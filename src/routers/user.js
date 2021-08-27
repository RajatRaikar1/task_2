const express = require('express')
const User = require('../models/usermodel')
const router = new express.Router()
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/index', async (req, res) => {
    res.render('index')
})


router.get('/signup', async (req, res) => {
    res.render('signup')
})


router.post('/register', async (req, res) => {
    const user = new User({
        username : req.body.username,
        emailId : req.body.emailId,
        password : req.body.password
    })
    try{
        
        console.log(user)
        await user.save()
        res.status(201).send(user)

    }catch(e){
        res.status(400).send(e)
    }

})

router.get('/signin', async (req, res) => {
    res.render('signin')
})

router.post('/user_signin', async (req, res) => {
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
             return res.render('admin-homepage',
             {admin:user,
                all:users})

        }
        if(user.role === 'student' || user.role === 'user' || user.role === 'teacher'){
            return res.render('student-page',{
                user:user
            })
        }
      
    }catch(e){
        res.status(400).send('<h1>Unable to login</h1>')
    }
    
})

router.get('/list-all-user', async (req, res) => {
    try{
        const users = await User.find({})
        console.log(users)
        res.send(users)

    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/update-user', async (req, res) => {
    try{
        console.log(req.body.id)
        const user = await User.findById({_id:req.body.id})
        return res.render('details-update',{
            update_user:user
        })

    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/update', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['_id', 'username', 'role']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const user = await User.findByIdAndUpdate(req.body._id, req.body, { new: true, runValidators: true })
        if (!user) {
            return res.status(404).send('error')
        }
        res.send(user)
    } catch (e) {
        res.status(400).send('error')
    }

})

router.post('/update-personal', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['_id', 'username', 'password','emailId']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try{
        if(req.body.username!=undefined){
            const user = await User.findOneAndUpdate({_id: req.body._id},
            {
                username:req.body.username
            })
            //return res.send(user)
        }
        if((req.body.password!==undefined) || (req.body.password!=="")){
            const pass =  await bcrypt.hash(req.body.password, 8)
            console.log(pass)
            
            const user =  await User.findOneAndUpdate({_id: req.body._id},
            {
                password:pass
            })
       }

       if((req.body.emailId!==undefined) || (req.body.emailId!=="")){
        const user =  await User.findOneAndUpdate({_id: req.body._id},
        {
            emailId:req.body.emailId
        })
   }
        return res.send(user)
        
    } catch (e) {
        res.status(400).send('Updated...')
    } 
})

module.exports = router
