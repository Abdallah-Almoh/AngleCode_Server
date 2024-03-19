/* eslint-disable no-unused-vars */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
 const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });   
};
const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async(req, res, next)=>{
const newUser = await User.create(req.body);
const token = signToken(newUser._id);
createSendToken(newUser,201,res);

});     

exports.login= catchAsync( async (req, res, next) =>{
    const { email ,password} = req.body;
if(!email || !password){
    
next(new appError('please provide your email and password',400));
}
const user = await User.findOne({ email}).select('+password');
if (!user || !await user.correctPassword(password,user.password)){  
    console.log(password);
next(new appError('Incorrect email or password',401));
}
createSendToken(user,200,res);

});
exports.protect =catchAsync( async (req,res, next)=>{ 
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
    }   
    console.log(token); 
    if ( !token ) {
        return next( 
            new appError('You are not logged in! Please log in to get access ',401)
            );
    } 
    const decoded = await promisify(jwt.verify)(token ,process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next (new appError('The user belonging to this token does not exist',401));
    }
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next( new appError('User recently changed password! please log in again.',401)
        );
    }
    req.user= currentUser;
    next(); 
});

exports.restrictTo = (...roles) => {
    return (req, res , next) =>{
        if(!roles.includes(req.user.role)){

            return  next(new appError('You dont have permission to perform this action ',403));
        }
        next();
    };
};
exports.forgotPassword = catchAsync( async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email}); 
    if( !user ){
        return next(new appError('there is no user  with that email address', 404 )); 
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave:false }); 
   const resetURL= `${req.protcol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
   const message = `forgot your password ? submet patch request your new password and password confirm to:${resetURL}.\n if you didnt forget your password ignore this email`; 
   try{ 
   await sendEmail({
        email:user.email,
        subject:'Your password reset token (valid for 10 min )',
        message
    });
    res.status (200).json({
        status:'Success',
        message:'Token sent to your email' 
        
    });
   }catch(err){
       user.passwordResetToken= undefined;
       user.passwordResetExpires= undefined;
       await user.save({ validateBeforeSave:false }); 
       return next(new appError('There was an error sending the email! Please try again later'),500);
   }
});

exports.resetPassword = catchAsync( async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token ).digest('hex');
    const user =  await User.findOne({passwordResetToken:hashedToken, passwordResetExpires:{$gt: Date.now()}});
    if(!user){
        return next(new appError('Token is invalid or expired! Please try again later',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken =undefined ;
    user.passwordResetExpires=undefined;
    await user.save();
    createSendToken(user,200,res);
    
});
exports.updatePassword =catchAsync( async (req,res, next) => {
        const user = await User.findById(req.user.id).select('+password');
        if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){

            return next( new appError('Your current password is wrong ',401));
        }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user,200,res);
});