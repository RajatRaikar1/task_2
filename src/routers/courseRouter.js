const express = require('express')
const Course = require('../models/coursemodel')

const router = new express.Router()
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/course', (req, res) => {
    return res.render('courseAdding')
})


router.post('/course/add', async (req, res) => {
    console.log(req.body)
    const course = new Course({
        courseName: req.body.courseName,
        duration: req.body.duration,
        rating: req.body.rating,

        
    })
    console.log(course)
    course.save()
    return res.send('Added successfully')
})

router.get('/allCourses', async (req, res) => {
    try{
        const courses = await Course.find({})
        console.log(courses)
        return res.render('listingAllCourses',{
            courses:courses
        })
    }catch(e){
        return res.status(400).send(e)
    }
})

router.post('/updateCourse', async (req, res) => {
    try{
        console.log(req.body.id)
        const session = req.session
        console.log(session.req.body.id)
        const course = await Course.findById({_id: req.body.id})
        console.log(course)
        return res.render('update-course',{
            update_course:course
        })
    }catch(e){
        return res.status(400).send(e)
    }    
})

router.post('/updated-course', async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(updates)
    const allowedUpdates = ['_id','courseName', 'duration','rating']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        const course =  await Course.findOne({_id: req.body._id})
        console.log(course)
        if(!course)
            return res.status(400).send('You Have Changed Id Please refresh the page ')
        
        console.log(req.body.courseName)
        if(req.body.courseName!==""){
        const course = await Course.findOneAndUpdate({_id: req.body._id},
        {
            courseName:req.body.courseName,
            duration:req.body.duration,
            rating:req.body.rating

        })
        }
        return res.send(course)

    } catch (e) {
        return res.status(400).send('Error')
    } 
})

router.post('/admin/delete', async (req, res) => {
    try{
        console.log(req.body.id)
        const course = await Course.findByIdAndDelete({_id: req.body.id})
        if(!course){
            return res.status(400).send('Invalid Id')
        }else{
            return res.status(200).send('Successfully removed')
        }
        }catch(e){
            return res.status(400).send(e)
        }    
    }) 

module.exports = router 