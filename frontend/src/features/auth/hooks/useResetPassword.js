import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resetPassword } from '../api/authApi'

function getErrorMessage(error) {
  return error?.message ?? 'Could not reset password.'
}

export function useResetPassword() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(values) {
    setError('')
    setFieldErrors({})
    setMessage('')
    setIsLoading(true)

    try {
      const response = await resetPassword(values)
      setMessage(response?.message ?? 'Password reset successfully.')
      setTimeout(() => navigate('/login', { replace: true }), 800)
    } catch (error) {
      setError(getErrorMessage(error))
      setFieldErrors(error?.errors ?? {})
    } finally {
      setIsLoading(false)
    }
  }

  return { error, fieldErrors, isLoading, message, submit }
}
