import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Sidebar.css'

import { IoMdChatbubbles } from "react-icons/io";
import { MdGroups2 } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";


const Sidebar = ({ rooms, users, onlineUsers, onRoomSelect, onDMSelect, activeRoom, activeDM }) => {
  const { user, logout } = useAuth()

  return (
    <div className='sidebar'>

      {/* App title */}
      <div className='sidebar-header'>
        <IoMdChatbubbles size={25} />
        <h2>ChatApp</h2>
      </div>

      {/* Rooms section */}
      <div className='sidebar-section'>
        <div className='icon-cont'><MdGroups2 size={30} color='rgba(255, 255, 255, 0.35)'/><h3>Rooms</h3></div>
        {rooms.map(room => (
          <div
            key={room._id}
            onClick={() => onRoomSelect(room)}
            className={`sidebar-item ${activeRoom?._id === room._id ? 'active' : ''}`}>
                
            <span className='room-lock'>{room.name}
            {room.isPrivate && <FaLock color='rgba(255, 255, 255, 0.35)'/>}</span>
          </div>
        ))}
      </div>

      {/* Users section */}
      <div className='sidebar-section'>
        <div className='icon-cont'><BsPersonFill size={30} color='rgba(255, 255, 255, 0.35)'/><h3>Direct Messages</h3></div>
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