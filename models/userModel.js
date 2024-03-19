const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { NIL } = require('uuid');
const userSchema = mongoose.Schema({
first_name:{
type: 'string',
required: [true,'please tell us your first name']
},
last_name:{
    type:'string',
    required: [true,'please tell us your last name']
},
about:{
    type:'string'
},
user_name:{
    type:'string',
    unique: [true,'there is another user have the same usaername'],
},
phone_number:{
    type: Number,
    // required: [true,'please tell us your phone number']
},
email: {
    type: String,
    required: [true,'TPlease provide your email '],
    unique: [true,'there is another user have the same email'],
    lowercase: true,
    validate:[validator.isEmail,'please provide a valid email' ]
},
role: {
    type: String,
    enum: ['admin', 'user','superAdmin'],
    default: 'user' 
},
password: {
    type: String,
    required: [true,'The user must have password '],
    minlength:8,
    select:false
},
    avatar: String,

passwordConfirm: {
    type: String,
    required: [true,'please confirm your password'],
    validate:{
        //this will work in create and save 
        validator: function(val){ 
            return val == this.password;
        },
        message: 'password are not the same please try again'
    }
},
lesson:[{
    type: mongoose.Schema.Types.ObjectId,ref:'Lesson'
}],

course:[{
    type: mongoose.Schema.Types.ObjectId,ref:'Course'
}],
finishedCourse:[{
   finishedCourse:{ type: mongoose.Schema.Types.ObjectId,ref:'Course',
    },
    results:{
        type:Number,
        default:0
    }
}],
courseAttend:[{
    courseAttend:{
    type: mongoose.Schema.Types.ObjectId,ref:'Course'
    },
    lessonsAttend:[
        {
            type: mongoose.Schema.Types.ObjectId,
            default:[],
            ref: 'Lesson',
        },
    ],
    correctAnswers:{
        type:Number,
        default:0
    },
    testAttend:[{
        testId:{type:mongoose.Schema.Types.ObjectId,ref:'Test'},
        percentageCorrect:{
            type:Number,
            default:0}
    }]
}],
Meetings:[{
type: mongoose.Schema.Types.ObjectId,ref:'Meeting'
}],
createdAt:{
    type: Date,
select:false
},
passwordChangedAt : Date,
updatedAt:{ 
    type:Date,
select:false
},
passwordResetToken: String, 
passwordResetExpires: Date,
active:{
    type: Boolean,
    default:true ,
    //hide it from user
    select:false
},
viewedCourses: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Course',
    default: [],
  }
});
userSchema.pre('save',async function(next)  {
    if(!this.isModified('password'))  return next();
    this.password = await bcrypt.hash(this.password, 12 );
    this.passwordConfirm = undefined;
next();
});
userSchema.pre('save', function(next) {
    if(!this.isModified('password')||this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
}); 
userSchema.pre(/^find/, function(next) {
    this.find({active:{$ne:false} });
next();
});


userSchema.methods.correctPassword = async function (condidatePassword,userPassword) {  
 const aa = await bcrypt.compare(condidatePassword,userPassword); 
 console.log(aa);   
 return aa;
 }; 
    
    userSchema.methods.changePasswordAfter = function (JWTTimestamp){
   if(this.passwordChangedAt){
       const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
       console.log(changedTimestamp, JWTTimestamp); 
       return  JWTTimestamp < changedTimestamp ;
   }
       return false;
};
userSchema.methods.createPasswordResetToken = function (){
    
    const   resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    return resetToken;
};

const User = mongoose.model('User',userSchema);
module.exports=User;
