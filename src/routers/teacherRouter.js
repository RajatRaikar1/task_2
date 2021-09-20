const express = require('express')
const Course = require('../models/coursemodel')
const User = require('../models/usermodel')
const studentCourse = require('../models/studentCourseModel')
const studentCourseTest = require('../models/studentCourseTestModel')
//onst studentCourseTest = require('../models/studentCourseTestModel')
const Course_test = require('../models/course_test')
const router = new express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/teacher/signin', (req, res) => {
    res.render('teacherSigninPage')
})

router.post('/teacher_signin', async (req, res) => {
    try{
        console.log(req.body.emailId) 
        const teacher = await User.findOne({emailId:req.body.emailId})
        if(!teacher){
            throw new Error('invalid details')
        }
        const isMatch = await bcrypt.compare(req.body.password, teacher.password)
        if (!isMatch) {
            throw new Error('Unable to login')
        }
        if(teacher.role!='teacher'){
            return res.send('you are not authorised to login')
        }
        req.session.teacherId=teacher._id
        console.log(req.session.teacherId)
        return res.render('teacherHomePage',{
            teacher:teacher
        })  
    }catch(e){
        return res.status(400).send('error')
    } 
})

router.post('/update-student-personal', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['_id', 'username', 'password','emailId']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        const student =  await User.findById({_id: req.body._id})
        console.log(student)  
        if(req.body.username!=""){
            const student = await User.findOneAndUpdate({_id: req.body._id},    
            {
                username:req.body.username 
            
            })
        }
        if((req.body.password!=='123456789') ){
            const pass =  await bcrypt.hash(req.body.password, 8)
            console.log(pass)
            
            const student =  await User.findOneAndUpdate({_id: req.body._id},
            {
                password:pass
            })
        }   
        // const userEmail = req.body.emailId
        if((req.body.userEmail!=="")){
        const student =  await User.findOneAndUpdate({_id: req.body._id},//,{validate:true},
        {
            emailId:req.body.emailId     
        })
        }

        console.log(student) 
        return res.send(student)
         
    } catch (e) {
        return res.status(400).send('Error')
    } 
})

router.get('/allCourses/teacher', async (req, res) => {
    try{
        console.log(req.session.teacherId)
        const teacher = await User.findById({_id:req.session.teacherId})
        const courses =[]
        for(let i = 0 ; i< teacher.courses.length ; i++){
            const course = await Course.findById({_id:teacher.courses[i]._id})
            courses.push(course)
        }
        return res.render('teacherAssignedCourses',{
            courses:courses})  
    }catch(e){
        return res.status(400).send(e) 
    }
})




router.get('/teacher/getStudents', async (req, res) => {
    const students = await User.find({role:"student"})
    return res.render('studentList',{
        students:students
    })

})
router.get('/teacher/studentInEachCourse', async (req, res) => {
    const mainCourse = []
    const course = await Course.find({})
    for(let i = 0 ; i < course.length ; i++){
        const courseTest = await Course_test.findById({_id:course[i].tests})
        mainCourse.push(courseTest)
    }

    const student = await User.findById({_id:req.query._id})
    const studentCourses = []
    const studentcourse1 =[]
    
    for(let i = 0 ; i < student.courses.length ; i++){
        const studentcourse = await studentCourse.findById({_id:student.courses[i]._id})
        studentcourse1.push(studentcourse)
        const testStudent = await studentCourseTest.findById({_id:studentcourse.tests})
        console.log(testStudent)
        
        studentCourses.push(testStudent)
    }
    return res.render('marks',{mainCourse:mainCourse,testStudent:studentCourses,student:student,studentcourse:studentcourse1})
     
})



router.get('/logout', async (req, res) => {
    return res.render('teacherSigninPage')
})
 


module.exports = router