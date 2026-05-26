import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resendEmailVerification, verifyEmail } from '../api/authApi'
import { storage } from '../../../shared/utils/storage'

function getErrorMessage(error) {
  return error?.errors?.otp?.[0] ?? error?.errors?.email?.[0] ?? error?.message ?? 'Could not verify email.'
}

export function useVerifyEmail() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  async function submit(values) {
    setError('')
    setFieldErrors({})
    setMessage('')
    setIsLoading(true)

    try {
      const authData = await verifyEmail(values)
      storage.setToken(authData.token)
      storage.setAdminSession(false)
      navigate('/', { replace: true })
    } catch (error) {
      setError(getErrorMessage(error))
      setFieldErrors(error?.errors ?? {})
    } finally {
      setIsLoading(false)
    }
  }

  async function resend(email) {
    setError('')
    setMessage('')
    setIsResending(true)

    try {
      const response = await resendEmailVerification({ email })
      setMessage(response?.message ?? 'Verification code sent to email.')
    } catch (error) {
      setError(getErrorMessage(error))
      setFieldErrors(error?.errors ?? {})
    } finally {
      setIsResending(false)
    }
  }

  return { error, fieldErrors, isLoading, isResending, message, resend, submit }
}
