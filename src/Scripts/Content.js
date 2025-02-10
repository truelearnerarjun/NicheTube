let settings = {
  enabled: false,
  genres: []
}

// Load settings when content script starts
chrome.storage.local.get(['settings'], (result) => {
  if (result.settings) {
    settings = result.settings
    if (settings.enabled) {
      startFiltering()
    }
  }
})

// Listen for settings updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SETTINGS_UPDATED') {
    settings = message.settings
    if (settings.enabled) {
      startFiltering()
    } else {
      stopFiltering()
    }
  }
})

let observer = null

function startFiltering() {
  observer = new MutationObserver(() => {
    filterContent()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Initial filtering
  filterContent()
}

function stopFiltering() {
  if (observer) {
    observer.disconnect()
  }
  // Show all hidden videos
  document.querySelectorAll('[data-nichetube-hidden="true"]').forEach(el => {
    el.style.display = ''
    el.removeAttribute('data-nichetube-hidden')
  })
}

function filterContent() {
  const videoElements = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer')
  
  videoElements.forEach(video => {
    const title = video.querySelector('#video-title')?.textContent.toLowerCase() || ''
    const shouldShow = !settings.enabled || settings.genres.some(genre => 
      title.includes(genre.toLowerCase())
    )

    if (!shouldShow) {
      video.style.display = 'none'
      video.setAttribute('data-nichetube-hidden', 'true')
    } else {
      video.style.display = ''
      video.removeAttribute('data-nichetube-hidden')
    }
  })
}
