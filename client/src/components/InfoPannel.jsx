import React, { useState } from 'react'
import axios from 'axios'

import '../styles/infoPannel.css'
import { MdDelete } from "react-icons/md";
import { MdVideoCall } from "react-icons/md";

const InfoPannel = ({ activeRoom, activeDM, onlineUsers, onRoomCreated, onRoomDeleted, currentUser, pendingRoom, onJoinWithPassword, onCancelJoin, onStartCall }) => {

  const [isForm, setIsForm] = useState(null);
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const [roomPassword, setRoomPassword] = useState('')
  const [joinError, setJoinError] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/rooms`, { name, description, isPrivate, password }, { withCredentials: true })
      onRoomCreated(res.data.room)

      setName('')
      setDescription('')
      setIsPrivate(false)
      setPassword('')
      setIsForm(false)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room')
    }
  }

  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`${backendUrl}/api/rooms/${roomId}`, { withCredentials: true })
      onRoomDeleted(roomId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const err = await onJoinWithPassword(roomPassword)
    if (err) {
      setJoinError(err)
    } else {
      setRoomPassword('')
      setJoinError(null)
    }
  }

  return (
    <div className='info-panel'>

      {/* Room info */}
      {activeRoom && (
        <div>
          <h3>{activeRoom.name}</h3>
          <div className="room-prop">
            <p>{activeRoom.description || ''}</p>
          <p>{activeRoom.members.length} members</p>
          <p>{activeRoom.isPrivate ? 'Private' : 'Public'}</p>
          </div>
          {activeRoom.creator._id === currentUser._id && (
            <button className='delete-btn' onClick={() => handleDeleteRoom(activeRoom._id)}>
              <MdDelete size={20} /> Delete Room
            </button>
          )}
        </div>
      )}

      {/** DM info */}
      {activeDM && (
        <div>
          <h3>{activeDM.name}</h3>
          <span className={onlineUsers.includes(activeDM._id) ? 'online' : 'offline'}>
            {onlineUsers.includes(activeDM._id) ? 'Online' : 'Offline'}
          </span>
        </div>
      )}

      {activeDM && (
        <div className="call-btn-cont"><button className="call-btn" onClick={onStartCall}> <MdVideoCall size={19} /> Video Call </button></div>
      )}

      {/** Nothing selected */}
      {!activeDM && !activeRoom && (
        <>
          <p>Select a room or user to start chatting</p>
          <button onClick={() => setIsForm(!isForm)}>{isForm ? 'Cancel' : 'Create Room'}</button>
        </>
      )}

      {pendingRoom && (
        <div>
          <h3>{pendingRoom.name}</h3>
          <p>This room is private. Enter password to join.</p>
          {joinError && <p className='error'>{joinError}</p>}
          <form onSubmit={handlePasswordSubmit}>
            <input
              type='password'
              placeholder='Room password'
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              required
            />
            <button type='submit'>Join Room</button>
            <button type='button' onClick={onCancelJoin}>Cancel</button>
          </form>
        </div>
      )}

      {isForm && (
        <form onSubmit={handleSubmit}>

          {error && <p className='error'>{error}</p>}

          <input
            type='text'
            placeholder='Room name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type='text'
            placeholder='Description (optional)'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>
            <input
              type='checkbox'
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private room
          </label>

          {isPrivate && (
            <input
              type='password'
              placeholder='Room password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button type='submit'>Create Room</button>
        </form>
      )}
    </div>
  )
}

export default InfoPannel
