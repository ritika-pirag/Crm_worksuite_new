import { useState, useEffect } from 'react'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'
import { authAPI } from '../../../api'

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    language: 'English',
    timezone: 'UTC',
  })
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.data.success) {
        const user = response.data.data
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value })
  }

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value })
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value })
  }

  const handleSaveSettings = () => {
    alert('Settings saved successfully!')
  }

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
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
      setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Settings</h1>
        <p className="text-secondary-text mt-1">Manage your personal settings</p>
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
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
            <Button variant="primary" onClick={handleSaveSettings}>
              Save Settings
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
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
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
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
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Settings
