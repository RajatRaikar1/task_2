const mongoose = require('mongoose')
const Course_test = require('../models/course_test')

const courseSchema = new mongoose.Schema({
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


    registeredForCourse: [{
        type: String

    }]

})

// courseSchema.virtual('users',{
//     ref: 'User',
//     localField: '_id',
//     foreignField: 'user'    
// })
const Course = mongoose.model('course', courseSchema)

module.exports = Course