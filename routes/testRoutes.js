const  express = require('express');
const testController = require('./../controllers/testController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.post('/CreateTest',authController.protect,testController.createTest);
router.post('/CreateQuestion',authController.protect,testController.createQuestion);
router.patch('/UpdateTest/:id',authController.protect,testController.updateTest);
router.patch('/UpdateQuestion/:id',authController.protect,testController.updateQuestion);
router.delete('/DeleteTest/:id',authController.protect,testController.deleteTest);
router.delete('/DeleteQuestion/:id',authController.protect,testController.deleteQuestion);
router.get('',authController.protect,testController.getAllTests);
router.get('/getTests/:courseId',authController.protect,testController.getAllTestsForCourse);
router.get('/:id',authController.protect,testController.getTest);
router.get('/AllQuestions/:id',authController.protect,testController.getAllQuestionsForTest);
router.get('/Question/:testId/:id',authController.protect,testController.getQuestionForTest);
router.patch('/checkTestAnswers/:id',authController.protect,testController.checkTestAnswers);
router.patch('/levelTestChecking/:id',authController.protect,testController.levelTestChecking);
module.exports= router;