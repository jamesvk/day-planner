import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import TripList from './pages/TripList'
import TripDetail from './pages/TripDetail'
import CreateTrip from './pages/CreateTrip'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trips" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/trips" element={<TripList />} />
      <Route path="/trips/new" element={<CreateTrip />} />
      <Route path="/trips/:id" element={<TripDetail />} />
    </Routes>
  )
}

export default App
