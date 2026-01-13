import { useState, useEffect, useCallback, useRef } from 'react'
import { financeTemplatesAPI, companiesAPI } from '../../../api'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { IoCreate, IoTrash, IoEye, IoDocumentText, IoColorPalette, IoDownload, IoCopy } from 'react-icons/io5'
import RichTextEditor from '../../../components/ui/RichTextEditor'

const FinanceTemplates = () => {
  const fileInputRef = useRef(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templates, setTemplates] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    type: 'invoice',
    template_data: {
      logo: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      template: '',
    },
  })

  const documentTypes = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'expense', label: 'Expense' },
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching finance templates...')
      const response = await financeTemplatesAPI.getAll()
      console.log('Finance Templates API response:', response.data)

      if (response.data && response.data.success) {
        const fetchedTemplates = response.data.data || []
        console.log('Fetched templates count:', fetchedTemplates.length)

        const transformedTemplates = fetchedTemplates.map(template => {
          const templateData = template.template_data || {}
          return {
            id: template.id,
            company_id: template.company_id,
            company_name: template.company_name || '--',
            name: template.name,
            type: template.type,
            status: 'Active',
            preview: `${template.type} template`,
            primaryColor: templateData.primaryColor || '#3B82F6',
            secondaryColor: templateData.secondaryColor || '#1E40AF',
            logo: templateData.logo || '',
            template: templateData.template || '',
            template_data: templateData,
          }
        })
        console.log('Transformed templates:', transformedTemplates)
        setTemplates(transformedTemplates)
      } else {
        console.error('Failed to fetch templates:', response.data?.error)
        setTemplates([])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      console.error('Error details:', error.response?.data || error.message)
      setTemplates([])
      alert(error.response?.data?.error || 'Failed to fetch templates. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }, [])

  const columns = [
    { key: 'name', label: 'Template Name' },
    { key: 'company_name', label: 'Company' },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge variant="default">{value}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'default'}>
          {value}
        </Badge>
      ),
    },
    { key: 'preview', label: 'Preview' },
  ]

  const handleAdd = () => {
    setFormData({
      name: '',
      type: 'invoice',
      template_data: {
        logo: '',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        template: '',
      },
    })
    setSelectedTemplate(null)
    setIsAddModalOpen(true)
  }

  const handleEdit = async (template) => {
    try {
      const response = await financeTemplatesAPI.getById(template.id)
      if (response.data.success) {
        const data = response.data.data
        const templateData = data.template_data || {}
        setSelectedTemplate(template)
        setFormData({
          name: data.name || '',
          type: data.type || 'invoice',
          template_data: {
            logo: templateData.logo || '',
            primaryColor: templateData.primaryColor || '#3B82F6',
            secondaryColor: templateData.secondaryColor || '#1E40AF',
            template: templateData.template || '',
          },
        })
        setIsEditModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching template:', error)
      alert('Failed to load template details')
    }
  }

  const handleView = async (template) => {
    try {
      const response = await financeTemplatesAPI.getById(template.id)
      if (response.data.success) {
        const data = response.data.data
        const templateData = data.template_data || {}
        setSelectedTemplate({
          ...template,
          ...data,
          company_name: data.company_name || '--',
          primaryColor: templateData.primaryColor || '#3B82F6',
          secondaryColor: templateData.secondaryColor || '#1E40AF',
          logo: templateData.logo || '',
          template: templateData.template || '',
        })
        setIsViewModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching template:', error)
      setSelectedTemplate(template)
      setIsViewModalOpen(true)
    }
  }

  const handlePreview = (template) => {
    setSelectedTemplate(template)
    setIsPreviewModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.type) {
      alert('Name and type are required')
      return
    }

    try {
      const templateData = {
        name: formData.name,
        type: formData.type,
        template_data: formData.template_data,
      }

      if (isEditModalOpen && selectedTemplate) {
        const response = await financeTemplatesAPI.update(selectedTemplate.id, templateData)
        if (response.data.success) {
          alert('Template updated successfully!')
          await fetchTemplates()
          setIsEditModalOpen(false)
          setSelectedTemplate(null)
        } else {
          alert(response.data.error || 'Failed to update template')
        }
      } else {
        const response = await financeTemplatesAPI.create(templateData)
        if (response.data.success) {
          alert('Template created successfully!')
          await fetchTemplates()
          setIsAddModalOpen(false)
        } else {
          alert(response.data.error || 'Failed to create template')
        }
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert(error.response?.data?.error || 'Failed to save template')
    }
  }

  const handleDelete = async (template) => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      try {
        const response = await financeTemplatesAPI.delete(template.id)
        if (response.data.success) {
          alert('Template deleted successfully!')
          await fetchTemplates()
        } else {
          alert(response.data.error || 'Failed to delete template')
        }
      } catch (error) {
        console.error('Error deleting template:', error)
        alert(error.response?.data?.error || 'Failed to delete template')
      }
    }
  }

  const handleGenerateReport = async (template) => {
    try {
      // Sample document data - in production, this would come from selected invoice/proposal/estimate
      const sampleData = {
        type: template.type,
        number: `${template.type.toUpperCase()}-001`,
        client_name: 'Sample Client',
        date: new Date().toLocaleDateString(),
        items: [
          { description: 'Item 1', quantity: 1, rate: 100, amount: 100 },
          { description: 'Item 2', quantity: 2, rate: 50, amount: 100 },
        ],
        total: 200,
      }

      const response = await financeTemplatesAPI.generateReport(template.id, sampleData, 'pdf')
      if (response.data.success) {
        alert('Report generated successfully! Check console for details.')
        console.log('Generated report:', response.data.data)
        // In production, you would download the PDF/Excel file here
      } else {
        alert(response.data.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert(error.response?.data?.error || 'Failed to generate report')
    }
  }

  const handleLogoClick = () => {
    fileInputRef.current?.click()
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          template_data: {
            ...prev.template_data,
            logo: reader.result
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1 sm:gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-1.5 sm:p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="View"
      >
        <IoEye size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handlePreview(row)
        }}
        className="p-1.5 sm:p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="Preview"
      >
        <IoDocumentText size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleGenerateReport(row)
        }}
        className="p-1.5 sm:p-2 text-secondary-green hover:bg-secondary-green hover:bg-opacity-10 rounded transition-colors"
        title="Generate Report"
      >
        <IoDownload size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="p-1.5 sm:p-2 text-warning hover:bg-warning hover:bg-opacity-10 rounded transition-colors"
        title="Edit"
      >
        <IoCreate size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDelete(row)
        }}
        className="p-1.5 sm:p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
        title="Delete"
      >
        <IoTrash size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Finance Templates</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage templates for invoices, proposals, estimates, and expenses</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Template" />
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-secondary-text">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-secondary-text">No templates found. Create your first template!</p>
          </div>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className="p-5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePreview(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-primary-text">{template.name}</h3>
                  <Badge variant="default" className="mt-1">{template.type}</Badge>
                </div>
                <Badge variant={template.status === 'Active' ? 'success' : 'default'}>
                  {template.status}
                </Badge>
              </div>
              <div className="mb-3">
                <div
                  className="h-32 rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: template.primaryColor }}
                >
                  <div className="text-center">
                    <IoDocumentText
                      className="mx-auto mb-2"
                      size={32}
                      style={{ color: template.primaryColor }}
                    />
                    <p className="text-xs text-secondary-text">{template.preview}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.primaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.secondaryColor }}
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(template)
                    }}
                    className="p-1.5 text-warning hover:bg-warning/10 rounded"
                  >
                    <IoCreate size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleView(template)
                    }}
                    className="p-1.5 text-primary-accent hover:bg-primary-accent/10 rounded"
                  >
                    <IoEye size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedTemplate(null)
        }}
        title={isAddModalOpen ? 'Add Finance Template' : 'Edit Finance Template'}
        width="max-w-5xl"
      >
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <Input
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Modern Invoice"
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              required
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Logo Upload
            </label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleLogoChange}
            />
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-accent transition-colors cursor-pointer relative group"
              onClick={handleLogoClick}
            >
              {formData.template_data.logo ? (
                <div className="relative">
                  <img
                    src={formData.template_data.logo}
                    alt="Logo preview"
                    className="mx-auto h-32 object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <p className="text-transparent group-hover:text-white font-medium">Click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <IoDocumentText className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-secondary-text">Click to upload logo</p>
                  <p className="text-xs text-secondary-text mt-1">PNG, JPG (Max 2MB)</p>
                </>
              )}
            </div>
            {formData.template_data.logo && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  template_data: { ...prev.template_data, logo: '' }
                }))}
                className="text-xs text-red-500 mt-2 hover:underline"
              >
                Remove logo
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
                <IoColorPalette size={16} />
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.template_data.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      primaryColor: e.target.value
                    }
                  })}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.template_data.primaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      primaryColor: e.target.value
                    }
                  })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
                <IoColorPalette size={16} />
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.template_data.secondaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      secondaryColor: e.target.value
                    }
                  })}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.template_data.secondaryColor}
                  onChange={(e) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      secondaryColor: e.target.value
                    }
                  })}
                  placeholder="#1E40AF"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Editor based on Type */}
          {formData.type === 'proposal' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Proposal Background
                </label>
                <RichTextEditor
                  value={formData.template_data.background}
                  onChange={(content) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      background: content
                    }
                  })}
                  placeholder="Enter proposal background..."
                />
                <div className="mt-2 flex gap-2 flex-wrap">
                  {['{CLIENT_NAME}', '{CLIENT_COMPANY}', '{PROPOSAL_DATE}'].map(variable => (
                    <Badge
                      key={variable}
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        // Copy logic here or user can just copy paste in this version
                        navigator.clipboard.writeText(variable)
                        alert(`Copied ${variable} to clipboard!`)
                      }}
                    >
                      {variable} <IoCopy size={10} className="ml-1 inline" />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Scope of Work
                </label>
                <RichTextEditor
                  value={formData.template_data.scope}
                  onChange={(content) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      scope: content
                    }
                  })}
                  placeholder="Enter scope of work..."
                />
                <div className="mt-2 flex gap-2 flex-wrap">
                  {['{PROPOSAL_ITEMS}', '{TOTAL_AMOUNT}'].map(variable => (
                    <Badge
                      key={variable}
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        navigator.clipboard.writeText(variable)
                        alert(`Copied ${variable} to clipboard!`)
                      }}
                    >
                      {variable} <IoCopy size={10} className="ml-1 inline" />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Terms & Conditions
                </label>
                <RichTextEditor
                  value={formData.template_data.terms}
                  onChange={(content) => setFormData({
                    ...formData,
                    template_data: {
                      ...formData.template_data,
                      terms: content
                    }
                  })}
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Template Content (Rich Text)
              </label>
              <RichTextEditor
                value={formData.template_data.template}
                onChange={(content) => setFormData({
                  ...formData,
                  template_data: {
                    ...formData.template_data,
                    template: content
                  }
                })}
                placeholder="Design your template..."
              />
              <p className="text-xs text-secondary-text mt-2">
                Use variables like {'{{invoice_number}}'}, {'{{client_name}}'}, {'{{amount}}'}, etc.
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setSelectedTemplate(null)
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="px-4">
              {isAddModalOpen ? 'Save Template' : 'Update Template'}
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* View Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTemplate(null)
        }}
        title="Template Details"
        width="max-w-5xl"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Company</label>
                <p className="text-primary-text mt-1 text-base">{selectedTemplate.company_name || '--'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Type</label>
                <p className="text-primary-text mt-1 text-base">
                  <Badge variant="default">{selectedTemplate.type || '--'}</Badge>
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-secondary-text">Template Name</label>
                <p className="text-primary-text mt-1 text-base font-semibold">{selectedTemplate.name || '--'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text mb-2 block">Template Preview</label>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div
                  className="p-8 border-2 rounded-lg"
                  style={{ borderColor: selectedTemplate.primaryColor || '#3B82F6' }}
                >
                  <div className="text-center mb-6">
                    <div
                      className="text-2xl font-bold mb-2"
                      style={{ color: selectedTemplate.primaryColor || '#3B82F6' }}
                    >
                      {selectedTemplate.type?.toUpperCase() || 'DOCUMENT'}
                    </div>
                    <div className="text-sm text-secondary-text">
                      Template: {selectedTemplate.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedTemplate)
                }}
                className="flex-1"
              >
                Edit Template
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedTemplate(null)
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`${selectedTemplate?.type?.toUpperCase() || 'DOCUMENT'} Template Preview`}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div
              className="p-8 border-2 rounded-lg"
              style={{ borderColor: selectedTemplate.primaryColor || '#3B82F6' }}
            >
              <div className="text-center mb-6">
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ color: selectedTemplate.primaryColor || '#3B82F6' }}
                >
                  {selectedTemplate.type?.toUpperCase() || 'DOCUMENT'}
                </div>
                <div className="text-sm text-secondary-text">
                  Template: {selectedTemplate.name}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-secondary-text">Document Number</p>
                    <p className="text-sm font-semibold text-primary-text">DOC-001</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary-text">Date</p>
                    <p className="text-sm font-semibold text-primary-text">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-secondary-text">Client</p>
                  <p className="text-sm font-semibold text-primary-text">Sample Client Name</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-secondary-text mb-2">Amount</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: selectedTemplate.primaryColor || '#3B82F6' }}
                  >
                    $1,000.00
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPreviewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Template applied successfully!')
                  setIsPreviewModalOpen(false)
                }}
                className="flex-1"
              >
                Use This Template
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default FinanceTemplates
