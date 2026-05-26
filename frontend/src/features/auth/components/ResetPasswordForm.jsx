import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { useResetPassword } from '../hooks/useResetPassword'
import { FormError } from './FormError'

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.token) {
    errors.token = 'Reset token is missing. Open the link from your email again.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!values.password_confirmation) {
    errors.password_confirmation = 'Confirm password is required.'
  } else if (values.password_confirmation !== values.password) {
    errors.password_confirmation = 'Passwords do not match.'
  }

  return errors
}

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const { error, fieldErrors, isLoading, message, submit } = useResetPassword()
  const [values, setValues] = useState({
    email: searchParams.get('email') ?? '',
    token: searchParams.get('token') ?? '',
    password: '',
    password_confirmation: '',
  })
  const [touched, setTouched] = useState({})
  const liveErrors = useMemo(() => validate(values), [values])
  const hasErrors = Object.keys(liveErrors).length > 0

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  function handleBlur(event) {
    const { name } = event.target
    setTouched((currentTouched) => ({ ...currentTouched, [name]: true }))
  }

  function getFieldError(name) {
    if ((touched[name] || name === 'token') && liveErrors[name]) {
      return liveErrors[name]
    }

    return fieldErrors[name]
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setTouched({ email: true, token: true, password: true, password_confirmation: true })

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    submit(values)
  }

  return (
    <form className="w-full max-w-md rounded-lg border border-teal-900/15 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-teal-800">Password reset</p>
        <h1 className="mt-2 text-3xl font-black text-teal-950">Set new password</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-teal-900/75">Use the secure link from your email to set a new password.</p>
      </div>

      {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}
      {message ? <div className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">{message}</div> : null}
      <FormError error={getFieldError('token')} />

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Email
          <Input autoComplete="email" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="email" onBlur={handleBlur} onChange={handleChange} required type="email" value={values.email} />
          <FormError error={getFieldError('email')} />
        </label>

        <label className="grid gap-2 text-sm font-bold text-teal-950">
          New password
          <Input autoComplete="new-password" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="password" onBlur={handleBlur} onChange={handleChange} required type="password" value={values.password} />
          <FormError error={getFieldError('password')} />
        </label>

        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Confirm password
          <Input autoComplete="new-password" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="password_confirmation" onBlur={handleBlur} onChange={handleChange} required type="password" value={values.password_confirmation} />
          <FormError error={getFieldError('password_confirmation')} />
        </label>
      </div>

      <Button className="mt-6 w-full bg-teal-800 hover:bg-teal-900 focus:ring-teal-800 disabled:cursor-not-allowed disabled:bg-teal-800/50" disabled={isLoading || hasErrors} type="submit">
        {isLoading ? 'Resetting password...' : 'Reset password'}
      </Button>

      <p className="mt-5 text-center text-sm font-semibold text-teal-900/75">
        Need a new link? <Link className="text-teal-800 hover:text-teal-950" to="/forgot-password">Send reset link</Link>
      </p>
    </form>
  )
}
