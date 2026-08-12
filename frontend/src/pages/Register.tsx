import { Link } from 'react-router-dom'

export default function Register() {
  // TODO(James): registration logic, form state, and submit handler

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>

        <form className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
