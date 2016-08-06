#Install Node
sudo apt-get install software-properties-common python-software-properties
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
#sudo ln -s /usr/bin/nodejs /usr/bin/node -- not needed

#Install Nginx
sudo apt-get update && sudo apt-get install -y python python-pip python-dev nginx-extras libfreetype6 libfontconfig1 wget build-essential zlib1g-dev libpcre3 libpcre3-dev unzip logrotate -y
cd /usr/src && sudo wget http://nginx.org/download/nginx-1.7.9.tar.gz
cd /usr/src && sudo tar -xvzf nginx-1.7.9.tar.gz
cd /usr/src/nginx-1.7.9/ && sudo ./configure --with-http_realip_module 
  --prefix=/usr/local/share/nginx --conf-path=/etc/nginx/nginx.conf \
  --sbin-path=/usr/local/sbin --error-log-path=/var/log/nginx/error.log
cd /usr/src/nginx-1.7.9/ && sudo make
cd /usr/src/nginx-1.7.9/ && sudo make install
cd $HOME && sudo rm -fr /usr/src/*
sudo apt-get clean && \
    sudo rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    find /var/log -type f | while read f; do echo -ne '' > $f; done;

#Make important folders
mkdir $HOME/.baloo
mkdir $HOME/.baloo/logs
mkdir $HOME/.baloo/nohup
mkdir $HOME/workspace

#Stop Logstash (if running) - sometimes this causes issue
	# To stop both of them from auto-starting you’ll have to edit the files located at: /etc/init/logstash.conf and /etc/init/logstash-web.conf. 
	# There, change the line reading “start on virtual-filesystems” to “start on never”.
	# /etc/init.d/logstash stop
	# sudo stop logstash-web

# For Log files rollover add the following job to crontab
crontab -e
30 02 * * * /bin/bash /home/ubuntu/workspace/baloo_pearson/deploy/scripts/deleteOldLogs.sh

##========================================================
## 				QA Specific Deployment Steps
##========================================================

#Install MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org=3.0.2 mongodb-org-server=3.0.2 mongodb-org-shell=3.0.2 mongodb-org-mongos=3.0.2 mongodb-org-tools=3.0.2

#Get the latest Baloo QA codebase
sudo apt-get install git
cd $HOME/workspace
git clone https://myit.builder:C3ompr0#1@devops-tools.pearson.com/stash/scm/baloo/baloo_app_code.git baloo_pearson #only on qa
cd $HOME/workspace/baloo_pearson
git pull origin qa

#Install Node Modules
mkdir $HOME/.npm-packages
mkdir $HOME/.npm
chmod 764 $HOME/workspace/baloo_pearson/deploy/scripts/npm-g-nosudo.sh
chmod 764 $HOME/workspace/baloo_pearson/deploy/scripts/restart.sh
$HOME/workspace/baloo_pearson/deploy/scripts/npm-g-nosudo.sh
source ~/.bashrc
npm install -g npm@2.14.0
npm install -g clusterjs@0.7.1
npm install -g grunt-cli@0.1.13
npm install -g bower@1.3.12

#Compile application
cd $HOME/workspace/baloo_pearson
npm install
bower install --config.interactive=false --allow-root
grunt build

#Configure MongoDB
sudo vi /etc/mongod.conf
# write this on top of file: storageEngine=wiredTiger
# comment this line: bind_ip = 127.0.0.1
rm -rf /var/lib/mongodb/*
sudo service mongod restart

##========================================================
## 				Staging and Production Specific Deployment Steps
##========================================================

#Install Node Modules
sudo npm install -g npm@2.14.0
sudo npm install -g clusterjs@0.7.1
sudo npm install -g grunt-cli@0.1.13
sudo npm install -g bower@1.3.12
sudo npm install -g appdynamics@4.0.7

#Configure NGINX
sudo cp $HOME/workspace/baloo_pearson/config/nginx/sites-enabled/default /etc/nginx/sites-enabled
sudo service nginx restart

#Appdynamics related changes
mkdir $HOME/.baloo/appd
mkdir $HOME/.baloo/appd/proxy_ctrl_dir
mkdir $HOME/.baloo/appd/logs
/usr/lib/node_modules/appdynamics/node_modules/appdynamics-proxy/proxy/runProxy -j
/usr/lib/node_modules/appdynamics/node_modules/appdynamics-jre/jre -- $HOME/.baloo/appd/proxy_ctrl_dir  $HOME/.baloo/appd/logs &


# Mongo db back related configuration
# enable s3cmd to be used without sudo rights, generate the configuration file by running the following command without sudo
sudo apt-get install s3cmd
s3cmd --configure
