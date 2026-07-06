import User from '../models/userModel.js'

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password') 
        //$ne evreyone except me
        res.status(200).json({ success: true, users })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}