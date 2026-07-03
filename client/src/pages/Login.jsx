import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(email, password)
            navigate('/')
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed')
        }
    }

    return (
        <div className='Auth-container'>
            <form className='auth-form' onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>

                {error && <p className='error'>{error}</p>}

                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor='password'>Password</label>
                <input
                    type='password'
                    id='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type='submit'>Login</button>
                <p>Don't have an account? <Link to='/register'>Sign up</Link></p>
            </form>

        </div>
    )
}

export default Login
