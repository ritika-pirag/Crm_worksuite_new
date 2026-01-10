import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { invoicesAPI, companiesAPI } from '../../../api'
import { IoDownload, IoEye } from 'react-icons/io5'

const Invoices = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  const clientId = user?.client_id || localStorage.getItem('clientId')
  
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [companyInfo, setCompanyInfo] = useState(null)

  useEffect(() => {
    if (companyId) {
      fetchInvoices()
      fetchCompanyInfo()
    }
  }, [companyId, userId, clientId])

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

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoicesAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId
      })
      if (response.data && response.data.success) {
        const fetchedInvoices = response.data.data || []
        const transformedInvoices = fetchedInvoices.map(inv => {
          const dueDate = inv.due_date || inv.dueDate || inv.bill_date || inv.created_at
          const dueDateObj = dueDate ? new Date(dueDate) : new Date()
          const today = new Date()
          const daysOverdue = Math.max(0, Math.floor((today - dueDateObj) / (1000 * 60 * 60 * 24)))
          let status = inv.status || 'Unpaid'
          
          // Handle status based on payments
          if (inv.status === 'Fully Paid' || inv.status === 'Paid') {
            status = 'Paid'
          } else if (inv.status === 'Partially Paid') {
            status = 'Partially Paid'
          } else if (status === 'Unpaid' && daysOverdue > 0) {
            status = 'Overdue'
          }
          
          return {
            id: inv.id,
            invoiceNo: inv.invoice_number || inv.invoiceNumber || `INV-${inv.id}`,
            amount: parseFloat(inv.total || inv.amount || 0),
            dueDate: dueDateObj.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }),
            status: status,
            items: inv.items || [],
            ...inv
          }
        })
        setInvoices(transformedInvoices)
      } else {
        setInvoices([])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'invoiceNo', label: 'Invoice No' },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => `$${value.toLocaleString()}`,
    },
    { key: 'dueDate', label: 'Due Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Paid: 'success',
          Unpaid: 'warning',
          Overdue: 'danger',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
  ]

  // Download Invoice as PDF with dynamic data
  const handleDownloadPDF = async (invoice) => {
    // Fetch full invoice details if needed
    let fullInvoice = invoice
    if (!invoice.items || invoice.items.length === 0) {
      try {
        const response = await invoicesAPI.getById(invoice.id, { company_id: companyId })
        if (response.data && response.data.success) {
          fullInvoice = { ...invoice, ...response.data.data }
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error)
      }
    }
    
    const invoiceNumber = fullInvoice.invoice_number || fullInvoice.invoiceNo || `INV-${fullInvoice.id}`
    const issueDate = fullInvoice.issue_date || fullInvoice.created_at
    const dueDate = fullInvoice.due_date || fullInvoice.dueDate
    const billDateFormatted = issueDate ? new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
    const items = fullInvoice.items || []
    const subTotal = parseFloat(fullInvoice.sub_total || fullInvoice.total || fullInvoice.amount || 0).toFixed(2)
    const discount = parseFloat(fullInvoice.discount || 0).toFixed(2)
    const total = parseFloat(fullInvoice.total || fullInvoice.amount || 0).toFixed(2)
    const status = fullInvoice.status || 'Unpaid'
    
    // Company info
    const companyName = companyInfo?.name || companyInfo?.company_name || 'Company Name'
    const companyAddress = companyInfo?.address || ''
    const companyCity = companyInfo?.city || ''
    const companyState = companyInfo?.state || ''
    const companyZip = companyInfo?.zip || companyInfo?.postal_code || ''
    const companyPhone = companyInfo?.phone || ''
    const companyEmail = companyInfo?.email || ''
    const companyWebsite = companyInfo?.website || ''
    
    // Client info
    const clientName = fullInvoice.client_name || user?.name || 'Client'
    const clientEmail = fullInvoice.client_email || user?.email || ''
    const clientAddress = fullInvoice.client_address || user?.address || ''
    const clientPhone = fullInvoice.client_phone || user?.phone || ''
    
    // Status badge color
    const statusColor = status === 'Paid' || status === 'Fully Paid' ? '#10b981' : 
                        status === 'Overdue' ? '#ef4444' : '#f59e0b'
    const statusText = status === 'Paid' || status === 'Fully Paid' ? 'Paid' : 
                       status === 'Overdue' ? 'Overdue' : 'Not paid'
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; position: relative; }
          .badge-container { position: absolute; top: 0; left: 0; width: 120px; height: 120px; overflow: hidden; }
          .badge-ribbon { position: absolute; top: 25px; left: -35px; width: 150px; background: ${statusColor}; color: white; text-align: center; padding: 8px 0; font-size: 12px; font-weight: bold; transform: rotate(-45deg); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-top: 30px; }
          .logo { font-size: 36px; font-weight: bold; }
          .logo-icon { color: #0891b2; }
          .logo-text { color: #0891b2; }
          .invoice-info { text-align: right; }
          .invoice-number { font-size: 24px; font-weight: bold; color: #333; border-bottom: 3px solid #333; padding-bottom: 5px; margin-bottom: 10px; display: inline-block; }
          .invoice-dates { font-size: 14px; color: #666; line-height: 1.8; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { max-width: 45%; }
          .party-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; }
          .party-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
          .party-details { font-size: 13px; color: #666; line-height: 1.6; }
          .party-details a { color: #0891b2; text-decoration: none; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #0891b2; color: white; padding: 12px 15px; text-align: left; font-size: 14px; font-weight: 600; }
          .items-table th:nth-child(2) { text-align: center; }
          .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
          .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
          .items-table td:nth-child(2) { text-align: center; }
          .items-table td:nth-child(3), .items-table td:nth-child(4) { text-align: right; }
          .items-table tbody tr:hover { background: #f9fafb; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totals-box { width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee; }
          .total-row.balance { background: #1f2937; color: white; padding: 15px; margin-top: 10px; font-weight: bold; font-size: 16px; border: none; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 20px; }
            .badge-ribbon { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .items-table th { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .total-row.balance { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="badge-container">
            <div class="badge-ribbon">${statusText}</div>
          </div>
          
          <div class="header">
            <div class="logo">
              <span class="logo-icon">⬡</span> <span class="logo-text">RISE</span>
            </div>
            <div class="invoice-info">
              <div class="invoice-number">INV #${invoiceNumber}</div>
              <div class="invoice-dates">
                <p>Bill date: ${billDateFormatted}</p>
                <p>Due date: ${dueDateFormatted}</p>
              </div>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">${companyName}</div>
              <div class="party-details">
                ${companyAddress ? companyAddress + '<br>' : ''}
                ${companyCity || companyState || companyZip ? `${companyCity}${companyCity && companyState ? ', ' : ''}${companyState} ${companyZip}<br>` : ''}
                ${companyPhone ? 'Phone: ' + companyPhone + '<br>' : ''}
                ${companyEmail ? 'Email: <a href="mailto:' + companyEmail + '">' + companyEmail + '</a><br>' : ''}
                ${companyWebsite ? 'Website: <a href="' + companyWebsite + '">' + companyWebsite + '</a>' : ''}
              </div>
            </div>
            <div class="party" style="text-align: right;">
              <div class="party-label">Bill To</div>
              <div class="party-name">${clientName}</div>
              <div class="party-details">
                ${clientAddress ? clientAddress + '<br>' : ''}
                ${clientEmail ? clientEmail + '<br>' : ''}
                ${clientPhone ? clientPhone : ''}
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.length > 0 ? items.map(item => `
                <tr>
                  <td>${item.item_name || item.name || item.description || 'Item'}</td>
                  <td>${item.quantity || 1} ${item.unit || 'PC'}</td>
                  <td>$${parseFloat(item.unit_price || item.rate || item.price || 0).toFixed(2)}</td>
                  <td>$${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td>Invoice Amount</td>
                  <td>1</td>
                  <td>$${total}</td>
                  <td>$${total}</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row">
                <span>Sub Total</span>
                <span>$${subTotal}</span>
              </div>
              ${parseFloat(discount) > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-$${discount}</span>
              </div>
              ` : ''}
              <div class="total-row balance">
                <span>Balance Due</span>
                <span>$${total}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="margin-top: 5px;">Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  const handleView = async (invoice) => {
    // If invoice doesn't have items, fetch them
    if (!invoice.items || invoice.items.length === 0) {
      try {
        const response = await invoicesAPI.getById(invoice.id, { company_id: companyId })
        if (response.data && response.data.success) {
          setSelectedInvoice({
            ...invoice,
            items: response.data.data.items || []
          })
        } else {
          setSelectedInvoice(invoice)
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error)
        setSelectedInvoice(invoice)
      }
    } else {
      setSelectedInvoice(invoice)
    }
    setIsViewModalOpen(true)
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded-md transition-all duration-200"
        title="View Details"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleDownloadPDF(row)
        }}
        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-all duration-200"
        title="Download PDF"
      >
        <IoDownload size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Invoices</h1>
        <p className="text-secondary-text mt-1">View and download your invoices</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading invoices...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          searchPlaceholder="Search invoices..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Paid', 'Unpaid', 'Overdue', 'Partially Paid'] },
            { key: 'dueDate', label: 'Due Date', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Invoice Details"
        width="max-w-3xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Invoice No</label>
                <p className="text-primary-text mt-1 text-base font-semibold">{selectedInvoice.invoiceNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedInvoice.status === 'Paid'
                        ? 'success'
                        : selectedInvoice.status === 'Overdue'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {selectedInvoice.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Amount</label>
                <p className="text-primary-text mt-1 text-base font-semibold">
                  ${selectedInvoice.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Due Date</label>
                <p className="text-primary-text mt-1 text-base">{selectedInvoice.dueDate}</p>
              </div>
            </div>

            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-primary-text mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-secondary-text">Description</th>
                        <th className="text-right py-2 text-sm font-medium text-secondary-text">Quantity</th>
                        <th className="text-right py-2 text-sm font-medium text-secondary-text">Rate</th>
                        <th className="text-right py-2 text-sm font-medium text-secondary-text">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-primary-text">
                            <div>
                              <p className="font-medium">{item.item_name || item.name || item.description || 'Invoice Item'}</p>
                              {item.description && item.item_name && item.description !== item.item_name && (
                                <p className="text-xs text-secondary-text mt-1">{item.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-2 text-sm text-primary-text text-right">{item.quantity || 0} {item.unit || ''}</td>
                          <td className="py-2 text-sm text-primary-text text-right">${parseFloat(item.unit_price || item.rate || item.price || 0).toLocaleString()}</td>
                          <td className="py-2 text-sm text-primary-text text-right font-semibold">
                            ${parseFloat(item.amount || item.total || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                onClick={() => handleDownloadPDF(selectedInvoice)}
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

export default Invoices
