import { useCallback, useEffect, useState } from 'react'
import { reportsAPI, clientsAPI, employeesAPI } from '../../../api'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { IoDownload, IoRefresh, IoPieChart, IoBarChart, IoPeople, IoFolder, IoTrendingUp, IoBusiness, IoPerson, IoFilter, IoCheckmarkCircle, IoTime, IoHourglass, IoDocumentText } from 'react-icons/io5'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

const Reports = () => {
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])

  // Filter states
  const [filterType, setFilterType] = useState('all') // 'all', 'client', 'employee'
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [salesData, setSalesData] = useState([])
  const [salesTotal, setSalesTotal] = useState({ revenue: 0, paid: 0, unpaid: 0, count: 0 })
  const [revenueData, setRevenueData] = useState([])
  const [revenueTotal, setRevenueTotal] = useState({ revenue: 0, paid: 0, unpaid: 0, invoices: 0 })
  const [projectStatusData, setProjectStatusData] = useState([])
  const [projectsList, setProjectsList] = useState([])
  const [projectTotal, setProjectTotal] = useState({ projects: 0, budget: 0 })
  const [employeePerformanceData, setEmployeePerformanceData] = useState([])
  const [employeeSummary, setEmployeeSummary] = useState({
    total_employees: 0, excellent: 0, good: 0, fair: 0, average: 0,
    total_tasks: 0, total_completed: 0, total_projects: 0, total_hours: 0
  })

  // Get company ID from localStorage
  const companyId = localStorage.getItem('companyId') || '1'

  useEffect(() => {
    fetchClients()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchAllReports()
  }, [filterType, selectedClient, selectedEmployee, dateRange])

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ company_id: companyId })
      const clientData = response.data?.data || response.data || []
      setClients(Array.isArray(clientData) ? clientData : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await employeesAPI.getAll({ company_id: companyId })
      const employeeData = response.data?.data || response.data || []
      setEmployees(Array.isArray(employeeData) ? employeeData : [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    }
  }

  const fetchAllReports = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        company_id: companyId,
        ...(dateRange.startDate && { start_date: dateRange.startDate }),
        ...(dateRange.endDate && { end_date: dateRange.endDate })
      }

      // Add client or employee filter based on selection
      if (filterType === 'client' && selectedClient) {
        params.client_id = selectedClient
      } else if (filterType === 'employee' && selectedEmployee) {
        params.employee_id = selectedEmployee
        params.user_id = selectedEmployee
      }

      console.log('Fetching reports with params:', params)

      // Fetch all reports in parallel
      const [salesRes, revenueRes, projectsRes, employeesRes] = await Promise.all([
        reportsAPI.getSalesReport(params).catch(err => {
          console.error('Sales API error:', err)
          return { data: { success: true, data: [], total: {} } }
        }),
        reportsAPI.getRevenueReport({ ...params, period: 'monthly' }).catch(err => {
          console.error('Revenue API error:', err)
          return { data: { success: true, data: [], total: {} } }
        }),
        reportsAPI.getProjectStatusReport(params).catch(err => {
          console.error('Projects API error:', err)
          return { data: { success: true, data: [], projects: [], total: {} } }
        }),
        reportsAPI.getEmployeePerformanceReport(params).catch(err => {
          console.error('Employees API error:', err)
          return { data: { success: true, data: [], summary: {} } }
        })
      ])

      console.log('API Responses:', { salesRes, revenueRes, projectsRes, employeesRes })
      console.log('Employee Response Detail:', JSON.stringify(employeesRes?.data, null, 2))

      // Process Sales Data
      if (salesRes.data?.success) {
        const formatted = (salesRes.data.data || []).map(item => ({
          name: item.month_name || item.month || 'N/A',
          revenue: parseFloat(item.revenue || 0),
          count: parseInt(item.count || 0),
          paid: parseFloat(item.paid || 0),
          unpaid: parseFloat(item.unpaid || 0)
        }))
        setSalesData(formatted)
        setSalesTotal(salesRes.data.total || {
          revenue: formatted.reduce((s, d) => s + d.revenue, 0),
          paid: formatted.reduce((s, d) => s + d.paid, 0),
          unpaid: formatted.reduce((s, d) => s + d.unpaid, 0),
          count: formatted.reduce((s, d) => s + d.count, 0)
        })
      }

      // Process Revenue Data
      if (revenueRes.data?.success) {
        const formatted = (revenueRes.data.data || []).map(item => ({
          name: item.period || 'N/A',
          revenue: parseFloat(item.total_revenue || 0),
          paid: parseFloat(item.total_paid || 0),
          unpaid: parseFloat(item.total_unpaid || 0),
          count: parseInt(item.invoice_count || 0)
        }))
        setRevenueData(formatted)
        setRevenueTotal(revenueRes.data.total || {
          revenue: formatted.reduce((s, d) => s + d.revenue, 0),
          paid: formatted.reduce((s, d) => s + d.paid, 0),
          unpaid: formatted.reduce((s, d) => s + d.unpaid, 0),
          invoices: formatted.reduce((s, d) => s + d.count, 0)
        })
      }

      // Process Project Status Data
      if (projectsRes.data?.success) {
        const formatted = (projectsRes.data.data || []).map(item => ({
          name: item.status || 'Unknown',
          value: parseInt(item.count || 0),
          budget: parseFloat(item.total_budget || 0)
        }))
        setProjectStatusData(formatted)
        setProjectsList(projectsRes.data.projects || [])
        setProjectTotal(projectsRes.data.total || {
          projects: formatted.reduce((s, d) => s + d.value, 0),
          budget: formatted.reduce((s, d) => s + d.budget, 0)
        })
      }

      // Process Employee Performance Data
      if (employeesRes.data?.success) {
        setEmployeePerformanceData(employeesRes.data.data || [])
        setEmployeeSummary(employeesRes.data.summary || {
          total_employees: 0, excellent: 0, good: 0, fair: 0, average: 0,
          total_tasks: 0, total_completed: 0, total_projects: 0, total_hours: 0
        })
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId, filterType, selectedClient, selectedEmployee, dateRange])

  const handleExportCSV = () => {
    // Generate CSV for Sales Data
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Category,Month/Period,Revenue,Paid,Unpaid,Count\n"

    // Add Sales Data
    salesData.forEach(row => {
      csvContent += `Sales,${row.name},${row.revenue},${row.paid},${row.unpaid},${row.count}\n`
    })

    // Add Revenue Data
    revenueData.forEach(row => {
      csvContent += `Revenue,${row.name},${row.revenue},${row.paid},${row.unpaid},${row.count}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `business_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const escapeHtml = (value) => {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
    }

    const today = new Date().toISOString().split('T')[0]

    const salesRows = (salesData || [])
      .map((row) => {
        return `
          <tr>
            <td>${escapeHtml(row.name)}</td>
            <td style="text-align:right">$${Number(row.revenue || 0).toLocaleString()}</td>
            <td style="text-align:right">$${Number(row.paid || 0).toLocaleString()}</td>
            <td style="text-align:right">$${Number(row.unpaid || 0).toLocaleString()}</td>
            <td style="text-align:right">${Number(row.count || 0).toLocaleString()}</td>
          </tr>
        `
      })
      .join('')

    const revenueRows = (revenueData || [])
      .map((row) => {
        return `
          <tr>
            <td>${escapeHtml(row.name)}</td>
            <td style="text-align:right">$${Number(row.revenue || 0).toLocaleString()}</td>
            <td style="text-align:right">$${Number(row.paid || 0).toLocaleString()}</td>
            <td style="text-align:right">$${Number(row.unpaid || 0).toLocaleString()}</td>
            <td style="text-align:right">${Number(row.count || 0).toLocaleString()}</td>
          </tr>
        `
      })
      .join('')

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Business Report ${escapeHtml(today)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin: 0 0 4px 0; }
            .meta { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
            h2 { font-size: 14px; margin: 18px 0 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
            th { background: #f9fafb; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Business Report</h1>
          <div class="meta">Generated: ${escapeHtml(today)}</div>

          <h2>Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Paid</th>
                <th>Unpaid</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              ${salesRows || '<tr><td colspan="5">No data</td></tr>'}
            </tbody>
          </table>

          <h2>Revenue</h2>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Paid</th>
                <th>Unpaid</th>
                <th>Invoices</th>
              </tr>
            </thead>
            <tbody>
              ${revenueRows || '<tr><td colspan="5">No data</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!printWindow) return

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Chart Color Palette
  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  // Custom Chart Components using Recharts
  const PremiumBarChart = ({ data, dataKey, color = '#3B82F6' }) => (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={(value) => `$${value >= 1000 ? (value / 1000) + 'k' : value}`}
        />
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
        />
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          barSize={40}
        />
      </ReBarChart>
    </ResponsiveContainer>
  )

  const PremiumPieChart = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </RePieChart>
    </ResponsiveContainer>
  )

  // Rating Badge Component
  const RatingBadge = ({ rating }) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-700',
      'Good': 'bg-blue-100 text-blue-700',
      'Fair': 'bg-yellow-100 text-yellow-700',
      'Average': 'bg-gray-100 text-gray-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[rating] || colors['Average']}`}>
        {rating}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">View and export business reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={fetchAllReports}
          >
            <IoRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            onClick={handleExportCSV}
          >
            <IoDocumentText size={18} />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2 shadow-lg shadow-blue-500/20"
            onClick={handleExportPDF}
          >
            <IoDownload size={18} />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <IoFilter size={20} className="text-blue-600" />
          <span className="font-medium text-gray-900">Filter Reports</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report For
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setSelectedClient('')
                setSelectedEmployee('')
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="all">All (Company Wide)</option>
              <option value="client">Client Specific</option>
              <option value="employee">Employee Specific</option>
            </select>
          </div>

          {/* Client Filter */}
          {filterType === 'client' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <IoBusiness className="text-blue-500" size={16} />
                  Select Client
                </span>
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name || client.client_name || client.company_name || `Client #${client.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Employee Filter */}
          {filterType === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <IoPerson className="text-green-500" size={16} />
                  Select Employee
                </span>
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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

          {/* Date Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Active Filter Badge */}
        {(filterType !== 'all' || dateRange.startDate) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filterType === 'client' && selectedClient && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <IoBusiness size={14} />
                {clients.find(c => c.id == selectedClient)?.name || clients.find(c => c.id == selectedClient)?.client_name || 'Client'}
                <button onClick={() => setSelectedClient('')} className="ml-1 hover:text-blue-900">×</button>
              </span>
            )}
            {filterType === 'employee' && selectedEmployee && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <IoPerson size={14} />
                {employees.find(e => e.id == selectedEmployee)?.name || employees.find(e => e.id == selectedEmployee)?.email || 'Employee'}
                <button onClick={() => setSelectedEmployee('')} className="ml-1 hover:text-green-900">×</button>
              </span>
            )}
            {dateRange.startDate && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {dateRange.startDate} - {dateRange.endDate || 'Today'}
                <button onClick={() => setDateRange({ startDate: '', endDate: '' })} className="ml-1 hover:text-gray-900">×</button>
              </span>
            )}
          </div>
        )}
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading reports...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Report */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <IoTrendingUp className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Sales Report</h3>
            </div>
            <div className="h-64 mt-2">
              {salesData.length > 0 ? (
                <PremiumBarChart data={salesData} dataKey="revenue" color="#3B82F6" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-xl border border-dashed">
                  <IoBarChart size={48} className="mb-2 opacity-50" />
                  <p className="font-medium">No sales data available</p>
                  <p className="text-sm">Create invoices to see sales data</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">${(salesTotal.revenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${(salesTotal.paid || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Paid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">${(salesTotal.unpaid || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Unpaid</p>
              </div>
            </div>
          </Card>

          {/* Revenue Report */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <IoBarChart className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Report</h3>
            </div>
            <div className="h-64 mt-2">
              {revenueData.length > 0 ? (
                <PremiumBarChart data={revenueData} dataKey="revenue" color="#10B981" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-xl border border-dashed">
                  <IoBarChart size={48} className="mb-2 opacity-50" />
                  <p className="font-medium">No revenue data available</p>
                  <p className="text-sm">Create invoices to see revenue data</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{revenueTotal.invoices || 0}</p>
                <p className="text-xs text-gray-500">Total Invoices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">${(revenueTotal.revenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </Card>

          {/* Project Status */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <IoFolder className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
            </div>
            <div className="h-64 mt-2">
              {projectStatusData.length > 0 && projectStatusData.some(d => d.value > 0) ? (
                <PremiumPieChart data={projectStatusData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50 rounded-xl border border-dashed">
                  <IoPieChart size={48} className="mb-2 opacity-50" />
                  <p className="font-medium">No project data available</p>
                  <p className="text-sm">Create projects to see status data</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{projectTotal.projects || 0}</p>
                <p className="text-xs text-gray-500">Total Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${(projectTotal.budget || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Budget</p>
              </div>
            </div>

            {/* Projects List */}
            {projectsList.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Projects</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {projectsList.slice(0, 5).map((project, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{project.project_name || 'Project'}</span>
                        <span className="text-gray-500 ml-2">({project.client_name || project.client_company_name || 'No client'})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${project.status?.toLowerCase().includes('completed') ? 'bg-green-100 text-green-700' :
                        project.status?.toLowerCase().includes('progress') ? 'bg-blue-100 text-blue-700' :
                          project.status?.toLowerCase().includes('hold') ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {project.status || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Employee Performance */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <IoPeople className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Employee Performance</h3>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-600">{employeeSummary.total_employees || 0}</p>
                <p className="text-xs text-gray-500">Employees</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">{employeeSummary.total_completed || 0}</p>
                <p className="text-xs text-gray-500">Tasks Done</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold text-purple-600">{employeeSummary.total_projects || 0}</p>
                <p className="text-xs text-gray-500">Projects</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold text-orange-600">{employeeSummary.total_hours || 0}h</p>
                <p className="text-xs text-gray-500">Hours</p>
              </div>
            </div>

            <div className="h-64 overflow-y-auto">
              {employeePerformanceData.length > 0 ? (
                <div className="space-y-3">
                  {employeePerformanceData.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {(emp.name || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.name || 'Employee'}</p>
                          <p className="text-xs text-gray-500">{emp.designation || emp.email || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <IoCheckmarkCircle className="text-green-500" size={14} />
                            <span className="font-semibold text-green-600">{emp.tasks_completed || 0}</span>
                          </div>
                          <p className="text-xs text-gray-400">Done</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <IoTime className="text-blue-500" size={14} />
                            <span className="font-semibold text-blue-600">{emp.tasks_in_progress || 0}</span>
                          </div>
                          <p className="text-xs text-gray-400">Progress</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <IoHourglass className="text-orange-500" size={14} />
                            <span className="font-semibold text-orange-600">{emp.tasks_pending || 0}</span>
                          </div>
                          <p className="text-xs text-gray-400">Pending</p>
                        </div>
                        <RatingBadge rating={emp.rating} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <IoPeople size={48} className="mb-2 opacity-50" />
                  <p>No employee data available</p>
                  <p className="text-sm">Add employees to see performance data</p>
                </div>
              )}
            </div>

            {/* Rating Summary */}
            {employeePerformanceData.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1 text-sm">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Excellent: {employeeSummary.excellent || 0}
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    Good: {employeeSummary.good || 0}
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    Fair: {employeeSummary.fair || 0}
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    Average: {employeeSummary.average || 0}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default Reports
