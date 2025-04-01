const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.authMid = (req,res,next)=>{
    try {
        const token = req.header('x-auth-token')
        if (!token) {
            return res.status(401).json({message:"No token authorization denied"})
        }
        const verified = jwt.verify(token,process.env.secret_key,(err,decode)=>{
            if (err) {
                return res.status(401).json({message:"Token verification failed"})

            }else{
                req.user = decode
                next()
            }
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message:err.message})
    }
}