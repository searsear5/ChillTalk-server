const express = require('express')
const router = express.Router()
const {getAllProjects,getProject,createProject,updateProject,deleteProject} = require('../controllers/project.controller')
const {authMid} = require('../middleware/auth.middleware')

router.get('/projects',getAllProjects)
router.get('/projects/:id',getProject)
router.post('/projects',authMid,createProject)
router.put('/projects/:id',authMid,updateProject)
router.delete('/projects/:id',authMid,deleteProject)

module.exports = router


