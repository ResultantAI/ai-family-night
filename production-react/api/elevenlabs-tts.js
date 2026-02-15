/**
 * ElevenLabs Text-to-Speech API
 * Serverless function to generate high-quality audio for ReadAloud feature
 *
 * Free tier: 10,000 characters/month
 * Voice: Rachel (warm, friendly female voice - great for kids)
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, voiceId: customVoiceId } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  // Character limit check (prevent abuse)
  if (text.length > 5000) {
    return res.status(400).json({ error: 'Text too long. Maximum 5000 characters.' })
  }

  try {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not set in environment variables')
      return res.status(500).json({ error: 'API key not configured' })
    }

    // Voice IDs (ElevenLabs pre-made voices)
    const VOICES = {
      rachel: '21m00Tcm4TlvDq8ikWAM',  // Warm, friendly female (default)
      bella: 'EXAVITQu4vr4xnSDxMaL',   // Young, energetic female
      adam: 'pNInz6obpgDQGcFmaJgB',    // Deep, confident male
      charlie: 'IKne3meq5aSn9XLyUdCD', // Young, playful male
      dorothy: 'ThT5KcBeYPX3keUQqHPh', // Mature, storyteller female
    }

    // Use custom voice ID if provided, otherwise default to Rachel
    const voiceId = customVoiceId || VOICES.rachel

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5', // New free tier model (fast, high quality)
          voice_settings: {
            stability: 0.4,        // Lower = more expressive and energetic (perfect for roast battle!)
            similarity_boost: 0.8, // Higher = better voice clarity
            style: 0.5             // Add some style variation
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('ElevenLabs API error:', errorData)

      // Check if it's a quota error
      if (response.status === 401) {
        return res.status(401).json({ error: 'Invalid API key' })
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Monthly character quota exceeded. Upgrade your plan.' })
      }

      return res.status(500).json({ error: 'Failed to generate audio' })
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer()

    // Return audio file
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.byteLength)
    res.send(Buffer.from(audioBuffer))

  } catch (error) {
    console.error('Error in elevenlabs-tts:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
