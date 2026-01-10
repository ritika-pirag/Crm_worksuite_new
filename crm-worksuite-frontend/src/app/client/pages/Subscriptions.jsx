import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { subscriptionsAPI } from '../../../api'
import { IoRefresh, IoEye, IoReceipt } from 'react-icons/io5'

const Subscriptions = () => {
  const { user } = useAuth()
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const userId = user?.id || localStorage.getItem('userId')
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (companyId) {
      fetchSubscriptions()
    }
  }, [companyId, clientId, userId])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      // Use client_id if available, otherwise fallback to userId
      // Backend will filter subscriptions by client_id
      const actualClientId = clientId || userId
      const response = await subscriptionsAPI.getAll({
        company_id: companyId,
        client_id: actualClientId
      })
      if (response.data && response.data.success) {
        setSubscriptions(response.data.data || [])
      } else {
        setSubscriptions([])
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      'active': 'success',
      'inactive': 'warning',
      'cancelled': 'danger',
      'expired': 'danger',
      'pending': 'warning'
    }
    return <Badge variant={variants[status?.toLowerCase()] || 'default'}>{status || 'Unknown'}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  // Calculate total
  const totalAmount = subscriptions
    .filter(s => s.status?.toLowerCase() === 'active')
    .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)

  const columns = [
    { 
      key: 'subscription_id', 
      label: 'Subscription ID',
      render: (value, row) => (
        <span className="text-primary-accent font-medium">
          SUBSCRIPTION #{row.id}
        </span>
      )
    },
    { 
      key: 'title', 
      label: 'Title',
      render: (value, row) => (
        <span className="text-primary-accent">
          {value || row.plan_name || row.name || '-'}
        </span>
      )
    },
    { 
      key: 'first_billing_date', 
      label: 'First billing date',
      render: (value, row) => formatDate(value || row.start_date || row.created_at)
    },
    { 
      key: 'next_billing_date', 
      label: 'Next billing date',
      render: (value) => formatDate(value)
    },
    { 
      key: 'billing_cycle', 
      label: 'Repeat every',
      render: (value) => {
        if (value === 'monthly' || value === 'month') return '1 Month(s)'
        if (value === 'yearly' || value === 'year') return '1 Year(s)'
        if (value === 'weekly' || value === 'week') return '1 Week(s)'
        return value || '-'
      }
    },
    { 
      key: 'cycles', 
      label: 'Cycles',
      render: (value, row) => `${row.completed_cycles || 0}/${row.total_cycles || '∞'}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => formatCurrency(value)
    },
  ]

  const handleViewDetails = (subscription) => {
    // View subscription details - could open a modal in future
    const details = `
Subscription ID: #${subscription.id}
Plan: ${subscription.title || subscription.plan_name || subscription.plan || 'N/A'}
Amount: ${formatCurrency(subscription.amount)}
Billing Cycle: ${subscription.billing_cycle || 'N/A'}
Status: ${subscription.status || 'N/A'}
First Billing: ${formatDate(subscription.first_billing_date || subscription.created_at)}
Next Billing: ${formatDate(subscription.next_billing_date)}
Cycles: ${subscription.completed_cycles || 0}/${subscription.total_cycles || '∞'}
    `.trim()
    alert(details)
  }

  const handleCancelSubscription = async (subscription) => {
    if (!window.confirm(`Are you sure you want to cancel subscription "${subscription.title || subscription.plan_name || subscription.plan}"?`)) {
      return
    }

    try {
      const response = await subscriptionsAPI.cancel(subscription.id, {
        company_id: companyId
      })
      if (response.data && response.data.success) {
        alert('Subscription cancelled successfully!')
        await fetchSubscriptions()
      } else {
        alert(response.data?.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert(error.response?.data?.error || 'Failed to cancel subscription')
    }
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleViewDetails(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="View Details"
      >
        <IoEye size={18} />
      </button>
      {row.status?.toLowerCase() === 'active' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleCancelSubscription(row)
          }}
          className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
          title="Cancel Subscription"
        >
          <IoReceipt size={18} />
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Subscriptions</h1>
        <p className="text-secondary-text mt-1">View your active subscriptions</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <IoRefresh size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Subscriptions Found</h3>
          <p className="text-secondary-text">You don't have any active subscriptions at the moment.</p>
        </Card>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={subscriptions}
            searchPlaceholder="Search subscriptions..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No subscriptions found"
          />
          
          {/* Total Row */}
          <div className="flex justify-end">
            <div className="bg-gray-50 px-6 py-3 rounded-lg">
              <span className="text-secondary-text mr-4">Total (Active):</span>
              <span className="text-xl font-bold text-primary-text">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Subscriptions

