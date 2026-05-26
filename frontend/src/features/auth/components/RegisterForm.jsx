import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { useRegister } from '../hooks/useRegister'
import { FormError } from './FormError'

const initialValues = {
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
}

function validate(values) {
  const errors = {}
  const usernamePattern = /^[A-Za-z0-9_-]+$/

  if (!values.username.trim()) {
    errors.username = 'Username is required.'
  } else if (values.username.length > 255) {
    errors.username = 'Username must be 255 characters or less.'
  } else if (!usernamePattern.test(values.username)) {
    errors.username = 'Use only letters, numbers, dash, or underscore.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  } else if (values.email.length > 255) {
    errors.email = 'Email must be 255 characters or less.'
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

export function RegisterForm() {
  const { error, fieldErrors, isLoading, submit } = useRegister()
  const [values, setValues] = useState(initialValues)
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
    if (touched[name] && liveErrors[name]) {
      return liveErrors[name]
    }

    return fieldErrors[name]
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setTouched({ username: true, email: true, password: true, password_confirmation: true })

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    submit(values)
  }

  return (
    <form className="w-full max-w-md rounded-lg border border-teal-900/15 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-teal-800">Join TosTinh</p>
        <h1 className="mt-2 text-3xl font-black text-teal-950">Create account</h1>
      </div>

      {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Username
          <Input autoComplete="username" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="username" onBlur={handleBlur} onChange={handleChange} placeholder="heng" required value={values.username} />
          <FormError error={getFieldError('username')} />
        </label>

        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Email
          <Input autoComplete="email" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="email" onBlur={handleBlur} onChange={handleChange} placeholder="heng@example.com" required type="email" value={values.email} />
          <FormError error={getFieldError('email')} />
        </label>

        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Password
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
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="mt-5 text-center text-sm font-semibold text-teal-900/75">
        Already have account? <Link className="text-teal-800 hover:text-teal-950" to="/login">Login</Link>
      </p>
    </form>
  )
}
