import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import { documentsAPI } from '../../../api'
import { 
  IoDownload, 
  IoEye, 
  IoDocument, 
  IoImage, 
  IoFileTray, 
  IoAdd,
  IoCloudUpload,
  IoClose,
  IoTrash,
  IoCheckmarkCircle
} from 'react-icons/io5'

const Files = () => {
  const { user } = useAuth()
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const userId = user?.id || localStorage.getItem('userId')
  const fileInputRef = useRef(null)
  
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (companyId) {
      fetchFiles()
    }
  }, [companyId])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await documentsAPI.getAll({
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        setFiles(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file')
      return
    }

    try {
      setUploading(true)
      
      // Upload each file
      for (const file of selectedFiles) {
        const formDataToSend = new FormData()
        formDataToSend.append('file', file)
        formDataToSend.append('company_id', companyId)
        formDataToSend.append('user_id', userId)
        formDataToSend.append('name', formData.name || file.name)
        formDataToSend.append('description', formData.description || '')
        formDataToSend.append('uploaded_by', 'client')
        
        await documentsAPI.create(formDataToSend)
      }
      
      alert('Files uploaded successfully!')
      setIsAddModalOpen(false)
      setSelectedFiles([])
      setFormData({ name: '', description: '' })
      fetchFiles()
    } catch (error) {
      console.error('Error uploading files:', error)
      alert(error.response?.data?.error || 'Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (file) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await documentsAPI.delete(file.id, { company_id: companyId, user_id: userId })
        alert('File deleted successfully!')
        fetchFiles()
      } catch (error) {
        console.error('Error deleting file:', error)
        alert(error.response?.data?.error || 'Failed to delete file')
      }
    }
  }

  const handleDownload = async (file) => {
    try {
      // Use relative URL to leverage Vite proxy
      window.open(`/api/v1/documents/${file.id}/download?company_id=${companyId}`, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  const handleView = (file) => {
    // Open view modal with file details
    setSelectedFile(file)
    setIsViewModalOpen(true)
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return IoDocument
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return IoImage
    }
    return IoDocument
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
  }

  const columns = [
    { 
      key: 'file_name', 
      label: 'File Name',
      render: (value, row) => {
        const Icon = getFileIcon(value || row.name)
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon size={20} className="text-primary-accent" />
            </div>
            <span className="font-medium">{value || row.name || `File #${row.id}`}</span>
          </div>
        )
      }
    },
    { 
      key: 'file_type', 
      label: 'Type',
      render: (value, row) => {
        const fileName = row.file_name || row.name || ''
        const ext = fileName.split('.').pop()?.toUpperCase() || value || 'FILE'
        return <Badge variant="default">{ext}</Badge>
      }
    },
    { 
      key: 'file_size', 
      label: 'Size',
      render: (value) => formatFileSize(value)
    },
    { 
      key: 'created_at', 
      label: 'Uploaded',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="View"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownload(row)
        }}
        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        title="Download"
      >
        <IoDownload size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
        }}
        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
        title="Delete"
      >
        <IoTrash size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Files</h1>
          <p className="text-secondary-text mt-1">View and download your files</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <IoAdd size={20} />
          Add Files
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center">
          <IoFileTray size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Files Found</h3>
          <p className="text-secondary-text mb-4">There are no files shared with you at the moment.</p>
          <Button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center gap-2">
            <IoCloudUpload size={20} />
            Upload Your First File
          </Button>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={files}
          searchPlaceholder="Search files..."
          filters={true}
          filterConfig={[
            { key: 'file_type', label: 'Type', type: 'select', options: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'JPG', 'PNG'] },
          ]}
          actions={actions}
          bulkActions={false}
          emptyMessage="No files found"
        />
      )}

      {/* Add Files Modal */}
      <RightSideModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSelectedFiles([])
          setFormData({ name: '', description: '' })
        }}
        title="Upload Files"
        width="500px"
      >
        <div className="space-y-6">
          {/* File Drop Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-accent hover:bg-primary-accent/5 transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept="*/*"
            />
            <IoCloudUpload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-primary-text mb-2">
              Click to upload files
            </p>
            <p className="text-secondary-text text-sm">
              or drag and drop your files here
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports all file types up to 10MB
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-primary-text">Selected Files ({selectedFiles.length})</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <IoDocument size={20} className="text-primary-accent" />
                      <div>
                        <p className="text-sm font-medium text-primary-text truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-secondary-text">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <IoClose size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Name & Description */}
          <div className="space-y-4">
            <Input
              label="File Name (Optional)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Custom file name"
            />
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description for your files"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setSelectedFiles([])
                setFormData({ name: '', description: '' })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <IoCheckmarkCircle size={20} />
                  Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View File Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedFile(null)
        }}
        title="File Details"
        width="500px"
      >
        {selectedFile && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {(() => {
                  const Icon = getFileIcon(selectedFile.file_name || selectedFile.name)
                  return <Icon size={32} className="text-primary-accent" />
                })()}
              </div>
              <div>
                <h3 className="font-semibold text-primary-text">{selectedFile.file_name || selectedFile.name || `File #${selectedFile.id}`}</h3>
                <p className="text-sm text-secondary-text">{formatFileSize(selectedFile.file_size)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">File ID</label>
                <p className="text-primary-text">#{selectedFile.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">File Type</label>
                <p className="text-primary-text">{(selectedFile.file_name || selectedFile.name || '').split('.').pop()?.toUpperCase() || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Uploaded On</label>
                <p className="text-primary-text">{selectedFile.created_at ? new Date(selectedFile.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              {selectedFile.description && (
                <div>
                  <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
                  <p className="text-primary-text">{selectedFile.description}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDownload(selectedFile)}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <IoDownload size={18} />
                Download
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Files
