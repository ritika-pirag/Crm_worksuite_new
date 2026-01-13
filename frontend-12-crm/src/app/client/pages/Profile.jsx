import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { authAPI, clientsAPI } from '../../../api'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'

const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_country: '',
    billing_postal_code: '',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const userResponse = await authAPI.getCurrentUser()
      if (userResponse.data.success) {
        const userData = userResponse.data.data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          company: '',
          phone: userData.phone || '',
          address: userData.address || '',
          billing_address: userData.billing_address || '',
          billing_city: userData.billing_city || '',
          billing_state: userData.billing_state || '',
          billing_country: userData.billing_country || '',
          billing_postal_code: userData.billing_postal_code || '',
        })
        
        if (userData.company_id) {
          try {
            const clientsResponse = await clientsAPI.getAll()
            if (clientsResponse.data.success && clientsResponse.data.data.length > 0) {
              const client = clientsResponse.data.data[0]
              setFormData(prev => ({
                ...prev,
                company: client.company_name || client.companyName || '',
                address: client.address || prev.address,
                phone: client.phone_number || client.phoneNumber || prev.phone,
                billing_address: client.billing_address || prev.billing_address,
                billing_city: client.billing_city || prev.billing_city,
                billing_state: client.billing_state || prev.billing_state,
                billing_country: client.billing_country || prev.billing_country,
                billing_postal_code: client.billing_postal_code || prev.billing_postal_code,
              }))
            }
          } catch (error) {
            console.error('Error fetching client data:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await authAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        billing_address: formData.billing_address,
        billing_city: formData.billing_city,
        billing_state: formData.billing_state,
        billing_country: formData.billing_country,
        billing_postal_code: formData.billing_postal_code,
      })
      if (response.data.success) {
        alert('Profile updated successfully!')
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
          <p className="text-secondary-text">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Profile</h1>
        <p className="text-secondary-text mt-1">Manage your profile information</p>
      </div>

      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary-text mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-text">Billing Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Billing Address"
                value={formData.billing_address}
                onChange={(e) => handleChange('billing_address', e.target.value)}
              />
            </div>
            <Input
              label="City"
              value={formData.billing_city}
              onChange={(e) => handleChange('billing_city', e.target.value)}
            />
            <Input
              label="State"
              value={formData.billing_state}
              onChange={(e) => handleChange('billing_state', e.target.value)}
            />
            <Input
              label="Country"
              value={formData.billing_country}
              onChange={(e) => handleChange('billing_country', e.target.value)}
            />
            <Input
              label="Postal Code"
              value={formData.billing_postal_code}
              onChange={(e) => handleChange('billing_postal_code', e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Billing Info'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-text">Password Change</h2>
            <Button variant="primary" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
              Change Password
            </Button>
          </div>
          <p className="text-secondary-text text-sm">Update your password to keep your account secure</p>
        </div>
      </Card>

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

export default Profile
