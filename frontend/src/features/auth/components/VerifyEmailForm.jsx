import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { useVerifyEmail } from '../hooks/useVerifyEmail'
import { FormError } from './FormError'

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.otp.trim()) {
    errors.otp = 'Verification code is required.'
  } else if (!/^\d{6}$/.test(values.otp)) {
    errors.otp = 'Verification code must be 6 digits.'
  }

  return errors
}

export function VerifyEmailForm() {
  const [searchParams] = useSearchParams()
  const { error, fieldErrors, isLoading, isResending, message, resend, submit } = useVerifyEmail()
  const [values, setValues] = useState({ email: searchParams.get('email') ?? '', otp: '' })
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
    setTouched({ email: true, otp: true })

    if (Object.keys(validate(values)).length > 0) {
      return
    }

    submit(values)
  }

  function handleResend() {
    setTouched((currentTouched) => ({ ...currentTouched, email: true }))

    if (validate(values).email) {
      return
    }

    resend(values.email)
  }

  return (
    <form className="w-full max-w-md rounded-lg border border-teal-900/15 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-teal-800">Check your email</p>
        <h1 className="mt-2 text-3xl font-black text-teal-950">Verify email</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-teal-900/75">Enter the 6-digit code we sent to your inbox.</p>
      </div>

      {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}
      {message ? <div className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">{message}</div> : null}

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Email
          <Input autoComplete="email" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="email" onBlur={handleBlur} onChange={handleChange} required type="email" value={values.email} />
          <FormError error={getFieldError('email')} />
        </label>

        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Verification code
          <Input className="border-teal-900/20 text-center text-lg font-black tracking-[0.35em] focus:border-teal-800 focus:ring-teal-800/20" inputMode="numeric" maxLength="6" name="otp" onBlur={handleBlur} onChange={handleChange} placeholder="123456" required value={values.otp} />
          <FormError error={getFieldError('otp')} />
        </label>
      </div>

      <Button className="mt-6 w-full bg-teal-800 hover:bg-teal-900 focus:ring-teal-800 disabled:cursor-not-allowed disabled:bg-teal-800/50" disabled={isLoading || hasErrors} type="submit">
        {isLoading ? 'Verifying...' : 'Verify and continue'}
      </Button>

      <button className="mt-3 w-full rounded-md border border-teal-800 px-4 py-2 text-sm font-bold text-teal-900 hover:bg-teal-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isResending} onClick={handleResend} type="button">
        {isResending ? 'Sending...' : 'Resend code'}
      </button>

      <p className="mt-5 text-center text-sm font-semibold text-teal-900/75">
        Already verified? <Link className="text-teal-800 hover:text-teal-950" to="/login">Login</Link>
      </p>
    </form>
  )
}
