import React from 'react'
import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Chat from './pages/Chat.jsx'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if(loading) return <div>Loading...</div>
  return user ? children : <Navigate to='/login' />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/' element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
