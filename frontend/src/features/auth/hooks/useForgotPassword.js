import { useState } from 'react'
import { forgotPassword } from '../api/authApi'

function getErrorMessage(error) {
  return error?.errors?.email?.[0] ?? error?.message ?? 'Could not send reset OTP.'
}

export function useForgotPassword() {
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
      const response = await forgotPassword(values)
      setMessage(response?.message ?? 'Password reset OTP sent.')
    } catch (error) {
      setError(getErrorMessage(error))
      setFieldErrors(error?.errors ?? {})
    } finally {
      setIsLoading(false)
    }
  }

  return { error, fieldErrors, isLoading, message, submit }
}
