const mongoose = require('mongoose');
const slugify = require('slugify');
const courseSchema = new mongoose.Schema({

    name:{
        type: 'string',
        required: [true,'the course should have name '],
        maxLength:[30,'the course name should be less than 30 characters'],

    },
    description:{
        type: 'string',
        required: [true,'the course should have description']
    },
    imageCover:{
        type:'string'
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt: Date,
lesson:[{
    type: mongoose.Schema.Types.ObjectId,ref:'Lesson'
}],
user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A course must have a user'],
  },
  views:{
    type:Number,
    default:0
},
requirements:{
    type:[String]
},
hidden:{
    type:Boolean,
    default:true
},
accepted:{
    type:Boolean,
    default:false
},

});

const Course = mongoose.model('Course',courseSchema);
module.exports = Course; 