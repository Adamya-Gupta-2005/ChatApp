import Room from '../models/roomModel.js'
import bcrypt from 'bcryptjs'

// @route POST /api/rooms
export const createRoom = async (req, res) => {
    try {

        const { name, description, isPrivate, password } = req.body

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Room name is required'
            })
        }

        if (isPrivate && !password) {
            return res.status(400).json({
                success: false,
                message: 'Private room needs a password'
            })
        }

        const existingRoom = await Room.findOne({ name })
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: 'Room name already taken'
            })
        }

        let hashPass = null
        if (isPrivate && password) {
            const salt = await bcrypt.genSalt(10)
            hashPass = await bcrypt.hash(password, salt)
        }

        const room = await Room.create({
            name, description, creator: req.user._id,
            members: [req.user._id], isPrivate: isPrivate || false,
            password: hashPass
        })

        res.status(201).json({
            success: true,
            room
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @route GET /api/rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({})
            .select('-password')
            .populate('creator', 'name email')
        //fetch User _id equals creator in DB and replace objectID in res with users name and email

        res.status(200).json({
            success: true, rooms
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @route POST /api/rooms/:id/join
export const joinRoom = async (req, res) => {
    try {

        const room = await Room.findById(req.params.id)

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        //check if already a member
        const isMember = room.members.includes(req.user._id)
        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'Already a member'
            })
        }

        //check passwords if private
        if (room.isPrivate) {
            const { password } = req.body
            if (!password) {
                return res.status(401).json({
                    success: false,
                    message: 'Password required'
                })
            }

            const isMatch = await bcrypt.compare(password, room.password)
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid room password'
                })
            }
        }
        room.members.push(req.user._id)
        await room.save()

        res.status(200).json({
            success: true,
            message: 'Joined room',
            room
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @route DELETE /api/rooms/:id
export const deleteRoom = async (req, res) => {
    try {

        const room = await Room.findById(req.params.id)

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            })
        }

        if (room.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete'
            })
        }

        await room.deleteOne();
        return res.status(200).json({
            success: true,
            message: 'Room deleted'
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}