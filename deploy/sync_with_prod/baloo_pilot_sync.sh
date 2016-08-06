# -----------------------------------------------------------
# Arguments for the utility
# -----------------------------------------------------------
# Sample command: 
# Staging / Production ---------- ./baloo_pilot_sync.sh mongodb-localhost-baloo-2015-10-09-0230.zip "/home/ubuntu/.baloo" "/mnt/nfs/baloo/repository/" "BALOO/10.76.10.66,10.76.10.67,10.76.10.68" "balooapp" "Bagheer@"
# QA ---------------------------- ./baloo_pilot_sync.sh mongodb-localhost-baloo-2015-10-09-0230.zip "/home/ubuntu/.baloo" "/media/seconddrive/repository/" "localhost"
s3_mongodb_zip_file=$1 #the name of the database dump file must be passed as an argument to the utility...sample: mongodb-localhost-baloo-2015-10-06-0230.zip
baloo_config_home=$2 #identifies the location for baloo configuration or server home...sample: /home/ubuntu/.baloo
baloo_documents_home=$3 #identifies the location for documents...sample: /mnt/nfs/baloo/repository/ ---- DO NOOOOOOOOOT FORGET THE SLASH IN THE ENDDDDDDDDDDD
baloo_db_uri=$4 #identified the database uri for application...sample: BALOO/10.76.10.66,10.76.10.67,10.76.10.68
baloo_db_username=$5 #database username
baloo_db_password=$6 #database password

# -----------------------------------------------------------
# Variables for the utility
# -----------------------------------------------------------
timestamp=`date +%F-%H%M`
s3_bucket_name="myitlab-baloo"
s3_document_bucket_path="document-backups"
s3_database_bucket_path="mongodb-backups"

restore_logfile=$baloo_config_home"/logs"/restore-$timestamp.log
database_dump_path=$baloo_config_home"/prod_db_dump"

# -----------------------------------------------------------
# Am I Running already?
# -----------------------------------------------------------
if [ ! -z "`ps -C \`basename $0\` --no-headers -o "pid,ppid,sid,comm"|grep -v "$$ "|grep -v "<defunct>"`" ]; then
 #script is already running – abort
 echo =================================== >> $restore_logfile
 echo `date`... Script is already running, aborting. >> $restore_logfile
 exit 1
fi

# -----------------------------------------------------------
# Sync the documents from S3.
# Expect that 's3cmd --configure' command has already been executed
# -----------------------------------------------------------
echo ==================================== >> $restore_logfile
echo `date`... restoring from S3 >> $restore_logfile
echo s3cmd sync -r --delete-removed s3://myitlab-baloo/$s3_document_bucket_path/documents $baloo_documents_home >> $restore_logfile 2>&1
s3cmd sync -r --delete-removed s3://myitlab-baloo/$s3_document_bucket_path/documents $baloo_documents_home >> $restore_logfile 2>&1
echo `date`... completed documents sync >> $restore_logfile

# -----------------------------------------------------------
# Sync the database from S3.
# Expect that 's3cmd --configure' command has already been executed
# -----------------------------------------------------------
rm -rf $database_dump_path
echo `date`... restoring database >> $restore_logfile
s3cmd get s3://$s3_bucket_name/$s3_database_bucket_path/$s3_mongodb_zip_file $database_dump_path/baloo-db.zip >> $restore_logfile 2>&1
echo `date`... retrieved from s3 >> $restore_logfile
unzip $database_dump_path/baloo-db.zip -d $database_dump_path >> $restore_logfile 2>&1
echo `date`... completed unzip >> $restore_logfile
mongorestore --host $baloo_db_uri --port 27017 --username "$baloo_db_username" --password "$baloo_db_password" --drop --db baloo $database_dump_path/home/compro/.baloo/dbBackup/db/baloo >> $restore_logfile 2>&1
echo `date`... completed restore >> $restore_logfile

# -----------------------------------------------------------
# Update database with additional scripts
# -----------------------------------------------------------
#echo `date`... restoring test series >> $restore_logfile
#mongorestore --host $baloo_db_uri --port 27017 --username balooapp --password Bagheer@ --db baloo "./data_test_series" >> $restore_logfile 2>&1
#echo `date`... completed restore test series >> $restore_logfile
#echo `date`... restoring functional accounts >> $restore_logfile
#mongorestore --host $baloo_db_uri --port 27017 --username balooapp --password Bagheer@ --db baloo "./data_automation_users" >> $restore_logfile 2>&1
#echo `date`... completed restore functional accounts >> $restore_logfile
#echo `date`... restoring qa accounts >> $restore_logfile
#mongorestore --host $baloo_db_uri --port 27017 --username balooapp --password Bagheer@ --db baloo "./data_test_users" >> $restore_logfile 2>&1
#echo `date`... completed restore qa accounts >> $restore_logfile