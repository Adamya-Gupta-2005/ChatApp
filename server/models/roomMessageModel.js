import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
},{timestamps: true})

export default mongoose.model('RoomMessage', roomMessageSchema)