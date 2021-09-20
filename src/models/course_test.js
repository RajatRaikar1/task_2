const mongoose = require('mongoose')

const course_test_Schema = new mongoose.Schema({
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

const Course_test = mongoose.model('course_test', course_test_Schema)
module.exports =  Course_test