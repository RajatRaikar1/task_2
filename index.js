const express = require('express')
require('./src/db/mongoose')
const userRouter = require('./src/routers/user')
const path = require('path')


const app = express()
const port = process.env.PORT || 3080

app.set('view engine', 'hbs')

const viewsPath = path.join(__dirname, '../src/public')


app.set('views', viewsPath)
app.use(express.json())
app.use(userRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
