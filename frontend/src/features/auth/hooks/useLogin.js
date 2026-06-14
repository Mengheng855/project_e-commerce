import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import { storage } from '../../../shared/utils/storage'

function getErrorMessage(error) {
  return error?.errors?.login?.[0] ?? error?.errors?.email?.[0] ?? error?.message ?? 'Login failed. Please try again.'
}

export function useLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  async function submit(values) {
    setError('')
    setFieldErrors({})
    setIsLoading(true)

    try {
      const authData = await login(values)

      storage.setToken(authData.token)
      if (authData.user?.is_admin) {
        storage.setAdminSession(true)
        navigate('/admin', { replace: true })
      } else {
        storage.setAdminSession(false)
        navigate('/', { replace: true })
      }
    } catch (error) {
      const verificationEmail = error?.errors?.email?.[0]
      if (verificationEmail) {
        navigate('/verify-email?email=' + encodeURIComponent(verificationEmail))
        return
      }

      setError(getErrorMessage(error))
      setFieldErrors(error?.errors ?? {})
    } finally {
      setIsLoading(false)
    }
  }

  return { error, fieldErrors, isLoading, submit }
}
