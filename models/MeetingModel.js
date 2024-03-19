const { string } = require('joi');
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
title:String,
link:String,
content:String,
userCreater:{
    type:mongoose.Schema.Types.ObjectId,ref:'User'
},
users:[{ 
    type:mongoose.Schema.Types.ObjectId,ref:'User'
}],
startDate:Date,
duration:Number,
image:String
});
const Meeting = mongoose.model('Meeting',meetingSchema);
module.exports = Meeting;