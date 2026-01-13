import { useState, useEffect } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { expensesAPI, leadsAPI, companiesAPI, itemsAPI, clientsAPI, projectsAPI, usersAPI } from '../../../api'
import { 
  IoAdd,
  IoClose,
  IoSearch,
  IoFilter,
  IoDownload,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoCloudUpload,
  IoTrash,
  IoCreate,
  IoEye,
  IoInformationCircle,
  IoDocumentText
} from 'react-icons/io5'

const Expenses = () => {
  // Get company_id from localStorage
  const companyId = parseInt(localStorage.getItem('companyId') || 1, 10)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Category options
  const categoryOptions = [
    'Advertising',
    'Travel',
    'Office Supplies',
    'Software',
    'Hardware',
    'Marketing',
    'Utilities',
    'Rent',
    'Salaries',
    'Other'
  ]

  const taxOptions = [
    { value: '', label: '-' },
    { value: 'GST 10%', label: 'GST 10%', rate: 10 },
    { value: 'CGST 18%', label: 'CGST 18%', rate: 18 },
    { value: 'VAT 10%', label: 'VAT 10%', rate: 10 },
    { value: 'IGST 10%', label: 'IGST 10%', rate: 10 },
    { value: 'UTGST 10%', label: 'UTGST 10%', rate: 10 },
  ]

  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    title: '',
    description: '',
    client_id: '',
    project_id: '',
    employee_id: '',
    tax: '',
    secondTax: '',
    isRecurring: false,
  })

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [companies, setCompanies] = useState([])

  // Fetch data on component mount
  useEffect(() => {
    fetchExpenses()
    fetchClients()
    fetchProjects()
    fetchEmployees()
    fetchCompanies()
  }, [statusFilter])

  // Filter projects when client changes
  useEffect(() => {
    if (formData.client_id) {
      const clientProjects = projects.filter(p => 
        parseInt(p.client_id) === parseInt(formData.client_id)
      )
      setFilteredProjects(clientProjects)
    } else {
      setFilteredProjects([])
    }
    // Reset project and employee when client changes
    setFormData(prev => ({ ...prev, project_id: '', employee_id: '' }))
    setFilteredEmployees([])
  }, [formData.client_id, projects])

  // Filter employees when project changes
  useEffect(() => {
    if (formData.project_id) {
      // Get employees assigned to this project or all employees for the company
      setFilteredEmployees(employees)
    } else {
      setFilteredEmployees([])
    }
  }, [formData.project_id, employees])

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

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setProjects(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await usersAPI.getAll({ company_id: companyId })
      if (response.data.success) {
        setEmployees(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll()
      if (response.data.success) {
        setCompanies(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error('Invalid companyId for fetchExpenses:', companyId)
        setExpenses([])
        setLoading(false)
        return
      }
      const params = { company_id: companyId }
      if (statusFilter !== 'All') {
        params.status = statusFilter.toLowerCase()
      }
      
      const response = await expensesAPI.getAll(params)
      if (response.data.success) {
        const fetchedExpenses = response.data.data || []
        // Transform API data to match component format
        const transformedExpenses = fetchedExpenses.map(expense => ({
          id: expense.id,
          title: expense.title || expense.description || 'N/A',
          category: expense.category || 'Other',
          amount: parseFloat(expense.amount || expense.total || 0),
          expenseDate: expense.expense_date || expense.created_at,
          client_id: expense.client_id,
          client_name: expense.client_name || 'N/A',
          project_id: expense.project_id,
          project_name: expense.project_name || 'N/A',
          employee_id: expense.employee_id,
          employee_name: expense.employee_name || 'N/A',
          description: expense.description || '',
          tax: expense.tax || '',
          secondTax: expense.second_tax || '',
          isRecurring: expense.is_recurring || false,
          status: expense.status || 'Pending',
          createdAt: expense.created_at || new Date().toISOString(),
        }))
        setExpenses(transformedExpenses)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const expenseData = {
        company_id: companyId,
        expense_date: formData.expenseDate,
        category: formData.category,
        amount: parseFloat(formData.amount) || 0,
        title: formData.title,
        description: formData.description,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
        tax: formData.tax || null,
        second_tax: formData.secondTax || null,
        is_recurring: formData.isRecurring ? 1 : 0,
        status: 'Pending',
      }

      let response
      if (selectedExpense && isEditModalOpen) {
        response = await expensesAPI.update(selectedExpense.id, expenseData, { company_id: companyId })
        if (response.data.success) {
          alert('Expense updated successfully!')
          setIsEditModalOpen(false)
          resetForm()
          await fetchExpenses()
        } else {
          alert(response.data.error || 'Failed to update expense')
        }
      } else {
        response = await expensesAPI.create(expenseData)
        if (response.data.success) {
          alert('Expense created successfully!')
          setIsAddModalOpen(false)
          resetForm()
          await fetchExpenses()
        } else {
          alert(response.data.error || 'Failed to create expense')
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      alert(error.response?.data?.error || 'Failed to save expense')
    }
  }

  const resetForm = () => {
    setFormData({
      expenseDate: new Date().toISOString().split('T')[0],
      category: '',
      amount: '',
      title: '',
      description: '',
      client_id: '',
      project_id: '',
      employee_id: '',
      tax: '',
      secondTax: '',
      isRecurring: false,
    })
    setSelectedExpense(null)
    setFilteredProjects([])
    setFilteredEmployees([])
  }

  // Export expenses to CSV
  const handleExportExpenses = () => {
    const csvData = expenses.map(exp => ({
      'Title': exp.title || '',
      'Category': exp.category || '',
      'Amount': exp.amount || 0,
      'Date': exp.expenseDate || '',
      'Client': exp.client_name || '',
      'Project': exp.project_name || '',
      'Status': exp.status || ''
    }))
    
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
      key: 'title',
      label: 'Title',
      render: (value) => <span className="font-medium text-primary-text">{value || 'N/A'}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => <span className="text-primary-text">{value || 'N/A'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-semibold text-primary-text">
          ${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'expenseDate',
      label: 'Date',
      render: (value) => {
        if (!value) return 'N/A'
        try {
          const date = new Date(value)
          return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        } catch (e) {
          return 'N/A'
        }
      },
    },
    {
      key: 'client_name',
      label: 'Client',
      render: (value) => <span className="text-primary-text">{value || 'N/A'}</span>,
    },
    {
      key: 'project_name',
      label: 'Project',
      render: (value) => <span className="text-primary-text">{value || 'N/A'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Approved': 'bg-green-100 text-green-800',
          'Rejected': 'bg-red-100 text-red-800',
        }
        return (
          <Badge variant="default" className={statusColors[value] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: 'Action',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedExpense(row)
              setIsViewModalOpen(true)
            }}
            className="p-1 text-primary-accent hover:bg-primary-accent/10 rounded"
          >
            <IoEye size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedExpense(row)
              setFormData({
                expenseDate: row.expenseDate ? new Date(row.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                category: row.category || '',
                amount: row.amount || '',
                title: row.title || '',
                description: row.description || '',
                client_id: row.client_id?.toString() || '',
                project_id: row.project_id?.toString() || '',
                employee_id: row.employee_id?.toString() || '',
                tax: row.tax || '',
                secondTax: row.secondTax || '',
                isRecurring: row.isRecurring || false,
              })
              // Set filtered projects and employees based on existing data
              if (row.client_id) {
                const clientProjects = projects.filter(p => parseInt(p.client_id) === parseInt(row.client_id))
                setFilteredProjects(clientProjects)
              }
              if (row.project_id) {
                setFilteredEmployees(employees)
              }
              setIsEditModalOpen(true)
            }}
            className="p-1 text-primary-accent hover:bg-primary-accent/10 rounded"
          >
            <IoCreate size={16} />
          </button>
          <button
            onClick={async () => {
              if (window.confirm(`Are you sure you want to delete this expense?`)) {
                try {
                  const response = await expensesAPI.delete(row.id, { company_id: companyId })
                  if (response.data.success) {
                    alert('Expense deleted successfully!')
                    await fetchExpenses()
                  } else {
                    alert(response.data.error || 'Failed to delete expense')
                  }
                } catch (error) {
                  console.error('Error deleting expense:', error)
                  alert(error.response?.data?.error || 'Failed to delete expense')
                }
              }
            }}
            className="p-1 text-danger hover:bg-danger/10 rounded"
          >
            <IoTrash size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Expenses</h1>
          <p className="text-sm sm:text-base text-secondary-text mt-1">Manage expense proposals</p>
        </div>
        <AddButton onClick={() => setIsAddModalOpen(true)} label="Create Expense" />
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <IoInformationCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
        <p className="text-sm text-blue-900">
          Expenses are for Leads. If you want to create for existing clients, then create Estimate.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-secondary-text">
            <span>Duration</span>
            <span>Start Date To End Date</span>
            <span>Status</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
          >
            <option value="All">Lead All</option>
            <option value="All">All</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <IoAdd size={18} />
            Create Expense
          </Button>
          <Button variant="outline" onClick={handleExportExpenses} className="flex items-center gap-2">
            <IoDownload size={18} />
            Export
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
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
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-secondary-text">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-secondary-text">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses
                  .filter(expense => {
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase()
                      return (
                        expense.leadContact?.toLowerCase().includes(query) ||
                        expense.deal?.toLowerCase().includes(query) ||
                        expense.status?.toLowerCase().includes(query)
                      )
                    }
                    return true
                  })
                  .map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      {columns.map((column, idx) => (
                        <td key={idx} className="px-4 py-3">
                          {column.render ? column.render(expense[column.key], expense) : (expense[column.key] || '')}
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
            Showing {expenses.length} to {expenses.length} of {expenses.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button disabled className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-400 cursor-not-allowed">
              Previous
            </button>
            <button disabled className="px-2 py-0.5 text-xs border border-gray-300 rounded text-gray-400 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          resetForm()
        }}
        title={isEditModalOpen ? "Edit expense" : "Add expense"}
      >
        <div className="space-y-4">
          {/* Date of expense */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Date of expense</label>
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            />
          </div>

          {/* Category */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Amount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              min="0"
              step="0.01"
            />
          </div>

          {/* Title */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            />
          </div>

          {/* Description */}
          <div className="flex items-start">
            <label className="w-32 text-sm font-medium text-primary-text pt-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm resize-none"
            />
          </div>

          {/* Client */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Client</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              <option value="">Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.company_name || client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project - filtered by client */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Project</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              disabled={!formData.client_id}
            >
              <option value="">-</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name || project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team member - filtered by project */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Team member</label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
              disabled={!formData.project_id}
            >
              <option value="">-</option>
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.email}
                </option>
              ))}
            </select>
          </div>

          {/* TAX */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">TAX</label>
            <select
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              {taxOptions.map(tax => (
                <option key={tax.value} value={tax.value}>{tax.label}</option>
              ))}
            </select>
          </div>

          {/* Second TAX */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Second TAX</label>
            <select
              value={formData.secondTax}
              onChange={(e) => setFormData({ ...formData, secondTax: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
            >
              {taxOptions.map(tax => (
                <option key={tax.value} value={tax.value}>{tax.label}</option>
              ))}
            </select>
          </div>

          {/* Recurring */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-primary-text">Recurring</label>
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                resetForm()
              }}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Expense Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedExpense(null)
        }}
        title="Expense Details"
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Expense #</label>
                <p className="text-primary-text font-medium">{selectedExpense.expense_number || selectedExpense.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Status</label>
                <p className="text-primary-text">{selectedExpense.status || 'Pending'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Amount</label>
                <p className="text-primary-text font-medium">${parseFloat(selectedExpense.total || selectedExpense.amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Date</label>
                <p className="text-primary-text">{selectedExpense.created_at ? new Date(selectedExpense.created_at).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Lead Name</label>
                <p className="text-primary-text">{selectedExpense.lead_name || selectedExpense.leadContact || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Deal</label>
                <p className="text-primary-text">{selectedExpense.deal || selectedExpense.deal_name || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
              <p className="text-primary-text whitespace-pre-wrap">{selectedExpense.description || '-'}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedExpense(null)
                }} 
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(selectedExpense)
                }} 
                className="flex-1"
              >
                Edit Expense
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Expenses
