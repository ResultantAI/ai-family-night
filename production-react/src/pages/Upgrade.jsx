import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Upgrade() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to pricing page
    navigate('/pricing', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to pricing...</p>
      </div>
    </div>
  )
}
