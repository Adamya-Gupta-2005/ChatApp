import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
        //ref tells mongoose that stored id belong to user model
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: null
    }
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)