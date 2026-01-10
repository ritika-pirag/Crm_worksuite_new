import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import { creditNotesAPI } from '../../../api'
import { IoEye, IoDownload } from 'react-icons/io5'

const CreditNotes = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCreditNote, setSelectedCreditNote] = useState(null)
  const [creditNotes, setCreditNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId && companyId) {
      fetchCreditNotes()
    }
  }, [userId, companyId])

  const fetchCreditNotes = async () => {
    try {
      setLoading(true)
      // Get credit notes for this client
      const response = await creditNotesAPI.getAll({
        company_id: companyId,
        client_id: userId
      })
      if (response.data.success) {
        const creditNotesData = response.data.data || []
        const transformedCreditNotes = creditNotesData.map(cn => ({
          id: cn.id,
          creditNoteNo: cn.credit_note_number || cn.creditNoteNumber || `CN-${cn.id}`,
          invoice: cn.invoice_number || cn.related_invoice || 'N/A',
          amount: Math.abs(parseFloat(cn.total || cn.amount || 0)),
          date: cn.created_at ? new Date(cn.created_at).toLocaleDateString() : 'N/A',
          status: cn.status || 'Applied',
          ...cn
        }))
        setCreditNotes(transformedCreditNotes)
      }
    } catch (error) {
      console.error('Error fetching credit notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'creditNoteNo', label: 'Credit Note No' },
    { key: 'invoice', label: 'Invoice' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `$${value.toLocaleString()}`,
    },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Applied' ? 'success' : 'default'}>{value}</Badge>
      ),
    },
  ]

  const handleView = (creditNote) => {
    setSelectedCreditNote(creditNote)
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
          alert(`Downloading ${row.creditNoteNo}...`)
        }}
        className="p-2 text-secondary-accent hover:bg-secondary-accent hover:bg-opacity-10 rounded transition-colors"
        title="Download"
      >
        <IoDownload size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Credit Notes</h1>
        <p className="text-secondary-text mt-1">View your credit notes</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading credit notes...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={creditNotes}
          searchPlaceholder="Search credit notes..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Applied', 'Pending', 'Expired'] },
            { key: 'date', label: 'Date', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Credit Note Details"
      >
        {selectedCreditNote && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Credit Note No</label>
              <p className="text-primary-text mt-1">{selectedCreditNote.creditNoteNo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Invoice</label>
              <p className="text-primary-text mt-1">{selectedCreditNote.invoice}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Amount</label>
              <p className="text-primary-text mt-1">
                ${selectedCreditNote.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Date</label>
              <p className="text-primary-text mt-1">{selectedCreditNote.date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge variant="success">{selectedCreditNote.status}</Badge>
              </div>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default CreditNotes
