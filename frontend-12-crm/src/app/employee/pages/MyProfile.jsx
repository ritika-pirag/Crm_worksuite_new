import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'
import { employeesAPI, documentsAPI } from '../../../api'
import { IoCreate, IoDocumentText, IoDownload, IoTrash } from 'react-icons/io5'

const MyProfile = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    employee_number: '',
    joining_date: '',
  })
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userId && companyId) {
      fetchProfile()
      fetchDocuments()
    }
  }, [userId, companyId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await employeesAPI.getProfile({
        user_id: userId,
        company_id: companyId
      })
      if (response.data.success) {
        const profile = response.data.data
        setProfileData(profile)
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          department: profile.department_name || '',
          position: profile.position_name || '',
          employee_number: profile.employee_number || '',
          joining_date: profile.joining_date || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      alert('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getAll({
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        setDocuments(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required')
      return
    }

    try {
      setSaving(true)
      const updateData = {
        user_id: userId,
        company_id: companyId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
      }

      const response = await employeesAPI.updateProfile(updateData, {
        user_id: userId,
        company_id: companyId
      })
      if (response.data.success) {
        alert('Profile updated successfully!')
        await fetchProfile()
        setIsEditModalOpen(false)
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

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await documentsAPI.download(doc.id, {
        company_id: companyId,
        user_id: userId
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', doc.file_name || doc.title)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">My Profile</h1>
          <p className="text-secondary-text mt-1">Manage your profile information</p>
        </div>
        <Card>
          <div className="text-center py-8">
            <p className="text-secondary-text">Loading profile...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">My Profile</h1>
          <p className="text-secondary-text mt-1">Manage your profile information</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2"
        >
          <IoCreate size={18} />
          Edit Profile
        </Button>
      </div>

      {/* Personal Information */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary-text mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Full Name</label>
              <p className="text-primary-text mt-1">{formData.name || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Email</label>
              <p className="text-primary-text mt-1">{formData.email || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Phone</label>
              <p className="text-primary-text mt-1">{formData.phone || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Employee ID</label>
              <p className="text-primary-text mt-1">{formData.employee_number || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Department</label>
              <p className="text-primary-text mt-1">{formData.department || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Position</label>
              <p className="text-primary-text mt-1">{formData.position || '--'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Joining Date</label>
              <p className="text-primary-text mt-1">
                {formData.joining_date 
                  ? new Date(formData.joining_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '--'
                }
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-secondary-text">Address</label>
              <p className="text-primary-text mt-1">{formData.address || '--'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary-text mb-4">Documents</h2>
          {documents.length === 0 ? (
            <p className="text-secondary-text">No documents available</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IoDocumentText size={24} className="text-primary-accent" />
                    <div>
                      <p className="text-primary-text font-medium">{doc.title || doc.file_name}</p>
                      <p className="text-sm text-secondary-text">{doc.size || '--'} • {doc.date || '--'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
                    title="Download"
                  >
                    <IoDownload size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <RightSideModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        width="max-w-5xl"
      >
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-4">Personal Information</h3>
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 234-567-8900"
              />
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default MyProfile
