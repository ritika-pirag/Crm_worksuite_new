import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import DataTable from '../../../components/ui/DataTable'
import BarChart from '../../../components/charts/BarChart'
import DonutChart from '../../../components/charts/DonutChart'
import LineChart from '../../../components/charts/LineChart'
import axiosInstance from '../../../api/axiosInstance'
import { 
  IoBusiness,
  IoPeople,
  IoPerson,
  IoFolderOpen,
  IoReceipt,
  IoCash,
  IoArrowForward,
  IoRefresh,
  IoStatsChart,
  IoCube,
  IoCloseCircle,
  IoCheckmarkCircle,
  IoTime,
  IoCalendar,
  IoDocumentText,
  IoWarning,
  IoCheckmark,
  IoEye,
  IoAdd,
  IoArrowUp,
  IoArrowDown,
} from 'react-icons/io5'

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totals: {
      companies: 0,
      users: 0,
      clients: 0,
      projects: 0,
      invoices: 0,
      payments: 0,
      packages: 0,
      active_companies: 0,
      inactive_companies: 0,
      license_expired: 0
    },
    revenue: {
      total: 0,
      this_month: 0,
      last_month: 0,
      growth: 0
    },
    package_distribution: [],
    companies_growth: [],
    revenue_over_time: [],
    recent: {
      companies: [],
      users: []
    }
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/stats')
      if (response.data.success) {
        const data = response.data.data
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate trend percentages (mock for now, can be enhanced with historical data)
  const calculateTrend = (current, previous = 0) => {
    if (previous === 0) return { value: '+0%', up: null }
    const change = ((current - previous) / previous * 100).toFixed(0)
    return {
      value: `${change >= 0 ? '+' : ''}${change}%`,
      up: change >= 0
    }
  }

  const statCards = [
    {
      label: 'Total Companies',
      value: stats.totals.companies,
      icon: IoBusiness,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      path: '/app/superadmin/companies',
      trend: calculateTrend(stats.totals.companies, stats.totals.companies - 1)
    },
    {
      label: 'License Expired',
      value: stats.totals.license_expired,
      icon: IoCloseCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      path: '/app/superadmin/packages',
      trend: calculateTrend(stats.totals.license_expired, stats.totals.license_expired + 1)
    },
    {
      label: 'Total Packages',
      value: stats.totals.packages,
      icon: IoCube,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      path: '/app/superadmin/packages',
      trend: { value: `+${stats.totals.packages}`, up: true }
    },
    {
      label: 'Active Companies',
      value: stats.totals.active_companies,
      icon: IoCheckmarkCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      path: '/app/superadmin/companies',
      trend: calculateTrend(stats.totals.active_companies, stats.totals.active_companies - 1)
    },
    {
      label: 'Inactive Companies',
      value: stats.totals.inactive_companies,
      icon: IoBusiness,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      path: '/app/superadmin/companies',
      trend: { value: '0%', up: null }
    },
    {
      label: 'Total Users',
      value: stats.totals.users,
      icon: IoPeople,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      path: '/app/superadmin/users',
      trend: calculateTrend(stats.totals.users, stats.totals.users - 1)
    },
    {
      label: 'Total Clients',
      value: stats.totals.clients,
      icon: IoPerson,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      path: '/app/superadmin/companies',
      trend: calculateTrend(stats.totals.clients, stats.totals.clients - 1)
    },
    {
      label: 'Total Projects',
      value: stats.totals.projects,
      icon: IoFolderOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      path: '/app/superadmin/companies',
      trend: calculateTrend(stats.totals.projects, stats.totals.projects - 1)
    },
    {
      label: 'Total Revenue',
      value: `$${(stats.revenue.total / 1000).toFixed(1)}K`,
      icon: IoCash,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      path: '/app/superadmin/billing',
      trend: {
        value: `${stats.revenue.growth >= 0 ? '+' : ''}${stats.revenue.growth}%`,
        up: stats.revenue.growth >= 0
      }
    },
    {
      label: 'Total Invoices',
      value: stats.totals.invoices,
      icon: IoReceipt,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      path: '/app/superadmin/billing',
      trend: calculateTrend(stats.totals.invoices, stats.totals.invoices - 1)
    }
  ]

  const recentCompaniesColumns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Company Name',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.logo ? (
            <img src={row.logo} alt={value} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{value?.charAt(0)?.toUpperCase() || 'C'}</span>
            </div>
          )}
          <span className="font-medium text-primary-text">{value || 'N/A'}</span>
        </div>
      )
    },
    { 
      key: 'package_name', 
      label: 'Package',
      render: (value) => (
        <Badge variant={value ? 'info' : 'default'} className="text-xs">
          {value || 'Default'}
        </Badge>
      )
    },
    {
      key: 'total_users',
      label: 'Users',
      render: (value) => value || 0
    },
    {
      key: 'total_clients',
      label: 'Clients',
      render: (value) => value || 0
    },
    {
      key: 'created_at',
      label: 'Registered Date',
      render: (value) => {
        if (!value) return 'N/A'
        const date = new Date(value)
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }
    },
    {
      key: 'is_deleted',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'danger' : 'success'} className="text-xs">
          {value ? 'Inactive' : 'Active'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/app/superadmin/companies/${row.id}`)
          }}
          className="text-primary-accent hover:text-primary-accent/80 transition-colors"
        >
          <IoEye size={18} />
        </button>
      )
    }
  ]

  // Prepare companies growth chart data (last 6 months)
  const prepareCompaniesGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()
    const data = []
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      
      // Find matching data from API
      const monthData = stats.companies_growth.find(g => {
        const growthMonth = new Date(g.month + '-01').getMonth()
        return growthMonth === monthIndex
      })
      
      data.push({
        name: monthName,
        value: monthData ? parseInt(monthData.count) : 0
      })
    }
    
    return data
  }

  // Prepare revenue chart data (last 6 months)
  const prepareRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()
    const data = []
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      
      // Find matching data from API
      const monthData = stats.revenue_over_time.find(r => {
        const revenueMonth = new Date(r.month + '-01').getMonth()
        return revenueMonth === monthIndex
      })
      
      data.push({
        name: monthName,
        value: monthData ? parseFloat(monthData.total_revenue) : 0
      })
    }
    
    return data
  }

  // Prepare package distribution data
  const preparePackageDistributionData = () => {
    if (!stats.package_distribution || stats.package_distribution.length === 0) {
      return [
        { name: 'Basic', value: 0 },
        { name: 'Professional', value: 0 },
        { name: 'Enterprise', value: 0 },
        { name: 'Custom', value: 0 }
      ]
    }
    
    return stats.package_distribution.map(pkg => ({
      name: pkg.package_name || 'Unnamed',
      value: parseInt(pkg.companies_count) || 0
    }))
  }

  const companiesChartData = prepareCompaniesGrowthData()
  const revenueChartData = prepareRevenueData()
  const packageDistributionData = preparePackageDistributionData()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">Super Admin Dashboard</h1>
          <p className="text-secondary-text mt-2">
            Complete overview of system-wide statistics and activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchStats}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <IoRefresh size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/app/superadmin/companies')}
            className="flex items-center gap-2"
          >
            <IoAdd size={18} />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className={`p-4 sm:p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-200 ${stat.bgColor}`}
              onClick={() => navigate(stat.path)}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.trend.up === true ? 'text-green-600' : 
                      stat.trend.up === false ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.trend.up === true ? <IoArrowUp size={14} /> : 
                       stat.trend.up === false ? <IoArrowDown size={14} /> : null}
                      {stat.trend.value}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-secondary-text mb-1">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                  {loading ? (
                    <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()
                  )}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Companies Growth Chart */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">Companies Growth</h3>
            <Button
              variant="ghost"
              onClick={() => navigate('/app/superadmin/companies')}
              className="text-sm"
            >
              View All
            </Button>
          </div>
          <div className="h-64">
            <BarChart 
              data={companiesChartData} 
              dataKey="value" 
              name="Companies" 
              height={250} 
              color="#3B82F6"
            />
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">Revenue Overview</h3>
            <Button
              variant="ghost"
              onClick={() => navigate('/app/superadmin/billing')}
              className="text-sm"
            >
              View Details
            </Button>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary-text">This Month</span>
              <span className="text-lg font-bold text-green-600">
                ${(stats.revenue.this_month / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-text">Last Month</span>
              <span className="text-base font-semibold text-gray-600">
                ${(stats.revenue.last_month / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
          <div className="h-48">
            <LineChart 
              data={revenueChartData} 
              dataKey="value" 
              name="Revenue" 
              height={200} 
            />
          </div>
        </Card>
      </div>

      {/* Package Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Package Distribution */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">Package Distribution</h3>
            <Button
              variant="ghost"
              onClick={() => navigate('/app/superadmin/packages')}
              className="text-sm"
            >
              Manage
            </Button>
          </div>
          <div className="h-48">
            <DonutChart data={packageDistributionData} height={200} />
          </div>
          <div className="mt-4 space-y-2">
            {packageDistributionData.map((pkg, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    idx === 0 ? 'bg-blue-500' :
                    idx === 1 ? 'bg-purple-500' :
                    idx === 2 ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-secondary-text">{pkg.name}</span>
                </div>
                <span className="font-semibold text-primary-text">{pkg.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Registered Companies */}
        <Card className="p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">Recent Registered Companies</h3>
            <Button
              variant="ghost"
              onClick={() => navigate('/app/superadmin/companies')}
              className="text-sm flex items-center gap-1"
            >
              View All
              <IoArrowForward size={16} />
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-secondary-text">Loading...</div>
          ) : stats.recent.companies.length === 0 ? (
            <div className="text-center py-8 text-secondary-text">
              <IoBusiness size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No companies registered yet</p>
              <Button
                variant="primary"
                onClick={() => navigate('/app/superadmin/companies')}
                className="mt-4"
              >
                Add First Company
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                data={stats.recent.companies}
                columns={recentCompaniesColumns}
                loading={false}
                onRowClick={(row) => navigate(`/app/superadmin/companies/${row.id}`)}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Recent Users */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-text">Recent Users</h3>
          <Button
            variant="ghost"
            onClick={() => navigate('/app/superadmin/users')}
            className="text-sm flex items-center gap-1"
          >
            View All
            <IoArrowForward size={16} />
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-secondary-text">Loading...</div>
        ) : stats.recent.users.length === 0 ? (
          <div className="text-center py-8 text-secondary-text">
            <IoPeople size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.recent.users.slice(0, 6).map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-primary-accent hover:shadow-md transition-all cursor-pointer bg-white"
                onClick={() => navigate(`/app/superadmin/users/${user.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-accent to-info flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-text truncate">{user.name || 'N/A'}</p>
                    <p className="text-xs text-secondary-text truncate">{user.email || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={user.status === 'Active' ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {user.status || 'Active'}
                      </Badge>
                      <span className="text-xs text-secondary-text">
                        {user.company_name || 'No Company'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/app/superadmin/companies')}
            className="flex flex-col items-center gap-2 py-4"
          >
            <IoBusiness size={24} className="text-primary-accent" />
            <span className="text-sm">Add Company</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/app/superadmin/packages')}
            className="flex flex-col items-center gap-2 py-4"
          >
            <IoCube size={24} className="text-primary-accent" />
            <span className="text-sm">Manage Packages</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/app/superadmin/billing')}
            className="flex flex-col items-center gap-2 py-4"
          >
            <IoReceipt size={24} className="text-primary-accent" />
            <span className="text-sm">View Billing</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/app/superadmin/users')}
            className="flex flex-col items-center gap-2 py-4"
          >
            <IoPeople size={24} className="text-primary-accent" />
            <span className="text-sm">Manage Users</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard
