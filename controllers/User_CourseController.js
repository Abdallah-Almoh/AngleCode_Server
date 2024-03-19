const catchAsync = require('./../utils/catchAsync');
const APIFeatures= require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const Lesson = require('../models/lessonModel');
const Course = require('../models/CourseModel');
const {Test} = require('../models/testModel');
exports.AddCoursetoMyCourses = catchAsync(async(req,res,next)=>{
    const courseId = req.params.id;
   

    const user = req.user;

    if (!user) {
      return next(appError('User Not Found', 404));
    }
    const firstLesson = await Lesson.findOne({ course: courseId })
    .sort({ level: 1, createdAt: 1 })
    .select('_id');

    const course = await Course.findById(courseId);

    if (!course) {
      return next(appError('Course Not Found', 404));
    }
    const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
    
        if(courseAttendIndex!==-1){
        const courseAttend = user.courseAttend[courseAttendIndex];

            res.status(201).json({
                status: 'success',
                message:'Course is already in the user\'s attended courses',
                data: courseAttend,
              });
        }
        if(courseAttendIndex===-1){
        const updatedUser =  await User.findByIdAndUpdate(
            user._id,
            {
              $push: { courseAttend:{courseAttend: courseId, lessonsAttend:firstLesson._id}},
            },
            { new: true }
            );
            const courseAttendIndex = updatedUser.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
            const courseAttend =   updatedUser.courseAttend[courseAttendIndex];
    res.status(201).json({
      status: 'success',
      data: courseAttend,
    });
}});
exports.unlockLessons = catchAsync(async (req,res,next) => {
  console.log(req.params.id);
    const lessonId = req.params.id;
    const lesson = await Lesson.findById(lessonId);
    const user = req.user;
    const courseId = lesson.course;
    const answer = req.body.answer;
    
    const lessons = await Lesson.find({ course: courseId }).sort({
        level: 1,
        createdAt: 1,
      });
      
      const lessonIndex = lessons.findIndex((el) => el._id.toString() === lessonId.toString());
    
    
    if (lessonIndex !== -1 && lessonIndex < lessons.length - 1) {
      const nextLesson = lessons[lessonIndex + 1];
      const nextLessonId = nextLesson._id;
      console.log('Next lesson ID:', nextLessonId);
      const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
    if (courseAttendIndex === -1) {
      return next(appError('User has not attended this course', 404));
    }
    const lessonsIndex = user.courseAttend[courseAttendIndex].lessonsAttend.findIndex((l) => l.toString() === nextLessonId.toString());
    const less =  user.courseAttend[courseAttendIndex].lessonsAttend.findIndex((l) => l.toString() === req.params.id.toString());
    if(less === -1) {
      return next(new appError('you cant study this lesson', 404));
    }
    if(lessonsIndex!==-1){
      
      const courseAttend = user.courseAttend[courseAttendIndex];
        return res.status(200).json({
            status: 'success',
            message: 'lesson is already in the user\'s attended courses',
            data: courseAttend,
          });
    }
    if(answer){
      await User.findOneAndUpdate(
           { _id: user._id , 'courseAttend.courseAttend': courseId },
           { $inc: { 'courseAttend.$.correctAnswers': 1 }  },
           { new: true },);
   }
   const test= await Test.findOne({course:courseId,level:lesson.level});
   console.log('test',test,'nextLesson.level',nextLesson.level,'lesson.level',lesson.level);
   if(nextLesson.level > lesson.level){
    const courseAttend = user.courseAttend[courseAttendIndex];

    const testi = courseAttend.testAttend.find((t)=> t.testId.toString()=== test._id.toString());
      console.log('testi',testi);
      if(!testi){
        return next(new appError('you need to make the test level',400));
      }
      if(testi.percentageCorrect<60){
        return next(new appError('you cant start the  next lesson until you pass in exam'));
      }
   }
     const updatedUser=  await User.findOneAndUpdate({_id:user._id,'courseAttend.courseAttend':courseId},{$push:{'courseAttend.$.lessonsAttend':nextLessonId} },{new: true},);
     const courseAttendIndex1 = updatedUser.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
    const courseAttend = updatedUser.courseAttend[courseAttendIndex1];
res.status(201).json({ 
status:'Success',
data: courseAttend,
});
}else if(lessonIndex === lessons.length -1){
  const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
  
  if(answer){
    await User.findOneAndUpdate(
      { _id: user._id , 'courseAttend.courseAttend': courseId },
      { $inc: { 'courseAttend.$.correctAnswers': 1 }  },
      { new: true },);
    }
    const courseAttend = user.courseAttend[courseAttendIndex];
    console.log(courseAttend);
    res.status(200).json({
status:'success',
message: 'you finished all lessons',
data:courseAttend
    });
}

});
exports.progress = catchAsync(async(req,res,next)=>{
const courseId = req.params.id;
const course = await Course.findById(courseId);
const progress = [];
const correctAnswerProg = [];
const courseLessonLength = course.lesson.length;
console.log(courseLessonLength);
const user = req.user;
const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
if (courseAttendIndex === -1) {
  return next(appError('User has not attended this course', 404));
}
const lessonsStudied = user.courseAttend[courseAttendIndex].lessonsAttend.length -1;
const correctAnswers = user.courseAttend[courseAttendIndex].correctAnswers;
const correctAnswersPercentage = (correctAnswers/lessonsStudied) * 100;
const progressPercentage = (lessonsStudied / courseLessonLength ) * 100;
correctAnswerProg.push(correctAnswers,correctAnswersPercentage);
progress.push(courseLessonLength,lessonsStudied, progressPercentage);
console.log(progress,correctAnswerProg);
res.status(200).json({
  status:'Success',
  data:{progress,correctAnswerProg}
});
});
exports.myfavCourses = catchAsync(async(req,res,next)=>{
const user = req.user;
const populatedUser = await User.findById(user._id).populate({
  path: 'courseAttend.courseAttend',
  select: '-lessons -correctAnswers'
}).select('courseAttend.courseAttend');

const courseIds = populatedUser.courseAttend.map((courseAttend) => courseAttend.courseAttend);
const courses = await Course.find({
  _id: { $in: courseIds },
});

console.log(courses);
res.status(200).json({
  status: 'success',
  data: courses,
});
});
exports.getunlockLessonsForCourse = catchAsync(async(req,res,next)=>{
const user = req.user;
const courseId = req.params.id;
const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
const lessonsUnlock= user.courseAttend[courseAttendIndex].lessonsAttend;
res.status(200).json({
  status: 'success',
  data: lessonsUnlock
});
});
exports.getMyFavCoursesAndUnlockedLessons = catchAsync(async (req, res, next) => {
  const user = req.user;
  const populatedUser = await User.findById(user._id).populate({
    path: 'courseAttend.courseAttend',
    select: '-correctAnswers',
  }).select('courseAttend.courseAttend courseAttend.lessonsAttend');

//   const courses = populatedUser.courseAttend.map((attend) => {
//     const course = attend.courseAttend;
//     const unlockedLessons = attend.lessonsAttend;
//     const userId = course.user; 
//     const user1 = await User.findById(userId).select('first_name last_name avatar').lean(); user
//     // console.log(user);
//     return {
//         ...course.toObject(),
//       unlockedLessons,
//       // userId
//     };
//   });
//   // console.log(userId);
//   const resolvedCourses = await Promise.all(courses);
//   console.log(resolvedCourses);
//   // console.log(course.toObject());
//   res.status(200).json({
//     status: 'success',
//     data: resolvedCourses,
//   });
// });
const courses = await Promise.all(populatedUser.courseAttend.map(async (attend) => {
  const course = attend.courseAttend;
  const unlockedLessons = attend.lessonsAttend;
  const userId = course.user;

  const user = await User.findById(userId).select('first_name last_name avatar').lean();

  return {
    ...course.toObject(),
    unlockedLessons,
    user
  };
}));

res.status(200).json({
  status: 'success',
   data: courses,
});
});