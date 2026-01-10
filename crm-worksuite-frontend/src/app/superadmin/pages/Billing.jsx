import { useState, useEffect } from 'react'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import DataTable from '../../../components/ui/DataTable'
import axiosInstance from '../../../api/axiosInstance'
import { IoReceipt, IoBusiness, IoCash, IoSearch } from 'react-icons/io5'

const Billing = () => {
  const [loading, setLoading] = useState(true)
  const [billingData, setBillingData] = useState([])
  const [totals, setTotals] = useState({
    total_companies: 0,
    total_revenue: 0,
    total_users: 0,
    total_clients: 0
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/billing')
      if (response.data.success) {
        setBillingData(response.data.data.billing || [])
        setTotals(response.data.data.totals || totals)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = billingData.filter(item =>
    item.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'package_name', label: 'Package' },
    {
      key: 'price',
      label: 'Price',
      render: (value, row) => (
        <span className="font-semibold">
          ${value}/{row.billing_cycle === 'Monthly' ? 'mo' : 'yr'}
        </span>
      ),
    },
    {
      key: 'total_users',
      label: 'Users',
      render: (value) => <span>{value || 0}</span>,
    },
    {
      key: 'total_clients',
      label: 'Clients',
      render: (value) => <span>{value || 0}</span>,
    },
    {
      key: 'subscription_start',
      label: 'Start Date',
      render: (value) => (
        <span>{new Date(value).toLocaleDateString('en-GB')}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">Billing</h1>
          <p className="text-secondary-text mt-1">View billing information for all companies</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-text mb-2">Total Companies</p>
              <p className="text-3xl font-bold text-primary-text">{totals.total_companies}</p>
            </div>
            <IoBusiness size={32} className="text-primary-accent" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-text mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-primary-text">
                ${totals.total_revenue.toLocaleString()}
              </p>
            </div>
            <IoCash size={32} className="text-green-500" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-text mb-2">Total Users</p>
              <p className="text-3xl font-bold text-primary-text">{totals.total_users}</p>
            </div>
            <IoReceipt size={32} className="text-blue-500" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-text mb-2">Total Clients</p>
              <p className="text-3xl font-bold text-primary-text">{totals.total_clients}</p>
            </div>
            <IoReceipt size={32} className="text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Billing Table */}
      <Card className="p-0">
        <DataTable
          data={filteredData}
          columns={columns}
          loading={loading}
          emptyMessage="No billing data found"
        />
      </Card>
    </div>
  )
}

export default Billing

