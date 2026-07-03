import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register(name, email, password)
            navigate('/')
        } catch (error) {
            setError(error.response?.data?.message || 'Sign Up failed')
        }
    }

    return (
        <div className='Auth-container'>
            <form className='auth-form' onSubmit={handleSubmit}>
                <h2>Welcome </h2>

                {error && <p className='error'>{error}</p>}

                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

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

                <button type='submit'>Sign Up</button>
                <p>Have an account? <Link to='/login'>login</Link></p>
            </form>

        </div>
    )
}

export default Register
