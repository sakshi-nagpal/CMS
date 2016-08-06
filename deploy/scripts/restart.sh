# 1. Kill node server
ps -ef | grep clusterjs | grep -v grep | awk '{print $2}' | xargs kill -9

# 2. Sleep..just in case
sleep 10

# 3. set environment variables to access node modules
NPM_PACKAGES="$HOME/.npm-packages"
NODE_PATH="$NPM_PACKAGES/lib/node_modules:$NODE_PATH"
PATH="$NPM_PACKAGES/bin:$PATH"
export PATH
# Unset manpath so we can inherit from /etc/manpath via the `manpath` command
unset MANPATH  # delete if you already modified MANPATH elsewhere in your config
MANPATH="$NPM_PACKAGES/share/man:$(manpath)"

# 4. Start node
nohup clusterjs server.js >> $HOME/.baloo/nohup/nohup-$1.out 2>>$HOME/.baloo/nohup/nohup-$1.err &
