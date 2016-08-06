# -----------------------------------------------------------
# Configuration
# -----------------------------------------------------------
timestamp=`date +%F-%H%M`
logfile=$HOME"/.baloo/logs"/sync-$timestamp.log
documents_path=$HOME"/.baloo/documents"
s3_bucket_name="myitlab-baloo"
s3_bucket_path="document-backups"

# -----------------------------------------------------------
# Am I Running already?
# -----------------------------------------------------------
if [ ! -z "`ps -C \`basename $0\` --no-headers -o "pid,ppid,sid,comm"|grep -v "$$ "|grep -v "<defunct>"`" ]; then
 #script is already running – abort
 echo =================================== >> $logfile
 echo `date`... Script is already running, aborting. >> $logfile
 exit 1
fi

# -----------------------------------------------------------
# RUN THE BACKUP COMMANDS
# -----------------------------------------------------------

echo ==================================== >> $logfile
echo `date`... running backup >> $logfile

# documents sync
echo SYNCING WORKSPACE >> $logfile
s3cmd sync -r --delete-removed $documents_path s3://$s3_bucket_name/$s3_bucket_path/ >> $logfile 2>&1

# ------------------------------------------------------------
# Done
# ------------------------------------------------------------
exit 0

