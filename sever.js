const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = 8000
const authRouter = require('./routers/auth.routers')

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/auth',authRouter)







app.listen(port,(req,res)=>{
    console.log(`Server is running on port ${port}`)
})