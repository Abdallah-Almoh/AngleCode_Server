const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures= require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const Course = require('../models/CourseModel');
const Lesson = require('../models/lessonModel');

const multerStorage = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, 'img'); 
  },
  filename: (req,file,cb)=>{
    const ext = file.mimetype.split('/')[1];
    cb(null,`${uuidv4()}-User-${req.user.id}-${Date.now()}.${ext}`);
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


  exports.updateUser = catchAsync(async (req, res,next) =>{
      const userID = req.params.id;
      const user = await User.findById(userID);
      console.log('req.body',req.body);

      console.log('req.file',req.file);

      if (req.user.role !== 'superAdmin' && user._id.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
      }
      const updatedUserData = {
        first_name: req.body.first_name || user.first_name,
          last_name: req.body.last_name || user.last_name,
          about: req.body.about || user.about,
          user_name: req.body.user_name || user.user_name,
          phone_number: req.body.phone_number || user.phone_number,
          email: req.body.email || user.email,
          avatar: req.file ? req.file.filename : user.avatar,
          active: req.body.active || user.active
          
      };
      const updateUser = await User.findByIdAndUpdate(userID,updatedUserData,
        {
            new:true ,
            runValidators:true
        });
        if(!updateUser) { 
            return next(new appError('no User found with this id', 404));
        }
        res.status(200).json({
            status: 'success',
            data:{
                updateUser
            }
        });
  });
  exports.deleteUser = catchAsync(async(req,res,next) => {
      const userID = req.params.id;
      const user = await User.findById(userID);
      if (req.user.role !== 'superAdmin' && user.id.toString() !== req.user._id.toString()) { 
        return next(new appError('You are not authorized to perform this action', 403));
      }
      if(!user){
        return next(new appError('User not found', 404));
      }
      await Lesson.deleteMany({ user: userID });
      await Course.deleteMany({ user: userID});
      await user.remove();
      res.status(204).json({
          status: 'Success',
          data: null
      });
  });

  exports.getAllUsers = catchAsync( async(req,res,next)=>{
if(req.user.role !='superAdmin'){
    return next(new appError('You are not authorized to perform this action', 403));
}
const users = await User.find();
res.status(200).json({
status: 'Success',
resutls: users.length,
data: users
});
  });
  exports.getUser = catchAsync( async(req,res,next)=>{
const userID = req.params.id;
const user = await User.findById(userID);

if(req.user.role !='superAdmin' &&req.user._id.toString() !== user._id.toString()){
  return next(new appError('You are not authorized to perform this action',403));
}
else if(!user){
    return next(new appError('User not found', 404));
}
res.status(200).json({
    status: 'Success',
    data: user
});
  });
  exports.getUserFromOtherUser = catchAsync( async(req, res, next)=>{
    const UserID = req.params.id;
    const user = await User.findById(UserID).select('first_name last_name avatar user_name about phone_number active finishedCourse');
    if(!user){
      return next(new appError('User not found', 404));

    }
    res.status(200).json({
      status: 'Success',
      data: user
    });
  });

  exports.getUsersCount = catchAsync( async(req,res,next)=>{
    if(req.user.role !='superAdmin'){
      return next(new appError('You are not authorized to perform this action', 403));
    }
    const UsersCount = [] ;
         const totalCount = await User.countDocuments();
         const usersCount = await User.countDocuments({ role:'user'});
         const  adminCount = await User.countDocuments({ role:'admin'});
         const superAdminCount = await User.countDocuments({ role:'superAdmin'});
    UsersCount.push(totalCount, usersCount,adminCount,superAdminCount);
    res.status(201).json({
      status:'Success',
      data:UsersCount
    });
  });

  exports.themostcourseCreated = catchAsync(async(req,res,next)=>{
    if(req.user.role !='superAdmin'){
      return next(new appError('You are not authorized to perform this action', 403));
  }
  const result = await User.find({role:{$in:['admin','superAdmin']}}).sort({ course : -1 }).limit(5).select('first_name last_name avatar ').select({ courseCount: {$size:'$course'}});
  res.status(201).json({
    status:'Success',
    data:result
  });
  });
  exports.getTheMostCourseAttendes = catchAsync(async(req,res,next)=>{
    // Aggregate the users collection
const result = await User.aggregate([
  {
    $unwind: '$courseAttend'
  },
  {
    $group: {
      _id: '$courseAttend.courseAttend',
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
]);

// Lookup the course information for each group
const courseIds = result.map(({ _id }) => _id);
const courses = await Course.find({ _id: { $in: courseIds } }).select('name imageCover user ').populate('user','first_name last_name avatar');
// Add the course information to the result
const finalResult = result.map(({ _id, count }) => {
  const course = courses.find((c) => c._id.toString() === _id.toString());
  return { course, count };
});
res.status(201).json({
  status: 'success',
  data: finalResult
});
  }); 
 exports.getUsers = catchAsync(async(req,res,next)=>{
  if (req.user.role !== 'superAdmin' ) {
    return next(new appError('You are not authorized to perform this action', 403));
  }
  const teachers = await User.find({role:'admin'}).sort({course:-1}).select('first_name last_name avatar ').select({ courseCount: {$size:'$course'}});
  const users = await User.find({role:'user'}).sort({'courseAttend.courseAttend':-1}).select('first_name last_name avatar ').select({ courseCount: {$size:'$courseAttend.courseAttend'}});
 res.status(201).json({
   status: 'success',
   data:teachers,users
 });
 });