const express = require('express')
const User = require('../models/usermodel')
const Course = require('../models/coursemodel')
const studentCourse = require('../models/studentCourseModel')
const router = new express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')

router.use(bodyParser.urlencoded({ extended: false }));

// index Page
router.get('/', async (req, res) => {
    res.render('index')
})

// signUp Page
router.get('/signup', async (req, res) => {
    res.render('signup')
})

// Register Page
router.post('/register', async (req, res) => {
    try{
    const user = new User({
        username : req.body.username,
        emailId : req.body.emailId,
        password : req.body.password,
        role: req.body.role
    })
    await user.save()
    res.status(201).send(user)
    }catch(e){
        res.status(400).send('Enter Proper Details like valid mailID or Length of the password must be more than 7 characters...!')
    }

})

// SignIn Page
router.get('/signin', async (req, res) => {
    res.render('signin')
})

// Signing Page
router.post('/userSignin', async (req, res) => {
    try{
        const user = await User.findOne({emailId:req.body.emailId})
        if(!user){
            throw new Error('invalid details')
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) {
            throw new Error('Unable to login')
        }
        
        const tok = user.generateAuthToken()

        if(user.role === 'admin'){
            const users = await User.find({})

            return res.render('adminHomePage',
            {admin:user,all:users})
        }
      
    }catch(e){
        res.status(400).send('<h1>Unable to login</h1>')
    }
})

// Adding course to teacher
router.post('/addingCourseToTeacher', async (req, res) => {
    try{ 
        console.log(req.body._id_teacher)  
        const teacher = await User.findById({_id:req.body._id_teacher})
        console.log('teacher')  
        const course = await Course.findById({_id:req.body._id_course})
        console.log('course')  
        teacher.courses.push(course)      
        await User.update({_id:req.body._id_teacher},{$set:{
            courses:teacher.courses
        }})     
        console.log(teacher)    
        res.send(teacher)   
 
    }catch(e){ 
        res.status(400).send('error')
    } 
})


// List of teachers
router.get('/listOfTeachers', async (req, res) => { 
    try{
    const teachers = await User.find({role:'teacher'})
    const courses = await Course.find({})
    console.log(courses)
    
    return res.render('listOfTeachers',{teachers:teachers, courses:courses})
    }catch(e){
        return res.status(400).send('something went wrong try to refresh it...!')
    }
})

// assigned courses for teacher
router.get('/showAssignedCourses', async (req, res) => {
    try{
    const students = await User.findById({_id:req.query.id})
    const courses = []
    console.log(students)
    for(let i = 0 ; i < students.courses.length; i++){
        const _id = students.courses[i]._id
        console.log(_id)
        const course = await Course.findById({_id:_id})
        console.log(course)
        courses.push(course)
    }
    return res.send(courses)
    }catch(e){
        return res.status(400).send('something went wrong try to refresh it...!')
    }
})


//editing Student details
router.get('/updateDetails', async (req, res) => {
    const studentDetail = await User.findById({_id:req.query.id})
    return res.render('studentDetailUpdate',{student:studentDetail})
})

router.post('/update', async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(req.query.id)
    const allowedUpdates = ['username', 'emailId','role', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    console.log(isValidOperation)
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        const student =  await User.findOne({_id: req.query.id})
        console.log(student)
        if(!student)
            return res.status(400).send('You Have Changed Id Please refresh the page ')

        console.log('k')
        if(req.body.username!=""){
            await User.updateOne({_id:req.query.id},{$set:{
                username:req.body.username
    
            }})
        }
        
        console.log("hi")
        if((req.body.password!=='123456789') ){
            const pass =  await bcrypt.hash(req.body.password, 8)
            console.log(pass)
            
            await User.updateOne({_id:req.query.id},{$set:{
                password:pass
    
            }})
        }
        const userEmail = req.body.emailId
        if((userEmail!=="")){
            await User.updateOne({_id:req.query.id},{$set:{
                emailId:userEmail
    
            }})
        res.send(student)
        } 
    } catch (e) {
        res.status(400).send('Error')
    } 
})

//Deleting student details 
router.get('/deteteDetails', async (req, res) => { 
    try{
    console.log(req.query.id)
    const student = await User.deleteOne({_id:req.query.id})
    console.log(student)
    
    return res.send('<h1> User deleted Successfully </h1>')
    }catch(e){
        return res.status(400).send('something went wrong try to refresh it...!')
    }
})

// List of students
router.get('/listOfStudents', async (req, res) => { 
    const students = await User.find({role:'student'})
    
    return res.render('listOfStudents',{students:students})
})

// showing enrolled courses by each student
router.get('/showEntrolledCourses', async (req, res) => {
    try{
    const students = await User.findById({_id:req.query.id})
    const courses = []
    console.log(students)
    if(students.courses.length===0)
        return res.send('student not yet registered any courses')
    for(let i = 0 ; i < students.courses.length; i++){
        const _id = students.courses[i]._id
        console.log(_id)
        const course = await studentCourse.findById({_id:_id})
        console.log(course)
        courses.push(course)
    }
    return res.send(courses)
    }catch(e){
        return res.status(400).send('something went wrong try to refresh it...!')
    }
})

router.get('/issueCertificate', async (req, res) =>{
    try{
        const students = await User.findById({_id:req.query.id})
        const courses = []
        console.log(students)
        if(students.courses.length===0)
            return res.send('student not yet registered any courses')
        for(let i = 0 ; i < students.courses.length; i++){
            const _id = students.courses[i]._id
            console.log(_id)
            const course = await studentCourse.findById({_id:_id})
            if(student.progress >= student.duration)
            {
                return res.send('issue')
            }
        }
        return res.send(courses)
        }catch(e){
            return res.status(400).send('something went wrong try to refresh it...!')
        }

})
router.get('/course/delete', async (req, res)=> {
    const course = await Course.deleteOne({_id:req.query.id})
    console.log(course)
    return res.send('deleted')

})

router.get('/logout', async (req, res) => {
    return res.render('signin')
})

module.exports = router
