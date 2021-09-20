const express = require('express')
const Course = require('../models/coursemodel')
const Course_test = require('../models/course_test')
const router = new express.Router()
const bodyParser = require('body-parser')

router.use(bodyParser.urlencoded({ extended: false }));



router.post('/add-question', async (req, res) => {
    const course_test = new Course_test({       
        question: req.body.question,
        answer: req.body.answer,
        scheduledDate: req.body.date,


    })

    await course_test.save() 
    console.log(course_test,'Course_test') 
    const course = await Course.findById({_id:req.body._id})   
    console.log(course,'Course')           
    //course.tests.push(course_test)     
    await Course.updateOne({_id:req.body._id},{$set:{
        tests:course_test._id}  
    })         
    console.log(course,'course')             
    return res.status(200).send('Question is added')   
})

router.post('/addAssignment', async (req, res) =>
{
    try{
        const course = await Course.findById({_id:req.body._id}) 
        await Course.updateOne({_id:req.body._id},{$set:{
            assignment:req.body.assigment}  
        })   
        return res.send('added')     
    }catch(e){

    }
})




        
module.exports = router