import React from 'react'
import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

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
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  )
}

export default App
