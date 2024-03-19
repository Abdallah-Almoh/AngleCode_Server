const express = require('express');
const User_CourseController = require('../controllers/User_CourseController');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const AdController = require('../controllers/AdController');
const router = express.Router();
router.post('/CreateAd',authController.protect,AdController.UploadPhoto,AdController.AddAd);
router.patch('/AddCourseToFav/:id',authController.protect,User_CourseController.AddCoursetoMyCourses);
router.patch('/lesso/:id',authController.protect,User_CourseController.unlockLessons);
router.get('/progress/:id',authController.protect,User_CourseController.progress);
router.get('/myfav',authController.protect,User_CourseController.myfavCourses);
router.get('/myFavAndUnlock',authController.protect,User_CourseController.getMyFavCoursesAndUnlockedLessons);
router.get('/unlockedLesson/:id',authController.protect,User_CourseController.getunlockLessonsForCourse);
router.get('/viewsWebsite',authController.protect,courseController.getViewsForWebsite);
router.get('/UnAcceptedAds',authController.protect,AdController.getUnAcceptedAd);
router.patch('/AcceptAd/:id',authController.protect,AdController.AcceptAd);
router.patch('/updateAd/:id',authController.protect,AdController.UploadPhoto,AdController.updateAd);
router.get('/getAds',authController.protect,AdController.getAds);
router.get('/getAcceptedAds',authController.protect,AdController.getAcceptedAds);
router.delete('/deleteAd/:id',authController.protect,AdController.deleteAd);
module.exports = router;