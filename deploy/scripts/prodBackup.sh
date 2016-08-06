# Production backup (push to s3)

# Sample command: 
# STAGE:  prodBackup.sh ---- Default arguments are for STAGE
# PILOT: prodBackup.sh -home "/home/compro/.baloo" -zip mongodb-baloo-2015-10-26.zip -doc_home "/home/compro/.baloo/" -uri "localhost" -u "" -p ""
# PROD: prodBackup.sh -home "/home/ubuntu/.baloo" -zip mongodb-baloo-2015-10-26.zip -doc_home "/mnt/nfs/baloo/repository/" -uri "BALOO/10.76.24.34,10.76.24.35,10.76.24.36" -u "balooapp" -p "Ikki8989"
# Any Server: prodRestore.sh -zip mongodb-baloo-2015-10-26.zip ---- Optional parameter (default: current date)

# Am I Running already?
if [ ! -z "`ps -C \`basename $0\` --no-headers -o "pid,ppid,sid,comm"|grep -v "$$ "|grep -v "<defunct>"`" ]; then
 #script is already running – abort
 echo =================================== >> $logfile
 echo `date`... Script is already running, aborting. >> $logfile
 exit 1
fi

# variables
s3_bucket_name="myitlab-baloo"
s3_database_bucket_path="mongodb-backups"
s3_document_bucket_path="document-backups"
mongo_port="27017"
mongo_db="baloo"
timestamp=`date +%F`

# default input arguments - stage
baloo_config_home="/home/ubuntu/.baloo"  #location for baloo configuration or server home
baloo_documents_home="/mnt/nfs/baloo/repository/" #location for documents---- DO NOOOOOOOOOT FORGET THE SLASH IN THE ENDDDDDDDDDDD
mongo_db_uri="BALOO/10.76.10.66,10.76.10.67,10.76.10.68"  #database uri for application
mongo_db_username="balooapp"  #database username
mongo_db_password="Bagheer@"  #database password
mongodb_zip_file="mongodb-"$mongo_db"-"$timestamp".zip"

#get input parameters if any
while [ $# -gt 1 ]
do
key="$1"

case $key in
    -home)
    baloo_config_home="$2"
    shift # past argument
    ;;
    -doc_home)
    baloo_documents_home="$2"
    shift # past argument
    ;;
    -uri)
    mongo_db_uri="$2"
    shift # past argument
    ;;
	-u|-db_username)
    mongo_db_username="$2"
    shift # past argument
    ;;
	-p|-db_password)
    mongo_db_password="$2"
    shift # past argument
    ;;
	-zip)
    mongodb_zip_file="$2"
    shift # past argument
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
done
echo baloo_config_home  = "${baloo_config_home}"
echo baloo_documents_home     = "${baloo_documents_home}"
echo mongo_db_uri    = "${mongo_db_uri}"
echo mongo_db_username    = "${mongo_db_username}"
echo mongo_db_password    = "${mongo_db_password}"
echo mongodb_zip_file    = "${mongodb_zip_file}"

#derived variables
mongodump_path=$baloo_config_home"/dbBackup"
backup_logfile=$baloo_config_home"/logs"/backup-$timestamp.log


#create database backup directory if doesn't exist
if [ ! -d "$mongodump_path" ]; then
mkdir $mongodump_path
fi

#Force file synchronization and lock writes
mongo admin --eval "printjson(db.fsyncLock())"

#Create database backup
if [ -n "$mongo_db_username" ]; then
mongodump --host $mongo_db_uri --port $mongo_port --username $mongo_db_username --password $mongo_db_password --db $mongo_db --out $mongodump_path/db
else
mongodump --host $mongo_db_uri --port $mongo_port --db $mongo_db --out $mongodump_path/db
fi


#Unlock database writes
mongo admin --eval "printjson(db.fsyncUnlock())"

#Add timestamp to backup
cd $mongodump_path/db
zip -r $mongodump_path/$mongodb_zip_file ./*

#Upload database dump to s3
s3cmd put $mongodump_path/$mongodb_zip_file s3://$s3_bucket_name/$s3_database_bucket_path/$mongodb_zip_file
echo `date`... completed database backup >> $backup_logfile

rm $mongodump_path/$mongodb_zip_file

#Create documents backup
s3cmd sync -r --delete-removed $baloo_documents_home s3://$s3_bucket_name/$s3_document_bucket_path/ >> $backup_logfile 2>&1
echo `date`... completed documents backup >> $backup_logfile
