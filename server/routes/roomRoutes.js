import express from 'express'
import { createRoom, getRooms, joinRoom, deleteRoom } from '../controllers/roomController.js'
import { protect } from '../middleware/protect.js'

const router = express.Router();

router.post('/', protect, createRoom)
router.get('/', protect, getRooms)
router.post('/:id/join', protect, joinRoom)
router.delete('/:id', protect, deleteRoom)

export default router