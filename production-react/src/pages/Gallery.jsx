import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Gallery() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creations, setCreations] = useState([])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        navigate('/login')
        return
      }

      setUser(authUser)

      // Fetch all creations from gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('gallery')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (!galleryError && galleryData) {
        const formattedCreations = galleryData.map(item => ({
          id: item.id,
          title: item.title || 'Untitled Creation',
          game: item.game_name,
          date: new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          preview: item.preview
        }))
        setCreations(formattedCreations)
      }

      setLoading(false)
    }

    fetchUser()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <Logo className="w-8 h-8" textClassName="text-lg" />
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <PhotoIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Gallery
          </h1>
          <p className="text-xl text-gray-600">
            All your saved creations from family game nights
          </p>
        </div>

        {creations.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-12 text-center">
            <PhotoIcon className="w-24 h-24 text-purple-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No creations yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start playing games and save your creations to see them here!
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              <SparklesIcon className="w-5 h-5" />
              Browse Games
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map((creation, index) => (
              <div
                key={creation.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {creation.preview ? (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    <img
                      src={creation.preview}
                      alt={creation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-purple-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{creation.title}</h3>
                  <p className="text-sm text-gray-600">{creation.game}</p>
                  <p className="text-xs text-gray-500 mt-2">{creation.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
