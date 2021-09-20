const express = require('express')
const Course = require('../models/coursemodel')
const User = require('../models/usermodel')
const Course_test = require('../models/course_test')
const studentCourse = require('../models/studentCourseModel')
const studentCourseTest = require('../models/studentCourseTestModel')

const router = new express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/student/signin', (req, res) => {
    res.render('studentSigninPage')
})

router.post('/student_signin', async (req, res) => {
    try{
        const student = await User.findOne({emailId:req.body.emailId})
        if(!student){
            throw new Error('invalid details')
        }
        const isMatch = await bcrypt.compare(req.body.password, student.password)
        if (!isMatch) {
            throw new Error('Unable to login')
        }
        if(student.role!='student'){
            return res.send('you are not authorised to login')
        }
        req.session.studentId=student._id
        console.log(student.xp)
        var currentXp =  parseInt(student.xp)
        var currentLevel = parseInt(student.level)
        console.log('j')
        if(currentXp < 100){
            await User.updateOne({_id:student._id}, {$set:{
            xp : currentXp + 10
        }})
        }else{
            await  User.updateMany({_id:student._id}, {$set:{
            
            level : currentLevel + 1,
            xp : currentXp + 10

        }})
        }
        return res.render('studentPage',{
            student:student
        })
    }catch(e){
        return res.status(400).send('error')
    }
})

router.post('/updateStudentPersonal', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['_id', 'username', 'password','emailId']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        const student =  await User.findById({_id: req.body._id})
        //console.log(student)  
        if(req.body.username!=""){
            const student = await User.findOneAndUpdate({_id: req.body._id},    
            
                {$set:{username:req.body.username}}
            
            )
        }

        if((req.body.password!=='123456789') ){
            const pass =  await bcrypt.hash(req.body.password, 8)   
            console.log(pass)
            
            const student =  await User.findOneAndUpdate({_id: req.body._id},
            {
                $set:{password:pass}
            })
        }   
        // const userEmail = req.body.emailId
        if((req.body.userEmail!=="")){
        const student =  await User.findOneAndUpdate({_id: req.body._id},//,{validate:true},
        {
            emailId:req.body.emailId     
        })
        }  
        return res.send(student)
         
    } catch (e) {
        return res.status(400).send('Error')
    } 
})

router.get('/allCourses/student', async (req, res) => {
    try{
        const courses = await Course.find({})
        console.log(req.session.studentId,'studentId')
        console.log(courses)  
        return res.render('courseList',{
            courses:courses})  
    }catch(e){
        return res.status(400).send(e) 
    }
})

// adding course into Student list
router.get('/student/addingCourse', async (req, res) => {
    try{
        const student = await User.findById({_id:req.session.studentId})
        const course = await Course.findById({_id:req.query.courseId})
        const test = await Course_test.findById({_id:course.tests._id})
        const studentTest = new studentCourseTest({
            question:test.question,
            answer:test.answer,
            scheduledDate:test.scheduledDate
        })
        await studentTest.save()
        const courseStudent = new studentCourse({
        courseId: course._id,
        courseName: course.courseName,
        duration: course.duration,
        rating: course.rating,
        tests: studentTest._id,
        assignment: course.assignment
        })
        await courseStudent.save()
        var result = false 
        if(student.courses.length === 0 ){
            await student.courses.push(courseStudent)
            await User.updateOne({_id:student._id},{$set:{   
            courses:student.courses  
        }})
        course.registeredForCourse.push(student._id)
        await Course.updateOne({_id:course._id},{$set:{
            registeredForCourse:course.registeredForCourse
        }})
        return res.send(student) 
    }

    for(let i = 0 ; i < student.courses.length ; i++){
        const dummy = await studentCourse.findById({_id:student.courses[i]._id})
 
        if(JSON.stringify((dummy.courseId)) === (JSON.stringify(course._id))){
            result = true 
            return res.send('course is already enrolled')
        }      
    }
    if(result === false){
        await student.courses.push(courseStudent)
        await User.updateOne({_id:student._id},{$set:{
            courses:student.courses  
        }}) 
        course.registeredForCourse.push(student._id)
        await Course.updateOne({_id:course._id},{$set:{
            registeredForCourse:course.registeredForCourse

        }}) 
        return res.send(student) 

    }else{
        return res.send('course is already enrolled')
    }
    }catch(e)
    {
        if(studentTest)
            await studentCourseTest.deleteOne({_id:studentTest._id})
        if(courseStudent)
            await studentCourse.deleteOne({_id:courseStudent._id})
        return res.status(400).send('error')
    }
})

router.get('/student/enrolledCourse', async (req, res) => {
    try{
    const student = await User.findById({_id:req.query._id})
    console.log(student) 
    const courses = []
    for(let i = 0; i<student.courses.length; i++){
        const course = await studentCourse.findById({_id:student.courses[i]._id})
        courses.push(course)      
    }   
    return res.render('studentCourseEnrolledPage',{courses:courses})  
    }catch(e){
        return res.send('error') 
    }         
})

router.post('/srudent/progressbar', async(req, res) => {
    try{
    const studentcourse = await studentCourse.findById({_id:req.query._id})
    var progressValue =  parseInt(req.body.progress)
    var actualProgress = parseInt(studentcourse.progress)
    var actualDuration = parseInt(studentcourse.duration)
    if(actualDuration > actualProgress){
    await studentCourse.updateOne({_id:req.query._id},{ $set:{
        progress: actualProgress + progressValue
    }})
    console.log(studentcourse)
    var remaining = parseInt(studentcourse.duration) - parseInt(studentcourse.progress)
    return  res.send('updated')
    }
    else{
        return res.send('course is completed ')
    } 
}catch(e){
    return res.send('updated')
}
})

router.get('/student/course-test', async (req, res ) => {
    try{
    //const tests = []
    console.log(req.session.studentId)
    const course = await studentCourse.findById({_id:req.query._id})
    console.log(course)
    console.log(course.tests)
    const test = await studentCourseTest.findById({_id:course.tests})
    console.log(test)

    let a = test.scheduledDate
    console.log(new Date(a).toLocaleDateString())
    a.replace("-","/")
    console.log(a)
    console.log(new Date().toLocaleDateString())
    console.log(new Date().toLocaleDateString() === new Date(a).toLocaleDateString())
    
    if(test){
        if(new Date().toLocaleDateString() === new Date(a).toLocaleDateString()){
        return res.render('courseTestWindow',{
        test:test,
        courses:course
    })
}else{
    return res.send('test is not scheduled today')
}
    }
    
    else{
        return res.send('test is not yet uploaded')
    }
    }catch(e){
        return res.send('error')
    }

})

router.post('/submit', async(req, res) => {     
    console.log(req.body.answer)
    console.log(req.body._idcourse)
    console.log(req.body._idtest)
    const student = await User.findById({_id:req.session.studentId})
    console.log(student)
    const course = await studentCourse.findById({_id:req.body._idcourse})
    console.log(course)
    const test = await studentCourseTest.findById({_id:course.tests}) 
    console.log(test.answer,'test')

    
    await studentCourseTest.updateOne({_id:test._id}, {$set:{
        answer:req.body.answer
    }})
    
    await studentCourse.updateOne({_id:req.session.studentId}, {$set:{
        answer:req.body.answer
    }})
    return res.send('submitted') 
})

    
  
module.exports = router
 