import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { FaArrowLeft } from 'react-icons/fa'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
  })
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const result = signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      )
      if (result.success) {
        // Redirect based on role
        const role = result.user.role
        if (role === 'ADMIN') {
          navigate('/app/admin/dashboard')
        } else if (role === 'EMPLOYEE') {
          navigate('/app/employee/dashboard')
        } else if (role === 'CLIENT') {
          navigate('/app/client/dashboard')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center text-primary-accent hover:text-primary-accent/80 transition-colors"
      >
        <FaArrowLeft className="mr-2" />
        {/* <span className="text-sm font-medium">Back to Home</span> */}
      </button>

      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-primary-text mb-2">Create Account</h1>
        <p className="text-secondary-text">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger rounded-lg p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
        />

        <div>
          <label className="block text-sm font-medium text-primary-text mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent focus:outline-none transition-colors"
          >
            <option value="CLIENT">Client</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Sign Up
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-text text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-accent hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <Link
          to="/forgot-password"
          className="block text-center text-sm text-primary-accent hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </Card>
  )
}

export default SignupPage