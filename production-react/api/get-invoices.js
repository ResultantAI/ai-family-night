/**
 * Get Billing History - Fetch Stripe invoices for a customer
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customerId } = req.query

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID required' })
  }

  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured')
      return res.status(500).json({ error: 'Stripe not configured' })
    }

    // Fetch invoices from Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/invoices?customer=${customerId}&limit=10`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Stripe API error:', errorData)
      return res.status(response.status).json({
        error: 'Failed to fetch invoices',
        details: errorData
      })
    }

    const data = await response.json()

    // Transform invoices to frontend format
    const invoices = data.data.map(invoice => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      amount: (invoice.amount_paid / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      paid: invoice.paid,
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      description: invoice.lines.data[0]?.description || 'Subscription',
      // Check if discount/coupon was applied
      discount: invoice.discount ? {
        code: invoice.discount.coupon.id,
        percent: invoice.discount.coupon.percent_off,
        amount: invoice.discount.coupon.amount_off
      } : null
    }))

    return res.status(200).json({
      success: true,
      invoices
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return res.status(500).json({
      error: error.message,
      success: false
    })
  }
}
