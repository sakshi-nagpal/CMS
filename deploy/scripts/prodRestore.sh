# Production restore (via s3)

# Sample command: 
# PILOT: prodRestore.sh ---- Default arguments are for PILOT
# PROD:  prodRestore.sh -home "/home/ubuntu/.baloo" -zip mongodb-baloo-2015-10-26.zip -doc_home "/mnt/nfs/baloo/repository/" -uri "BALOO/10.76.24.34,10.76.24.35,10.76.24.36" -u "balooapp" -p "Ikki8989"
# STAGE: prodRestore.sh -home "/home/ubuntu/.baloo" -zip mongodb-baloo-2015-10-26.zip -doc_home "/mnt/nfs/baloo/repository/" -uri "BALOO/10.76.10.66,10.76.10.67,10.76.10.68" -u "balooapp" -p "Bagheer@"
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

# default input arguments - pilot
baloo_config_home="/home/compro/.baloo"  #location for baloo configuration or server home...sample: /home/ubuntu/.baloo
baloo_documents_home="/home/compro/.baloo/"  #location for documents...sample: /mnt/nfs/baloo/repository/ ---- DO NOOOOOOOOOT FORGET THE SLASH IN THE ENDDDDDDDDDDD
mongo_db_uri="localhost"  #database uri for application...sample: BALOO/10.76.10.66,10.76.10.67,10.76.10.68
mongo_db_username=""  #database username
mongo_db_password=""  #database password
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
    -uri|db_uri)
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
restore_logfile=$baloo_config_home"/logs"/restore-$timestamp.log

#create database backup directory if doesn't exist
if [ ! -d "$mongodump_path" ]; then
mkdir $mongodump_path
fi

#get dump from s3
rm -f $mongodump_path/baloo-db.zip
s3cmd get s3://$s3_bucket_name/$s3_database_bucket_path/$mongodb_zip_file $mongodump_path/baloo-db.zip >> $restore_logfile 2>&1

#unzip dump
unzip -o $mongodump_path/baloo-db.zip -d $mongodump_path/db >> $restore_logfile 2>&1

#Restore db
if [ -n "$mongo_db_username" ]; then
mongorestore --host $mongo_db_uri --port $mongo_port --username $mongo_db_username --password $mongo_db_password --db $mongo_db --drop $mongodump_path/db/$mongo_db >> $restore_logfile 2>&1
else
mongorestore --host $mongo_db_uri --port $mongo_port --db $mongo_db --drop $mongodump_path/db/$mongo_db >> $restore_logfile 2>&1
fi
echo `date`... completed database restore >> $restore_logfile

# Sync the documents from S3
s3cmd sync -r --delete-removed s3://$s3_bucket_name/$s3_document_bucket_path/documents $baloo_documents_home >> $restore_logfile 2>&1
echo `date`... completed documents sync >> $restore_logfile
