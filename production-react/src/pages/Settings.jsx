import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserCircleIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { isGrandmaModeEnabled, setGrandmaMode } from '../utils/moderation'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'
import { isPremiumUser } from '../config/stripe'
import { getNotificationPreferences, updateNotificationPreferences } from '../lib/notifications'

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [loadingChildren, setLoadingChildren] = useState(true)

  // Fetch real user data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        navigate('/login')
        return
      }

      // Extract user data from Supabase auth
      const firstName = authUser.user_metadata?.first_name ||
                       authUser.user_metadata?.firstName ||
                       authUser.user_metadata?.full_name?.split(' ')[0] ||
                       authUser.email?.split('@')[0]

      const lastName = authUser.user_metadata?.last_name ||
                      authUser.user_metadata?.lastName ||
                      authUser.user_metadata?.full_name?.split(' ')[1] ||
                      ''

      const email = authUser.email

      // Check subscription status from localStorage (set by Stripe checkout)
      const hasPremium = isPremiumUser()

      // Fetch subscription details from API
      let subscriptionData = {
        nextBillingDate: null,
        paymentMethod: null,
        customerId: null
      }

      if (hasPremium) {
        try {
          const response = await fetch(`/api/get-subscription?userId=${authUser.id}`)
          if (response.ok) {
            subscriptionData = await response.json()
          }
        } catch (err) {
          console.error('Error fetching subscription:', err)
        }
      }

      setUser({
        firstName,
        lastName,
        email,
        isPremium: hasPremium,
        subscriptionStatus: hasPremium ? 'premium' : 'free',
        ...subscriptionData
      })

      setLoading(false)

      // Fetch children profiles
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true })

      if (!childrenError && childrenData) {
        setChildren(childrenData)
      }
      setLoadingChildren(false)
    }

    fetchUser()
  }, [navigate])

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'children', name: 'Children', icon: UserGroupIcon },
    { id: 'safety', name: 'Content Safety', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: CogIcon }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CogIcon className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard">
              <Logo className="w-8 h-8" textClassName="text-lg" />
            </Link>
            <Link
              to="/dashboard"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CogIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-50 text-purple-700 border-2 border-purple-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'billing' && <BillingTab user={user} />}
            {activeTab === 'children' && <ChildrenTab children={children} loading={loadingChildren} onUpdate={() => {
              // Refresh children list
              supabase.auth.getUser().then(({ data: { user: authUser } }) => {
                if (authUser) {
                  supabase
                    .from('children')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: true })
                    .then(({ data }) => {
                      if (data) setChildren(data)
                    })
                }
              })
            }} />}
            {activeTab === 'safety' && <SafetyTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Tab
function ProfileTab({ user }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Change avatar
            </button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First name
            </label>
            <input
              type="text"
              defaultValue={user.firstName}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last name
            </label>
            <input
              type="text"
              defaultValue={user.lastName}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email address
          </label>
          <input
            type="email"
            defaultValue={user.email}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Save Changes
          </button>
          <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Billing Tab
function BillingTab({ user }) {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    if (!user.customerId) {
      alert('No customer ID found. Please contact support.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.customerId,
          returnUrl: window.location.href
        })
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error opening billing portal. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error opening billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Subscription Card */}
      {user.isPremium ? (
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Premium Plan</h2>
              <p className="text-purple-200">Active subscription</p>
            </div>
            <span className="bg-white/20 px-4 py-2 rounded-lg font-semibold text-sm">
              ${user.amount || '9.99'}/{user.interval || 'month'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-purple-200 text-sm mb-1">Status</div>
              <div className="font-semibold">{user.status === 'trialing' ? 'Free Trial' : 'Active'}</div>
            </div>
            <div>
              <div className="text-purple-200 text-sm mb-1">Next billing date</div>
              <div className="font-semibold">{user.nextBillingDate || 'Loading...'}</div>
            </div>
          </div>

          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Opening...' : 'Manage Billing & Subscription'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h2>
            <p className="text-gray-600">Upgrade to Premium for unlimited access</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Current Plan</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ 3 free games</li>
                <li>🔒 Premium games locked</li>
                <li>🔒 Limited creations</li>
              </ul>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Premium Plan</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ All 8+ games unlocked</li>
                <li>✅ Weekly new games</li>
                <li>✅ Unlimited creations</li>
                <li>✅ Save to gallery</li>
              </ul>
            </div>
          </div>

          <Link
            to="/pricing"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-4 px-6 rounded-xl font-bold text-lg transition-colors"
          >
            Upgrade to Premium - $9.99/month
          </Link>
        </div>
      )}

      {/* Payment Method - Only show if premium */}
      {user.isPremium && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

            {user.paymentMethod ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <CreditCardIcon className="w-10 h-10 text-gray-600" />
                  <div>
                    <div className="font-semibold capitalize">
                      {user.paymentMethod.brand || user.paymentMethod.type} •••• {user.paymentMethod.last4}
                    </div>
                    {user.paymentMethod.expMonth && (
                      <div className="text-sm text-gray-500">
                        Expires {user.paymentMethod.expMonth}/{user.paymentMethod.expYear}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleManageBilling}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Update
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No payment method on file</p>
                <button
                  onClick={handleManageBilling}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  + Add payment method
                </button>
              </div>
            )}
          </div>

          {/* Billing History - Only show if premium */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>

            <div className="text-center py-8 text-gray-500">
              <p>No billing history yet</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Children Tab
function ChildrenTab({ children, loading, onUpdate }) {
  const [showModal, setShowModal] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [formData, setFormData] = useState({ name: '', age: '', gender: '', interests: [] })
  const [saving, setSaving] = useState(false)

  const handleAdd = () => {
    setEditingChild(null)
    setFormData({ name: '', age: '', gender: '', interests: [] })
    setShowModal(true)
  }

  const handleEdit = (child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      age: child.age.toString(),
      gender: child.gender || '',
      interests: child.interests || []
    })
    setShowModal(true)
  }

  const handleDelete = async (childId) => {
    if (!confirm('Are you sure you want to remove this child profile?')) return

    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId)

    if (!error) {
      onUpdate()
    } else {
      alert('Error removing child profile')
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('User error:', userError)
        alert('Authentication error. Please log in again.')
        setSaving(false)
        return
      }

      const childData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        interests: formData.interests
      }

      if (editingChild) {
        // Update existing
        const { error } = await supabase
          .from('children')
          .update(childData)
          .eq('id', editingChild.id)

        if (error) {
          console.error('Update error:', error)
          alert(`Error updating child: ${error.message}\n\nPlease make sure the database is set up correctly. See DIAGNOSTIC-TESTS.md for help.`)
        } else {
          setShowModal(false)
          onUpdate()
        }
      } else {
        // Create new
        const { error } = await supabase
          .from('children')
          .insert({ ...childData, user_id: user.id })

        if (error) {
          console.error('Insert error:', error)

          // Provide helpful error messages
          if (error.message.includes('relation "public.children" does not exist')) {
            alert('⚠️ Database table not created!\n\nThe "children" table does not exist in your database.\n\nPlease run the SQL file: supabase-children-table.sql\n\nSee DIAGNOSTIC-TESTS.md for instructions.')
          } else if (error.message.includes('permission denied')) {
            alert('⚠️ Permission error!\n\nRow Level Security is blocking access.\n\nPlease check your Supabase RLS policies.\n\nSee DIAGNOSTIC-TESTS.md for help.')
          } else {
            alert(`Error creating child: ${error.message}\n\nCheck browser console for details.`)
          }
        } else {
          setShowModal(false)
          onUpdate()
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert(`Unexpected error: ${err.message}`)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <p className="text-gray-600">Loading children...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Children</h2>
          <button
            onClick={handleAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            + Add Child
          </button>
        </div>

        {children.length > 0 ? (
          <div className="space-y-4">
            {children.map((child) => (
              <div key={child.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {child.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{child.name}</div>
                      <div className="text-gray-500">{child.age} years old</div>
                      {child.interests && child.interests.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          Interests: {child.interests.length}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(child)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No children profiles yet</h3>
            <p className="text-gray-600 mb-6">Add your children to personalize their experience and track their progress.</p>
            <button
              onClick={handleAdd}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Your First Child
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingChild ? 'Edit Child Profile' : 'Add Child Profile'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Alex"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <select
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select age</option>
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(age => (
                    <option key={age} value={age}>{age} years old</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select gender (optional)</option>
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                  <option value="other">Other/Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.interests.join(', ')}
                  onChange={(e) => {
                    const interestsArray = e.target.value
                      .split(',')
                      .map(i => i.trim())
                      .filter(i => i.length > 0)
                    setFormData({ ...formData, interests: interestsArray })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="dinosaurs, space, art, soccer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple interests with commas
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.age || saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Notifications Tab
function NotificationsTab() {
  const [preferences, setPreferences] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    const prefs = await getNotificationPreferences()
    setPreferences(prefs)
  }

  const handleToggle = async (key, value) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)

    setSaving(true)
    const result = await updateNotificationPreferences('current-user-id', newPrefs)
    setSaving(false)

    if (result.success) {
      setSaveMessage('✓ Saved')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  if (!preferences) {
    return <div className="bg-white rounded-2xl border border-gray-200 p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Email Notifications</h2>
          {saveMessage && (
            <span className="text-sm text-green-600 font-medium">{saveMessage}</span>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Weekly Mission Reminders</div>
              <div className="text-sm text-gray-500 mt-1">Monday, Wednesday, and Sunday mission notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailWeeklyMissions}
                onChange={(e) => handleToggle('emailWeeklyMissions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Badge & Reward Unlocks</div>
              <div className="text-sm text-gray-500 mt-1">Get notified when your child earns a new badge</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailBadges}
                onChange={(e) => handleToggle('emailBadges', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">New Game Releases</div>
              <div className="text-sm text-gray-500 mt-1">Sunday notifications when new games are available</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNewGames}
                onChange={(e) => handleToggle('emailNewGames', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">In-App Notifications</h2>

        <div className="space-y-6">
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Mission Reminders</div>
              <div className="text-sm text-gray-500 mt-1">In-app alerts for upcoming missions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushMissionReminders}
                onChange={(e) => handleToggle('pushMissionReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between py-4">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Badge Unlocks</div>
              <div className="text-sm text-gray-500 mt-1">Celebrate achievements with instant notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushBadgeUnlocks}
                onChange={(e) => handleToggle('pushBadgeUnlocks', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Timing Preferences */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Timing</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred notification time
            </label>
            <input
              type="time"
              value={preferences.preferredTime}
              onChange={(e) => handleToggle('preferredTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              We'll try to send notifications around this time (in your timezone)
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-purple-800">
              💡 <strong>Recommended:</strong> Set this to right after dinner (6-7pm) when families are most likely to have quality time together.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Safety Tab
function SafetyTab() {
  const [grandmaModeActive, setGrandmaModeActive] = useState(false)

  useEffect(() => {
    setGrandmaModeActive(isGrandmaModeEnabled())
  }, [])

  const toggleGrandmaMode = (enabled) => {
    setGrandmaMode(enabled)
    setGrandmaModeActive(enabled)
  }

  return (
    <div className="space-y-6">
      {/* Grandma Mode Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Extra Safe Mode</h2>
            <p className="text-gray-600">
              Additional content filtering for the youngest family members
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={grandmaModeActive}
              onChange={(e) => toggleGrandmaMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        {grandmaModeActive && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <ShieldCheckIcon className="w-5 h-5" />
              Extra Safe Mode is ON
            </div>
            <p className="text-green-700 text-sm">
              All AI-generated content is using the strictest safety filters. Perfect for ages 4-7!
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">What This Does:</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">✅ Extra gentle content</div>
              <p className="text-sm text-gray-600">
                All AI responses are extra positive, focusing on friendship and kindness
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">✅ No intense scenarios</div>
              <p className="text-sm text-gray-600">
                Avoids any content that could be scary or overwhelming for young kids
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">✅ Blocks roast battle</div>
              <p className="text-sm text-gray-600">
                AI Roast Battle is disabled (too intense for very young children)
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">✅ Mr. Rogers tone</div>
              <p className="text-sm text-gray-600">
                All content feels like Sesame Street or Mr. Rogers' Neighborhood
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-900">
                <strong>When to use Extra Safe Mode:</strong> Perfect for families with children ages 4-7, or when you want the gentlest, most positive content possible. You can toggle this on/off anytime!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Monitoring */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Monitoring</h2>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Log all AI interactions</div>
              <div className="text-sm text-gray-500">
                Keep a record of all AI-generated content for review
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={true} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-start justify-between pt-4 border-t border-gray-200">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Content moderation alerts</div>
              <div className="text-sm text-gray-500">
                Get notified if inappropriate content is detected and blocked
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={true} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            View Activity Log
          </button>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Safety Tips for Parents</h2>

        <div className="space-y-3 text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">1.</span>
            <p>
              <strong>Play together:</strong> The best way to ensure safety is to play games with your children, especially the first few times.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">2.</span>
            <p>
              <strong>Review creations:</strong> Check the Activity Log regularly to see what your kids are creating.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">3.</span>
            <p>
              <strong>Age-appropriate games:</strong> Some games like AI Roast Battle are designed for ages 9-14. Younger kids should stick to games like Comic Maker and Noisy Storybook.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-purple-600 font-bold">4.</span>
            <p>
              <strong>Report issues:</strong> If you ever see inappropriate content, please report it immediately so we can improve our filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Privacy Tab
function PrivacyTab() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Data</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Download Your Data</h3>
            <p className="text-gray-600 mb-4">
              Request a copy of all your family's creations and data
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Request Data Export
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              Permanently delete your account and all associated data
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Delete Account
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Share creations publicly</div>
                  <div className="text-sm text-gray-500">Allow your creations to appear in the public gallery</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Session</h2>
        <p className="text-gray-600 mb-6">
          Sign out of your account on this device
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  )
}
