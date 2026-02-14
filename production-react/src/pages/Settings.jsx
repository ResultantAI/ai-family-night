import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  UserCircleIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@example.com',
    isPremium: true,
    subscriptionStatus: 'active',
    nextBillingDate: '2026-03-15'
  })

  const [children] = useState([
    { id: 1, name: 'Emma', age: 8 },
    { id: 2, name: 'Noah', age: 11 }
  ])

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'children', name: 'Children', icon: UserGroupIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <SparklesIcon className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">AI Family Night</span>
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
            {activeTab === 'children' && <ChildrenTab children={children} />}
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
  return (
    <div className="space-y-6">
      {/* Subscription Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Premium Plan</h2>
            <p className="text-purple-200">Active subscription</p>
          </div>
          <span className="bg-white/20 px-4 py-2 rounded-lg font-semibold text-sm">
            $9.99/month
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-purple-200 text-sm mb-1">Status</div>
            <div className="font-semibold">Active</div>
          </div>
          <div>
            <div className="text-purple-200 text-sm mb-1">Next billing date</div>
            <div className="font-semibold">{user.nextBillingDate}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-colors">
            Update Payment Method
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

        <div className="border-2 border-gray-200 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <div className="font-semibold text-gray-900">•••• •••• •••• 4242</div>
              <div className="text-sm text-gray-500">Expires 12/2027</div>
            </div>
          </div>
          <button className="text-purple-600 hover:text-purple-700 font-medium">
            Update
          </button>
        </div>

        <button className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm">
          + Add payment method
        </button>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>

        <div className="space-y-4">
          {[
            { date: '2026-02-15', amount: '$9.99', status: 'Paid', invoice: '#INV-001' },
            { date: '2026-01-15', amount: '$9.99', status: 'Paid', invoice: '#INV-002' },
            { date: '2025-12-15', amount: '$9.99', status: 'Paid', invoice: '#INV-003' }
          ].map((bill, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{bill.invoice}</div>
                  <div className="text-gray-500">{bill.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-semibold text-gray-900">{bill.amount}</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {bill.status}
                </span>
                <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Children Tab
function ChildrenTab({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Children</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
          + Add Child
        </button>
      </div>

      <div className="space-y-4">
        {children.map((child) => (
          <div key={child.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {child.name[0]}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{child.name}</div>
                  <div className="text-gray-500">{child.age} years old</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  Edit
                </button>
                <button className="text-red-600 hover:text-red-700 font-medium">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Notifications Tab
function NotificationsTab() {
  const notifications = [
    { id: 'weekly', label: 'Weekly game releases', description: 'Get notified when a new game is available', enabled: true },
    { id: 'progress', label: 'Child progress', description: 'Updates when your child completes a game', enabled: true },
    { id: 'billing', label: 'Billing alerts', description: 'Subscription renewals and payment confirmations', enabled: true },
    { id: 'tips', label: 'Tips & inspiration', description: 'Weekly ideas for family activities', enabled: false }
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Notifications</h2>

      <div className="space-y-6">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-start justify-between py-4 border-b border-gray-200 last:border-0">
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{notif.label}</div>
              <div className="text-sm text-gray-500 mt-1">{notif.description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

// Privacy Tab
function PrivacyTab() {
  return (
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
  )
}
