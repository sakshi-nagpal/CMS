var skill= require('./SkillIndex').skillData;

var scenarioJson = {
    'friendlyId' : 'YO13.XL13.01.01.08.A2',
    'eTextURL' : 'http://view.ebookplus.pearsoncmg.com/ebook/linktoebook4.do?platform=1052&bookid=24292&startpage=393&endpage=394&hid=6545da6dafb94be1f01edc601dbb89fa',
    'videoURL' : 'http://ph_cc_bp768432_set.title.Excel:_Workshop_1__/ph/streaming/bp/2014/it/kinser/blue_box_videos/excel/yo_e01_08.m4v',
    'title' : 'E01.08&nbsp;- To Select, Copy, and Paste to Contiguous and Noncontiguous Selections',
    'pageNo' : '393',
    'phase' : {
        'code' : 'AUT',
        'index' : 3
    },
    'type' : {
        'index' : 1,
        'code' : 'T1'
    },
    'taskId' : '5549e457a7ad28a0236e5fd5',
    'steps':[{
        text : 'dummy value 1',
        _id: '5590ffc8be9b1730042776db',
        'threads' : [{
            'sequence' : 1,
            'thread' : '564bfeb61fba5cfd03bb65e5',
            '_id' : '5624bb73a0cb50d46d039210'
        }],
        methods : [{
            type : 'Keyboard',
            primary : true,
            status : 'default',
            actions : [{
                text : 'Click dummy text'
            }]
        }],
        skills:[{
                skillId:skill.skillId,
                app:skill.app,
                label:skill.title
        }]
        },
        {
            text : 'dummy value 2',
            _id: '5590ffc8be9b1730042776dc',
            methods : [{
                type : 'Ribbon',
                primary : true,
                status : 'default',
                actions : [{
                    text : 'Click dummy text'
                }]
            }],
            skills:[{
                skillId:skill.skillId,
                app:skill.app,
                label:skill.title
            }]
        }],
    'createdBy' : {
        '_id' : '55558c9626c2edd81cfee461',
        'name' : 'Lorenzo Espares'
    },
    'updatedBy' : {
        '_id' : '55558c9626c2edd81cfee461',
        'name' : 'Lorenzo Espares'
    },
    'threads' : [{
        'sequence' : 1,
        'thread' : '5624bb73a0cb50d46d03920e',
        '_id' : '5624bb73a0cb50d46d039210'
    }]
};
module.exports = scenarioJson;
