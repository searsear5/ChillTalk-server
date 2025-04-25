const express = require('express')
const router = express.Router()
const { getAllProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/project.controller')
const { authMid, hasPermission } = require('../middleware/auth.middleware')

router.get('/projects', getAllProjects)
router.get('/projects/:id', getProjectById)
router.post('/projects', authMid, hasPermission(['create_project']), createProject)
router.put('/projects/:id', authMid, hasPermission(['update_project']), updateProject)
router.delete('/projects/:id', authMid, hasPermission(['delete_project']), deleteProject)

module.exports = router
