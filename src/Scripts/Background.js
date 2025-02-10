// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.local.set({
    settings: {
      enabled: false,
      genres: [],
      currentGenre: ''
    }
  })
})
