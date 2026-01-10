import { useState } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import {
  IoCreate,
  IoTrash,
  IoAdd,
  IoSearch,
  IoFilter,
  IoFolder,
  IoEllipsisVertical,
  IoCheckmarkCircle
} from 'react-icons/io5'
import {
  FormRow,
  FormSection,
  FormInput,
  FormSelect,
  FormActions
} from '../../../components/ui/FormRow'
import RichTextEditor from '../../../components/ui/RichTextEditor'

const ProjectTemplates = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [subCategoryFilter, setSubCategoryFilter] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const [formData, setFormData] = useState({
    projectName: '',
    projectCategory: '',
    projectSubCategory: '',
    projectSummary: '',
    notes: '',
  })

  const [templates, setTemplates] = useState([])

  const projectCategories = ['Web Development', 'Mobile App', 'Design', 'Marketing', 'Consulting', 'Other']

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const columns = [
    {
      key: 'checkbox',
      label: '',
      render: () => (
        <input type="checkbox" className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent" />
      ),
    },
    {
      key: 'projectName',
      label: 'Project Name',
      render: (value) => (
        <button
          onClick={() => handleSort('projectName')}
          className="flex items-center gap-1 hover:text-primary-accent"
        >
          {value || 'Project Name'}
          {sortColumn === 'projectName' ? (
            sortDirection === 'asc' ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />
          ) : (
            <div className="flex flex-col">
              <IoChevronUp size={10} className="-mb-1 opacity-30" />
              <IoChevronDown size={10} className="opacity-30" />
            </div>
          )}
        </button>
      ),
    },
    {
      key: 'members',
      label: 'Members',
      render: (value) => (
        <button
          onClick={() => handleSort('members')}
          className="flex items-center gap-1 hover:text-primary-accent"
        >
          Members
          {sortColumn === 'members' ? (
            sortDirection === 'asc' ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />
          ) : (
            <div className="flex flex-col">
              <IoChevronUp size={10} className="-mb-1 opacity-30" />
              <IoChevronDown size={10} className="opacity-30" />
            </div>
          )}
        </button>
      ),
    },
    {
      key: 'projectCategory',
      label: 'Project Category',
      render: (value) => (
        <button
          onClick={() => handleSort('projectCategory')}
          className="flex items-center gap-1 hover:text-primary-accent"
        >
          Project Category
          {sortColumn === 'projectCategory' ? (
            sortDirection === 'asc' ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />
          ) : (
            <div className="flex flex-col">
              <IoChevronUp size={10} className="-mb-1 opacity-30" />
              <IoChevronDown size={10} className="opacity-30" />
            </div>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      render: () => (
        <div className="flex items-center gap-2">
          <button className="p-1 text-primary-accent hover:bg-primary-accent/10 rounded">
            <IoCreate size={16} />
          </button>
          <button className="p-1 text-danger hover:bg-danger/10 rounded">
            <IoTrash size={16} />
          </button>
        </div>
      ),
    },
  ]

  const handleAdd = () => {
    setFormData({
      projectName: '',
      projectCategory: '',
      projectSubCategory: '',
      projectSummary: '',
      notes: '',
    })
    setIsAddModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.projectName) {
      alert('Project Name is required')
      return
    }

    const newTemplate = {
      id: templates.length + 1,
      ...formData,
    }
    setTemplates([...templates, newTemplate])
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Project Template</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage project templates</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Project Template" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing to search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            />
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={18} />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option>Project Category All</option>
            <option value="All">All</option>
            {projectCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={subCategoryFilter}
            onChange={(e) => setSubCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option>Project Sub Category</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option>Select Project Category</option>
            {projectCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider"
                  >
                    {column.render ? column.render() : column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-secondary-text">
                    No data available in table
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    {columns.map((column, idx) => (
                      <td key={idx} className="px-4 py-3">
                        {column.render ? column.render(template[column.key], template) : template[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-secondary-text">
            <span>Show</span>
            <select className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries</span>
          </div>
          <div className="text-sm text-secondary-text">
            Showing 0 to 0 of 0 entries
          </div>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
              Previous
            </button>
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-gray-400 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Add Template Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
        }}
        title="Add Project Template"
      >
        <div className="space-y-0 max-h-[calc(100vh-150px)] overflow-y-auto pb-4">
          <FormSection title="Template Details">
            <FormRow label="Template Name" required>
              <FormInput
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="Enter template name"
                required
              />
            </FormRow>

            <FormRow label="Project Category">
              <FormSelect
                value={formData.projectCategory}
                onChange={(e) => setFormData({ ...formData, projectCategory: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {projectCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </FormSelect>
            </FormRow>
          </FormSection>

          <FormSection title="Summary & Notes" last>
            <FormRow label="Project Summary">
              <RichTextEditor
                value={formData.projectSummary}
                onChange={(content) => setFormData({ ...formData, projectSummary: content })}
                placeholder="Enter project summary..."
              />
            </FormRow>

            <FormRow label="Notes">
              <RichTextEditor
                value={formData.notes}
                onChange={(content) => setFormData({ ...formData, notes: content })}
                placeholder="Enter notes..."
              />
            </FormRow>
          </FormSection>

          <FormActions>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="px-6 flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              {isEditModalOpen ? 'Update' : 'Save'}
            </Button>
          </FormActions>
        </div>
      </RightSideModal>
    </div>
  )
}

export default ProjectTemplates

