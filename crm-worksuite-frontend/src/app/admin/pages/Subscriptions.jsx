import { useState, useEffect } from 'react'
import { subscriptionsAPI, clientsAPI } from '../../../api'
import AddButton from '../../../components/ui/AddButton'
import EnhancedDataTable from '../../../components/ui/EnhancedDataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { IoCreate, IoTrash } from 'react-icons/io5'

const Subscriptions = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [formData, setFormData] = useState({
    client: '',
    plan: '',
    amount: '',
    billingCycle: 'Monthly',
    status: 'Active',
    nextBillingDate: '',
  })

  const [subscriptions, setSubscriptions] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
    fetchClients()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await subscriptionsAPI.getAll({  })
      if (response.data.success) {
        setSubscriptions(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      alert(error.response?.data?.error || 'Failed to fetch subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({  })
      if (response.data.success) {
        const clientNames = response.data.data.map(c => c.company_name || c.name)
        setClients(clientNames)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const columns = [
    { key: 'client', label: 'Client' },
    { key: 'plan', label: 'Plan' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `$${value}/mo`,
    },
    { key: 'billingCycle', label: 'Billing Cycle' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'default'}>{value}</Badge>
      ),
    },
    { key: 'nextBillingDate', label: 'Next Billing Date' },
  ]

  const handleAdd = () => {
    setFormData({
      client: '',
      plan: '',
      amount: '',
      billingCycle: 'Monthly',
      status: 'Active',
      nextBillingDate: '',
    })
    setIsAddModalOpen(true)
  }

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription)
    setFormData({
      client: subscription.client,
      plan: subscription.plan,
      amount: subscription.amount,
      billingCycle: subscription.billingCycle,
      status: subscription.status,
      nextBillingDate: subscription.nextBillingDate,
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.client || !formData.plan) {
      alert('Client and plan are required')
      return
    }

    try {
      setSaving(true)
      const subscriptionData = {
        client_id: formData.client, // Should be client_id, not name
        plan: formData.plan,
        amount: parseFloat(formData.amount) || 0,
        billing_cycle: formData.billingCycle,
        status: formData.status,
        next_billing_date: formData.nextBillingDate,
      }

      if (isEditModalOpen && selectedSubscription) {
        const response = await subscriptionsAPI.update(selectedSubscription.id, subscriptionData)
        if (response.data.success) {
          alert('Subscription updated successfully!')
          setIsEditModalOpen(false)
          await fetchSubscriptions()
        }
      } else {
        const response = await subscriptionsAPI.create(subscriptionData)
        if (response.data.success) {
          alert('Subscription created successfully!')
          setIsAddModalOpen(false)
          await fetchSubscriptions()
        }
      }
    } catch (error) {
      console.error('Failed to save subscription:', error)
      alert(error.response?.data?.error || 'Failed to save subscription')
    } finally {
      setSaving(false)
    }
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="p-2 text-warning hover:bg-warning hover:bg-opacity-10 rounded transition-colors"
      >
        <IoCreate size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (window.confirm(`Cancel subscription for ${row.client}?`)) {
            setSubscriptions(subscriptions.filter((s) => s.id !== row.id))
          }
        }}
        className="p-2 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
      >
        <IoTrash size={18} />
      </button>
    </div>
  )

  if (loading && subscriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Subscriptions</h1>
          <p className="text-secondary-text mt-1">Manage client subscriptions</p>
        </div>
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Subscriptions</h1>
          <p className="text-secondary-text mt-1">Manage client subscriptions</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Subscription" />
      </div>

      <EnhancedDataTable
        columns={columns}
        data={subscriptions}
        searchPlaceholder="Search subscriptions..."
        filters={true}
        filterConfig={[
          { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Cancelled', 'Suspended'] },
          { key: 'plan', label: 'Plan', type: 'select', options: ['Basic', 'Professional', 'Enterprise'] },
          { key: 'billingCycle', label: 'Billing Cycle', type: 'select', options: ['Monthly', 'Quarterly', 'Yearly'] },
          { key: 'nextBillingDate', label: 'Next Billing Date', type: 'daterange' },
        ]}
        quickFilters={[
          { label: 'All Records', filter: {} },
          { label: 'Active', filter: { status: 'Active' } },
          { label: 'This Month', filter: {} },
        ]}
        actions={actions}
        bulkActions={true}
        module="subscriptions"
        exportOptions={true}
      />

      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
        }}
        title={isAddModalOpen ? 'Add New Subscription' : 'Edit Subscription'}
      >
        <div className="space-y-4">
          <Input
            label="Client"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          />
          <Input
            label="Plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
          />
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Billing Cycle
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
            >
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <Input
            label="Next Billing Date"
            type="date"
            value={formData.nextBillingDate}
            onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
          />
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
              {saving ? 'Saving...' : (isAddModalOpen ? 'Save Subscription' : 'Update Subscription')}
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Subscriptions
