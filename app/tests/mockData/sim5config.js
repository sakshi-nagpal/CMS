var sim5config={
    "domain" : "http://dev2.comprotechnologies.com",
    "launchUrl" : {
        "launchSIM" : "sim5frame.aspx?resLinkID=",
        "friendlyId" : "taskid:",
        "context" : "baloosim5stage"
    },
    "label" : "SIM5 - Stage",
    "type" : "basic",
    "env" : "stage",
    "userRoles" : [
        "systemAdmin",
        "contentAuthor",
        "contentReviewer",
        "developer",
        "devContentAdmin",
        "editorialAuthor",
        "mediaVendor",
        "softwareTester"
    ]
};

exports.sim5configData = sim5config;
