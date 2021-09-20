const mongoose = require('mongoose')
const Course_test = require('../models/course_test')

const studentCourseSchema = new mongoose.Schema({
    courseId:{
        type:String,
        requrired:true
    },
    courseName: {
        type: String,
        trim: true,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    tests: {
        type: mongoose.Schema.Types.ObjectId,
        //unique:true,
        ref: 'course_test'

    },
    assignment:{
        type:String
    },
    progress:{
        type:Number,
        default:0

    },
    testMarks:{
        type: Number,
        default:0
    }, 
    assignmentMarks:{
        type: Number,
        default:0
    }

})


const studentCourse = mongoose.model('studentcourse', studentCourseSchema)

module.exports = studentCourse