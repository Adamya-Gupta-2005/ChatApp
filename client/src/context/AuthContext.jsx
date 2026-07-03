import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'


const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/auth/me`, {
                    withCredentials: true
                })
                setUser(res.data.user)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        //provides user data on reload and page switching prvents re-logging
        checkAuth()
    }, [])//[] runs only once

    const register = async (name, email, password) => {
        const res = await axios.post(`${backendUrl}/api/auth/register`, 
            {name,email,password},
            {withCredentials: true}
        )
        setUser(res.data.user)
    }

    const login = async (email, password) => {
        const res = await axios.post(`${backendUrl}/api/auth/login`,
            {email,password},
            {withCredentials: true}
        )
        setUser(res.data.user)
    }

    const logout = async () => {
        const res = await axios.post(`${backendUrl}/api/auth/logout`, {}, {
            withCredentials: true
        })
        setUser(null)
    }


    return (
        <AuthContext.Provider value={{user,loading,register,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)