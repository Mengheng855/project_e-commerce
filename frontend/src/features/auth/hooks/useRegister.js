import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/authApi'

function getErrorMessage(error) {
  return error?.message ?? 'Registration failed. Please check your information.'
}

export function useRegister() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  async function submit(values) {
    setError('')
    setFieldErrors({})
    setIsLoading(true)

    try {
      const response = await register(values)
      const email = response?.email ?? values.email
      navigate('/verify-email?email=' + encodeURIComponent(email), { replace: true })
    } catch (error) {
      setError(getErrorMessage(error))
      setFieldErrors(error?.errors ?? {})
    } finally {
      setIsLoading(false)
    }
  }

  return { error, fieldErrors, isLoading, submit }
}
