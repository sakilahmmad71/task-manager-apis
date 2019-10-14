const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_PATH, {
    useCreateIndex : true,
    useNewUrlParser : true,
    useFindAndModify : false,
    useUnifiedTopology: true
})