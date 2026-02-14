import { useState, useRef } from 'react'
import { ShareIcon, PhotoIcon, ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { exportToImage, shareAsImage, copyToClipboard } from '../utils/exportToImage'

export default function ShareButton({
  elementId,
  filename = 'my-creation.png',
  title = 'My Creation',
  text = 'Check out what I made with AI Family Night!'
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = async () => {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error('Element not found:', elementId)
        return
      }
      await exportToImage(element, filename)
      setShowMenu(false)
    } catch (error) {
      console.error('Failed to download:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  const handleShare = async () => {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error('Element not found:', elementId)
        return
      }
      await shareAsImage(element, title, text)
      setShowMenu(false)
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }

  const handleCopy = async () => {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error('Element not found:', elementId)
        return
      }
      await copyToClipboard(element)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard. Your browser may not support this feature.')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg transition-all"
      >
        <ShareIcon className="w-5 h-5" />
        Share Image
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute bottom-full mb-2 right-0 z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden min-w-[200px]">
            <button
              onClick={handleDownload}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <PhotoIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Download</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <ShareIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Share</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Copy</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
