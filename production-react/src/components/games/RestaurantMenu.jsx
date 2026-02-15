import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BuildingStorefrontIcon,
  ClockIcon,
  PrinterIcon,
  ArrowLeftIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import VoiceInput from '../VoiceInput'

export default function RestaurantMenu() {
  const [restaurantName, setRestaurantName] = useState('')
  const [cuisine, setCuisine] = useState('american')
  const [menuItems, setMenuItems] = useState([])
  const [currentItem, setCurrentItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizers'
  })
  const [menuGenerated, setMenuGenerated] = useState(false)

  const cuisineTypes = [
    { id: 'american', name: 'American Diner', emoji: '🍔' },
    { id: 'italian', name: 'Italian Trattoria', emoji: '🍝' },
    { id: 'mexican', name: 'Mexican Cantina', emoji: '🌮' },
    { id: 'asian', name: 'Asian Fusion', emoji: '🍜' },
    { id: 'dessert', name: 'Dessert Café', emoji: '🍰' },
    { id: 'pizza', name: 'Pizza Palace', emoji: '🍕' }
  ]

  const categories = [
    { id: 'appetizers', name: 'Appetizers', emoji: '🥗' },
    { id: 'mains', name: 'Main Dishes', emoji: '🍽️' },
    { id: 'desserts', name: 'Desserts', emoji: '🍰' },
    { id: 'drinks', name: 'Drinks', emoji: '🥤' }
  ]

  const sampleItems = {
    american: [
      { name: 'Super Burger', description: 'Triple-stacked burger with all the fixings', price: '12.99', category: 'mains' },
      { name: 'Crispy Fries', description: 'Golden fries with secret seasoning', price: '4.99', category: 'appetizers' }
    ],
    italian: [
      { name: 'Pasta Perfection', description: 'Homemade pasta in creamy sauce', price: '14.99', category: 'mains' },
      { name: 'Garlic Bread', description: 'Warm, buttery, and garlicky', price: '5.99', category: 'appetizers' }
    ],
    mexican: [
      { name: 'Mega Burrito', description: 'Loaded with beans, rice, and cheese', price: '11.99', category: 'mains' },
      { name: 'Chips & Salsa', description: 'Fresh tortilla chips with homemade salsa', price: '3.99', category: 'appetizers' }
    ]
  }

  const addItem = () => {
    if (currentItem.name && currentItem.price) {
      setMenuItems([...menuItems, { ...currentItem, id: Date.now() }])
      setCurrentItem({ name: '', description: '', price: '', category: 'appetizers' })
    }
  }

  const removeItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  const loadSamples = () => {
    const samples = sampleItems[cuisine] || sampleItems.american
    setMenuItems([...menuItems, ...samples.map(item => ({ ...item, id: Date.now() + Math.random() }))])
  }

  const handleGenerate = () => {
    setMenuGenerated(true)
    window.scrollTo({ top: 600, behavior: 'smooth' })
  }

  const getItemsByCategory = (categoryId) => {
    return menuItems.filter(item => item.category === categoryId)
  }

  const canGenerate = restaurantName.trim() && menuItems.length >= 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Games</span>
            </Link>
            <div className="flex items-center gap-2 text-amber-600">
              <ClockIcon className="w-5 h-5" />
              <span className="text-sm font-medium">20 min</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6 shadow-lg">
            <BuildingStorefrontIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Restaurant Menu Maker
          </h1>
          <p className="text-xl text-gray-600">
            Create a delicious menu for your dream restaurant!
          </p>
        </div>

        {/* Menu Creator */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Creator */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-yellow-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-amber-500" />
              Design Your Menu
            </h2>

            <div className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Name 🎤
                </label>
                <VoiceInput
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="The Tasty Treehouse"
                  className="w-full px-4 py-3 pr-12 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Cuisine Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cuisine Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {cuisineTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCuisine(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        cuisine === type.id
                          ? 'border-amber-500 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-yellow-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.emoji}</div>
                      <div className="font-semibold text-gray-900 text-sm">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Menu Item */}
              <div className="border-t-2 border-yellow-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Add Menu Item</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <VoiceInput
                        type="text"
                        value={currentItem.name}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                        placeholder="Item name 🎤"
                        className="w-full px-3 py-2 pr-12 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <VoiceInput
                        type="number"
                        step="0.01"
                        value={currentItem.price}
                        onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                        placeholder="Price 🎤"
                        className="w-full px-3 py-2 pr-12 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <VoiceInput
                    type="text"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    placeholder="Description 🎤"
                    className="w-full px-3 py-2 pr-12 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  />

                  <select
                    value={currentItem.category}
                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-yellow-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={addItem}
                    disabled={!currentItem.name || !currentItem.price}
                    className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                      currentItem.name && currentItem.price
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Add Item
                    </div>
                  </button>
                </div>

                <button
                  onClick={loadSamples}
                  className="w-full mt-3 py-2 border-2 border-yellow-300 hover:bg-yellow-50 text-amber-700 rounded-lg font-semibold text-sm transition-all"
                >
                  Load Sample Items
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-yellow-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu Preview</h2>

            {menuItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BuildingStorefrontIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Add items to see your menu!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map(category => {
                  const items = getItemsByCategory(category.id)
                  if (items.length === 0) return null

                  return (
                    <div key={category.id}>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">{category.emoji}</span>
                        {category.name}
                      </h3>
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 group hover:bg-yellow-100 transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-gray-900">{item.name}</div>
                                  <div className="text-amber-600 font-bold">${item.price}</div>
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {menuItems.length >= 3 && (
              <button
                onClick={handleGenerate}
                className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-6 h-6" />
                  Generate Final Menu
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Generated Menu */}
        {menuGenerated && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-yellow-200 overflow-hidden">
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-12 text-white text-center">
                <div className="text-5xl mb-4">{cuisineTypes.find(c => c.id === cuisine)?.emoji}</div>
                <h2 className="text-5xl font-bold mb-3">{restaurantName}</h2>
                <p className="text-xl opacity-90">{cuisineTypes.find(c => c.id === cuisine)?.name}</p>
              </div>

              {/* Menu Content */}
              <div className="p-12">
                {categories.map(category => {
                  const items = getItemsByCategory(category.id)
                  if (items.length === 0) return null

                  return (
                    <div key={category.id} className="mb-12 last:mb-0">
                      <div className="border-b-4 border-amber-300 pb-3 mb-6">
                        <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                          <span className="text-4xl">{category.emoji}</span>
                          {category.name}
                        </h3>
                      </div>

                      <div className="space-y-6">
                        {items.map(item => (
                          <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-2xl font-bold text-gray-900">{item.name}</h4>
                              <span className="text-2xl font-bold text-amber-600">${item.price}</span>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 italic">{item.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                <div className="mt-12 pt-8 border-t-2 border-yellow-200 text-center">
                  <p className="text-gray-600 italic">Thank you for dining with us!</p>
                  <p className="text-sm text-gray-500 mt-2">Created with love at {restaurantName}</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-yellow-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Make It Real!</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">🍳</div>
                  <h4 className="font-bold text-gray-900 mb-2">Cook the Menu</h4>
                  <p className="text-sm text-gray-600">
                    Pick 2-3 items and actually cook them as a family dinner!
                  </p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">🎨</div>
                  <h4 className="font-bold text-gray-900 mb-2">Design & Decorate</h4>
                  <p className="text-sm text-gray-600">
                    Print and decorate your menu, then host a restaurant night at home
                  </p>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">👨‍🍳</div>
                  <h4 className="font-bold text-gray-900 mb-2">Play Restaurant</h4>
                  <p className="text-sm text-gray-600">
                    Take turns being the chef, server, and customer!
                  </p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <div className="text-3xl mb-3">📸</div>
                  <h4 className="font-bold text-gray-900 mb-2">Photo Menu</h4>
                  <p className="text-sm text-gray-600">
                    Take photos of your dishes and create a picture menu
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white border-2 border-yellow-300 hover:border-yellow-500 text-amber-600 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Menu
              </button>
              <button
                onClick={() => {
                  setMenuGenerated(false)
                  setRestaurantName('')
                  setMenuItems([])
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <SparklesIcon className="w-5 h-5" />
                Create New Menu
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
