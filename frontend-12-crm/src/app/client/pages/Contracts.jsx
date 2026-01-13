import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { contractsAPI, companiesAPI } from '../../../api'
import { IoEye, IoDownload } from 'react-icons/io5'

const Contracts = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState(null)
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState(null)

  useEffect(() => {
    if (userId && companyId) {
      fetchContracts()
      fetchCompanyInfo()
    }
  }, [userId, companyId])

  const fetchCompanyInfo = async () => {
    try {
      const response = await companiesAPI.getById(companyId)
      if (response.data && response.data.success) {
        setCompanyInfo(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    }
  }

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await contractsAPI.getAll({
        company_id: companyId,
        client_id: userId
      })
      if (response.data.success) {
        const fetchedContracts = response.data.data || []
        const transformedContracts = fetchedContracts.map(contract => ({
          id: contract.id,
          contractNo: contract.contract_number || contract.contractNumber || `CNT-${contract.id}`,
          project: contract.project_name || contract.projectName || contract.subject || 'N/A',
          status: contract.status || 'Active',
          startDate: contract.contract_date ? new Date(contract.contract_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A',
          endDate: contract.valid_until ? new Date(contract.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A',
          start_date: contract.contract_date,
          end_date: contract.valid_until,
          ...contract
        }))
        setContracts(transformedContracts)
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'contractNo', label: 'Contract No' },
    { key: 'project', label: 'Project' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'default'}>{value}</Badge>
      ),
    },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
  ]

  const handleView = (contract) => {
    setSelectedContract(contract)
    setIsViewModalOpen(true)
  }

  // Download Contract as PDF
  const handleDownload = (contract) => {
    const contractNumber = contract.contract_number || contract.contractNo || `CONTRACT-${contract.id}`
    const title = contract.title || 'Contract'
    const projectName = contract.project_name || contract.project || 'N/A'
    const clientName = contract.client_name || user?.name || 'Client'
    const startDate = contract.contract_date ? new Date(contract.contract_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'
    const endDate = contract.valid_until ? new Date(contract.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'
    const amount = parseFloat(contract.amount || 0).toFixed(2)
    const status = contract.status || 'Draft'
    const note = contract.note || ''
    const tax = contract.tax || ''
    const secondTax = contract.second_tax || ''
    
    // Company info
    const companyName = companyInfo?.name || companyInfo?.company_name || 'Company'
    const companyAddress = companyInfo?.address || ''
    const companyPhone = companyInfo?.phone || ''
    const companyEmail = companyInfo?.email || ''
    
    // Status color
    const statusColor = status === 'Accepted' || status === 'Active' ? '#10b981' : 
                        status === 'Expired' || status === 'Cancelled' ? '#ef4444' : '#f59e0b'
    
    const contractHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${contractNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
          .contract-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0891b2; padding-bottom: 20px; }
          .logo { font-size: 36px; font-weight: bold; color: #0891b2; }
          .contract-info { text-align: right; }
          .contract-number { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .contract-status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background: ${statusColor}; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .party { max-width: 45%; }
          .party-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; }
          .party-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .party-details { font-size: 13px; color: #666; line-height: 1.6; }
          .details-section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .detail-item { }
          .detail-label { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; margin-bottom: 5px; }
          .detail-value { font-size: 14px; color: #333; }
          .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .amount-label { font-size: 14px; color: #666; margin-bottom: 5px; }
          .amount-value { font-size: 32px; font-weight: bold; color: #0891b2; }
          .notes-section { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .notes-title { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 10px; }
          .notes-content { font-size: 14px; color: #333; line-height: 1.6; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature-box { width: 45%; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
          .signature-label { font-size: 12px; color: #666; }
          @media print {
            body { padding: 20px; }
            .contract-status { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="contract-container">
          <div class="header">
            <div class="logo">⬡ RISE</div>
            <div class="contract-info">
              <div class="contract-number">${contractNumber}</div>
              <div class="contract-status">${status}</div>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">${companyName}</div>
              <div class="party-details">
                ${companyAddress ? companyAddress + '<br>' : ''}
                ${companyPhone ? 'Phone: ' + companyPhone + '<br>' : ''}
                ${companyEmail ? 'Email: ' + companyEmail : ''}
              </div>
            </div>
            <div class="party" style="text-align: right;">
              <div class="party-label">To</div>
              <div class="party-name">${clientName}</div>
            </div>
          </div>
          
          <div class="details-section">
            <div class="section-title">${title}</div>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Project</div>
                <div class="detail-value">${projectName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">${status}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Start Date</div>
                <div class="detail-value">${startDate}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">End Date</div>
                <div class="detail-value">${endDate}</div>
              </div>
              ${tax ? `
              <div class="detail-item">
                <div class="detail-label">Tax</div>
                <div class="detail-value">${tax}</div>
              </div>
              ` : ''}
              ${secondTax ? `
              <div class="detail-item">
                <div class="detail-label">Second Tax</div>
                <div class="detail-value">${secondTax}</div>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="amount-box">
            <div class="amount-label">Contract Amount</div>
            <div class="amount-value">$${amount}</div>
          </div>
          
          ${note ? `
          <div class="notes-section">
            <div class="notes-title">Notes</div>
            <div class="notes-content">${note}</div>
          </div>
          ` : ''}
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-label">Company Representative</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-label">Client</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(contractHTML)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 300)
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
          handleDownload(row)
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
        <h1 className="text-3xl font-bold text-primary-text">Contracts</h1>
        <p className="text-secondary-text mt-1">View your contracts</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading contracts...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={contracts}
          searchPlaceholder="Search contracts..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Completed', 'Expired'] },
            { key: 'project', label: 'Project', type: 'text' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Contract Details"
      >
        {selectedContract && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-secondary-text">Contract No</label>
              <p className="text-primary-text mt-1 font-semibold">{selectedContract.contractNo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Title</label>
              <p className="text-primary-text mt-1">{selectedContract.title || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Project</label>
              <p className="text-primary-text mt-1">{selectedContract.project}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Status</label>
              <div className="mt-1">
                <Badge variant={
                  selectedContract.status === 'Accepted' || selectedContract.status === 'Active' ? 'success' : 
                  selectedContract.status === 'Expired' || selectedContract.status === 'Cancelled' ? 'danger' : 'warning'
                }>
                  {selectedContract.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Start Date</label>
                <p className="text-primary-text mt-1">{selectedContract.startDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">End Date</label>
                <p className="text-primary-text mt-1">{selectedContract.endDate}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">Amount</label>
              <p className="text-primary-text mt-1 text-xl font-bold text-primary-accent">
                ${parseFloat(selectedContract.amount || 0).toLocaleString()}
              </p>
            </div>
            {(selectedContract.tax || selectedContract.second_tax) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedContract.tax && (
                  <div>
                    <label className="text-sm font-medium text-secondary-text">Tax</label>
                    <p className="text-primary-text mt-1">{selectedContract.tax}</p>
                  </div>
                )}
                {selectedContract.second_tax && (
                  <div>
                    <label className="text-sm font-medium text-secondary-text">Second Tax</label>
                    <p className="text-primary-text mt-1">{selectedContract.second_tax}</p>
                  </div>
                )}
              </div>
            )}
            {selectedContract.note && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Notes</label>
                <p className="text-primary-text mt-1 bg-gray-50 p-3 rounded-lg">{selectedContract.note}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownload(selectedContract)}
                className="flex-1"
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Contracts
