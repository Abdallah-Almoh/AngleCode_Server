const mongoose = require('mongoose');

const AdSchema = mongoose.Schema({
    details:String,
    images:[String],
    accepted:{
        type:Boolean,
        default:false
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,ref:'User'
}
});

const Ad  = mongoose.model('Ad',AdSchema);
module.exports = Ad; 