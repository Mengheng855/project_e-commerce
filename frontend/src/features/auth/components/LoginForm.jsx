import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { useLogin } from '../hooks/useLogin'
import { FormError } from './FormError'

export function LoginForm() {
  const { error, fieldErrors, isLoading, submit } = useLogin()

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    submit({
      login: form.get('login'),
      password: form.get('password'),
    })
  }

  return (
    <form className="w-full max-w-md rounded-lg border border-teal-900/15 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-teal-800">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black text-teal-950">Login</h1>
      </div>

      {error ? <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div> : null}

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Email or username
          <Input autoComplete="username" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="login" placeholder="heng@example.com" required />
          <FormError error={fieldErrors.login} />
        </label>

        <label className="grid gap-2 text-sm font-bold text-teal-950">
          Password
          <Input autoComplete="current-password" className="border-teal-900/20 focus:border-teal-800 focus:ring-teal-800/20" name="password" placeholder="Your password" required type="password" />
          <FormError error={fieldErrors.password} />
        </label>
      </div>

      <div className="mt-3 text-right">
        <Link className="text-sm font-bold text-teal-800 hover:text-teal-950" to="/forgot-password">Forgot password?</Link>
      </div>

      <Button className="mt-4 w-full bg-teal-800 hover:bg-teal-900 focus:ring-teal-800" disabled={isLoading} type="submit">
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>

      <p className="mt-5 text-center text-sm font-semibold text-teal-900/75">
        No account? <Link className="text-teal-800 hover:text-teal-950" to="/register">Create one</Link>
      </p>
    </form>
  )
}
