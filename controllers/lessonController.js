const Lesson = require('../models/lessonModel');
const Course = require('../models/CourseModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const User = require('../models/userModel');

exports.createLesson = catchAsync(async (req, res, next) => {
  console.log(req.body);
    const course = await  Course.findById(req.body.course);
    if(!course){
        return next( new appError('Course not found',404));
    }
    if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
      console.log(req.user);
        return next(new appError('You are not authorized to perform this action', 403));
      }
  const newLesson = await Lesson.create(req.body);

  const updatedCourse = await Course.findByIdAndUpdate(
    req.body.course,
    { $push: { lesson: newLesson._id } },
    { new: true }
  );
  const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      {$push:{lesson: newLesson._id}},
      {new: true}
  );
        if(!updatedUser) {
            return next(new appError('User not found',404));
        }
        if (!updatedCourse) 
        {
        return next(new appError( 'Course not found',404));
        }
  res.status(201).json({
    status: 'success',
    data: {
      lesson: newLesson,
    },
  });
});

exports.deleteLesson = catchAsync(async (req, res, next) => {
    const lessonId = req.params.id;
    const lesson = await Lesson.findById(lessonId);

    if (req.user.role !== 'superAdmin' && lesson.user.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
      }
  
    if (!lesson) {
      return next(new appError('Lesson not found', 404));
    }
  
    const courseId = lesson.course;
  const userId = lesson.user;
    await lesson.remove();
  
    await Course.findByIdAndUpdate(courseId, { $pull: { lesson: lessonId } });
    await User.findByIdAndUpdate(userId, { $pull: {lesson: lessonId } });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
  exports.updateLesson = catchAsync(async (req, res, next) =>{
      const lessonId = req.params.id;
      const lessonn = await Lesson.findById(lessonId);
    if (req.user.role !== 'superAdmin' && lessonn.user.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
      }
    const lesson = await Lesson.findByIdAndUpdate(req.params.id,req.body,
        {
            new:true ,
            runValidators:true
        });
        if(!lesson) { 
            return next(new appError('no Lesson found with this id', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                lesson
            }
        });
  });
  exports.getAllLessonsForCourse = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
  
    const lessons = await Lesson.find({ course: courseId,hidden:{$in:[false,null]} }).sort({level:1,createdAt:1});
  
    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: {
        lessons,
      },
    });
  });
  exports.getAllLessonsForCourseForAdmin = catchAsync(async (req, res, next) => {
    if(req.user.role !='superAdmin'){
      return next(new appError('You are not authorized to perform this action', 403));
  }
    const courseId = req.params.id;
  
    const lessons = await Lesson.find({ course: courseId });
  
    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: {
        lessons,
      },
    });
  });
  exports.getLesson = catchAsync(async (req, res, next) => {
    
    const lessonId = req.params.id;
  
    const lesson = await Lesson.findById(lessonId);
  
    if (!lesson) {
      return next(new appError('Lesson not found', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  });