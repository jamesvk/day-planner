import { Link } from 'react-router-dom'

export default function TripDetail() {
  // TODO(James): read the :id route param and fetch the trip

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/trips" className="text-sm font-medium text-indigo-600 hover:underline">
          &larr; Back to trips
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">Trip detail</h1>

        {/* TODO(James): render the fetched trip */}
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          Trip details go here.
        </div>
      </div>
    </div>
  )
}
