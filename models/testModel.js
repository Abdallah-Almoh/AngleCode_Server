
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
      type: String,
    },
    correctAnswer: {
      type: String,
    },
    answerOptions: {
      type: [String],
    },
    question_level: {
      type: Number
    },
    test:{
      type: mongoose.Schema.ObjectId,ref:'Test',
    }
});

const Question = mongoose.model('Question', questionSchema);

const testSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  course: {
   type: mongoose.Schema.Types.ObjectId, ref: 'Course' ,
  },
  about: {
    type: String,
  },
  questions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  },
  limit_time: {
    type: Number,
  },
  level:{
    type:Number
  }
});

const Test = mongoose.model('Test', testSchema);

module.exports = { Test, Question };