import { Link } from 'react-router-dom'

export default function TripList() {
  // TODO(James): fetch trips from the API and render them

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Your trips</h1>
          <Link
            to="/trips/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New trip
          </Link>
        </div>

        {/* TODO(James): map over fetched trips */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          No trips yet.
        </div>
      </div>
    </div>
  )
}
