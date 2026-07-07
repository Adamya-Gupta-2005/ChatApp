import React, { useState } from 'react'
import axios from 'axios'

const InfoPannel = ({ activeRoom, activeDM, onlineUsers, users }) => {

  const [isForm, setIsForm] = useState(0);
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      axios.post(`${backendUrl}/api/rooms`, { name, description, isPrivate, password }, { withCredentials: true })

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

  return (
    <div className='info-panel'>

      {/* Room info */}
      {activeRoom && (
        <div>
          <h3># {activeRoom.name}</h3>
          <p>{activeRoom.description || 'No description'}</p>
          <p>{activeRoom.members.length} members</p>
          <p>{activeRoom.isPrivate ? 'Private' : 'Public'}</p>
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

      {/** Nothing selected */}
      {!activeDM && !activeRoom && (
        <>
          <p>Select a room or user to start chatting</p>
          <button onClick={() => setIsForm(!isForm)}>{isForm ? 'Cancel' : 'Create Room'}</button>
        </>
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
