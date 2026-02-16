/**
 * Get Referrals - Fetch user's referral stats and history
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' })
  }

  try {
    // In production, fetch from database
    // For now, return mock data structure

    // TODO: Query Supabase for:
    // 1. All users who signed up with this user's referral code
    // 2. Which of those users have paid subscriptions
    // 3. Calculate free months earned (every 3 paid = 3 months)

    const mockReferrals = [
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        signupDate: '2026-01-15',
        isPaid: true
      },
      {
        name: 'Mike Chen',
        email: 'mike@example.com',
        signupDate: '2026-01-22',
        isPaid: true
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        signupDate: '2026-02-01',
        isPaid: false
      }
    ]

    const paidReferrals = mockReferrals.filter(r => r.isPaid).length
    const freeMonthsEarned = Math.floor(paidReferrals / 3) * 3

    return res.status(200).json({
      success: true,
      referrals: mockReferrals,
      rewards: {
        totalReferrals: mockReferrals.length,
        paidReferrals: paidReferrals,
        freeMonthsEarned: freeMonthsEarned,
        freeMonthsRemaining: freeMonthsEarned // In production, track usage
      }
    })

  } catch (error) {
    console.error('Error fetching referrals:', error)
    return res.status(500).json({
      error: error.message,
      success: false
    })
  }
}
