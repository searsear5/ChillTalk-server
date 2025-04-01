const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.getAllProjects = async (req,res)=>{
    try {
        const projects = await prisma.projects.findMany()
        res.status(200).json({ projects:projects, message:"Projects fetched successfully"})
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message:err.message
        })
    }
}

exports.getProject = async (req,res)=>{
    try {
        const {id} = req.params
        const project = await prisma.projects.findUnique({
            where:{
                id:Number(id)
            }
        })
        if(!project){
            return res.status(404).json({message:"Project not found"})
        }
        res.status(200).json({data:project,message:"Project fetched successfully"})
        
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message:err.message
        })
    }
}

exports.createProject = async (req,res)=>{
    try {
        const {title,headers,description,image,image2,image3,image4,type,video} = req.body
        //check all fields
        if(!title || !headers || !description || !type || !video){
            return res.status(400).json({message:"Please fill in all fields can be except image"})
        }
        const project = await prisma.projects.create({
            data:{
                tittle:title,
                headers:headers,
                description:description,
                image:image,
                image2:image2,
                image3:image3,
                image4:image4,
                type:type,
                video:video
            }
        })
        res.status(200).json({data:project,message:"Project created successfully"})
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message:err.message})
        }
}

exports.updateProject = async (req,res)=>{
    try {
        const {id} = req.params
        const {title,headers,description,image,image2,image3,image4,type,video} = req.body
        //check all fields
        if(!title || !headers || !description || !type || !video){
            return res.status(400).json({message:"Please fill in all fields can be except image"})
        }
        const updateProject = await prisma.projects.update({
            where:{
                id:Number(id)
            },
            data:{
                title:title,
                headers:headers,
                description:description,
                image:image,
                image2:image2,
                image3:image3,
                image4:image4,
                type:type,
                video:video
            }
        })
        res.status(200).json({data:updateProject,message:"Project updated successfully"}) 

    } catch (err) {
        console.log(err)
        res.status(500).json({message:err.message})
    }
}

exports.deleteProject = async (req,res)=>{
    try {
        const {id} = req.params
        const deleteProject = await prisma.projects.delete({
            where:{
                id:Number(id)
            }
        })
        res.status(200).json({data:deleteProject,message:"Project deleted successfully"})

    } catch (err) {
        console.log(err)
        res.status(500).json({message:err.message})
    }
}