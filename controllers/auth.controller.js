const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

//register func
exports.register = async(req,res)=>{
    try {
        //get user data
        const {name,username,password} = req.body
        
        if(!name || !username || !password){
            return res.status(400).json({message:"Please fill in all fields"})
        }
        //check  email exists
        const user = await prisma.users.findUnique({
            where:{
                username:username
            }
        })
        if (user) {
            return res.status(400).json({message:"User already exists"})
        }
        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        //create user
        const userData = {
            name:name,
            username:username,
            password:hashedPassword
        }
        const newUser = await prisma.users.create({
            data:userData
        })
        res.status(200).json({data:newUser,message:"User created successfully"})
        
    } catch (err) {
        console.log(err)
        res.status(500).json({message:err.message})
    }
}

//login func
exports.login = async(req,res)=>{
    try {
        const {username,password} = req.body
        //check all fields 
        if(!username || !password){
            return res.status(400).json({message:"Please fill in all fields"})
        }
        //check username
        const user = await prisma.users.findUnique({
            where:{
                username:username

            }
        })
        if (!user) {
            res.status(400).json({message:"User not found"})
        }
        //check password
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"worng password"})
        }
        //create token
        const payload = {
            user:{
                id:user.id,
                username:user.name,
                name:user.name,
            }
        }
        const token = jwt.sign(payload,process.env.secret_key,{expiresIn: '1h'})
        res.status(200).json({token:token})
        console.log(token)

    } catch (err) {
        console.log(err)
        res.status(500).json({message:err.message})
    }
}
