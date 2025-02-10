import React, { useState, useEffect } from 'react'

const Popup = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    genres: [],
    currentGenre: ''
  })

  useEffect(() => {
    // Load saved settings
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings)
      }
    })
  }, [])

  const handleToggle = () => {
    const newSettings = {
      ...settings,
      enabled: !settings.enabled
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleAddGenre = () => {
    if (!settings.currentGenre.trim()) return

    const newSettings = {
      ...settings,
      genres: [...settings.genres, settings.currentGenre.trim()],
      currentGenre: ''
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleRemoveGenre = (index) => {
    const newSettings = {
      ...settings,
      genres: settings.genres.filter((_, i) => i !== index)
    }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const saveSettings = (newSettings) => {
    chrome.storage.local.set({ settings: newSettings }, () => {
      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'SETTINGS_UPDATED',
          settings: newSettings
        })
      })
    })
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">NicheTube</h1>
      
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={handleToggle}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span>Enable Filtering</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Add Genre Filter:</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.currentGenre}
            onChange={(e) => setSettings({...settings, currentGenre: e.target.value})}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Enter genre..."
          />
          <button
            onClick={handleAddGenre}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Active Filters:</h3>
        <div className="space-y-2">
          {settings.genres.map((genre, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
              <span>{genre}</span>
              <button
                onClick={() => handleRemoveGenre(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
