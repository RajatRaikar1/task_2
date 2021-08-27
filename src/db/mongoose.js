const mongosse = require('mongoose')

mongosse.connect('mongodb://127.0.0.1:27017/management-system', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})