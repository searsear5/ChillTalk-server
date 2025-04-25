const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await prisma.projects.findMany({
            include: { images: true },
           
        });

        return res.status(200).json({
            success: true,
            data: projects,
            message: "Projects retrieved successfully"
        });
    } catch (error) {
        console.error('Error fetching all projects:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve projects",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id, 10))) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID provided"
            });
        }

        const projectId = parseInt(id, 10);
        const project = await prisma.projects.findUnique({
            where: { pid: projectId },
            include: { images: true }
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: project,
            message: "Project retrieved successfully"
        });
    } catch (error) {
        console.error(`Error fetching project with ID ${req.params.id}:`, error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.createProject = async (req, res) => {
    const { title, headers, description, type, video, images } = req.body;

    
    if (!title || !headers || !description || !type || !video) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: title, headers, description, type, and video are required"
        });
    }

    try {
        
        const result = await prisma.$transaction(async (prisma) => {
            
            const newProject = await prisma.projects.create({
                data: {
                    title,
                    headers,
                    description,
                    type,
                    video
                }
            });

            
            if (images && Array.isArray(images) && images.length > 0) {
                await prisma.image.createMany({
                    data: images.map(url => ({
                        url,
                        pid: newProject.pid
                    }))
                });
            }

            
            await prisma.project_logs.create({
                data: {
                    pid: newProject.pid,
                    action_type: 'CREATE',
                    old_data: '',
                    new_data: JSON.stringify(newProject),
                    uid: req.user.id 
                }
            });

            
            return await prisma.projects.findUnique({
                where: { pid: newProject.pid },
                include: { images: true }
            });
        });

        return res.status(201).json({
            success: true,
            data: result,
            message: "Project created successfully"
        });
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, headers, description, type, video, images } = req.body;

    
    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID provided"
        });
    }

    
    if (!title || !headers || !description || !type || !video) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: title, headers, description, type, and video are required"
        });
    }

    const projectId = parseInt(id, 10);

    try {
        
        const existingProject = await prisma.projects.findUnique({
            where: { pid: projectId },
            include: { images: true }
        });

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        
        const result = await prisma.$transaction(async (prisma) => {
            
            const updatedProject = await prisma.projects.update({
                where: { pid: projectId },
                data: {
                    title,
                    headers,
                    description,
                    type,
                    video
                }
            });

            
            if (images && Array.isArray(images)) {
                // Delete existing images
                await prisma.image.deleteMany({
                    where: { pid: projectId }
                });

                
                if (images.length > 0) {
                    await prisma.image.createMany({
                        data: images.map(url => ({
                            url,
                            pid: projectId
                        }))
                    });
                }
            }

            
            await prisma.project_logs.create({
                data: {
                    pid: projectId,
                    action_type: 'UPDATE',
                    old_data: JSON.stringify(existingProject),
                    new_data: JSON.stringify({
                        ...updatedProject,
                        images: images || existingProject.images
                    }),
                    uid: req.user.id 
                }
            });

            
            return await prisma.projects.findUnique({
                where: { pid: projectId },
                include: { images: true }
            });
        });

        return res.status(200).json({
            success: true,
            data: result,
            message: "Project updated successfully"
        });
    } catch (error) {
        console.error(`Error updating project with ID ${id}:`, error);
        return res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteProject = async (req, res) => {
    const { id } = req.params;

    
    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID provided"
        });
    }

    const projectId = parseInt(id, 10);

    try {
        
        const existingProject = await prisma.projects.findUnique({
            where: { pid: projectId },
            include: { images: true }
        });

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        
        await prisma.$transaction(async (prisma) => {
            
            await prisma.image.deleteMany({
                where: { pid: projectId }
            });

            
            await prisma.project_logs.create({
                data: {
                    pid: projectId,
                    action_type: 'DELETE',
                    old_data: JSON.stringify(existingProject),
                    new_data: '',
                    uid: req.user.id 
                }
            });

            
            await prisma.projects.update({
                where: { pid: projectId },
                data: { is_deleted: true } 
            });
        });

        return res.status(200).json({
            success: true,
            data: existingProject,
            message: "Project deleted successfully"
        });
    } catch (error) {
        console.error(`Error deleting project with ID ${id}:`, error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete project",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};