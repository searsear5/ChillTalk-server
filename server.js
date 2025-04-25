require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan')
const port = 8000;
const authRouter = require('./routers/auth.routers')
const projectRouter = require('./routers/project.routers')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
    max: 50, // Maximum number of requests
    windowMs: 15 * 60 * 1000, // Time window in milliseconds (15 minutes)
    message: "too many" // Message to send when the limit is exceeded
})

app.use(limiter)

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(helmet())

app.use('/auth', authRouter)
app.use('/api', projectRouter)

app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`)
})