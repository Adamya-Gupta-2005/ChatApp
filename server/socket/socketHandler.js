import RoomMessage from '../models/roomMessageModel.js'
import DirectMessage from '../models/directMessageModel.js'
import User from '../models/userModel.js'

const userSocketMap = {};

//io is entire server and socket is one connected client
export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log("User connected: ", socket.id)

        //set user online
        socket.on('user_connected', async (userId) => {
            socket.userId = userId
            userSocketMap[userId] = socket.id; // mapping userid to socketid
            await User.findByIdAndUpdate(userId, { isOnline: true })
            io.emit('user_status', { userId, isOnline: true })

            //sends update to everyone
            io.emit('user_status', {
                userId,
                isOnline: true
            })
        })

        //Room Event
        socket.on('join_room', async (roomId) => {
            socket.join(roomId)

            //sending last 50 msgs to user who just joined
            const message = await RoomMessage.find({ room: roomId })
                .sort({ createdAt: -1 }).limit(50).populate('sender', 'name')

            socket.emit('room_history', message.reverse())
        })

        socket.on('send_room_message', async ({ roomId, content }) => {
            try {
                const message = await RoomMessage.create({
                    sender: socket.userId,
                    room: roomId,
                    content
                })

                const populated = await message.populate('sender', 'name')
                //fills sender with name

                //broadcast to everyone in room including sender
                io.to(roomId).emit('receive_room_message', populated)
            } catch (error) {
                socket.emit('error', { message: error.message })
            }
        })

        socket.on('leave_room', (roomId) => {
            socket.leave(roomId)
        })

        //DM Events
        socket.on('join_dm', async ({ myId, otherId }) => {

            //creating unique room for two user, 
            //sorting because roomId is same regardless who starts
            const dmRoom = [myId, otherId].sort().join('_')
            socket.join(dmRoom)

            const messages = await DirectMessage.find({
                $or: [
                    { sender: myId, recipient: otherId },
                    { sender: otherId, recipient: myId }
                ]
            }).sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name')

            socket.emit('dm_history', messages.reverse())
        })

        socket.on('send_dm', async ({ recipientId, content }) => {
            try {

                const message = await DirectMessage.create({
                    sender: socket.userId,
                    //userId was set during user_connected
                    recipient: recipientId,
                    content
                })

                const populated = await message.populate('sender', 'name')

                const dmRoom = [socket.userId, recipientId].sort().join('_')
                io.to(dmRoom).emit('receive_dm', populated)

            } catch (error) {
                socket.emit('error', { message: error.message })
            }
        });


        //WEBRTC call eveents

        //a calls b - forward offer to b only
        socket.on('call-user', ({ offer, to, from, callerName}) => {
            const recipientSocket = userSocketMap[to];
            if(recipientSocket) {
                io.to(recipientSocket).emit('incoming-call', {offer, from, callerName})
            }
        })

        //b accepts - forward answer to a only
        socket.on('call-accepted', ({answer, to}) => {
            const callerSocket = userSocketMap[to];
            if(callerSocket) {
                io.to(callerSocket).emit('call_acccepted',  { answer })
            }
        })

        //b rejects - tell a
        socket.on('call_rejected', ({to}) => {
            const callerSocket = userSocketMap[to]
            if(callerSocket){
                io.to(callerSocket).emit('call_rejected')
            }
        })

        //ice candidates - forward to other peer
        socket.on('ice-candidate', ({ candidate, to }) => {
            const targetSocket = userSocketMap[to]
            if(targetSocket) {
                io.to(targetSocket).emit('ice_candidate', {candidate})
            }
        })

        //if any one hangs up - tell other peer
        socket.on('call_ended', ({to}) => {
            const targetSocket = userSocketMap[to]
            if(targetSocket){
                io.to(targetSocket).emit('call_ended')
            }
        })

        //disconnect
        socket.on('disconnect', async () => {
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen: Date.now()
                })
                io.emit('user_status', { userId: socket.userId, isOnline: false })
            }
            console.log('user disconnected', socket.id)
        })
    })
}