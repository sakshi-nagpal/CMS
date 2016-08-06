var skills = {
    'title' : 'Open a Word Outline in PowerPoint to Create a presentation',
    'type' : 'skill',
    'product' : 'Word',
    'skillId' : 'WD_APPLICATION_270',
    'mappedIds' : [],
    'parentLabels' : [
        'APPLICATION',
        'Outline'
    ],
    'app' : [
        'Word 2013'
    ]
};


var libraryStep = {
    'name' : 'this is a test step',
    'product' : 'Word',
    'mappedSteps' : [
        {
            scenarioId:'',
            stepId:''
        }
    ],
    'skills' : [],
    'methods' : [],
    'status' : 'Unqualified',
    'app' : [
        'Word 2013'
    ],
    'text' : 'task'
};

module.exports = {
    libraryStepData : libraryStep,
    skillData : skills
};
