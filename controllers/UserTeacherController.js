const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const User = require('../models/userModel');
const UserTeacher = require('../models/userTeacherModel');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${uuidv4()}-User-${req.user.id}-${Date.now()}.${ext}`);
    }

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
exports.UploadPhoto = Upload.array('images', 10);


exports.becomeTeacher = catchAsync(async(req, res, next) => {

    if (req.user.role !== 'user') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const user = req.user;
    console.log(user);
    const requestTeach = await UserTeacher.find({ userid: user._id });
    console.log('req', requestTeach);
    if (requestTeach.length !== 0) {
        return next(new appError('you already sent request', 400));
    }

    const images = req.files.map(file => file.filename);

    const newTeacher = new UserTeacher({
        userid: user.id,
        images: images ? images : null,
        message: req.body.message
    });
    const reqCreated = await newTeacher.save();
    res.status(200).json({
        status: 'Success',
        data: reqCreated
    });
});
exports.getAllBecomeTeacherReq = catchAsync(async(req, res, next) => {
    const user = req.user;
    console.log(user);
    if (user.role !== 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }

    const requests = await UserTeacher.find({ accepted: false });
    res.status(201).json({
        status: 'Success',
        data: requests
    });
});
exports.approveTeacher = catchAsync(async(req, res, next) => {
    const user = req.user;
    if (user.role !== 'superAdmin') {
        return next(new appError('You are not authorized to perform this action', 403));
    }
    const reqId = req.params.id;
    const userTeacher = await UserTeacher.findById(reqId);
    const usersender = await User.findById(userTeacher.userid);
    if (userTeacher.accepted === true) {
        return next(new appError('You already approved this user to TEACHER', 403));
    }
    await UserTeacher.findOneAndUpdate({ userid: usersender._id }, { accepted: true }, { new: true });
    const updatedUser = await User.findByIdAndUpdate(usersender._id, { role: 'admin' }, { new: true });
    res.status(201).json({
        status: 'Success',
        data: updatedUser
    });
});
exports.getMyRequestToBecomeTeacher = catchAsync(async(req, res, next) => {
    const Myreq = await UserTeacher.find({ userid: req.user._id });
    res.status(201).json({
        status: 'Success',
        data: Myreq
    });
});
exports.deleterequestToBecomeTeacher = catchAsync(async(req, res, next) => {
    const reqId = req.params.id;
    const user = req.user;
    const requestTeach = await UserTeacher.findById(reqId);
    console.log(requestTeach);
    if (!requestTeach) {
        return next(new appError('you didnt send request yet', 400));

    } else if (user.role !== 'superAdmin' && requestTeach.userid.toString() !== user._id.toString()) {
        return next(new appError('You are not authorized to perform this action', 403));
    } else if (requestTeach.accepted === true) {
        return next(new appError('you cant delete this request because it already accepted', 400));
    }

    await UserTeacher.findByIdAndDelete(reqId);
    res.status(201).json({
        status: 'Success',
        data: null
    });
});