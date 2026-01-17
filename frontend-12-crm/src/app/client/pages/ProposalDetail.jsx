import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useSettings } from "../../../context/SettingsContext";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { proposalsAPI, companiesAPI } from "../../../api";
import { 
  IoArrowBack,
  IoCheckmark, 
  IoClose, 
  IoCalendar,
  IoTime,
  IoPerson,
  IoDocumentText
} from "react-icons/io5";
import { FaEye, FaPrint, FaRegFilePdf, FaDownload } from "react-icons/fa";

const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { formatDate, formatCurrency, getCompanyInfo } = useSettings();
  
  const companyId = user?.company_id || localStorage.getItem("companyId");
  const primaryColor = theme?.primaryAccent || '#0891b2';

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id && companyId) {
      fetchProposal();
      fetchCompanyInfo();
    }
  }, [id, companyId]);

  const fetchCompanyInfo = async () => {
    try {
      const response = await companiesAPI.getById(companyId);
      if (response.data?.success) {
        setCompanyInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await proposalsAPI.getById(id, { company_id: companyId });
      if (response.data?.success) {
        const p = response.data.data;
        setProposal({
          ...p,
          id: p.id,
          title: p.title || `Proposal #${p.id}`,
          proposal_number: p.proposal_number || `PROP-${String(p.id).padStart(4, '0')}`,
          total: parseFloat(p.total || 0),
          status: p.status || "Pending",
          valid_till: p.valid_till,
          created_at: p.created_at,
          description: p.description || "",
          items: p.items || [],
          client_name: p.client_name || user?.name || "Client",
          client_email: p.client_email || user?.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (window.confirm("Are you sure you want to accept this proposal?")) {
      try {
        await proposalsAPI.updateStatus(id, "Accepted", { company_id: companyId });
        alert("Proposal accepted successfully!");
        fetchProposal();
      } catch (error) {
        console.error("Error accepting proposal:", error);
        alert("Failed to accept proposal");
      }
    }
  };

  const handleReject = async () => {
    if (window.confirm("Are you sure you want to reject this proposal?")) {
      try {
        await proposalsAPI.updateStatus(id, "Rejected", { company_id: companyId });
        alert("Proposal rejected!");
        fetchProposal();
      } catch (error) {
        console.error("Error rejecting proposal:", error);
        alert("Failed to reject proposal");
      }
    }
  };

  const handlePrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleDownload = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const generatePrintContent = () => {
    if (!proposal) return "";
    const company = companyInfo || getCompanyInfo() || {};
    const items = proposal.items || [];
    const subTotal = items.reduce((sum, item) => sum + parseFloat(item.amount || item.total || 0), 0);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Proposal - ${proposal.proposal_number || proposal.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: white; color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid ${primaryColor}; padding-bottom: 20px; }
            .logo { font-size: 32px; font-weight: bold; color: ${primaryColor}; }
            .proposal-info { text-align: right; }
            .proposal-number { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
            .proposal-status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background: ${proposal.status === 'Accepted' ? '#10b981' : proposal.status === 'Rejected' ? '#ef4444' : '#f59e0b'}; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .party { max-width: 45%; }
            .party-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 8px; text-transform: uppercase; }
            .party-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
            .party-details { font-size: 13px; color: #666; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background: ${primaryColor}; color: white; padding: 12px 15px; text-align: left; font-size: 14px; }
            .items-table th:last-child { text-align: right; }
            .items-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
            .items-table td:last-child { text-align: right; }
            .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
            .totals-box { width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee; }
            .total-row.final { background: #1f2937; color: white; padding: 15px; margin-top: 10px; font-weight: bold; font-size: 16px; }
            .description { margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .description h3 { margin-bottom: 10px; font-size: 14px; color: #666; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
            @media print { body { padding: 20px; } .items-table th, .total-row.final { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${company.name || company.company_name || 'Company'}</div>
              <div class="proposal-info">
                <div class="proposal-number">PROPOSAL #${proposal.proposal_number || proposal.id}</div>
                <div class="proposal-status">${proposal.status}</div>
              </div>
            </div>
            
            <div class="parties">
              <div class="party">
                <div class="party-label">From</div>
                <div class="party-name">${company.name || company.company_name || 'Company'}</div>
                <div class="party-details">
                  ${company.address ? company.address + '<br>' : ''}
                  ${company.phone ? 'Phone: ' + company.phone + '<br>' : ''}
                  ${company.email ? 'Email: ' + company.email : ''}
                </div>
              </div>
              <div class="party" style="text-align: right;">
                <div class="party-label">To</div>
                <div class="party-name">${proposal.client_name || 'Client'}</div>
                <div class="party-details">
                  ${proposal.client_email || ''}
                </div>
              </div>
            </div>
            
            <h3 style="margin-bottom: 15px; font-size: 18px;">${proposal.title}</h3>
            
            ${items.length > 0 ? `
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td>${item.item_name || item.name || 'Item'}</td>
                      <td>${item.description || '-'}</td>
                      <td>${item.quantity || 1}</td>
                      <td>$${parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                      <td>$${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            
            <div class="totals">
              <div class="totals-box">
                <div class="total-row">
                  <span>Sub Total</span>
                  <span>$${subTotal.toFixed(2)}</span>
                </div>
                ${proposal.discount ? `
                <div class="total-row">
                  <span>Discount</span>
                  <span>-$${parseFloat(proposal.discount).toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row final">
                  <span>Total</span>
                  <span>$${parseFloat(proposal.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            ${proposal.description ? `
              <div class="description">
                <h3>Description</h3>
                <div>${proposal.description}</div>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Valid until: ${proposal.valid_till ? new Date(proposal.valid_till).toLocaleDateString() : 'N/A'}</p>
              <p style="margin-top: 5px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Draft: { bg: "bg-gray-100", text: "text-gray-600" },
      Sent: { bg: "bg-blue-100", text: "text-blue-600" },
      Pending: { bg: "bg-yellow-100", text: "text-yellow-600" },
      Accepted: { bg: "bg-green-100", text: "text-green-600" },
      Rejected: { bg: "bg-red-100", text: "text-red-600" },
    };
    const style = statusStyles[status] || statusStyles.Pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent" style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
          <p className="text-secondary-text mt-4">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <IoDocumentText size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-secondary-text">Proposal not found</p>
        <button
          onClick={() => navigate('/app/client/proposals')}
          className="mt-4 hover:underline"
          style={{ color: primaryColor }}
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  const items = proposal.items || [];
  const subTotal = items.reduce((sum, item) => sum + parseFloat(item.amount || item.total || 0), 0);
  const company = companyInfo || getCompanyInfo() || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/client/proposals')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <IoArrowBack size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span 
              className="px-3 py-1 rounded-lg text-white text-sm font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              PROPOSAL #{proposal.proposal_number || proposal.id}
            </span>
            {getStatusBadge(proposal.status)}
          </div>
          <h1 className="text-2xl font-bold text-primary-text mt-2">{proposal.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Proposal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company & Client Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {(company.name || company.company_name || 'C').charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{company.name || company.company_name || 'Company'}</p>
                    {company.email && <p className="text-sm text-gray-500">{company.email}</p>}
                  </div>
                </div>
                {company.address && <p className="text-sm text-gray-600">{company.address}</p>}
                {company.phone && <p className="text-sm text-gray-600">Phone: {company.phone}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">To</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                    {(proposal.client_name || 'C').charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{proposal.client_name || user?.name || 'Client'}</p>
                    {proposal.client_email && <p className="text-sm text-gray-500">{proposal.client_email}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="font-semibold text-gray-900">
                  {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valid Until</p>
                <p className="font-semibold text-gray-900">
                  {proposal.valid_till ? new Date(proposal.valid_till).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(proposal.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold" style={{ color: primaryColor }}>
                  ${parseFloat(proposal.total || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Proposal Items</h3>
            </div>
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: primaryColor }}>
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-white">Item</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-white">Qty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white">Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{item.item_name || item.name || 'Item'}</p>
                          {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-700">{item.quantity || 1}</td>
                        <td className="py-4 px-4 text-right text-gray-700">${parseFloat(item.unit_price || item.rate || 0).toFixed(2)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-gray-900">${parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No items in this proposal
              </div>
            )}
            
            {/* Totals */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sub Total</span>
                    <span className="font-medium">${subTotal.toFixed(2)}</span>
                  </div>
                  {proposal.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-red-600">-${parseFloat(proposal.discount).toFixed(2)}</span>
                    </div>
                  )}
                  {proposal.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-medium">${parseFloat(proposal.tax).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                      ${parseFloat(proposal.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {proposal.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Description</h3>
              <div className="prose max-w-full text-gray-700 overflow-hidden break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: proposal.description }} />
            </div>
          )}

          {/* Terms */}
          {proposal.terms && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Terms & Conditions</h3>
              <div className="prose max-w-full text-gray-700 overflow-hidden break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: proposal.terms }} />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-primary-accent/5 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-accent/10 flex items-center justify-center group-hover:bg-primary-accent/20" style={{ color: primaryColor }}>
                  <FaEye size={16} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Preview</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex flex-col items-center gap-2 p-3 hover:bg-green-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100">
                  <FaPrint size={16} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Print</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex flex-col items-center gap-2 p-3 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-100">
                  <FaRegFilePdf size={16} />
                </div>
                <span className="text-xs font-semibold text-gray-600">View PDF</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex flex-col items-center gap-2 p-3 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
                  <FaDownload size={16} />
                </div>
                <span className="text-xs font-semibold text-gray-600">Download</span>
              </button>
            </div>
          </div>

          {/* Accept/Reject Actions */}
          {proposal.status === "Sent" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Respond to Proposal</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <IoCheckmark size={20} />
                  Accept Proposal
                </button>
                <button
                  onClick={handleReject}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
                >
                  <IoClose size={20} />
                  Reject Proposal
                </button>
              </div>
            </div>
          )}

          {/* Status Info */}
          {proposal.status !== "Sent" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Proposal Status</h3>
              <div className={`p-4 rounded-lg ${
                proposal.status === 'Accepted' ? 'bg-green-50 border border-green-200' :
                proposal.status === 'Rejected' ? 'bg-red-50 border border-red-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    proposal.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                    proposal.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {proposal.status === 'Accepted' ? <IoCheckmark size={20} /> :
                     proposal.status === 'Rejected' ? <IoClose size={20} /> :
                     <IoTime size={20} />}
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      proposal.status === 'Accepted' ? 'text-green-700' :
                      proposal.status === 'Rejected' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {proposal.status === 'Accepted' ? 'Proposal Accepted' :
                       proposal.status === 'Rejected' ? 'Proposal Rejected' :
                       'Pending Response'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {proposal.status === 'Accepted' ? 'You have accepted this proposal' :
                       proposal.status === 'Rejected' ? 'You have rejected this proposal' :
                       'Waiting for your response'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validity Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Validity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <IoCalendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="font-medium text-gray-900">
                    {proposal.valid_till ? new Date(proposal.valid_till).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No expiry'}
                  </p>
                </div>
              </div>
              {proposal.valid_till && new Date(proposal.valid_till) < new Date() && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">⚠️ This proposal has expired</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Proposal Preview"
        size="xl"
      >
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div dangerouslySetInnerHTML={{ __html: generatePrintContent() }} />
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleDownload}>
              <FaDownload size={14} className="mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProposalDetail;

