const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = process.env.salt_rounds 
const TOKEN_EXPIRY = process.env.token_expiry 
const SECRET_KEY = process.env.secret_key;

exports.register = async (req, res) => {
    const {
        username,
        password,
        first_name,
        last_name,
        email,
        phone,
        role,
        description_role
    } = req.body;

    
    if (!username || !password || !first_name || !last_name || !email || !phone || !role || !description_role) {
        return res.status(400).json({
            success: false,
            message: "please provide all required fields"
        });
    }

    try {
        
        const existingUsername = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const result = await prisma.$transaction(async (prisma) => {
            
            const newUser = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    first_name,
                    last_name,
                    email,
                    phone
                },
                select: {
                    uid: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    phone: true,
                    created_at: true
                }
            });

            
            let roleRecord = await prisma.role.findUnique({
                where: { name: role }
            });

            if (!roleRecord) {
                roleRecord = await prisma.role.create({
                    data: {
                        name: role,
                        description: description_role
                    }
                });
            }

            
            await prisma.user_role.create({
                data: {
                    uid: newUser.uid,
                    rid: roleRecord.rid
                }
            });

            return newUser;
        });

        return res.status(201).json({
            success: true,
            data: result,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required"
        });
    }

    try {
        
        const user = await prisma.user.findUnique({
            where: { username,deleted_at: null },
            
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        
        const userWithPermissions = await prisma.user.findUnique({
            where: { uid: user.uid },
            include: {
                user_role: {
                    include: {
                        role: {
                            include: {
                                role_permission: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        
        const permissions = [
            ...new Set(
                userWithPermissions.user_role.flatMap(userRole =>
                    userRole.role.role_permission.map(rolePermission =>
                        rolePermission.permission.name
                    )
                )
            )
        ];

        
        const payload = {
            user: {
                id: user.uid,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
            },
            permissions
        };

        
        const token = jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: TOKEN_EXPIRY }
        );

        return res.status(200).json({
            success: true,
            token,
            user: payload.user,
            permissions
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error during login",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        // req.user is set by the authMid middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const userId = req.user.id;

        // Get user data with roles and permissions
        const user = await prisma.user.findUnique({
            where: {
                uid: userId
            },
            select: {
                uid: true,
                username: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                created_at: true,
                user_role: {
                    select: {
                        role: {
                            select: {
                                rid: true,
                                name: true,
                                description: true,
                                role_permission: {
                                    select: {
                                        permission: {
                                            select: {
                                                pid: true,
                                                name: true,
                                                description: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Format permissions for easier frontend consumption
        const roles = user.user_role.map(ur => ({
            id: ur.role.rid,
            name: ur.role.name,
            description: ur.role.description
        }));

        const permissions = user.user_role.flatMap(ur =>
            ur.role.role_permission.map(rp => ({
                id: rp.permission.pid,
                name: rp.permission.name,
                description: rp.permission.description
            }))
        );

        // Remove duplicate permissions
        const uniquePermissions = Array.from(
            new Map(permissions.map(item => [item.id, item])).values()
        );

        // Create a clean user object without sensitive data
        const userData = {
            id: user.uid,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phone: user.phone,
            createdAt: user.created_at,
            roles,
            permissions: uniquePermissions
        };

        return res.status(200).json({
            success: true,
            data: userData,
            message: "User data retrieved successfully"
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user data",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};