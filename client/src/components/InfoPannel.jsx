import React from 'react'

const InfoPannel = ({ activeRoom, activeDM, onlineUsers, users }) => {
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
        <p>Select a room or user to start chatting</p>
      )}

    </div>
  )
}

export default InfoPannel
