import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { useForgotPassword } from '../hooks/useForgotPassword'
import { FormError } from './FormError'

export function ForgotPasswordForm() {
  const { error, fieldErrors, isLoading, message, submit } = useForgotPassword()

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get('email')

    submit({ email })
  }


  return (
    <form className="w-full max-w-md rounded-lg border border-teal-900/15 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-teal-800">Password help</p>
        <h1 className="mt-2 text-3xl font-black text-teal-950">Forgot password</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-teal-900/75">Enter your account email and we will send a reset link.</p>
      </div>

      {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}
      {message ? <div className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">{message}</div> : null}

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Email
          <Input autoComplete="email" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="email" placeholder="heng@example.com" required type="email" />
          <FormError error={fieldErrors.email} />
        </label>
      </div>

      <Button className="mt-6 w-full bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">
        {isLoading ? 'Sending link...' : 'Send reset link'}
      </Button>

      <p className="mt-5 text-center text-sm font-semibold text-teal-900/75">
        Remember password? <Link className="text-teal-800 hover:text-teal-950" to="/login">Login</Link>
      </p>
    </form>
  )
}
