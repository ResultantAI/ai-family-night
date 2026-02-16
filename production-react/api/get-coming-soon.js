/**
 * Get Coming Soon Games - Fetch upcoming game releases
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // In production, fetch from Supabase
    // Uncomment when database is set up:
    /*
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('coming_soon_games')
      .select('*')
      .eq('is_released', false)
      .gte('release_date', new Date().toISOString())
      .order('release_date', { ascending: true })
      .limit(3)

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      games: data || []
    })
    */

    // Temporary: Return mock data with realistic future dates
    const now = new Date()
    const mockGames = [
      {
        id: '1',
        title: 'Musical Maestro',
        description: 'Compose family songs with AI-generated melodies',
        category: 'Music',
        icon: '🎵',
        gradient: 'from-violet-400 to-purple-500',
        release_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        is_released: false
      },
      {
        id: '2',
        title: 'Pet Designer',
        description: 'Design your dream pet with magical abilities',
        category: 'Creative',
        icon: '🐾',
        gradient: 'from-teal-400 to-cyan-500',
        release_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        is_released: false
      },
      {
        id: '3',
        title: 'Time Capsule Maker',
        description: 'Create a digital time capsule for your family',
        category: 'Memory',
        icon: '⏰',
        gradient: 'from-indigo-400 to-blue-500',
        release_date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days
        is_released: false
      }
    ]

    return res.status(200).json({
      success: true,
      games: mockGames
    })

  } catch (error) {
    console.error('Error fetching coming soon games:', error)
    return res.status(500).json({
      error: error.message,
      success: false,
      games: []
    })
  }
}
