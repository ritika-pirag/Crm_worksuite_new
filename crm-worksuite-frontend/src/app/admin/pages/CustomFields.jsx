import { useState, useEffect } from 'react'
import { customFieldsAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { IoCreate, IoTrash, IoAdd, IoClose } from 'react-icons/io5'

const CustomFields = () => {
  const { user } = useAuth()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedField, setSelectedField] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    module: 'Leads',
    required: false,
    options: [],
    defaultValue: '',
    placeholder: '',
    helpText: '',
    visibility: ['all'],
    enabledIn: ['create', 'edit', 'table', 'filters'],
  })

  const [customFields, setCustomFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCustomFields()
  }, [])

  const fetchCustomFields = async () => {
    try {
      setLoading(true)
      const companyId = user?.company_id || parseInt(localStorage.getItem('companyId') || 0, 10)
      const params = companyId ? { company_id: companyId } : {}
      const response = await customFieldsAPI.getAll(params)
      if (response.data && response.data.success) {
        setCustomFields(response.data.data || [])
      } else {
        console.error('Failed to fetch custom fields:', response.data?.error)
        setCustomFields([])
      }
    } catch (error) {
      console.error('Failed to fetch custom fields:', error)
      console.error('Error details:', error.response?.data || error.message)
      setCustomFields([])
      alert(error.response?.data?.error || 'Failed to fetch custom fields')
    } finally {
      setLoading(false)
    }
  }

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date' },
    { value: 'datetime', label: 'Date & Time' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi-select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
    { value: 'file', label: 'File Upload' },
    { value: 'url', label: 'URL' },
  ]

  const visibilityOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'employee', label: 'Employee' },
    { value: 'client', label: 'Client' },
    { value: 'all', label: 'All' },
  ]

  const enabledInOptions = [
    { value: 'create', label: 'Create Form' },
    { value: 'edit', label: 'Edit Form' },
    { value: 'table', label: 'Table View' },
    { value: 'filters', label: 'Filters' },
    { value: 'reports', label: 'Reports' },
  ]

  const modules = ['Leads', 'Clients', 'Projects', 'Tasks', 'Finance', 'Invoices', 'Proposals', 'Estimates', 'Contracts']

  const columns = [
    { key: 'label', label: 'Field Label' },
    { key: 'name', label: 'Field Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge variant="default">{value}</Badge>
      ),
    },
    {
      key: 'module',
      label: 'Module',
      render: (value) => (
        <Badge variant="info">{value}</Badge>
      ),
    },
    {
      key: 'required',
      label: 'Required',
      render: (value) => (
        <Badge variant={value ? 'danger' : 'default'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ]

  const handleAdd = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      module: 'Leads',
      required: false,
      options: [],
      defaultValue: '',
      placeholder: '',
      helpText: '',
      visibility: ['all'],
      enabledIn: ['create', 'edit', 'table', 'filters'],
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = (field) => {
    setSelectedField(field)
    // Ensure visibility and enabledIn are arrays
    let visibility = ['all']
    if (field.visibility) {
      if (Array.isArray(field.visibility)) {
        visibility = field.visibility
      } else if (typeof field.visibility === 'string') {
        try {
          visibility = JSON.parse(field.visibility)
        } catch {
          visibility = [field.visibility]
        }
      }
    }
    
    let enabledIn = ['create', 'edit', 'table', 'filters']
    if (field.enabledIn) {
      if (Array.isArray(field.enabledIn)) {
        enabledIn = field.enabledIn
      } else if (typeof field.enabledIn === 'string') {
        try {
          enabledIn = JSON.parse(field.enabledIn)
        } catch {
          enabledIn = [field.enabledIn]
        }
      }
    }
    
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      module: field.module,
      required: field.required || false,
      options: Array.isArray(field.options) ? [...field.options] : [],
      defaultValue: field.defaultValue || '',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      visibility: visibility,
      enabledIn: enabledIn,
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.label) {
      alert('Field name and label are required')
      return
    }

    try {
      setSaving(true)
      const fieldData = {
        company_id: user?.company_id || null,
        field_name: formData.name,
        field_label: formData.label,
        field_type: formData.type,
        module: formData.module,
        required: formData.required || false,
        options: formData.options || [],
        default_value: formData.defaultValue || '',
        placeholder: formData.placeholder || '',
        help_text: formData.helpText || '',
        visibility: formData.visibility || ['all'],
        enabled_in: formData.enabledIn || ['create', 'edit', 'table', 'filters'],
      }

      if (isEditModalOpen && selectedField) {
        // Note: customFieldsAPI might not have update method
        alert('Update functionality needs backend API endpoint')
        setIsEditModalOpen(false)
        setSelectedField(null)
      } else {
        const response = await customFieldsAPI.create(fieldData)
        if (response.data && response.data.success) {
          alert('Custom field created successfully!')
          setIsAddModalOpen(false)
          // Reset form
          setFormData({
            name: '',
            label: '',
            type: 'text',
            module: 'Leads',
            required: false,
            options: [],
            defaultValue: '',
            placeholder: '',
            helpText: '',
            visibility: ['all'],
            enabledIn: ['create', 'edit', 'table', 'filters'],
          })
          // Refresh the list
          await fetchCustomFields()
        } else {
          alert(response.data?.error || 'Failed to create custom field')
        }
      }
    } catch (error) {
      console.error('Failed to save custom field:', error)
      alert(error.response?.data?.error || 'Failed to save custom field')
    } finally {
      setSaving(false)
    }
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    })
  }

  const updateOption = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index)
    setFormData({ ...formData, options: newOptions })
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1 sm:gap-2">
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
          if (window.confirm(`Delete field "${row.label}"?`)) {
            try {
              // Note: customFieldsAPI might not have delete method
              alert('Delete functionality needs backend API endpoint')
              // await customFieldsAPI.delete(row.id)
              // await fetchCustomFields()
            } catch (error) {
              console.error('Failed to delete custom field:', error)
              alert(error.response?.data?.error || 'Failed to delete custom field')
            }
          }
        }}
        className="p-1.5 sm:p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
        title="Delete"
      >
        <IoTrash size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
    </div>
  )

  const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(formData.type)

  if (loading && customFields.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Custom Fields</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Create custom fields for leads, clients, projects, tasks, and finance modules</p>
        </div>
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading custom fields...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Custom Fields</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Create custom fields for leads, clients, projects, tasks, and finance modules</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Custom Field" />
      </div>

      {/* Module Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {modules.map((module) => {
          const count = customFields.filter(f => f.module === module).length
          return (
            <Card
              key={module}
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
            >
              <p className="text-2xl font-bold text-primary-text">{count}</p>
              <p className="text-sm text-secondary-text mt-1">{module}</p>
            </Card>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        data={customFields}
        searchPlaceholder="Search custom fields..."
        filters={true}
        actions={actions}
        mobileColumns={2}
      />

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedField(null)
          // Reset form
          setFormData({
            name: '',
            label: '',
            type: 'text',
            module: 'Leads',
            required: false,
            options: [],
            defaultValue: '',
            placeholder: '',
            helpText: '',
            visibility: ['all'],
            enabledIn: ['create', 'edit', 'table', 'filters'],
          })
        }}
        title={isAddModalOpen ? 'Add Custom Field' : 'Edit Custom Field'}
      >
        <div className="space-y-4">
          <Input
            label="Field Label"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g., Industry"
            required
          />
          <Input
            label="Field Name (Internal)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            placeholder="e.g., industry"
            required
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Module
            </label>
            <select
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Field Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ 
                ...formData, 
                type: e.target.value, 
                options: ['dropdown', 'radio', 'checkbox', 'multiselect'].includes(e.target.value) ? formData.options : [] 
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {needsOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-primary-text">
                  Options
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center gap-1"
                >
                  <IoAdd size={14} />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-danger hover:bg-danger/10 rounded"
                    >
                      <IoClose size={18} />
                    </button>
                  </div>
                ))}
                {formData.options.length === 0 && (
                  <p className="text-sm text-secondary-text text-center py-2">
                    No options added. Click "Add Option" to add choices.
                  </p>
                )}
              </div>
            </div>
          )}
          <Input
            label="Placeholder Text"
            value={formData.placeholder}
            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
          <Input
            label="Default Value"
            value={formData.defaultValue}
            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
            placeholder="Default value (optional)"
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Help Text
            </label>
            <textarea
              value={formData.helpText}
              onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Help text to guide users"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
              />
              <label htmlFor="required" className="text-sm font-medium text-primary-text">
                Required Field
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Visibility
              </label>
              <div className="space-y-2">
                {visibilityOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.visibility) && formData.visibility.includes(opt.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            visibility: [...formData.visibility, opt.value],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            visibility: formData.visibility.filter(v => v !== opt.value),
                          })
                        }
                      }}
                      className="w-4 h-4 text-primary-accent rounded"
                    />
                    <span className="text-sm text-secondary-text">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Enabled In
              </label>
              <div className="space-y-2">
                {enabledInOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Array.isArray(formData.enabledIn) && formData.enabledIn.includes(opt.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            enabledIn: [...formData.enabledIn, opt.value],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            enabledIn: formData.enabledIn.filter(v => v !== opt.value),
                          })
                        }
                      }}
                      className="w-4 h-4 text-primary-accent rounded"
                    />
                    <span className="text-sm text-secondary-text">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
              }}
              className="px-4"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="px-4" disabled={saving}>
              {saving ? 'Saving...' : (isAddModalOpen ? 'Save Field' : 'Update Field')}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default CustomFields

