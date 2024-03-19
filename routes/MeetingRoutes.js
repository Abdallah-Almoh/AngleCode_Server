const express = require('express');
const authController = require('../controllers/authController');
const MeetingController = require('../controllers/MeetingController');

const router = express.Router();

router.post('/createMeeting',authController.protect,MeetingController.UploadPhoto,MeetingController.CreateMeeting);
router.patch('/updateMeeting/:id',authController.protect,MeetingController.UploadPhoto,MeetingController.updateMeeting);
router.delete('/deleteMeeting/:id',authController.protect,MeetingController.deleteMeeting);
router.patch('/joinMeeting/:id',authController.protect,MeetingController.joinMeeting);
router.get('/All',MeetingController.getAllMeetings);
router.get('/MyMeetings',authController.protect,MeetingController.MyMeetings);
router.get('/meetingsCr',authController.protect,MeetingController.MyCreatedMeeting);
router.get('/:id',MeetingController.getMeeting);
module.exports =router;