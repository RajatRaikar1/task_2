const mongoose = require('mongoose')
const emailValidator = require('email-validator')
const Course = require('../models/coursemodel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!emailValidator.validate(value)){
                throw new Error('emailid is in wrong format')
            }
        }
    },

    role: {
        type: String,
        required: true,
        enum: ["teacher", "admin" , "student"]
    },

    password: {
        type: String,
        //default:'12345678',
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if((value==="")){
                throw new Error('emailid is in wrong format')
            }
        }
        },
    
    tokens: [{
        token:{
        type: String,
        required: false
        }
    }],
    courses: [{
        course:{
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            required: false,
            ref: 'studentcourse'
        }
    }],
    xp:{
        type:Number,
        default:0
    },
    level:{
        type:Number,
        default:0
    }
    })


userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
    }

userSchema.methods.addingCourseIntoList =  function (_id,id) {
    const student = this
    // const student = User.findOne({id})
    const course =  Course.findBtId({_id})
    console.log('in addingcourse')
    student.courses = student.courses.concat({ course })
    student.save()
    return course
    }

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'managemesystem', { expiresIn: '5 second' })
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User