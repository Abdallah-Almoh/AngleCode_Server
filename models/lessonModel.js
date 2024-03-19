const { string } = require('joi');
const mongoose = require('mongoose');
const lessonSchema = new mongoose.Schema({
title: {
    type: 'string',
    required: [true,'the lesson should have title']
},
content:{
  type:'string'
},
level:{
type: 'number',
},
  hidden:{
  type: Boolean,
  default: false,
},
course:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A course must have a user'],
  },
  test: [
    {
      question: {
        type: String,
        required: [true, 'A question must have a text'],
      },
      options: {
        type: [String],
        required: [true, 'A question must have options'],
      },
      answer: {
        type: Number,
        required: [true, 'A question must have an answer'],
      },
    },
  ],
},
{
  timestamps: true,


}); 

const Lesson =mongoose.model('Lesson',lessonSchema);
module.exports = Lesson;