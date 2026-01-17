import { useCallback, useEffect, useState } from 'react'
import { reportsAPI, clientsAPI, employeesAPI, projectsAPI } from '../../../api'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import {
  IoDownload, IoRefresh, IoPieChart, IoBarChart, IoPeople, IoFolder, IoTrendingUp,
  IoBusiness, IoPerson, IoFilter, IoCheckmarkCircle, IoTime, IoHourglass, IoDocumentText,
  IoCash, IoReceipt, IoCalendar, IoSearch, IoPrint, IoChevronDown
} from 'react-icons/io5'
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'

const Reports = () => {
  const companyId = localStorage.getItem('companyId') || '1'
  const currentYear = new Date().getFullYear()

  // Main tab state
  const [activeTab, setActiveTab] = useState('expenses')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter states
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedView, setSelectedView] = useState('yearly')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')

  // Data states
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])

  // Report data states
  const [expensesData, setExpensesData] = useState({ data: [], chartData: {}, totals: {} })
  const [invoicesSummaryData, setInvoicesSummaryData] = useState({ data: [], totals: {} })
  const [invoiceDetailsData, setInvoiceDetailsData] = useState({ data: [], totals: {} })
  const [incomeExpenseData, setIncomeExpenseData] = useState({ data: [], summary: {} })
  const [paymentsSummaryData, setPaymentsSummaryData] = useState({ data: [], totals: {} })
  const [timesheetsData, setTimesheetsData] = useState({ data: [], totals: {} })
  const [projectsReportData, setProjectsReportData] = useState({ data: [], totals: {} })

  // Sub-view states
  const [expensesView, setExpensesView] = useState('yearly')
  const [invoicesView, setInvoicesView] = useState('yearly')
  const [paymentsView, setPaymentsView] = useState('monthly')
  const [timesheetsView, setTimesheetsView] = useState('details')
  const [projectsView, setProjectsView] = useState('team')

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  useEffect(() => {
    fetchDropdownData()
  }, [])

  useEffect(() => {
    fetchReportData()
  }, [activeTab, selectedYear, selectedView, dateRange, selectedClient, selectedEmployee, selectedProject, selectedCurrency, selectedPaymentMethod, expensesView, invoicesView, paymentsView, timesheetsView, projectsView])

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, employeesRes, projectsRes] = await Promise.all([
        clientsAPI.getAll({ company_id: companyId }).catch(() => ({ data: { data: [] } })),
        employeesAPI.getAll({ company_id: companyId }).catch(() => ({ data: { data: [] } })),
        projectsAPI.getAll({ company_id: companyId }).catch(() => ({ data: { data: [] } }))
      ])
      setClients(clientsRes.data?.data || clientsRes.data || [])
      setEmployees(employeesRes.data?.data || employeesRes.data || [])
      setProjects(projectsRes.data?.data || projectsRes.data || [])
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
    }
  }

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    const baseParams = {
      company_id: companyId,
      year: selectedYear,
      ...(dateRange.start && { start_date: dateRange.start }),
      ...(dateRange.end && { end_date: dateRange.end }),
      ...(selectedClient && { client_id: selectedClient }),
      ...(selectedCurrency && { currency: selectedCurrency })
    }

    try {
      switch (activeTab) {
        case 'expenses':
          const expRes = await reportsAPI.getExpensesSummary({ ...baseParams, view: expensesView })
          if (expRes.data?.success) setExpensesData(expRes.data)
          break
        case 'invoices-summary':
          const invSumRes = await reportsAPI.getInvoicesSummary({ ...baseParams, view: invoicesView })
          if (invSumRes.data?.success) setInvoicesSummaryData(invSumRes.data)
          break
        case 'invoice-details':
          const invDetRes = await reportsAPI.getInvoiceDetails(baseParams)
          if (invDetRes.data?.success) setInvoiceDetailsData(invDetRes.data)
          break
        case 'income-expense':
          const incExpRes = await reportsAPI.getIncomeVsExpenses({ ...baseParams, project_id: selectedProject })
          if (incExpRes.data?.success) setIncomeExpenseData(incExpRes.data)
          break
        case 'payments':
          const payRes = await reportsAPI.getPaymentsSummary({ ...baseParams, view: paymentsView, payment_method: selectedPaymentMethod })
          if (payRes.data?.success) setPaymentsSummaryData(payRes.data)
          break
        case 'timesheets':
          const timeRes = await reportsAPI.getTimesheetsReport({ ...baseParams, view: timesheetsView, user_id: selectedEmployee, project_id: selectedProject })
          if (timeRes.data?.success) setTimesheetsData(timeRes.data)
          break
        case 'projects':
          const projRes = await reportsAPI.getProjectsReport({ ...baseParams, view: projectsView })
          if (projRes.data?.success) setProjectsReportData(projRes.data)
          break
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId, activeTab, selectedYear, dateRange, selectedClient, selectedEmployee, selectedProject, selectedCurrency, selectedPaymentMethod, expensesView, invoicesView, paymentsView, timesheetsView, projectsView])

  const handleExport = (type = 'excel') => {
    let data = []
    let filename = `report_${activeTab}_${new Date().toISOString().split('T')[0]}`

    switch (activeTab) {
      case 'expenses': data = expensesData.data; break
      case 'invoices-summary': data = invoicesSummaryData.data; break
      case 'invoice-details': data = invoiceDetailsData.data; break
      case 'payments': data = paymentsSummaryData.data; break
      case 'timesheets': data = timesheetsData.data; break
      case 'projects': data = projectsReportData.data; break
      default: data = []
    }

    if (type === 'excel') {
      const headers = data.length > 0 ? Object.keys(data[0]).join(',') : ''
      const rows = data.map(row => Object.values(row).join(',')).join('\n')
      const csv = `${headers}\n${rows}`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.csv`
      a.click()
    } else {
      window.print()
    }
  }

  const formatCurrency = (value) => `$${parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Filter data by search term
  const filterData = (data) => {
    if (!searchTerm) return data
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  const tabs = [
    { id: 'expenses', label: 'Expenses Summary', icon: IoCash },
    { id: 'invoices-summary', label: 'Invoices Summary', icon: IoReceipt },
    { id: 'invoice-details', label: 'Invoice Details', icon: IoDocumentText },
    { id: 'income-expense', label: 'Income vs Expenses', icon: IoTrendingUp },
    { id: 'payments', label: 'Payments Summary', icon: IoCash },
    { id: 'timesheets', label: 'Timesheets', icon: IoTime },
    { id: 'projects', label: 'Projects Report', icon: IoFolder }
  ]

  // Render functions for each report type
  const renderExpensesSummary = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['yearly', 'monthly', 'custom', 'yearly-chart', 'category-chart'].map(view => (
          <button
            key={view}
            onClick={() => setExpensesView(view)}
            className={`px-3 py-1.5 text-sm rounded-lg ${expensesView === view ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {view.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {expensesView.includes('chart') ? (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{expensesView === 'yearly-chart' ? 'Yearly Expenses Chart' : 'Expenses by Category'}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {expensesView === 'yearly-chart' ? (
                <ReBarChart data={expensesData.chartData?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              ) : (
                <RePieChart>
                  <Pie data={expensesData.chartData?.category || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {(expensesData.chartData?.category || []).map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                </RePieChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <DataTable
            columns={[
              { key: 'category', header: 'Category' },
              { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row?.amount) },
              { key: 'tax', header: 'TAX', render: (row) => formatCurrency(row?.tax) },
              { key: 'second_tax', header: 'Second TAX', render: (row) => formatCurrency(row?.second_tax) },
              { key: 'total', header: 'Total', render: (row) => formatCurrency(row?.total) }
            ]}
            data={filterData(expensesData.data || [])}
            searchable={false}
          />
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-end gap-8 font-semibold">
            <span>Total: {formatCurrency(expensesData.totals?.total)}</span>
          </div>
        </Card>
      )}
    </div>
  )

  const renderInvoicesSummary = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['yearly', 'monthly', 'custom'].map(view => (
          <button
            key={view}
            onClick={() => setInvoicesView(view)}
            className={`px-3 py-1.5 text-sm rounded-lg ${invoicesView === view ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <DataTable
          columns={[
            { key: 'client_name', header: 'Client Name' },
            { key: 'count', header: 'Count' },
            { key: 'invoice_total', header: 'Invoice Total', render: (row) => formatCurrency(row?.invoice_total) },
            { key: 'discount', header: 'Discount', render: (row) => formatCurrency(row?.discount) },
            { key: 'tax', header: 'TAX', render: (row) => formatCurrency(row?.tax) },
            { key: 'second_tax', header: 'Second TAX', render: (row) => formatCurrency(row?.second_tax) },
            { key: 'tds', header: 'TDS', render: (row) => formatCurrency(row?.tds) },
            { key: 'payment_received', header: 'Payment Received', render: (row) => formatCurrency(row?.payment_received) },
            { key: 'due', header: 'Due', render: (row) => formatCurrency(row?.due) }
          ]}
          data={filterData(invoicesSummaryData.data || [])}
          searchable={false}
        />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-end gap-6 text-sm font-semibold">
          <span>Total: {formatCurrency(invoicesSummaryData.totals?.invoice_total)}</span>
          <span>Received: {formatCurrency(invoicesSummaryData.totals?.payment_received)}</span>
          <span>Due: {formatCurrency(invoicesSummaryData.totals?.due)}</span>
        </div>
      </Card>
    </div>
  )

  const renderInvoiceDetails = () => (
    <Card className="p-4">
      <DataTable
        columns={[
          { key: 'invoice_number', header: 'Invoice ID' },
          { key: 'client_name', header: 'Client' },
          { key: 'vat_gst', header: 'VAT/GST' },
          { key: 'bill_date', header: 'Bill Date' },
          { key: 'due_date', header: 'Due Date' },
          { key: 'invoice_total', header: 'Invoice Total', render: (row) => formatCurrency(row?.invoice_total) },
          { key: 'discount', header: 'Discount', render: (row) => formatCurrency(row?.discount) },
          { key: 'tax', header: 'TAX', render: (row) => formatCurrency(row?.tax) },
          { key: 'payment_received', header: 'Payment Received', render: (row) => formatCurrency(row?.payment_received) },
          { key: 'due', header: 'Due', render: (row) => formatCurrency(row?.due) },
          {
            key: 'status', header: 'Status', render: (row) => (
              <span className={`px-2 py-1 rounded text-xs font-medium ${row?.status === 'Paid' ? 'bg-green-100 text-green-700' :
                row?.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                  row?.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {row?.status || '-'}
              </span>
            )
          }
        ]}
        data={filterData(invoiceDetailsData.data || [])}
        searchable={false}
      />
      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-end gap-6 text-sm font-semibold">
        <span>Total: {formatCurrency(invoiceDetailsData.totals?.invoice_total)}</span>
        <span>Due: {formatCurrency(invoiceDetailsData.totals?.due)}</span>
      </div>
    </Card>
  )

  const renderIncomeVsExpenses = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(incomeExpenseData.summary?.total_income)}</p>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(incomeExpenseData.summary?.total_expense)}</p>
        </Card>
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-gray-600">Profit</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(incomeExpenseData.summary?.profit)}</p>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-gray-600">Profit %</p>
          <p className="text-2xl font-bold text-purple-600">{incomeExpenseData.summary?.profit_percentage || 0}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Income vs Expenses Chart</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeExpenseData.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="#10B98133" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" fill="#EF444433" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )

  const renderPaymentsSummary = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['monthly', 'clients'].map(view => (
          <button
            key={view}
            onClick={() => setPaymentsView(view)}
            className={`px-3 py-1.5 text-sm rounded-lg ${paymentsView === view ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {view === 'monthly' ? 'Monthly Summary' : 'Clients Summary'}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <DataTable
          columns={paymentsView === 'monthly' ? [
            { key: 'period', header: 'Month' },
            { key: 'count', header: 'Count' },
            { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row?.amount) }
          ] : [
            { key: 'client_name', header: 'Client' },
            { key: 'count', header: 'Count' },
            { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row?.amount) }
          ]}
          data={filterData(paymentsSummaryData.data || [])}
          searchable={false}
        />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-end gap-6 text-sm font-semibold">
          <span>Total Count: {paymentsSummaryData.totals?.count || 0}</span>
          <span>Total Amount: {formatCurrency(paymentsSummaryData.totals?.amount)}</span>
        </div>
      </Card>
    </div>
  )

  const renderTimesheets = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['details', 'summary', 'chart', 'daily'].map(view => (
          <button
            key={view}
            onClick={() => setTimesheetsView(view)}
            className={`px-3 py-1.5 text-sm rounded-lg ${timesheetsView === view ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {view === 'daily' ? 'Daily Activity' : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {timesheetsView === 'chart' ? (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Time Logged by Project</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={timesheetsData.data || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                  {(timesheetsData.data || []).map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} hours`} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <DataTable
            columns={timesheetsView === 'details' ? [
              { key: 'member', header: 'Member' },
              { key: 'project', header: 'Project' },
              { key: 'client', header: 'Client' },
              { key: 'task', header: 'Task' },
              { key: 'start_time', header: 'Start Time' },
              { key: 'end_time', header: 'End Time' },
              { key: 'total', header: 'Total', render: (row) => `${row?.total || 0}h` },
              { key: 'note', header: 'Note' }
            ] : timesheetsView === 'summary' ? [
              { key: 'member', header: 'Member' },
              { key: 'entries', header: 'Entries' },
              { key: 'total_hours', header: 'Total Hours', render: (row) => `${row?.total_hours || 0}h` }
            ] : [
              { key: 'date', header: 'Date' },
              { key: 'member', header: 'Member' },
              { key: 'total_hours', header: 'Total Hours', render: (row) => `${row?.total_hours || 0}h` },
              { key: 'entries', header: 'Entries' }
            ]}
            data={filterData(timesheetsData.data || [])}
            searchable={false}
          />
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-end gap-6 text-sm font-semibold">
            <span>Total Hours: {timesheetsData.totals?.total_hours || 0}h</span>
            <span>Total Entries: {timesheetsData.totals?.total_entries || 0}</span>
          </div>
        </Card>
      )}
    </div>
  )

  const renderProjectsReport = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['team', 'clients'].map(view => (
          <button
            key={view}
            onClick={() => setProjectsView(view)}
            className={`px-3 py-1.5 text-sm rounded-lg ${projectsView === view ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {view === 'team' ? 'Team Members Summary' : 'Clients Summary'}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <DataTable
          columns={projectsView === 'team' ? [
            { key: 'team_member', header: 'Team Member' },
            { key: 'open_projects', header: 'Open Projects' },
            { key: 'completed_projects', header: 'Completed Projects' },
            { key: 'hold_projects', header: 'Hold Projects' },
            { key: 'open_tasks', header: 'Open Tasks' },
            { key: 'completed_tasks', header: 'Completed Tasks' },
            { key: 'total_time_logged', header: 'Total Time Logged', render: (row) => `${row?.total_time_logged || 0}h` }
          ] : [
            { key: 'client_name', header: 'Client' },
            { key: 'open_projects', header: 'Open Projects' },
            { key: 'completed_projects', header: 'Completed Projects' },
            { key: 'hold_projects', header: 'Hold Projects' },
            { key: 'total_budget', header: 'Total Budget', render: (row) => formatCurrency(row?.total_budget) }
          ]}
          data={filterData(projectsReportData.data || [])}
          searchable={false}
        />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex justify-end gap-6 text-sm font-semibold">
          <span>Open: {projectsReportData.totals?.open_projects || 0}</span>
          <span>Completed: {projectsReportData.totals?.completed_projects || 0}</span>
          <span>Hold: {projectsReportData.totals?.hold_projects || 0}</span>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Finance</h1>
          <p className="text-gray-500">View and export business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReportData} className="flex items-center gap-2">
            <IoRefresh size={18} /> Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
            <IoDocumentText size={18} /> Excel
          </Button>
          <Button variant="primary" onClick={() => handleExport('print')} className="flex items-center gap-2">
            <IoPrint size={18} /> Print
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <IoFilter size={20} className="text-blue-600" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Client Filter */}
          {['invoices-summary', 'invoice-details', 'timesheets'].includes(activeTab) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.name || `Client #${c.id}`}</option>)}
              </select>
            </div>
          )}

          {/* Member Filter */}
          {activeTab === 'timesheets' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Members</option>
                {employees.map(e => <option key={e.id} value={e.user_id || e.id}>{e.name || e.email || `Employee #${e.id}`}</option>)}
              </select>
            </div>
          )}

          {/* Project Filter */}
          {['income-expense', 'timesheets'].includes(activeTab) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name || `Project #${p.id}`}</option>)}
              </select>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading report...</span>
        </div>
      ) : (
        <>
          {activeTab === 'expenses' && renderExpensesSummary()}
          {activeTab === 'invoices-summary' && renderInvoicesSummary()}
          {activeTab === 'invoice-details' && renderInvoiceDetails()}
          {activeTab === 'income-expense' && renderIncomeVsExpenses()}
          {activeTab === 'payments' && renderPaymentsSummary()}
          {activeTab === 'timesheets' && renderTimesheets()}
          {activeTab === 'projects' && renderProjectsReport()}
        </>
      )}
    </div>
  )
}

export default Reports
