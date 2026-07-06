import { useAuth } from '../context/AuthContext.jsx'

const Sidebar = ({ rooms, users, onlineUsers, onRoomSelect, onDMSelect, activeRoom, activeDM }) => {
  const { user, logout } = useAuth()

  return (
    <div className='sidebar'>

      {/* App title */}
      <div className='sidebar-header'>
        <h2>ChatApp</h2>
      </div>

      {/* Rooms section */}
      <div className='sidebar-section'>
        <h3>Rooms</h3>
        {rooms.map(room => (
          <div
            key={room._id}
            onClick={() => onRoomSelect(room)}
            className={`sidebar-item ${activeRoom?._id === room._id ? 'active' : ''}`}>
                
            <span># {room.name}</span>
            {room.isPrivate && <span>Locked</span>}
          </div>
        ))}
      </div>

      {/* Users section */}
      <div className='sidebar-section'>
        <h3>Direct Messages</h3>
        {users.map(u => (
          <div
            key={u._id}
            onClick={() => onDMSelect(u)}
            className={`sidebar-item ${activeDM?._id === u._id ? 'active' : ''}`}
          >
            <span
              className={`status-dot ${onlineUsers.includes(u._id) ? 'online' : 'offline'}`}
            />
            <span>{u.name}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className='sidebar-footer'>
        <span>{user?.name}</span>
        <button onClick={logout}>Logout</button>
      </div>

    </div>
  )
}

export default Sidebar