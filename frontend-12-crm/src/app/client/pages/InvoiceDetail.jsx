import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { useSettings } from '../../../context/SettingsContext'
import { invoicesAPI, companiesAPI } from '../../../api'
import { 
  IoArrowBack, 
  IoDownload, 
  IoPrint,
  IoEye,
  IoDocument
} from 'react-icons/io5'
import { FaEye, FaPrint, FaRegFilePdf, FaDownload } from 'react-icons/fa'

const InvoiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { getCompanyInfo, formatCurrency } = useSettings()
  
  const companyId = parseInt(user?.company_id || localStorage.getItem('companyId') || 1, 10)
  
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState(null)

  useEffect(() => {
    fetchInvoice()
    fetchCompanyInfo()
  }, [id, companyId])

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

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await invoicesAPI.getById(id, { company_id: companyId })
      if (response.data && response.data.success) {
        const inv = response.data.data
        setInvoice({
          ...inv,
          invoiceNo: inv.invoice_number || `INV#${String(inv.id).padStart(3, '0')}`,
          amount: parseFloat(inv.total || inv.amount || 0),
          items: inv.items || [],
          status: inv.status || 'Unpaid'
        })
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const company = companyInfo || getCompanyInfo() || {}
  const companyName = company.name || company.company_name || 'Company'

  const getStatusColor = (status) => {
    switch (status) {
      case 'Fully Paid':
      case 'Paid':
        return '#10b981'
      case 'Overdue':
        return '#ef4444'
      case 'Credited':
        return '#8b5cf6'
      case 'Partially Paid':
        return '#3b82f6'
      default:
        return '#f59e0b'
    }
  }

  const getStatusLabel = (status) => {
    if (status === 'Credited') return 'Credit Note'
    return 'Invoice'
  }

  const generateInvoiceHTML = () => {
    if (!invoice) return ''
    
    const items = invoice.items || []
    const subTotal = parseFloat(invoice.sub_total || invoice.total || invoice.amount || 0)
    const discount = parseFloat(invoice.discount || 0)
    const tax = parseFloat(invoice.tax || 0)
    const total = parseFloat(invoice.total || invoice.amount || 0)
    const balanceDue = total - parseFloat(invoice.paid_amount || 0)
    
    const billDate = invoice.bill_date || invoice.issue_date || invoice.created_at
    const dueDate = invoice.due_date
    const statusColor = getStatusColor(invoice.status)
    const primaryColor = theme.primaryAccent || '#0891b2'
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #333; }
          .download-btn { 
            display: block; 
            width: fit-content; 
            margin: 20px auto; 
            padding: 10px 30px; 
            background: white; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 14px;
            color: #374151;
          }
          .download-btn:hover { background: #f9fafb; }
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto 40px; 
            background: white; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
            padding: 40px;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .logo-section { }
          .logo { display: flex; align-items: center; gap: 10px; }
          .logo-icon { 
            width: 50px; 
            height: 50px; 
            background: ${primaryColor}; 
            border-radius: 10px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .logo-text { font-size: 28px; font-weight: bold; color: ${primaryColor}; letter-spacing: 1px; }
          .invoice-badge { text-align: right; }
          .badge-label { 
            display: inline-block; 
            background: ${statusColor}; 
            color: white; 
            padding: 6px 16px; 
            border-radius: 4px; 
            font-weight: bold; 
            font-size: 14px; 
            margin-bottom: 8px;
          }
          .invoice-meta { font-size: 13px; color: #6b7280; line-height: 1.8; text-align: right; }
          .invoice-meta strong { color: #374151; }
          
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { max-width: 45%; }
          .party-name { font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 8px; }
          .party-details { font-size: 13px; color: #6b7280; line-height: 1.8; }
          .party-details a { color: ${primaryColor}; text-decoration: none; }
          .bill-to-label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
          
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { 
            background: ${primaryColor}; 
            color: white; 
            padding: 14px 16px; 
            text-align: left; 
            font-size: 13px; 
            font-weight: 600; 
          }
          .items-table th:nth-child(2) { text-align: center; }
          .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
          .items-table td { padding: 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; vertical-align: top; }
          .items-table td:nth-child(2) { text-align: center; }
          .items-table td:nth-child(3), .items-table td:nth-child(4) { text-align: right; }
          .item-name { font-weight: 600; color: #111827; margin-bottom: 4px; }
          .item-desc { font-size: 12px; color: ${primaryColor}; line-height: 1.5; }
          
          .totals { display: flex; justify-content: flex-end; }
          .totals-box { width: 300px; }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 16px; 
            font-size: 14px; 
            border-bottom: 1px solid #e5e7eb;
          }
          .total-row.balance { 
            background: #1f2937; 
            color: white; 
            font-weight: bold; 
            font-size: 15px; 
            border: none;
            margin-top: 8px;
          }
          
          @media print {
            body { background: white; }
            .download-btn { display: none; }
            .invoice-container { box-shadow: none; margin: 0; }
            .items-table th, .total-row.balance { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <button class="download-btn" onclick="window.print()">Download PDF</button>
        
        <div class="invoice-container">
          <div class="header">
            <div class="logo-section">
              <div class="logo">
                <div class="logo-icon">${companyName.charAt(0).toUpperCase()}</div>
                <span class="logo-text">${companyName}</span>
              </div>
            </div>
            <div class="invoice-badge">
              <div class="badge-label">${getStatusLabel(invoice.status)}</div>
              <div class="invoice-meta">
                <p>ID: <strong>${invoice.invoiceNo}</strong></p>
                <p>Date: <strong>${billDate ? new Date(billDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</strong></p>
                ${invoice.main_invoice ? `<p>Main invoice: <strong>${invoice.main_invoice}</strong></p>` : ''}
              </div>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <div class="party-name">${companyName}</div>
              <div class="party-details">
                ${company.address ? company.address + '<br>' : ''}
                ${company.city ? company.city + ', ' : ''}${company.state ? company.state : ''}${company.postal_code ? ' ' + company.postal_code : ''}<br>
                ${company.phone ? 'Phone: ' + company.phone + '<br>' : ''}
                ${company.email ? 'Email: <a href="mailto:' + company.email + '">' + company.email + '</a><br>' : ''}
                ${company.website ? 'Website: <a href="' + company.website + '">' + company.website + '</a>' : ''}
              </div>
            </div>
            <div class="party" style="text-align: right;">
              <div class="bill-to-label">Bill To</div>
              <div class="party-name">${invoice.client_name || 'Client'}</div>
              <div class="party-details">
                ${invoice.client_address ? invoice.client_address + '<br>' : ''}
                ${invoice.client_city ? invoice.client_city + '<br>' : ''}
                ${invoice.client_state ? invoice.client_state + '<br>' : ''}
                ${invoice.client_country || ''}
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
                  <td>
                    <div class="item-name">${item.item_name || item.name || 'Item'}</div>
                    ${item.description ? `<div class="item-desc">${item.description.replace(/\n/g, '<br>')}</div>` : ''}
                  </td>
                  <td>${item.quantity || 1} ${item.unit || 'PC'}</td>
                  <td>$${parseFloat(item.unit_price || item.rate || item.price || 0).toFixed(2)}</td>
                  <td>${invoice.status === 'Credited' ? '-' : ''}$${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td>
                    <div class="item-name">Invoice Amount</div>
                  </td>
                  <td>1 PC</td>
                  <td>$${total.toFixed(2)}</td>
                  <td>$${total.toFixed(2)}</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-box">
              <div class="total-row">
                <span>Sub Total</span>
                <span>${invoice.status === 'Credited' ? '-' : ''}$${subTotal.toFixed(2)}</span>
              </div>
              ${discount > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-$${discount.toFixed(2)}</span>
              </div>
              ` : ''}
              ${tax > 0 ? `
              <div class="total-row">
                <span>Tax</span>
                <span>$${tax.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-row balance">
                <span>Balance Due</span>
                <span>${invoice.status === 'Credited' ? '-' : ''}$${balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const handleDownloadPDF = () => {
    const invoiceHTML = generateInvoiceHTML()
    const printWindow = window.open('', '_blank')
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
  }

  const handlePrint = () => {
    const invoiceHTML = generateInvoiceHTML()
    const printWindow = window.open('', '_blank')
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-accent border-t-transparent"></div>
          <p className="text-secondary-text mt-4">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-text">Invoice not found</p>
        <button
          onClick={() => navigate('/app/client/invoices')}
          className="mt-4 text-primary-accent hover:underline"
        >
          Back to Invoices
        </button>
      </div>
    )
  }

  const items = invoice.items || []
  const subTotal = parseFloat(invoice.sub_total || invoice.total || invoice.amount || 0)
  const discount = parseFloat(invoice.discount || 0)
  const tax = parseFloat(invoice.tax || 0)
  const total = parseFloat(invoice.total || invoice.amount || 0)
  const balanceDue = total - parseFloat(invoice.paid_amount || 0)
  const billDate = invoice.bill_date || invoice.issue_date || invoice.created_at
  const statusColor = getStatusColor(invoice.status)
  const primaryColor = theme.primaryAccent || '#0891b2'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/client/invoices')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary-text">Invoice Details</h1>
            <p className="text-secondary-text text-sm">{invoice.invoiceNo}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <IoPrint size={18} />
            <span className="text-sm font-medium">Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            <IoDownload size={18} />
            <span className="text-sm font-medium">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Download PDF Button */}
        <div className="flex justify-center py-4 border-b border-gray-100 bg-gray-50">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download PDF
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
            {/* Company Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>
              <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                {companyName}
              </span>
            </div>

            {/* Invoice Badge */}
            <div className="text-right">
              <div 
                className="inline-block px-4 py-1.5 rounded text-white text-sm font-bold mb-3"
                style={{ backgroundColor: statusColor }}
              >
                {getStatusLabel(invoice.status)}
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>ID: <span className="text-gray-800 font-semibold">{invoice.invoiceNo}</span></p>
                <p>Date: <span className="text-gray-800 font-semibold">
                  {billDate ? new Date(billDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                </span></p>
                {invoice.main_invoice && (
                  <p>Main invoice: <span className="text-gray-800 font-semibold">{invoice.main_invoice}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Company & Client Info */}
          <div className="flex flex-col sm:flex-row justify-between gap-8 mb-10">
            {/* Company Info */}
            <div>
              <p className="font-bold text-gray-900 text-lg mb-2">{companyName}</p>
              <div className="text-sm text-gray-500 space-y-1">
                {company.address && <p>{company.address}</p>}
                {(company.city || company.state || company.postal_code) && (
                  <p>{company.city}{company.city && company.state ? ', ' : ''}{company.state} {company.postal_code}</p>
                )}
                {company.phone && <p>Phone: {company.phone}</p>}
                {company.email && <p>Email: <a href={`mailto:${company.email}`} className="hover:underline" style={{ color: primaryColor }}>{company.email}</a></p>}
                {company.website && <p>Website: <a href={company.website} className="hover:underline" style={{ color: primaryColor }}>{company.website}</a></p>}
              </div>
            </div>

            {/* Client Info */}
            <div className="sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Bill To</p>
              <p className="font-bold text-gray-900 text-lg mb-2">{invoice.client_name || user?.name || 'Client'}</p>
              <div className="text-sm text-gray-500 space-y-1">
                {invoice.client_address && <p>{invoice.client_address}</p>}
                {invoice.client_city && <p>{invoice.client_city}</p>}
                {invoice.client_state && <p>{invoice.client_state}</p>}
                {invoice.client_country && <p>{invoice.client_country}</p>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: primaryColor }}>
                  <th className="text-left py-4 px-5 text-sm font-semibold text-white">Item</th>
                  <th className="text-center py-4 px-5 text-sm font-semibold text-white">Quantity</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-white">Rate</th>
                  <th className="text-right py-4 px-5 text-sm font-semibold text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-5 px-5">
                        <p className="font-semibold text-gray-900">{item.item_name || item.name || 'Item'}</p>
                        {item.description && (
                          <p className="text-sm mt-1 whitespace-pre-line" style={{ color: primaryColor }}>{item.description}</p>
                        )}
                      </td>
                      <td className="py-5 px-5 text-center text-gray-600">{item.quantity || 1} {item.unit || 'PC'}</td>
                      <td className="py-5 px-5 text-right text-gray-600">${parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                      <td className="py-5 px-5 text-right font-semibold text-gray-900">
                        {invoice.status === 'Credited' ? '-' : ''}${parseFloat(item.amount || item.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-100">
                    <td className="py-5 px-5">
                      <p className="font-semibold text-gray-900">Invoice Amount</p>
                    </td>
                    <td className="py-5 px-5 text-center text-gray-600">1 PC</td>
                    <td className="py-5 px-5 text-right text-gray-600">${total.toFixed(2)}</td>
                    <td className="py-5 px-5 text-right font-semibold text-gray-900">${total.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80">
              <div className="flex justify-between py-3 px-5 border-b border-gray-100">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium text-gray-900">
                  {invoice.status === 'Credited' ? '-' : ''}${subTotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-3 px-5 border-b border-gray-100">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-${discount.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between py-3 px-5 border-b border-gray-100">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-4 px-5 bg-gray-800 text-white mt-2 rounded-lg">
                <span className="font-semibold">Balance Due</span>
                <span className="font-bold text-lg">
                  {invoice.status === 'Credited' ? '-' : ''}${balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 sm:px-10 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={handleDownloadPDF}
              className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 rounded-xl transition-colors group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <FaEye size={16} />
              </div>
              <span className="text-xs font-semibold text-gray-600">Preview</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex flex-col items-center gap-2 p-4 hover:bg-green-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <FaPrint size={16} />
              </div>
              <span className="text-xs font-semibold text-gray-600">Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex flex-col items-center gap-2 p-4 hover:bg-red-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <FaRegFilePdf size={16} />
              </div>
              <span className="text-xs font-semibold text-gray-600">View PDF</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FaDownload size={16} />
              </div>
              <span className="text-xs font-semibold text-gray-600">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail

