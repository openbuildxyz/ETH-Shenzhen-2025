'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { SettingsService, UserSettings, UserApiKey, UserNotification } from '@/lib/settings'
import { Header } from '@/components/Header'
import { 
  Settings,
  Bell,
  Shield,
  Globe,
  Key,
  Moon,
  Sun,
  Monitor,
  Eye,
  Clock,
  DollarSign,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

// Force dynamic rendering due to auth usage
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [apiKeys, setApiKeys] = useState<UserApiKey[]>([])
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'security' | 'api'>('general')
  const [showCreateApiKey, setShowCreateApiKey] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  const loadSettings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const [userSettings, userApiKeys, userNotifications] = await Promise.all([
        SettingsService.getUserSettings(user.id),
        SettingsService.getUserApiKeys(user.id),
        SettingsService.getUserNotifications(user.id, 10, 0)
      ])

      setSettings(userSettings)
      setApiKeys(userApiKeys)
      setNotifications(userNotifications)
    } catch (err) {
      console.error('Failed to load settings:', err)
      showMessage('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user, loadSettings])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!user || !settings) return

    setSaving(true)
    try {
      const newSettings = await SettingsService.updateUserSettings(user.id, updatedSettings)
      setSettings(newSettings)
      showMessage('success', 'Settings saved successfully')
    } catch (err) {
      console.error('Failed to save settings:', err)
      showMessage('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateApiKey = async () => {
    if (!user || !newApiKeyName.trim()) return

    try {
      const newKey = await SettingsService.createApiKey(user.id, newApiKeyName.trim())
      setApiKeys(prev => [newKey, ...prev])
      setNewApiKeyName('')
      setShowCreateApiKey(false)
      showMessage('success', 'API key created successfully')
    } catch (err) {
      console.error('Failed to create API key:', err)
      showMessage('error', 'Failed to create API key')
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!user || !confirm('Are you sure you want to delete this API key?')) return

    try {
      await SettingsService.deleteApiKey(keyId, user.id)
      setApiKeys(prev => prev.filter(key => key.id !== keyId))
      showMessage('success', 'API key deleted successfully')
    } catch (err) {
      console.error('Failed to delete API key:', err)
      showMessage('error', 'Failed to delete API key')
    }
  }

  const markAllNotificationsAsRead = async () => {
    if (!user) return

    try {
      await SettingsService.markAllNotificationsAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      showMessage('success', 'All notifications marked as read')
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
      showMessage('error', 'Failed to mark notifications as read')
    }
  }

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>Please log in to access settings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-blue flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Access', icon: Key }
  ] as const

  return (
    <div className="min-h-screen bg-bg-blue">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#38B6FF' }}>Settings</h1>
          <p style={{ color: '#38B6FF', opacity: 0.8 }}>Manage your account preferences and configurations</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg p-6">
              {activeTab === 'general' && (
                <GeneralSettings 
                  settings={settings} 
                  onSave={handleSaveSettings} 
                  saving={saving} 
                />
              )}
              
              {activeTab === 'notifications' && (
                <NotificationSettings 
                  settings={settings} 
                  notifications={notifications}
                  onSave={handleSaveSettings} 
                  onMarkAllRead={markAllNotificationsAsRead}
                  saving={saving} 
                />
              )}
              
              {activeTab === 'privacy' && (
                <PrivacySettings 
                  settings={settings} 
                  onSave={handleSaveSettings} 
                  saving={saving} 
                />
              )}
              
              {activeTab === 'security' && (
                <SecuritySettings 
                  settings={settings} 
                  onSave={handleSaveSettings} 
                  saving={saving} 
                />
              )}
              
              {activeTab === 'api' && (
                <ApiSettings 
                  apiKeys={apiKeys}
                  showCreateForm={showCreateApiKey}
                  newKeyName={newApiKeyName}
                  onToggleCreateForm={() => setShowCreateApiKey(!showCreateApiKey)}
                  onKeyNameChange={setNewApiKeyName}
                  onCreateKey={handleCreateApiKey}
                  onDeleteKey={handleDeleteApiKey}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// General Settings Component
function GeneralSettings({ 
  settings, 
  onSave, 
  saving 
}: { 
  settings: UserSettings | null, 
  onSave: (settings: Partial<UserSettings>) => void,
  saving: boolean 
}) {
  if (!settings) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">General Settings</h2>
        <p className="text-gray-600">Configure your basic preferences</p>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4" />
          Language
        </label>
        <select
          value={settings.language}
          onChange={(e) => onSave({ language: e.target.value as UserSettings['language'] })}
          disabled={saving}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Monitor className="w-4 h-4" />
          Theme
        </label>
        <div className="flex gap-2">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'auto', label: 'Auto', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onSave({ theme: value as UserSettings['theme'] })}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                settings.theme === value
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <DollarSign className="w-4 h-4" />
          Currency Preference
        </label>
        <select
          value={settings.currency_preference}
          onChange={(e) => onSave({ currency_preference: e.target.value as UserSettings['currency_preference'] })}
          disabled={saving}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="CNY">CNY (¥)</option>
          <option value="KRW">KRW (₩)</option>
          <option value="SOL">SOL</option>
        </select>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4" />
          Timezone
        </label>
        <select
          value={settings.timezone}
          onChange={(e) => onSave({ timezone: e.target.value })}
          disabled={saving}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Shanghai">Shanghai</option>
          <option value="Asia/Seoul">Seoul</option>
        </select>
      </div>
    </div>
  )
}

// Notification Settings Component
function NotificationSettings({ 
  settings, 
  notifications,
  onSave, 
  onMarkAllRead,
  saving 
}: { 
  settings: UserSettings | null, 
  notifications: UserNotification[],
  onSave: (settings: Partial<UserSettings>) => void,
  onMarkAllRead: () => void,
  saving: boolean 
}) {
  if (!settings) return <div>Loading...</div>

  const notificationTypes = [
    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'push_notifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
    { key: 'order_notifications', label: 'Order Notifications', description: 'Get notified about order updates' },
    { key: 'marketing_notifications', label: 'Marketing Notifications', description: 'Receive promotional content' },
    { key: 'security_notifications', label: 'Security Notifications', description: 'Important security alerts' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Preferences</h2>
        <p className="text-gray-600">Choose how you want to be notified</p>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {notificationTypes.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">{label}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
              onClick={() => onSave({ [key]: !settings[key as keyof UserSettings] })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[key as keyof UserSettings] ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[key as keyof UserSettings] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Recent Notifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Recent Notifications</h3>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={onMarkAllRead}
              className="text-sm text-primary hover:text-blue-600"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications yet</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Privacy Settings Component
function PrivacySettings({ 
  settings, 
  onSave, 
  saving 
}: { 
  settings: UserSettings | null, 
  onSave: (settings: Partial<UserSettings>) => void,
  saving: boolean 
}) {
  if (!settings) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Privacy Settings</h2>
        <p className="text-gray-600">Control your privacy and visibility settings</p>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
        <div className="space-y-2">
          {[
            { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
            { value: 'private', label: 'Private', description: 'Only you can view your profile' },
            { value: 'contacts_only', label: 'Contacts Only', description: 'Only your contacts can view your profile' }
          ].map(({ value, label, description }) => (
            <label key={value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="profile_visibility"
                value={value}
                checked={settings.profile_visibility === value}
                onChange={(e) => onSave({ profile_visibility: e.target.value as UserSettings['profile_visibility'] })}
                disabled={saving}
                className="text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-gray-800">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Toggles */}
      <div className="space-y-4">
        {[
          { key: 'show_online_status', label: 'Show Online Status', description: 'Let others see when you\'re online' },
          { key: 'allow_contact_from_strangers', label: 'Allow Contact from Strangers', description: 'Allow people to contact you directly' },
          { key: 'show_purchase_history', label: 'Show Purchase History', description: 'Make your purchase history visible to others' }
        ].map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">{label}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button
              onClick={() => onSave({ [key]: !settings[key as keyof UserSettings] })}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[key as keyof UserSettings] ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[key as keyof UserSettings] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Security Settings Component
function SecuritySettings({ 
  settings, 
  onSave, 
  saving 
}: { 
  settings: UserSettings | null, 
  onSave: (settings: Partial<UserSettings>) => void,
  saving: boolean 
}) {
  if (!settings) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Settings</h2>
        <p className="text-gray-600">Manage your account security preferences</p>
      </div>

      {/* Two Factor Authentication */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <button
            onClick={() => onSave({ two_factor_enabled: !settings.two_factor_enabled })}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.two_factor_enabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Session Timeout */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Session Timeout</label>
        <select
          value={settings.session_timeout}
          onChange={(e) => onSave({ session_timeout: parseInt(e.target.value) })}
          disabled={saving}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value={1800}>30 minutes</option>
          <option value={3600}>1 hour</option>
          <option value={7200}>2 hours</option>
          <option value={14400}>4 hours</option>
          <option value={28800}>8 hours</option>
          <option value={86400}>24 hours</option>
        </select>
      </div>

      {/* Force Password Change */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Require Password Change</h3>
            <p className="text-sm text-gray-600">Force password change on next login</p>
          </div>
          <button
            onClick={() => onSave({ require_password_change: !settings.require_password_change })}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.require_password_change ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.require_password_change ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

// API Settings Component
function ApiSettings({ 
  apiKeys,
  showCreateForm,
  newKeyName,
  onToggleCreateForm,
  onKeyNameChange,
  onCreateKey,
  onDeleteKey
}: { 
  apiKeys: UserApiKey[],
  showCreateForm: boolean,
  newKeyName: string,
  onToggleCreateForm: () => void,
  onKeyNameChange: (name: string) => void,
  onCreateKey: () => void,
  onDeleteKey: (keyId: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">API Access</h2>
        <p className="text-gray-600">Manage your API keys and access permissions</p>
      </div>

      {/* Create API Key */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">API Keys</h3>
          <button
            onClick={onToggleCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>

        {showCreateForm && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => onKeyNameChange(e.target.value)}
                  placeholder="Enter a name for this API key"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onCreateKey}
                  disabled={!newKeyName.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Key
                </button>
                <button
                  onClick={onToggleCreateForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Keys List */}
      <div className="space-y-3">
        {apiKeys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No API keys created yet</p>
        ) : (
          apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{apiKey.key_name}</h4>
                  <p className="text-sm text-gray-600 font-mono">
                    {apiKey.api_key}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                    {apiKey.last_used_at && (
                      <span>Last used: {new Date(apiKey.last_used_at).toLocaleDateString()}</span>
                    )}
                    {apiKey.expires_at && (
                      <span>Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteKey(apiKey.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}