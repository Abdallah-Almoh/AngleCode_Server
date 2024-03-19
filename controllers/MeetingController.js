const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures= require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const Meeting = require('../models/MeetingModel');

const multerStorage = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, 'img'); // specify the folder where uploaded files will be stored
  },
  filename: (req,file,cb)=>{
    const ext = file.mimetype.split('/')[1];
    cb(null,`${uuidv4()}-Meeting-${req.user.id}-${Date.now()}.${ext}`);
  }

});

  const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
      cb(null,true);
    }else{
      cb(new appError('Not an image ! please uploade image',40),false);
    }
  };
  const Upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
  });
  exports.UploadPhoto = Upload.single('photo');
exports.CreateMeeting = catchAsync(async(req,res,next)=>{
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
        return next(new appError('You are not authorized to create a new course', 403));
      }
      const newMeeting = new Meeting({
            title: req.body.title,
            link: req.body.link,
            content: req.body.content,
            userCreater:req.user._id,
            startDate: req.body.startDate,
            duration: req.body.duration,
        image: req.file ? req.file.filename : null,
      }) ;
      try{
          const createdMeeting = await newMeeting.save();
          const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { Meetings: createdMeeting._id } },
            { new:true }
          );
          if (!updatedUser) {
            return next(new appError('User not found', 404));
          }
          res.status(201).json({
            status: 'success',
            data: createdMeeting
          });

      }catch(err){
        return next(new appError('there is error in creating meeting please try again'));
      }
});
exports.updateMeeting = catchAsync(async(req,res,next)=>{
    const MeetingId = req.params.id;
    const meeting = await Meeting.findById(MeetingId);
    if (req.user.role !== 'superAdmin' && meeting.userCreater.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
      }

      const updatedMeetingData = {
        title:req.body.title||meeting.title,
        link: req.body.link ||meeting.link,
        content: req.body.content || meeting.content,
        startDate: req.body.startDate || meeting.startDate,
        duration: req.body.duration || meeting.duration,
        image: req.file ? req.file.filename : meeting.image
      };

      const updatedMeeting = await Meeting.findByIdAndUpdate(MeetingId,updatedMeetingData, {
        new:true ,
        runValidators:true
    });
    if(!updatedMeeting){
        return next(new appError('no Meeting found with id',404));
    }
    res.status(200).json({
        status: 'success',
        data: {
          updatedMeeting
        }
    });
});
exports.deleteMeeting = catchAsync(async(req,res,next)=>{
const meetingId = req.params.id;
const meeting = await Meeting.findById(meetingId);
if (req.user.role !== 'superAdmin' && meeting.userCreater.toString() !== req.user._id.toString()) {
    return next(new appError('You are not authorized to perform this action', 403));
  }
if(!meeting){
    return next(new appError('Meeting not found',404));
}
const userId = meeting.userCreater;
    await meeting.remove();
    await User.findByIdAndUpdate(userId,{$pull:{Meetings:meetingId},});
    res.status(204).json({
        status: 'success',
        data: null,
      });
});
exports.joinMeeting = catchAsync(async(req,res,next)=>{
    const meetingId = req.params.id;
    const meeting = await Meeting.findById(meetingId);
    if(meeting.userCreater.toString()===req.user._id.toString()){
        return next(new appError('you are the meeting Creater',400));
    }

    if(meeting.users.includes(req.user._id)){
        return next(new appError('you joined this meeting befor',400));
    }
    const meetingupdated = await Meeting.findByIdAndUpdate(meetingId,{$push:{users:req.user._id}}, {
        new:true ,
        runValidators:true
    });
if(!meeting){
    return next(new appError('Meeting not found',404));

}
res.status(201).json({
    status: 'success',
    data: meetingupdated
});
});

exports.getAllMeetings = catchAsync(async(req,res,next)=>{
const meetings = await Meeting.find().populate('users userCreater','first_name last_name avatar');
res.status(200).json({
status: 'success',
data: meetings
});
});
exports.getMeeting = catchAsync(async(req,res,next)=>{
const meeting = await Meeting.findById(req.params.id).populate('users userCreater','first_name last_name avatar');
if(!meeting){
    return next(new appError('Meeting not found',404));
}
res.status(200).json({
status:'Success',
data:meeting
});
});
exports.MyCreatedMeeting = catchAsync(async(req,res,next)=>{
    const userId = req.user._id;
    const mycreatedMeeting = await Meeting.find({userCreater:userId});
    res.status(200).json({
        status:'Success',
        data:mycreatedMeeting
    });
});
exports.MyMeetings = catchAsync(async(req,res,next)=>{
    const userId = req.user._id;
    const mymeetings = await Meeting.find({users:{$in:userId}});
    res.status(200).json({
        status:'Success',
        data:mymeetings
    });
});