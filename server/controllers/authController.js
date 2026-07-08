import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const sendTokenResponse = (user, statusCode, res) => {

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    res.status(statusCode).json({
        success: true,
        user: {
            _id: user._id,
            //mongoDB objectId in doc, user.id is _id-object-to-string created by monogoose 
            name: user.name,
            email: user.email
        }
    })
}


export const register = async (req, res) => {
    try {

        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(password, salt)

        const user = await User.create({
            name, email, password: hashPass
        })

        sendTokenResponse(user, 201, res); //201 success

    } catch (error) {
        res.status(500).json({ //500 internal error 
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ // 401 unauthorized
                success: false,
                message: 'Invalid Credentials'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        user.isOnline = true
        await user.save()

        sendTokenResponse(user, 200, res)

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {

    try {

        if (req.user) {
            await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastSeen: Date.now() })
        }

        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        })

        res.status(200).json({
            success: true,
            message: 'Logged out'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @route GET /api/auth/me
export const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    })
}
