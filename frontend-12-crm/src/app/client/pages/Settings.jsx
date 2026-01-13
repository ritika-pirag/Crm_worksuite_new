import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { authAPI, settingsAPI } from '../../../api'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'

const Settings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    language: 'English',
    timezone: 'UTC',
  })
  const [billingPreferences, setBillingPreferences] = useState({
    currency: 'USD',
    payment_method: 'Bank Transfer',
    auto_pay: false,
    invoice_frequency: 'Monthly',
  })

  useEffect(() => {
    fetchSettings()
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.data.success) {
        const userData = response.data.data
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsAPI.get()
      if (response.data.success) {
        const settingsData = response.data.data || []
        const settingsObj = {}
        settingsData.forEach(setting => {
          settingsObj[setting.setting_key] = setting.setting_value
        })
        setSettings({
          emailNotifications: settingsObj.email_notifications === 'true' || settingsObj.emailNotifications === 'true',
          smsNotifications: settingsObj.sms_notifications === 'true' || settingsObj.smsNotifications === 'true',
          language: settingsObj.language || 'English',
          timezone: settingsObj.timezone || 'UTC',
        })
        setBillingPreferences({
          currency: settingsObj.currency || 'USD',
          payment_method: settingsObj.payment_method || 'Bank Transfer',
          auto_pay: settingsObj.auto_pay === 'true',
          invoice_frequency: settingsObj.invoice_frequency || 'Monthly',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleBillingChange = (field, value) => {
    setBillingPreferences({ ...billingPreferences, [field]: value })
  }

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value })
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value })
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      const settingsToSave = [
        { setting_key: 'email_notifications', setting_value: settings.emailNotifications.toString() },
        { setting_key: 'sms_notifications', setting_value: settings.smsNotifications.toString() },
        { setting_key: 'language', setting_value: settings.language },
        { setting_key: 'timezone', setting_value: settings.timezone },
      ]
      
      for (const setting of settingsToSave) {
        await settingsAPI.update(setting)
      }
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBilling = async () => {
    try {
      setSaving(true)
      const billingToSave = [
        { setting_key: 'currency', setting_value: billingPreferences.currency },
        { setting_key: 'payment_method', setting_value: billingPreferences.payment_method },
        { setting_key: 'auto_pay', setting_value: billingPreferences.auto_pay.toString() },
        { setting_key: 'invoice_frequency', setting_value: billingPreferences.invoice_frequency },
      ]
      
      for (const setting of billingToSave) {
        await settingsAPI.update(setting)
      }
      
      alert('Billing preferences saved successfully!')
    } catch (error) {
      console.error('Error saving billing preferences:', error)
      alert('Failed to save billing preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setSaving(true)
      const response = await authAPI.updateProfile(profileData)
      if (response.data.success) {
        alert('Profile updated successfully!')
        setIsProfileModalOpen(false)
        await fetchProfile()
      } else {
        alert(response.data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New password and confirm password do not match')
      return
    }

    if (passwordData.new_password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      setSaving(true)
      const response = await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })
      if (response.data.success) {
        alert('Password changed successfully!')
        setIsPasswordModalOpen(false)
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        })
      } else {
        alert(response.data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Settings</h1>
        <p className="text-secondary-text mt-1">Manage your account settings</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-text">Profile Settings</h2>
          <Button variant="primary" size="sm" onClick={() => setIsProfileModalOpen(true)}>
            Edit Profile
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-secondary-text">Name</label>
            <p className="text-primary-text mt-1">{profileData.name || '--'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-text">Email</label>
            <p className="text-primary-text mt-1">{profileData.email || '--'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-text">Phone</label>
            <p className="text-primary-text mt-1">{profileData.phone || '--'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary-text">Address</label>
            <p className="text-primary-text mt-1">{profileData.address || '--'}</p>
          </div>
        </div>
      </Card>

      {/* Password Change */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-text">Password Change</h2>
          <Button variant="primary" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </Button>
        </div>
        <p className="text-secondary-text text-sm">Update your password to keep your account secure</p>
      </Card>

      {/* Billing Preferences */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary-text mb-4">Billing Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Currency
              </label>
              <select
                value={billingPreferences.currency}
                onChange={(e) => handleBillingChange('currency', e.target.value)}
                className="w-full px-4 py-3 rounded-input border border-border-medium focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none transition-all duration-200 bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Payment Method
              </label>
              <select
                value={billingPreferences.payment_method}
                onChange={(e) => handleBillingChange('payment_method', e.target.value)}
                className="w-full px-4 py-3 rounded-input border border-border-medium focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none transition-all duration-200 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Invoice Frequency
              </label>
              <select
                value={billingPreferences.invoice_frequency}
                onChange={(e) => handleBillingChange('invoice_frequency', e.target.value)}
                className="w-full px-4 py-3 rounded-input border border-border-medium focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none transition-all duration-200 bg-white"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingPreferences.auto_pay}
                  onChange={(e) => handleBillingChange('auto_pay', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-primary-text">Enable Auto Pay</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSaveBilling} disabled={saving}>
              {saving ? 'Saving...' : 'Save Billing Preferences'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary-text mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-primary-text">Email Notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-primary-text">SMS Notifications</span>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-primary-text mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-3 rounded-input border border-border-medium focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none transition-all duration-200 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 rounded-input border border-border-medium focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none transition-all duration-200 bg-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Edit Modal */}
      <RightSideModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Edit Profile"
        width="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={profileData.name}
            onChange={(e) => handleProfileChange('name', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
          />
          <Input
            label="Phone"
            value={profileData.phone}
            onChange={(e) => handleProfileChange('phone', e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Address</label>
            <textarea
              value={profileData.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-input border border-border-medium focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none transition-all duration-200 bg-white"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsProfileModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateProfile}
              className="flex-1"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* Password Change Modal */}
      <RightSideModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false)
          setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: '',
          })
        }}
        title="Change Password"
        width="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.current_password}
            onChange={(e) => handlePasswordChange('current_password', e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordData.new_password}
            onChange={(e) => handlePasswordChange('new_password', e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm_password}
            onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordModalOpen(false)
                setPasswordData({
                  current_password: '',
                  new_password: '',
                  confirm_password: '',
                })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              className="flex-1"
              disabled={saving}
            >
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Settings
