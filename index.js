const express = require('express')
require('./src/db/mongoose')
const userRouter = require('./src/routers/user')
const courseRouter = require('./src/routers/courseRouter')
const studentRouter = require('./src/routers/studentRouter')
const teacherRouter = require('./src/routers/teacherRouter')
const courseTestRouter = require('./src/routers/course_test_router')
const path = require('path')
const session = require('express-session')  
const User = require('./src/models/usermodel')

const app = express()
const port = process.env.PORT || 8080

app.set('view engine', 'hbs')
  
const viewsPath = path.join(__dirname, './src/public')
app.use(session({secret: 'secret',saveUninitialized: true,resave: true}));
console.log(viewsPath)


app.set('views', viewsPath)
app.use(express.json())
app.use(userRouter)
app.use(courseRouter)
app.use(studentRouter)
app.use(teacherRouter)
app.use(courseTestRouter)




app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
 

// const main = () =>{
//     const user = User.findById({_id:'612f6443f8f1847cc37f3190'})
//     user.populate('User').execPopulate()  //ser.populate('tasks').execPopulate()
//     console.log(user.courses)
// }

// main()
   