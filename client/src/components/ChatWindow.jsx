import React, { useState } from 'react'


const ChatWindow = ({ messages, activeRoom, activeDM, socket, currentUser }) => {
  const [content, setContent] = useState('')

  const handleSend = () => {
    if (!content.trim()) return

    if (activeRoom) socket.emit('send_room_message', { roomId: activeRoom._id, content })
    else if (activeDM) socket.emit('send_dm', { recipientId: activeDM._id, content })

    setContent('');
  }

  const handleKeyDown = (e) => {
    if(e.key === 'Enter') handleSend()
  }

  return (
    <div className='chat-window'>

      {/**Header */}
      <div className="chat-header">
        <h3>{activeRoom ? `# ${activeRoom.name}`: activeDM ? `${activeDM.name}`: 'Select a chat'}</h3>
      </div>

      {/** Messages */}
      <div className="message-list">
        {messages.map(msg => (
          <div
            key={msg._id}
            className={`message ${msg.sender._id === currentUser._id ? 'own' : ''}`}
          >
            <span className='message-sender'>{msg.sender.name}</span>
            <p className='message-content'>{msg.content}</p>
            <span className='message-time'>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='chat-input'>
        <input
          type='text'
          placeholder='Send a message...'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>

    </div>
  )
}

export default ChatWindow
