const mongoose = require('mongoose');
// const validator = require('validator');
const userSchema = mongoose.Schema({
    userid:{
        type: mongoose.Schema.Types.ObjectId,ref:'User'
},
message: String,
images:[String],
accepted:{
    type:Boolean,
    default: false
}
});
const UserTeacher = mongoose.model('UserTeacher',userSchema);
module.exports=UserTeacher;
