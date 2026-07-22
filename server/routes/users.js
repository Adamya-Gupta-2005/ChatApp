import express from 'express'
import { getUsers } from '../controllers/userController.js'
import { protect } from '../middleware/protect.js'

const router = express.Router()

router.get('/', protect, getUsers)

router.get('/ice-config', protect, (req, res) => {
    res.json({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:standard.relay.metered.ca:80' },
            {
                urls: 'turn:standard.relay.metered.ca:80',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL
            },
            {
                urls: 'turn:standard.relay.metered.ca:443',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL
            },
            {
                urls: 'turns:standard.relay.metered.ca:443',
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL
            }
        ]
    })
})

export default router