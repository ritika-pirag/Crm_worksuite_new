import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { FaUserShield, FaUserTie, FaUser, FaArrowLeft, FaCrown } from 'react-icons/fa'

import { useSettings } from '../../context/SettingsContext.jsx'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [retryAfter, setRetryAfter] = useState(null)
  const { login } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()

  // Check for rate limiting on mount
  useEffect(() => {
    const checkRateLimit = () => {
      const retryAfter = localStorage.getItem('loginRetryAfter')
      if (retryAfter && Date.now() < parseInt(retryAfter)) {
        const secondsLeft = Math.ceil((parseInt(retryAfter) - Date.now()) / 1000)
        setRetryAfter(secondsLeft)

        // Update countdown every second
        const interval = setInterval(() => {
          const remaining = Math.ceil((parseInt(retryAfter) - Date.now()) / 1000)
          if (remaining > 0) {
            setRetryAfter(remaining)
          } else {
            setRetryAfter(null)
            localStorage.removeItem('loginRetryAfter')
            clearInterval(interval)
          }
        }, 1000)

        return () => clearInterval(interval)
      } else {
        setRetryAfter(null)
        if (retryAfter) {
          localStorage.removeItem('loginRetryAfter')
        }
      }
    }

    checkRateLimit()
    const interval = setInterval(checkRateLimit, 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-generate credentials based on role
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setError('')

    const credentials = {
      SUPERADMIN: {
        email: 'superadmin@crmapp.com',
        password: '123456'
      },
      ADMIN: {
        email: 'techmahindraadmin@gmail.com',
        password: '123456'
      },
      EMPLOYEE: {
        email: 'raja@gmail.com',
        password: '123456'
      },
      CLIENT: {
        email: 'virat@gmail.com',
        password: '123456'
      }
    }

    if (credentials[selectedRole]) {
      setEmail(credentials[selectedRole].email)
      setPassword(credentials[selectedRole].password)
    }
  }

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Check rate limiting before attempting login
    const retryAfter = localStorage.getItem('loginRetryAfter')
    if (retryAfter && Date.now() < parseInt(retryAfter)) {
      const secondsLeft = Math.ceil((parseInt(retryAfter) - Date.now()) / 1000)
      setError(`Too many login attempts. Please wait ${secondsLeft} seconds before trying again.`)
      setRetryAfter(secondsLeft)
      setIsLoading(false)
      return
    }

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (!role) {
      setError('Please select a role')
      setIsLoading(false)
      return
    }

    try {
      const result = await login(email, password, role)
      console.log('Login result:', result)

      if (result.success) {
        // Clear any rate limit on successful login
        localStorage.removeItem('loginRetryAfter')
        setRetryAfter(null)

        // Redirect based on role
        const userRole = result.user?.role || role
        console.log('User role:', userRole)
        console.log('Redirecting to dashboard...')

        // Small delay to ensure state is updated
        setTimeout(() => {
          if (userRole === 'SUPERADMIN') {
            navigate('/app/superadmin/dashboard', { replace: true })
          } else if (userRole === 'ADMIN') {
            navigate('/app/admin/dashboard', { replace: true })
          } else if (userRole === 'EMPLOYEE') {
            navigate('/app/employee/dashboard', { replace: true })
          } else if (userRole === 'CLIENT') {
            navigate('/app/client/dashboard', { replace: true })
          } else {
            // Fallback to admin if role not recognized
            console.warn('Unknown role, redirecting to admin dashboard')
            navigate('/app/admin/dashboard', { replace: true })
          }
        }, 100)
      } else {
        // Handle rate limiting error
        if (result.isRateLimited) {
          setRetryAfter(result.retryAfter || 60)
          setError(result.error || 'Too many login attempts. Please wait before trying again.')
        } else {
          setError(result.error || 'Invalid email or password')
        }
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Login error in LoginPage:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })

      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers?.['retry-after'] || 60
        setRetryAfter(retryAfter)
        setError(`Too many login attempts. Please wait ${retryAfter} seconds before trying again.`)
      } else {
        const errorMessage = err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Login failed. Please check your credentials and try again.'
        setError(errorMessage)
      }
      setIsLoading(false)
    }
  }

  const roleCards = [
    {
      id: 'SUPERADMIN',
      label: 'Super Admin',
      icon: FaCrown,
      description: 'System administrator',
      color: 'bg-purple-500'
    },
    {
      id: 'ADMIN',
      label: 'Admin',
      icon: FaUserShield,
      description: 'Full system access',
      color: 'bg-primary-accent'
    },
    {
      id: 'EMPLOYEE',
      label: 'Employee',
      icon: FaUserTie,
      description: 'Team member access',
      color: 'bg-secondary-accent'
    },
    {
      id: 'CLIENT',
      label: 'Client',
      icon: FaUser,
      description: 'Client portal access',
      color: 'bg-warning'
    }
  ]

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

      <div className="text-center mb-6 md:mb-8 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-text mb-2">Welcome Back</h1>
        <p className="text-secondary-text text-sm md:text-base">Select your role to sign in</p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-6">
        {roleCards.map((roleCard) => {
          const Icon = roleCard.icon
          const isSelected = role === roleCard.id
          return (
            <button
              key={roleCard.id}
              type="button"
              onClick={() => handleRoleSelect(roleCard.id)}
              className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 ${isSelected
                ? 'border-primary-accent bg-primary-accent shadow-lg'
                : 'border-gray-200 hover:border-primary-accent hover:shadow-md'
                }`}
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${roleCard.color} bg-opacity-20 flex items-center justify-center mx-auto mb-2`}
              >
                <Icon
                  size={20}
                  className={isSelected ? 'text-white' : 'text-secondary-text'}
                />
              </div>
              <p
                className={`text-xs md:text-sm font-semibold ${isSelected ? 'text-white' : 'text-primary-text'
                  }`}
              >
                {roleCard.label}
              </p>
              <p className={`text-[10px] md:text-xs mt-0.5 hidden md:block ${isSelected ? 'text-white/80' : 'text-muted-text'}`}>
                {roleCard.description}
              </p>
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {error && (
          <div className={`${retryAfter ? 'bg-warning bg-opacity-10 border-warning' : 'bg-danger bg-opacity-10 border-danger'} border rounded-lg p-3 text-sm ${retryAfter ? 'text-warning' : 'text-danger'}`}>
            <div className="font-semibold mb-1">{error}</div>
            {retryAfter && (
              <div className="text-xs mt-2">
                ⏱️ Retry available in: <span className="font-bold">{retryAfter} seconds</span>
              </div>
            )}
          </div>
        )}

        {role && !error && (
          <div className="bg-primary-accent border border-primary-accent rounded-lg p-3 text-sm text-white">
            ✓ Credentials auto-filled for {role.charAt(0) + role.slice(1).toLowerCase()}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded" />
            <span className="text-sm text-secondary-text">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-primary-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            variant="outline"
            className="px-8 min-w-[200px] text-gray-900 hover:bg-gray-800 hover:text-white border-2 border-gray-300"
            disabled={!role || !email || !password || isLoading || (retryAfter !== null && retryAfter > 0)}
          >
            {isLoading
              ? 'Signing in...'
              : retryAfter !== null && retryAfter > 0
                ? `Please wait ${retryAfter}s...`
                : `Sign In as ${role ? role.charAt(0) + role.slice(1).toLowerCase() : '...'}`
            }
          </Button>
        </div>
      </form>

      {/* Footer Links */}
      {/* Footer Settings */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-secondary-text">
          {[
            { text: 'Privacy Policy', url: settings?.footer_privacy_link },
            { text: 'Terms of Service', url: settings?.footer_terms_link },
            { text: 'Refund Policy', url: settings?.footer_refund_link },
            { text: settings?.footer_custom_link_1_text, url: settings?.footer_custom_link_1_url },
            { text: settings?.footer_custom_link_2_text, url: settings?.footer_custom_link_2_url }
          ].filter(link => link.text && link.url).map((link, index) => {
            const isInternal = link.url.startsWith('/')
            if (isInternal) {
              return (
                <Link key={index} to={link.url} className="hover:text-primary-accent transition-colors">
                  {link.text}
                </Link>
              )
            }
            return (
              <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-accent transition-colors">
                {link.text}
              </a>
            )
          })}
        </div>
        {settings?.footer_company_address && (
          <div className="text-xs text-secondary-text whitespace-pre-line mt-3 opacity-70">
            {settings.footer_company_address}
          </div>
        )}
      </div>
    </Card>
  )
}

export default LoginPage