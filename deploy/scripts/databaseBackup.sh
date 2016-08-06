#Forece file synchronization and lock writes
mongo admin --eval "printjson(db.fsyncLock())"

MONGODUMP_PATH=$HOME"/.baloo/dbBackup"
HOST="localhost"
MONGO_PORT="27017"
MONGO_DATABASE="baloo"
TIMESTAMP=`date +%F-%H%M`
S3_BUCKET_NAME="myitlab-baloo"
S3_BUCKET_PATH="mongodb-backups"

#creae database backup directory if doesn't exist
if [ ! -d "$MONGODUMP_PATH" ]; then
mkdir $MONGODUMO_PATH
fi

#Create backup
mongodump --host $HOST --port $MONGO_PORT --db $MONGO_DATABASE --out $MONGODUMP_PATH/db

#Add timestamp to backup
zip -r $MONGODUMP_PATH/mongodb-$HOST-$MONGO_DATABASE-$TIMESTAMP.zip $MONGODUMP_PATH/db

#Unlock database writes
mongo admin --eval "printjson(db.fsyncUnlock())"

#Upload to s3
s3cmd put $MONGODUMP_PATH/mongodb-$HOST-$MONGO_DATABASE-$TIMESTAMP.zip s3://$S3_BUCKET_NAME/$S3_BUCKET_PATH/mongodb-$HOST-$MONGO_DATABASE-$TIMESTAMP.zip

rm $MONGODUMP_PATH/mongodb-$HOST-$MONGO_DATABASE-$TIMESTAMP.zip
