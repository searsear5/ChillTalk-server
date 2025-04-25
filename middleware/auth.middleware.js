const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.secret_key;

exports.authMid = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '') ||
            req.header('x-auth-token')

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. No token provided."
            })
        }

        // Verify token
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: "Token has expired. Please login again."
                    })
                }

                return res.status(401).json({
                    success: false,
                    message: "Invalid token. Authentication failed."
                })
            }

            // Set user data in request object
            req.user = decoded.user
            req.permissions = decoded.permissions
            next()
        })
    } catch (err) {
        console.error('Authentication middleware error:', err)
        return res.status(500).json({
            success: false,
            message: "Server error during authentication"
        })
    }
}

exports.hasPermission = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            // Check if user has permissions attached to request
            if (!req.permissions) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. No permissions found."
                })
            }

            // Check if user has all required permissions
            const hasAllPermissions = requiredPermissions.every(
                permission => req.permissions.includes(permission)
            )

            if (!hasAllPermissions) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Insufficient permissions."
                })
            }

            next()
        } catch (err) {
            console.error('Permission middleware error:', err)
            return res.status(500).json({
                success: false,
                message: "Server error during permission verification"
            })
        }
    }
}