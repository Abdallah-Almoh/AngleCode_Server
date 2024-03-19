const express = require('express');

const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/CreateCourses', authController.protect,courseController.UploadPhoto,courseController.createCourse);
router.delete('/DeleteCourse/:id', authController.protect,courseController.deleteCourse);
router.patch('/UpdateCourse/:id',authController.protect,courseController.UploadPhoto, courseController.updateCourse);
router.get('/MyCourses/:id',authController.protect,courseController.getMyCourse);
router.get('/getUnAcceptedCourse',authController.protect,courseController.getAllUnAcceptedCourses);
router.patch('/ApproveCourse/:id',authController.protect,courseController.approveCourse);
router.get('/getCoursesCount',authController.protect,courseController.getCoursesCount);
router.get('/usersAttend/:id',authController.protect,courseController.userAttendsforCourse);
router.get('/getLastCoursesCreated',authController.protect,courseController.getlastCoursesCreated);
router.get('', courseController.getAllCourses);
router.get('/AllCourses',authController.protect,courseController.getAllCoursesForAdmin);

router.get('/:id',courseController.getCourse);
module.exports = router;
