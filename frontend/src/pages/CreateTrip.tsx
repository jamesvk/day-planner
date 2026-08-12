import { Link } from 'react-router-dom'

export default function CreateTrip() {
  // TODO(James): form state and create-trip submit handler

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <Link to="/trips" className="text-sm font-medium text-indigo-600 hover:underline">
          &larr; Back to trips
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">New trip</h1>

        <form className="space-y-4 rounded-lg bg-white p-8 shadow">
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
              Destination
            </label>
            <input
              id="destination"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start date
              </label>
              <input
                id="startDate"
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End date
              </label>
              <input
                id="endDate"
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create trip
          </button>
        </form>
      </div>
    </div>
  )
}
