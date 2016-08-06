'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var sim5ConfigSchema = new Schema({
    domain:{
        type:String,
        required: 'Domain cannot be left blank.'
    },
    launchUrl:{
        context:{
            type:String,
            required: 'Launch URL Context cannot be left blank.'
        },
        launchSIM:{
            type:String,
            required: 'Launch URL launchSIM name cannot be left blank.'
        },
        friendlyId:{
            type: String,
            trim: true
        }
    },
    label : {
        type: String,
        required: 'Label name cant be left blank.'
    },
    type : {
        default: 'basic',
        type: String
    },
    env : {
        type: String,
        required: 'Environment name cant be left blank.',
        unique:'Environment already exists'
    },
    userRoles : {
        type: [String]
    }
},{collection:'sim5config'});

mongoose.model('SIM5Config', sim5ConfigSchema);
