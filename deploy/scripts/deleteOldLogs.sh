APP_HOME=$HOME"/.baloo/logs"

#Delete logs older than 100 days
find $APP_HOME -type f -mtime +100 -delete