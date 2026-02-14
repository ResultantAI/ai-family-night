import html2canvas from 'html2canvas'

/**
 * Export a DOM element to an image
 * @param {HTMLElement} element - The element to export
 * @param {string} filename - The filename for the download
 * @param {object} options - Additional options for html2canvas
 * @returns {Promise<string>} - Data URL of the image
 */
export async function exportToImage(element, filename = 'creation.png', options = {}) {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      ...options
    })

    const dataURL = canvas.toDataURL('image/png')

    // Trigger download
    const link = document.createElement('a')
    link.href = dataURL
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('✅ Image exported:', filename)
    return dataURL
  } catch (error) {
    console.error('Failed to export image:', error)
    throw error
  }
}

/**
 * Share an image via Web Share API (mobile-friendly)
 * @param {HTMLElement} element - The element to share
 * @param {string} title - Title for the share
 * @param {string} text - Text for the share
 * @returns {Promise<void>}
 */
export async function shareAsImage(element, title = 'My Creation', text = 'Check out what I made!') {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    // Convert canvas to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

    // Check if Web Share API is available
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'creation.png', { type: 'image/png' })] })) {
      const file = new File([blob], 'creation.png', { type: 'image/png' })
      await navigator.share({
        title,
        text,
        files: [file]
      })
      console.log('✅ Shared successfully')
    } else {
      // Fallback: Download the image
      const dataURL = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataURL
      link.download = 'creation.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('✅ Downloaded (Share not available)')
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Share cancelled by user')
    } else {
      console.error('Failed to share:', error)
      throw error
    }
  }
}

/**
 * Copy image to clipboard
 * @param {HTMLElement} element - The element to copy
 * @returns {Promise<void>}
 */
export async function copyToClipboard(element) {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ])
      console.log('✅ Copied to clipboard')
    } else {
      throw new Error('Clipboard API not available')
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw error
  }
}

/**
 * Create a shareable card image for social media (Instagram Stories format 9:16)
 * @param {object} data - Data for the card {title, subtitle, content, footer}
 * @returns {string} Data URL of the card image
 */
export async function createSocialCard(data) {
  // Create temporary container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '1080px' // Instagram Stories width
  container.style.height = '1920px' // Instagram Stories height
  container.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  container.style.padding = '80px'
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.justifyContent = 'space-between'
  container.style.fontFamily = 'Inter, system-ui, sans-serif'
  container.style.color = 'white'

  container.innerHTML = `
    <div style="text-align: center;">
      <h1 style="font-size: 72px; font-weight: bold; margin: 0 0 20px 0; line-height: 1.2;">
        ${data.title || 'My Creation'}
      </h1>
      <p style="font-size: 36px; opacity: 0.9; margin: 0;">
        ${data.subtitle || ''}
      </p>
    </div>
    <div style="font-size: 32px; line-height: 1.6; text-align: center; padding: 60px; background: rgba(255,255,255,0.1); border-radius: 40px; backdrop-filter: blur(10px);">
      ${data.content || ''}
    </div>
    <div style="text-align: center; font-size: 28px; opacity: 0.8;">
      ${data.footer || 'Created with AI Family Night'}
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 1,
      logging: false
    })

    document.body.removeChild(container)

    return canvas.toDataURL('image/png')
  } catch (error) {
    document.body.removeChild(container)
    throw error
  }
}
