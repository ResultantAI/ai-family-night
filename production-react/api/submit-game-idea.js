/**
 * Submit Game Idea - Save user game suggestions
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, description, category, userId, userEmail } = req.body

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description required' })
  }

  try {
    // Option 1: Save to Supabase (recommended)
    // Uncomment when ready to use database:
    /*
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('game_ideas')
      .insert([{
        user_id: userId,
        user_email: userEmail,
        title,
        description,
        category,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to save game idea' })
    }
    */

    // Option 2: Send email notification (temporary solution)
    console.log('Game Idea Submitted:', {
      title,
      description,
      category,
      userId,
      userEmail,
      timestamp: new Date().toISOString()
    })

    // Option 3: Could also send to email service
    // await fetch('/api/send-email', { ... })

    return res.status(200).json({
      success: true,
      message: 'Game idea received! Thank you for your suggestion.'
    })

  } catch (error) {
    console.error('Error submitting game idea:', error)
    return res.status(500).json({
      error: error.message,
      success: false
    })
  }
}
