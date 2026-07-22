import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import axios from 'axios';
import ChatWindow from '../components/ChatWindow.jsx'
import Sidebar from '../components/Sidebar.jsx'
import InfoPanel from '../components/InfoPannel.jsx'

import useWebRTC from '../hooks/useWebRTC.js';
import VideoCall from '../components/VideoCall.jsx';
import IncomingCall from '../components/IncomingCall.jsx';

import '../styles/Chat.css'

const Chat = () => {

    const { user } = useAuth()
    const { socket } = useSocket()

    const [rooms, setRooms] = useState([])
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [activeRoom, setActiveRoom] = useState(null)
    const [activeDM, setActiveDM] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsRes, usersRes] = await Promise.all([
                    //promise make both request together othrwise it cause it finishes room and user one by one
                    axios.get(`${backendUrl}/api/rooms`, { withCredentials: true }),
                    axios.get(`${backendUrl}/api/users`, { withCredentials: true })
                ])

                setRooms(roomsRes.data.rooms);
                setUsers(usersRes.data.users);

                if(socket) {
                    socket.emit('get_online_users')
                }

            } catch (error) {
                console.log(error)
            }
        }

        fetchData()
    }, [socket])

    useEffect(() => {
        if (!socket) return;

        //room messages
        socket.on('room_history', (history) => setMessages(history))
        socket.on('receive_room_message', (message) => {
            setMessages(prev => [...prev, message])
        })

        //dm messages
        socket.on('receive_dm', (message) => {
            setMessages(prev => [...prev, message])
        })

        //dm messages
        socket.on('dm_history', (history) => setMessages(history))

        //online Status
        socket.on('user_status', ({ userId, isOnline }) => {
            setOnlineUsers(prev => isOnline ? [...new Set([...prev, userId])] : prev.filter(id => id !== userId))
        })

        //display online user for new logged in id
        socket.on('online_users', (userIds) => {
            setOnlineUsers(userIds)
        })

        //cleanup
        return () => {
            socket.off('room_history')
            socket.off('receive_room_message')
            socket.off('receive_dm')
            socket.off('user_status')
            socket.off('dm_history')
            socket.off('online_users')
        }
    }, [socket])

    //join room via socket
    const [pendingRoom, setPendingRoom] = useState(null)
    const handleRoomSelect = async (room) => {
        if (activeRoom) socket.emit('leave_room', activeRoom._id);

        if (room.isPrivate) {
            const isMember = room.members.some(m =>
                (m._id || m).toString() === user._id.toString()
            )
            if (!isMember) {
                setPendingRoom(room)
                return
            }
        }

        setActiveDM(null)
        setActiveRoom(room)
        setMessages([])
        socket.emit('join_room', room._id)
    }
    const handleJoinWithPassword = async (password) => {
        try {
            await axios.post(`${backendUrl}/api/rooms/${pendingRoom._id}/join`, { password }, { withCredentials: true })

            setRooms(prev => prev.map(r =>
                r._id === pendingRoom._id ? { ...r, members: [...r.members, user._id] } : r
            ))
            setActiveRoom(pendingRoom)
            setMessages([])
            socket.emit('join_room', pendingRoom._id)
            setPendingRoom(null)
        } catch (error) {
            return error.response?.data?.message || 'Wrong Password'
        }
    }

    //join dm via socket
    const handleDMSelect = (selectedUser) => {
        if (activeRoom) socket.emit('leave_room', activeRoom._id);
        setActiveDM(selectedUser)
        setActiveRoom(null)
        setMessages([])
        socket.emit('join_dm', { myId: user._id, otherId: selectedUser._id })
    }

    //handling creationn of room
    const handleRoomCreated = (newRoom) => {
        setRooms(prev => [...prev, newRoom])
    }

    const handleBack = () => {
        if (activeRoom) socket.emit('leave_room', activeRoom._id);
        setActiveRoom(null)
        setActiveDM(null)
        setMessages([])
    }

    const handleRoomDeleted = (roomId) => {
        setRooms(prev => prev.filter(r => r._id !== roomId))
        setActiveRoom(null)
        setMessages([])
    }

    const {
        callState, incomingCall,
        localVideoRef, remoteVideoRef,
        startCall, acceptCall,
        rejectCall, hangup, localStream, remoteStream, remoteStreamReady
    } = useWebRTC(socket, user, activeDM)


    return (
        <div className='chat-layout'>
            <Sidebar
                rooms={rooms}
                users={users}
                onlineUsers={onlineUsers}
                onRoomSelect={handleRoomSelect}
                onDMSelect={handleDMSelect}
                activeRoom={activeRoom}
                activeDM={activeDM}
            />
            <ChatWindow
                messages={messages}
                activeRoom={activeRoom}
                activeDM={activeDM}
                socket={socket}
                currentUser={user}
                onBack={handleBack}
            />
            <InfoPanel
                activeRoom={activeRoom}
                activeDM={activeDM}
                onlineUsers={onlineUsers}
                onRoomCreated={handleRoomCreated}
                onRoomDeleted={handleRoomDeleted}
                currentUser={user}
                pendingRoom={pendingRoom}
                onJoinWithPassword={handleJoinWithPassword}
                onCancelJoin={() => setPendingRoom(null)}
                onStartCall={startCall}
            />

            <VideoCall 
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                callState={callState}
                activeDM={activeDM}
                hangup={hangup}
                localStream={localStream}
                remoteStream={remoteStream}
                remoteStreamReady={remoteStreamReady}
            />

            <IncomingCall 
                incomingCall={incomingCall}
                callState={callState}
                acceptCall={acceptCall}
                rejectCall={rejectCall}
            />

        </div>
    )
}

export default Chat
