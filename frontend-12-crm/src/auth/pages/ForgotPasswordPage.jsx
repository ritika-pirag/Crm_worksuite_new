import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle password reset request
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary-text mb-2">
              Check Your Email
            </h1>
            <p className="text-secondary-text">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          <Link to="/login">
            <Button variant="primary">Back to Login</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-text mb-2">
          Forgot Password
        </h1>
        <p className="text-secondary-text">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
        />

        <Button type="submit" variant="primary" className="w-full">
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-primary-accent hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </Card>
  )
}

export default ForgotPasswordPage

