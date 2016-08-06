var mongoose = require('mongoose');
var methodTypeObject = {
    name: {
        type: String,
        trim: true,
        required: 'Method Type Description cannot be blank'
    }
};
var methodTypeSchema = mongoose.Schema(methodTypeObject);
mongoose.model('methodTypeEnum', methodTypeSchema);

module.exports = methodTypeObject;
