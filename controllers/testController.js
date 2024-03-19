const {Test,Question } = require('./../models/testModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const Course = require('../models/CourseModel');
  const Lesson = require('../models/lessonModel');
exports.createTest = catchAsync(async(req, res, next)=>{
const course = await Course.findById(req.body.course);
if(!course){
    return next(new appError('Course not found',404));
}
if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
    console.log(req.user);
      return next(new appError('You are not authorized to perform this action', 403));
    }
    const newTest = await Test.create(req.body);
    res.status(201).json({
        status:'Success',
        data:{
            newTest
        }
    });
});
exports.createQuestion = catchAsync(async(req,res,next)=>{
const test = await Test.findById(req.body.test);
if(!test){
    return next(new appError('Test not found',404));
}
const course = await Course.findById(test.course);
console.log(course.user);
if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
    console.log(req.user);
      return next(new appError('You are not authorized to perform this action', 403));
    }
const newQuestion = await Question.create(req.body);
const updateTest = await Test.findByIdAndUpdate(req.body.test,
    {$push:{questions:newQuestion._id}},
    {new:true}
);
if(!updateTest){
    return next(new appError('Test not found',404));
}
res.status(201).json({
    status: 'success',
    data: {
      questions: newQuestion,
    },
  });
});

exports.updateTest = catchAsync(async(req,res,next)=>{
const test = await Test.findById(req.params.id);
if(!test){
    return next(new appError('Test not found',404));
}
const course = await Course.findById(test.course);
console.log(course.user);
if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
    console.log(req.user);
      return next(new appError('You are not authorized to perform this action', 403));
    }
const updateTest = await Test.findByIdAndUpdate(req.params.id,req.body, {
    new:true ,
    runValidators:true
});
res.status(200).json({
status: 'success',
data: updateTest
});
});
exports.updateQuestion = catchAsync(async(req,res,next)=>{
const question = await Question.findById(req.params.id);
if(!question){
    return next(new appError('The Question not found',404));
}
const test = await Test.findById(question.test);
const course = await Course.findById(test.course);
console.log(course.user);
if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
    console.log(req.user);
      return next(new appError('You are not authorized to perform this action', 403));
    }
    const updateQuestion = await Question.findByIdAndUpdate(req.params.id,req.body, {
        new:true ,
        runValidators:true
    });
    res.status(200).json({
        status:'Success',
    data: updateQuestion
    });
});
exports.deleteTest = catchAsync(async(req,res,next)=>{
const testID = req.params.id;
const test = await Test.findById(testID);
if(!test){
    return next(new appError('test not found',404));
}
const course = await Course.findById(test.course);
if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
    console.log(req.user);
      return next(new appError('You are not authorized to perform this action', 403));
    }
    await test.remove();
    await Question.deleteMany({test:testID});
    res.status(204).json({
        status:'Success',
        data:null
    });
});
exports.deleteQuestion = catchAsync(async(req,res,next)=>{
const questionID = req.params.id;
const question = await Question.findById(questionID);
if(!question){
    return next(new appError('The Question not found',404));
}
const test = await Test.findById(question.test);
const course = await Course.findById(test.course);
console.log(course.user);
if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
    console.log(req.user);
      return next(new appError('You are not authorized to perform this action', 403));
    }
    await question.remove();
    await Test.findByIdAndUpdate(test,{$pull:{questions:question._id}});
    res.status(204).json({
        status:'Success',
        data:null
    });
});

exports.getAllTests = catchAsync(async(req, res, next)=>{
    if(req.user.role !='superAdmin'){
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const tests = await Test.find();
    res.status(200).json({
        status:'Success',
        data:tests
    });
});
exports.getAllTestsForCourse = catchAsync(async(req, res, next)=>{
const courseId = req.params.courseId;
const tests = await Test.find({course:courseId});
if(!tests){
    return next(new appError('there is no tests',404));
}
res.status(200).json({
    status:'Success',
    data:tests
});
});
exports.getTest = catchAsync(async(req,res,next)=>{
    const test = await Test.findById(req.params.id);
    if(!test){
        return next(new appError('test not found',404));
    }
    res.status(200).json({
        status:'Success',
        data:test
    });
});
exports.getAllQuestionsForTest = catchAsync(async(req,res,next)=>{
const testID = req.params.id;
const questions = await Question.find({test:testID});
if(!questions){
 return next(new appError('there is no questions',404));
}
res.status(200).json({
status:'Success',
data:questions
});
});
exports.getQuestionForTest = catchAsync(async(req,res,next)=>{
const testID= req.params.testId;
const questionID= req.params.id;
const question = await Question.findOne({_id:questionID,test:testID});
if(!question){
    return next(new appError('question not found',404));
}
res.status(200).json({
status:'Success',
data:question
});
});

exports.checkTestAnswers = catchAsync(async (req, res, next) => {
  const testId = req.params.id;
  const user = req.user;
  const userAnswers = req.body.answers; // Array of boolean values for each question
  
  // Load the test, course, and lesson models
  const test = await Test.findById(testId).populate('questions').lean();
  if(test.level !==0){
    return next(new appError('Wrong test please try again with the correct test',400));
  }
  const course = await Course.findById(test.course).lean();
  const lessons = await Lesson.find({ course: course._id }).lean();
  const totalQuestions = test.questions.length;
  console.log(test.questions.length);
  // Count the number of correct answers
 
  // Calculate the percentage of correct answers
  const percentageCorrect = (userAnswers / totalQuestions) * 100;
  console.log(percentageCorrect);

 // Check if user has already taken the test
 const testAttend = user.courseAttend.reduce((found, courseAttendObj) => {
  if (courseAttendObj.testAttend.some(test => test.testId.toString() === testId.toString())) {
    return courseAttendObj.testAttend.find(test => test.testId.toString() === testId.toString());
  }
  return found;
}, null);
console.log('testAttend',testAttend.percentageCorrect);
if (testAttend) {
  return res.status(200).json({
    status: 'success',
    message: 'You have already completed this test!',
    data: {
      testAttend,
    },
  });
}else{

  // Determine which lessons to unlock based on the percentage correct
  const courseId = course._id;
  const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === courseId.toString());
  console.log(courseAttendIndex);
  if(courseAttendIndex=== -1 ) {
      return next(new appError('you dont get started start this course please start it'));
  }
  let unlockedLessons = [];
  if(percentageCorrect<=30){
    res.status(200).json({
      status: 'success',
      message:'oh Sad please Study course from the beginning 😥',
    });
  }
  if (31<=percentageCorrect &&percentageCorrect <= 45) {
    console.log(3);
    unlockedLessons = lessons.filter(lesson => lesson.level === 1).map(lesson => lesson._id);
  } else if (46<= percentageCorrect && percentageCorrect <= 70) {
    console.log(2);
    unlockedLessons = lessons.filter(lesson => lesson.level <= 2).map(lesson => lesson._id);
  } else if (71<=percentageCorrect) {
    console.log(0);
    unlockedLessons = lessons.map(lesson => lesson._id);
  } 
  
  // Update the user's unlocked lessons for the course
const courseAttend = user.courseAttend[courseAttendIndex];
const uniqueLessonIds = unlockedLessons.filter((lessonId) => !courseAttend.lessonsAttend.includes(lessonId));
courseAttend.lessonsAttend = courseAttend.lessonsAttend.concat(uniqueLessonIds);

 // Populate the course and lesson instances for the unlocked lessons
 const populatedLessons = await Lesson.find({ _id: { $in: courseAttend.lessonsAttend } }).populate('course', 'name').lean();
//  console.log('populatedLessons',populatedLessons);
const result = await User.findOneAndUpdate(
    {_id:user._id, 'courseAttend.courseAttend': courseId},
    { $set: { 'courseAttend.$.lessonsAttend': courseAttend.lessonsAttend },
      $push:{'courseAttend.$.testAttend':{
        testId,
        percentageCorrect,
      }}   
    },
    { new: true },
  );
  
  // Return an error if the update was not successful
  if (!result) {
    return next(new appError('Failed to update user'));
  }
  // Return the unlocked lessons as well as the percentage of correct answers
   if (percentageCorrect === 100) {
    res.status(200).json({
      status: 'success',
      message:'Congratulations! You have finished this course.',
      data: {
        percentageCorrect,
        unlockedLessons: populatedLessons,
      },
    });
  }else{
  res.status(200).json({
    status: 'success',
    data: {
      percentageCorrect,
      unlockedLessons: populatedLessons,
    },
  });}}
});
exports.levelTestChecking = catchAsync(async(req,res,next)=>{
  let hasAllLevelLessons;
const testIdd = req.params.id;
const test = await Test.findById(testIdd);
const testLevel = test.level;
if(test.level ===0 ){
  return next(new appError('Wrong test please try again with the correct test',400));
}
const course = await Course.findById(test.course).lean();
const user = req.user;
const userAnswers = req.body.answers;
const courseAttendIndex = user.courseAttend.findIndex((c) => c.courseAttend._id.toString() === course._id.toString());
console.log(courseAttendIndex);
if(courseAttendIndex=== -1 ) {
    return next(new appError('you dont get started start this course please start it'));
}
const lessons = await Lesson.find({ course: course._id }).lean().sort({
  level: 1,
  createdAt: 1,
});
const totalQuestions = test.questions.length;
const percentageCorrect = (userAnswers / totalQuestions) * 100;
const testAttend = user.courseAttend.reduce((found, courseAttendObj) => {
 if (courseAttendObj.testAttend.some(test => test.testId.toString() === testIdd.toString())) {
   return courseAttendObj.testAttend.find(test => test.testId.toString() === testIdd.toString());
 }
 console.log('found',found);
 return found;
}, null);
console.log('testAttend',testAttend);
 if (testAttend && testAttend.percentageCorrect >=60 ) {
  return res.status(200).json({
    status: 'success',
    message: 'You have already completed this test!',
    data: {
      testAttend,
    },
  });
}else{


  if(testLevel === 1 || testLevel === 2 || testLevel === 3){
  const lessonsAttend = user.courseAttend.find(c => c.courseAttend.toString() === course._id.toString()).lessonsAttend;
  console.log('lessonsAttend',lessonsAttend);
  const levelLessons = lessons.filter(l => l.level === testLevel);
  console.log('testLevel', testLevel);
  const levelLessonsIds = levelLessons.map(l => l._id.toString());
  console.log('levelLessonsIds', levelLessonsIds);
   hasAllLevelLessons = levelLessonsIds.every(id => lessonsAttend.includes(id));
  console.log(2);
  // console.log('hasAllLevelLessons', hasAllLevelLessons);
  }
  else if(testLevel === 4){
    const lessonsAttend = user.courseAttend.find(c => c.courseAttend.toString() === course._id.toString()).lessonsAttend;
    console.log(lessonsAttend);
    const lessonsIds = lessons.map(lesson => lesson._id.toString() );
    console.log(lessonsIds);
      hasAllLevelLessons = lessonsIds.every(id => lessonsAttend.includes(id));
    console.log('test level is 4 ',1);
    const updatedUser =  await User.findByIdAndUpdate(
      user._id,
      {
        $push: { finishedCourse:{finishedCourse: course._id, results:percentageCorrect}},
      },
      { new: true }
      );
     }
  
  if (hasAllLevelLessons) {
    // If the user has attended all the lessons, add the test to the user's testAttend array
    if(testAttend && testAttend.percentageCorrect <60){
          updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            'courseAttend.$[courseAttendObj].testAttend': {
              testId: test._id,
              percentageCorrect,
            },
          },
        },
        {
          new: true,
          arrayFilters: [{ 'courseAttendObj.courseAttend': course._id }],
        },
      );
    }else{
     updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          'courseAttend.$[courseAttendObj].testAttend': {
            testId: test._id,
            percentageCorrect,
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ 'courseAttendObj.courseAttend': course._id }],
      },
    );
    }
    // Check if the user passed or failed the test
    if (percentageCorrect >= 60) {
      console.log('you did it');
      res.status(200).json({
        status: 'success',
        message: 'Congratulations! You passed the test!',
        data: {
          testAttend: updatedUser.courseAttend.find(c => c.courseAttend.toString() === course._id.toString()).testAttend.find(t => t.testId.toString() === testIdd.toString()),
        },
      });
    } else {
      next(new appError('Sorry, you failed the test. Please try again later.', 400));
    }
  } else {
    next(new appError('You must attend all the lessons for this test level before taking the test.', 400));
  }
}
});
// exports.finaltest = catchAsync(async(req,res,next)=>{
// const testId = req.params.id;
// const test = await Test.findByid(testId);
// if(test.level !== 4){
//   return next(new appError('Wrong test please try again with the correct test',400));
// }
// const course = await Course.findByid(test.course);
// const user = req.user;
// const userAnswers = req.body.answers;
// const lessons = await Lesson.find({ course: course._id }).lean().sort({
//   level: 1,
//   createdAt: 1,
// });
// const totalQuestions = test.questions.length;
// const percentageCorrect = (userAnswers / totalQuestions) * 100;
// const testAttend = user.courseAttend.reduce((found, courseAttendObj) => {
//   if (courseAttendObj.testAttend.some(test => test.testId.toString() === testId.toString())) {
//     return courseAttendObj.testAttend.find(test => test.testId.toString() === testId.toString());
//   }
//   return found;
//  }, null);
//  console.log('testAttend',testAttend);
//   if (testAttend && testAttend.percentageCorrect >=60 ) {
//    return res.status(200).json({
//      status: 'success',
//      message: 'You have already completed this test!',
//      data: {
//        testAttend,
//      },
//    });
//  }else{
//   const lessonsAttend = user.courseAttend.find(c => c.courseAttend.toString() === course._id.toString()).lessonsAttend;
// const lessonIds = lessons.map(I => I._id.toStirng() );
// const  haveAllLessons = lessonsIds.every(id => lessonAttend.include(id));
//  }
// });