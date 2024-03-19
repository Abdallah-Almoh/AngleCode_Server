const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Course = require('../models/CourseModel');
const Lesson = require('../models/lessonModel');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const Views = require('../models/viewsModel');
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img'); // specify the folder where uploaded files will be stored
    },
    filename: (req, file, cb) => {
            const ext = file.mimetype.split('/')[1];
            cb(null, `${uuidv4()}-Course-${req.user.id}-${Date.now()}.${ext}`);
        }
        // filename: (req, file, cb) => {
        //   const filename = `${uuidv4()}${path.extname(file.originalname)}`; // generate a unique filename for the uploaded file
        //   cb(null, filename);
        //}
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new appError('Not an image ! please uploade image', 40), false);
    }
};
const Upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.UploadPhoto = Upload.single('photo');

// exports.createCourse = catchAsync(async(req, res, next) => {
//   console.log('req.body',req.body);
//   console.log('req.file',req.file);
//   if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
//     return next(new appError('You are not authorized to create a new course', 403));
//   }
//     const newCourse = new Course({
//       name: req.body.name,
//       description: req.body.description,
//       imageCover: req.file ? req.file.filename : null,
//       user: req.user._id,
//       requirements: req.body.requirements ? req.body.requirements.split(",") : ['you can start learning no need to learn anything to start learning this ']
//     });

//     try {
//       const createdCourse = await newCourse.save();
//       const updatedUser = await User.findByIdAndUpdate(
//         req.user._id,
//         { $push: { course: createdCourse._id } },
//         { new:true }
//       );

//       if (!updatedUser) {
//         return next(new appError('User not found', 404));
//       }

//       res.status(201).json({
//         status: 'success',
//         data: { course: createdCourse }
//       });
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
// });
exports.createCourse = catchAsync(async(req, res, next) => {
    console.log('req.body', req.body);
    console.log('req.file', req.file);
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to create a new course', 403));
    }
    const newCourse = new Course({
        name: req.body.name,
        description: req.body.description,
        imageCover: req.file ? req.file.filename : null,
        user: req.body.user,
        requirements: req.body.requirements ? req.body.requirements.split(",") : ['you can start learning no need to learn anything to start learning this ']
    });

    try {
        const createdCourse = await newCourse.save();
        const updatedUser = await User.findByIdAndUpdate(
            req.body.user, { $push: { course: createdCourse._id } }, { new: true }
        );

        if (!updatedUser) {
            return next(new AppError('User not found', 404));
        }

        res.status(201).json({
            status: 'success',
            data: { course: createdCourse }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteCourse = catchAsync(async(req, res, next) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    if (!course) {
        return next(new appError('Course not found', 404));
    }
    const userId = course.user;
    const lessonsIds = course.lesson;
    await course.remove();
    await User.findByIdAndUpdate(userId, {
        $pull: {
            lesson: { $in: lessonsIds },
            course: courseId
        },
    });
    await Lesson.deleteMany({ course: courseId });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
exports.updateCourse = catchAsync(async(req, res, next) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const updatedCourseData = {
        name: req.body.name || course.name,
        description: req.body.description || course.description,
        imageCover: req.file ? req.file.filename : course.imageCover,
        requirements: req.body.requirements ? req.body.requirements.split(",") : course.requirements,
        hidden: req.body.hidden || course.hidden
    };

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updatedCourseData, {
        new: true,
        runValidators: true
    });
    if (!updatedCourse) {
        return next(new appError('no Course found with this id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            updatedCourse
        }
    });
});

exports.getAllCourses = catchAsync(async(req, res, next) => {
    const courses = await Course.find({ hidden: { $in: [false, null] }, accepted: { $in: [true] } }).populate('user', 'first_name last_name avatar');
    await Views.findByIdAndUpdate('64c90c1a556950954e56bd56', { $inc: { viewsCount: 1 } }, { new: true });
    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses,
        },
    });
});
// exports.getCourse = catchAsync(async (req, res, next) => {
//   const courseId = req.params.id;

//   const course = await Course.findById(courseId).populate('user', 'first_name last_name avatar').populate('lesson','title level ');
// course.views++;
// await course.save();
//   if (!course) {
//     return next(new appError('Course not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       course,
//     },
//   });
// });
exports.getCourse = catchAsync(async(req, res, next) => {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
        .populate('user', 'first_name last_name avatar')
        .populate('lesson', 'title level ');

    if (!course) {
        return next(new appError('Course not found', 404));
    }

    if (req.user && req.user.viewedCourses.includes(courseId)) {

    } else if (req.cookies.viewedCourses && req.cookies.viewedCourses.includes(courseId)) {

    } else {
        course.views++;
        await course.save();


        if (!req.user) {
            const viewedCourses = req.cookies.viewedCourses || [];
            viewedCourses.push(courseId);
            res.cookie('viewedCourses', viewedCourses, { maxAge: 86400000 });
        } else {
            req.user.viewedCourses.push(courseId);
            await req.user.save();
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            course,
        },
    });
});

exports.getMyCourse = catchAsync(async(req, res) => {
    const userId = req.params.id;
    const courses = await Course.find({ user: userId });
    res.status(200).json({
        status: 'success',
        length: courses.length,
        data: {
            courses
        }
    });
});
exports.getAllCoursesForAdmin = catchAsync(async(req, res, next) => {
    console.log(req.user);
    if (req.user.role !== 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const courses = await Course.find().populate('user', 'first_name last_name avatar');

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses,
        },
    });
});
exports.getAllUnAcceptedCourses = catchAsync(async(req, res, next) => {
    if (req.user.role != 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const UnAcceptedCourses = await Course.find({ accepted: false }).populate('user', 'first_name last_name avatar');
    res.status(201).json({
        status: 'Success',
        data: UnAcceptedCourses
    });
});

exports.approveCourse = catchAsync(async(req, res, next) => {

    if (req.user.role != 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (course.accepted === true) {
        return next(new appError(' this course is already accepted', 403));
    }
    const updatedCourse = await Course.findByIdAndUpdate(courseId, { accepted: true, hidden: false }, { new: true });
    res.status(201).json({
        status: 'Success',
        data: updatedCourse
    });
});

exports.getCoursesCount = catchAsync(async(req, res, next) => {
    if (req.user.role != 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const CoursesCount = [];
    const TotalCourseCount = await Course.countDocuments();
    const visibleCourseCount = await Course.countDocuments({ hidden: { $in: [false, null] }, accepted: { $in: [true, null] } });
    const hiddenCourseCount = await Course.countDocuments({ hidden: { $in: [true] } });
    const unAcceptedCourseCount = await Course.countDocuments({ accepted: { $in: [false] } });
    CoursesCount.push(TotalCourseCount, visibleCourseCount, hiddenCourseCount, unAcceptedCourseCount);
    res.status(201).json({
        status: 'success',
        data: CoursesCount
    });
});
exports.userAttendsforCourse = catchAsync(async(req, res, next) => {

    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (req.user.role !== 'superAdmin' && course.user.toString() !== req.user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const users = await User.find({ 'courseAttend.courseAttend': courseId }).select('first_name last_name avatar');
    res.status(201).json({
        status: 'Success',
        count: users.length,
        data: users
    });
});
exports.getlastCoursesCreated = catchAsync(async(req, res, next) => {
    if (req.user.role !== 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const courses = await Course.find().select('name imageCover').sort({ createdAt: -1 }).populate('user', 'first_name last_name avatar').limit(5);
    res.status(201).json({
        status: 'Success',
        data: courses
    });
});

exports.getViewsForWebsite = catchAsync(async(req, res, next) => {
    if (req.user.role !== 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const views = await Views.findById('64c90c1a556950954e56bd56');
    res.status(200).json({
        status: 'Success',
        data: views.viewsCount
    });
});