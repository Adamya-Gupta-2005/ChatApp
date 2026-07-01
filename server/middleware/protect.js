import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

export const protect = async (req, res, next) => {
    try {
        
        const token = req.cookies.token

        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Not Authorized'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const account = await User.findById(decoded.id).select('-password')

        if(!account) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }
        req.user = account
        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token invalid or expired'
        })
    }
}