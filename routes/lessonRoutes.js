const express = require('express');
const router = express.Router();
const lessonController = require('./../controllers/lessonController');
const authController = require('./../controllers/authController');

router.post('/CreateLesson',authController.protect,lessonController.createLesson);
router.delete('/DeleteLesson/:id',authController.protect,lessonController.deleteLesson);
router.patch('/UpdateLesson/:id',authController.protect,lessonController.updateLesson);
router.get('/:id',lessonController.getAllLessonsForCourse);
router.get('/ALL/:id',authController.protect,lessonController.getAllLessonsForCourseForAdmin);
router.get('/Lesson/:id',lessonController.getLesson);
module.exports = router;