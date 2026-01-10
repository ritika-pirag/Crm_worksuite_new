import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { paymentsAPI } from '../../../api'
import { IoEye, IoDownload } from 'react-icons/io5'  

const Payments = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId && companyId) {
      fetchPayments()
    }
  }, [userId, companyId])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentsAPI.getAll({
        company_id: companyId,
        client_id: userId
      })
      if (response.data.success) {
        const fetchedPayments = response.data.data || []
        const transformedPayments = fetchedPayments.map(pay => ({
          id: pay.id,
          paymentId: pay.payment_number || pay.paymentNumber || `PAY-${pay.id}`,
          invoice: pay.invoice_number || pay.invoiceNumber || `INV-${pay.invoice_id || pay.invoiceId}`,
          amount: parseFloat(pay.amount || 0),
          date: pay.payment_date ? new Date(pay.payment_date).toLocaleDateString() : 'N/A',
          mode: pay.payment_method || pay.paymentMethod || 'N/A',
          status: pay.status || 'Completed',
          ...pay
        }))
        setPayments(transformedPayments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'paymentId', label: 'Payment ID' },
    { key: 'invoice', label: 'Invoice' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `$${value.toLocaleString()}`,
    },
    { key: 'date', label: 'Date' },
    { key: 'mode', label: 'Payment Mode' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Completed' ? 'success' : 'warning'}>{value}</Badge>
      ),
    },
  ]

  const handleView = (payment) => {
    setSelectedPayment(payment)
    setIsViewModalOpen(true)
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="View Details"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          alert(`Downloading receipt for ${row.paymentId}...`)
        }}
        className="p-2 text-secondary-accent hover:bg-secondary-accent hover:bg-opacity-10 rounded transition-colors"
        title="Download Receipt"
      >
        <IoDownload size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Payments</h1>
        <p className="text-secondary-text mt-1">View your payment history</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading payments...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={payments}
          searchPlaceholder="Search payments..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Completed', 'Pending', 'Failed'] },
            { key: 'mode', label: 'Payment Mode', type: 'select', options: ['Bank Transfer', 'Credit Card', 'PayPal', 'Cash'] },
            { key: 'date', label: 'Date', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Payment ID</label>
              <p className="text-primary-text mt-1 text-base">{selectedPayment.paymentId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Invoice</label>
              <p className="text-primary-text mt-1 text-base">{selectedPayment.invoice}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Amount</label>
              <p className="text-primary-text mt-1 text-base">${selectedPayment.amount.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Date</label>
              <p className="text-primary-text mt-1 text-base">{selectedPayment.date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Payment Mode</label>
              <p className="text-primary-text mt-1 text-base">{selectedPayment.mode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge variant={selectedPayment.status === 'Completed' ? 'success' : 'warning'}>
                  {selectedPayment.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Payments
