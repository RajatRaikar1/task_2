const mongoose = require('mongoose')

const course_test1_Schema = new mongoose.Schema({
    question: {
        type:String,
        required: true,
        trim: true
    },
    answer: {
        type:String,
        required: true,
        trim: true
    },
    mark:{
        type: Number
    },
    scheduledDate:{
        type:String,
        required:true


    }
})

const studentCourseTest = mongoose.model('coursetest', course_test1_Schema)
module.exports =  studentCourseTest