# 1. Pull base image.
FROM python:2.7

# 2. Specify Environment Variables
ENV NODE_VERSION 0.10.33
ENV NGINX_VERSION 1.7.9
ENV NPS_VERSION 1.9.32.3
ENV BOWER_VERSION 1.3.12
ENV GRUNT_VERSION 0.4.5
ENV GRUNT_CLI_VERSION 0.1.1
ENV NODE_ENV production

# 3. Install NGinx
RUN apt-get update && apt-get install -y python python-pip python-dev nginx-extras libfreetype6 libfontconfig1 wget build-essential zlib1g-dev libpcre3 libpcre3-dev unzip logrotate -y

RUN cd /usr/src
RUN cd /usr/src && wget https://github.com/pagespeed/ngx_pagespeed/archive/release-${NPS_VERSION}-beta.zip
RUN cd /usr/src && unzip release-${NPS_VERSION}-beta.zip
RUN cd /usr/src/ngx_pagespeed-release-${NPS_VERSION}-beta/ && pwd && wget https://dl.google.com/dl/page-speed/psol/${NPS_VERSION}.tar.gz
RUN cd /usr/src/ngx_pagespeed-release-${NPS_VERSION}-beta/ && tar -xzvf ${NPS_VERSION}.tar.gz

RUN cd /usr/src && wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
RUN cd /usr/src && tar -xvzf nginx-${NGINX_VERSION}.tar.gz
RUN cd /usr/src/nginx-${NGINX_VERSION}/ && ./configure --with-http_realip_module --add-module=/usr/src/ngx_pagespeed-release-${NPS_VERSION}-beta \
  --prefix=/usr/local/share/nginx --conf-path=/etc/nginx/nginx.conf \
  --sbin-path=/usr/local/sbin --error-log-path=/var/log/nginx/error.log
RUN cd /usr/src/nginx-${NGINX_VERSION}/ && make
RUN cd /usr/src/nginx-${NGINX_VERSION}/ && make install

# 4. Install Pagespeed
RUN mkdir -p /var/pagespeed/cache

# 5. Perform Cleanup
RUN rm -fr /usr/src/*
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    find /var/log -type f | while read f; do echo -ne '' > $f; done;

# 6. Install Node.js
RUN \
cd /tmp && \
wget http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}.tar.gz && \
tar xvzf node-v${NODE_VERSION}.tar.gz && \
rm -f node-v${NODE_VERSION}.tar.gz && \
cd node-v* && \
./configure && \
CXX="g++ -Wno-unused-local-typedefs" make && \
CXX="g++ -Wno-unused-local-typedefs" make install && \
cd /tmp && \
rm -rf /tmp/node-v* && \
npm install -g npm && \
echo -e '\n# Node.js\nexport PATH="node_modules/.bin:$PATH"' >> /root/.bashrc

# 7. Install Node.js Modules
RUN npm install -g clusterjs
RUN npm install -g grunt-cli@${GRUNT_CLI_VERSION}
RUN npm install -g bower@${BOWER_VERSION}

# 8. Link the application codebase
WORKDIR /home/baloo
