import { useState, useEffect, useCallback } from 'react'
import { documentsAPI, clientsAPI, employeesAPI } from '../../../api'
import AddButton from '../../../components/ui/AddButton'
import Card from '../../../components/ui/Card'
import RightSideModal from '../../../components/ui/RightSideModal'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { IoDocumentText, IoTrash, IoDownload, IoPerson, IoBusiness, IoFilter } from 'react-icons/io5'

const Documents = () => {
  const companyId = localStorage.getItem('companyId') || 1
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [filterType, setFilterType] = useState('all') // 'all', 'client', 'employee'
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  
  const [formData, setFormData] = useState({
    document_for: 'client', // 'client' or 'employee'
    client_id: '',
    employee_id: '',
    title: '',
    category: '',
    description: '',
    file: null,
  })

  useEffect(() => {
    fetchClients()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [filterType, selectedClient, selectedEmployee])

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setClients(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setEmployees(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = { company_id: companyId }
      
      // Apply filters
      if (filterType === 'client' && selectedClient) {
        params.client_id = selectedClient
      } else if (filterType === 'employee' && selectedEmployee) {
        params.user_id = selectedEmployee
      }
      
      console.log('Fetching documents with params:', params)
      const response = await documentsAPI.getAll(params)
      console.log('Documents API response:', response.data)
      
      if (response.data && response.data.success) {
        let fetchedDocs = response.data.data || []
        
        // Additional client-side filtering if needed
        if (filterType === 'client') {
          fetchedDocs = fetchedDocs.filter(doc => doc.client_id)
        } else if (filterType === 'employee') {
          fetchedDocs = fetchedDocs.filter(doc => doc.user_id && !doc.client_id)
        }
        
        const transformedDocs = fetchedDocs.map(doc => {
          // Find client or employee name
          let uploadedByName = 'Unknown'
          let uploadedByType = ''
          
          if (doc.client_id) {
            const client = clients.find(c => c.id === doc.client_id)
            uploadedByName = client?.client_name || client?.name || `Client #${doc.client_id}`
            uploadedByType = 'Client'
          } else if (doc.user_id) {
            const employee = employees.find(e => e.id === doc.user_id)
            uploadedByName = employee?.name || employee?.email || `Employee #${doc.user_id}`
            uploadedByType = 'Employee'
          }
          
          return {
            id: doc.id,
            name: doc.title || doc.file_name || 'Untitled',
            type: 'file',
            size: doc.size || '-',
            date: doc.date || doc.created_at || '--',
            category: doc.category || '--',
            file_path: doc.file_path,
            file_name: doc.file_name,
            client_id: doc.client_id,
            user_id: doc.user_id,
            uploadedBy: uploadedByName,
            uploadedByType: uploadedByType,
          }
        })
        
        setDocuments(transformedDocs)
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [filterType, selectedClient, selectedEmployee, companyId, clients, employees])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, file })
    }
  }

  const handleUpload = async () => {
    if (formData.document_for === 'client' && !formData.client_id) {
      alert('Please select a client')
      return
    }
    if (formData.document_for === 'employee' && !formData.employee_id) {
      alert('Please select an employee')
      return
    }
    if (!formData.title) {
      alert('Document name is required')
      return
    }
    if (!formData.file) {
      alert('File is required')
      return
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('company_id', companyId)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('category', formData.category || '')
      uploadFormData.append('description', formData.description || '')
      uploadFormData.append('file', formData.file)
      
      // Add client_id or user_id based on selection
      if (formData.document_for === 'client') {
        uploadFormData.append('client_id', formData.client_id)
      } else {
        uploadFormData.append('user_id', formData.employee_id)
      }

      const response = await documentsAPI.create(uploadFormData)
      if (response.data.success) {
        alert('Document uploaded successfully!')
        await fetchDocuments()
        setIsUploadModalOpen(false)
        setFormData({
          document_for: 'client',
          client_id: '',
          employee_id: '',
          title: '',
          category: '',
          description: '',
          file: null,
        })
      } else {
        alert(response.data.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert(error.response?.data?.error || 'Failed to upload document')
    }
  }

  const handleDelete = async (doc) => {
    if (window.confirm(`Delete document "${doc.name}"?`)) {
      try {
        const response = await documentsAPI.delete(doc.id, { company_id: companyId })
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
  }

  const handleDownload = async (doc) => {
    try {
      // Check if file has a direct URL
      const fileUrl = doc.file_path
      if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
        window.open(fileUrl, '_blank')
        return
      }
      
      const response = await documentsAPI.download(doc.id, { company_id: companyId })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', doc.file_name || doc.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      // Try opening file_path directly as fallback
      if (doc.file_path) {
        window.open(doc.file_path, '_blank')
      } else {
        alert('Failed to download document')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Documents</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage client and employee documents</p>
        </div>
        <AddButton onClick={() => setIsUploadModalOpen(true)} label="Upload Document" />
      </div>

      {/* Filter Section */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <IoFilter size={20} className="text-primary-accent" />
          <span className="font-medium text-primary-text">Filter Documents</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter Type */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Document Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setSelectedClient('')
                setSelectedEmployee('')
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="all">All Documents</option>
              <option value="client">Client Documents</option>
              <option value="employee">Employee Documents</option>
            </select>
          </div>

          {/* Client Filter */}
          {filterType === 'client' && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Select Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.client_name || client.name || `Client #${client.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Employee Filter */}
          {filterType === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Select Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name || emp.email || `Employee #${emp.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-secondary-text">
                No documents found. Upload your first document!
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <IoDocumentText size={32} className="text-primary-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary-text truncate">{doc.name}</h3>
                    <p className="text-sm text-secondary-text mt-1">
                      {doc.size} • {typeof doc.date === 'string' ? doc.date.split('T')[0] : doc.date}
                    </p>
                    {doc.category && doc.category !== '--' && (
                      <p className="text-xs text-secondary-text mt-1">Category: {doc.category}</p>
                    )}
                    {/* Uploaded By Info */}
                    {doc.uploadedByType && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${doc.uploadedByType === 'Client' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {doc.uploadedByType === 'Client' ? <IoBusiness size={12} /> : <IoPerson size={12} />}
                          {doc.uploadedByType}
                        </span>
                        <span className="text-xs text-secondary-text truncate">{doc.uploadedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
                    title="Download"
                  >
                    <IoDownload size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors ml-auto"
                    title="Delete"
                  >
                    <IoTrash size={18} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Upload Document Modal */}
      <RightSideModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          setFormData({
            document_for: 'client',
            client_id: '',
            employee_id: '',
            title: '',
            category: '',
            description: '',
            file: null,
          })
        }}
        title="Upload Document"
        width="max-w-xl"
      >
        <div className="space-y-4">
          {/* Document For Selection */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Document For <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="document_for"
                  value="client"
                  checked={formData.document_for === 'client'}
                  onChange={(e) => setFormData({ ...formData, document_for: e.target.value, client_id: '', employee_id: '' })}
                  className="w-4 h-4 text-primary-accent"
                />
                <IoBusiness size={18} className="text-blue-500" />
                <span>Client</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="document_for"
                  value="employee"
                  checked={formData.document_for === 'employee'}
                  onChange={(e) => setFormData({ ...formData, document_for: e.target.value, client_id: '', employee_id: '' })}
                  className="w-4 h-4 text-primary-accent"
                />
                <IoPerson size={18} className="text-green-500" />
                <span>Employee</span>
              </label>
            </div>
          </div>

          {/* Client Selection */}
          {formData.document_for === 'client' && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Select Client <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                required
              >
                <option value="">-- Select Client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.client_name || client.name || `Client #${client.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Employee Selection */}
          {formData.document_for === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                required
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name || emp.email || `Employee #${emp.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Document Name"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter document name"
            required
          />
          
          <Input
            label="Category (Optional)"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Contracts, Proposals, ID Proof"
          />
          
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter document description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Upload File <span className="text-red-500">*</span>
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
          
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false)
                setFormData({
                  document_for: 'client',
                  client_id: '',
                  employee_id: '',
                  title: '',
                  category: '',
                  description: '',
                  file: null,
                })
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpload} className="px-4">
              Upload
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Documents
