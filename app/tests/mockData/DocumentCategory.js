var documentCategories =  [
    {
        'code' : 'START_DOC',
        'displayName' : 'Start Doc',
        'allowedAmount' : '1',
        'notifications' : true,
        'order' : 1,
        'fileSize' : 20971520,
        '__v' : 0,
        'required' : true
    },

    /* 1 */
    {
        'code' : 'END_DOC',
        'displayName' : 'End Doc',
        'allowedAmount' : '1',
        'notifications' : true,
        'order' : 2,
        'fileSize' : 20971520,
        '__v' : 0,
        'required' : true
    },

    /* 2 */
    {
        'code' : 'DEV_DOC',
        'displayName' : 'Dev Doc',
        'allowedAmount' : '*',
        'notifications' : false,
        'order' : 4,
        'fileSize' : 20971520,
        '__v' : 0,
        'required' : false
    },

    /* 3 */
    {
        'code' : 'AUDIO_FILE',
        'displayName' : 'Audio File',
        'allowedAmount' : '1',
        'notifications' : true,
        'order' : 3,
        'fileSize' : 20971520,
        '__v' : 0,
        'required' : false
    },

    /* 4 */
    {
        'code' : 'Audio_Timing_File',
        'displayName' : 'Audio Timing File',
        'allowedAmount' : '1',
        'notifications' : true,
        'order' : 5,
        'fileSize' : 20971520,
        '__v' : 0
    },

    /* 5 */
    {
        'code' : 'Additional_Assets',
        'displayName' : 'Additional_Assets File',
        'allowedAmount' : '*',
        'notifications' : false,
        'order' : 6,
        'fileSize' : 20971520,
        '__v' : 0
    }
];
module.exports = documentCategories;
