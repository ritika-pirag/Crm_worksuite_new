import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import AddButton from '../../../components/ui/AddButton'
import Card from '../../../components/ui/Card'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { IoDocumentText, IoFolder, IoTrash, IoDownload } from 'react-icons/io5'
import { documentsAPI } from '../../../api'

const MyDocuments = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    file: null,
  })

  useEffect(() => {
    if (userId && companyId) {
      fetchDocuments()
    }
  }, [userId, companyId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await documentsAPI.getAll({
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        const fetchedDocs = response.data.data || []
        // Transform API data to match component format
        const transformedDocs = fetchedDocs.map(doc => ({
          id: doc.id,
          name: doc.file_name || doc.title,
          type: 'file', // All are files, folders can be added later
          size: doc.size || '-',
          date: doc.date || formatDate(doc.created_at),
          file_path: doc.file_path,
          file_name: doc.file_name,
          title: doc.title,
          category: doc.category,
        }))
        setDocuments(transformedDocs)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      alert('Failed to load documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, file, title: formData.title || file.name })
    }
  }

  const handleUpload = async () => {
    if (!formData.title) {
      alert('Document name is required')
      return
    }
    if (!formData.file) {
      alert('Please select a file to upload')
      return
    }

    try {
      setUploading(true)
      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('file', formData.file)
      uploadFormData.append('company_id', companyId)
      uploadFormData.append('user_id', userId)
      if (formData.category) {
        uploadFormData.append('category', formData.category)
      }
      if (formData.description) {
        uploadFormData.append('description', formData.description)
      }

      const response = await documentsAPI.create(uploadFormData)
      if (response.data.success) {
        alert('Document uploaded successfully!')
        await fetchDocuments()
        setIsUploadModalOpen(false)
        resetForm()
      } else {
        alert(response.data.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert(error.response?.data?.error || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await documentsAPI.delete(id, {
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        alert('Document deleted successfully!')
        await fetchDocuments()
      } else {
        alert(response.data.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert(error.response?.data?.error || 'Failed to delete document')
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const response = await documentsAPI.download(id, {
        company_id: companyId,
        user_id: userId
      })
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      file: null,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">My Documents</h1>
          <p className="text-secondary-text mt-1">Manage your personal documents</p>
        </div>
        <AddButton onClick={() => setIsUploadModalOpen(true)} label="Upload Document" />
      </div>

      {loading ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-secondary-text">Loading documents...</p>
          </div>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <IoDocumentText size={64} className="text-secondary-text mx-auto mb-4" />
            <p className="text-secondary-text text-lg">No documents found</p>
            <p className="text-secondary-text mt-2">Upload your first document to get started</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {doc.type === 'folder' ? (
                  <IoFolder size={32} className="text-warning" />
                ) : (
                  <IoDocumentText size={32} className="text-primary-accent" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary-text truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-sm text-secondary-text mt-1">
                    {doc.size} • {doc.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {doc.type === 'file' && (
                    <>
                      <button
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                        className="p-1.5 text-primary-accent hover:bg-primary-accent/10 rounded transition-colors"
                        title="Download"
                      >
                        <IoDownload size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                        title="Delete"
                      >
                        <IoTrash size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RightSideModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          resetForm()
        }}
        title="Upload Document"
      >
        <div className="space-y-4">
          <Input
            label="Document Name *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter document name"
            required
          />
          <Input
            label="Category (Optional)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g. Resume, ID Proof, Certificates"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Upload File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              required
            />
            {formData.file && (
              <p className="text-sm text-secondary-text mt-2">
                Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter description"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false)
                resetForm()
              }}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              className="flex-1"
              disabled={uploading || !formData.title || !formData.file}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default MyDocuments
