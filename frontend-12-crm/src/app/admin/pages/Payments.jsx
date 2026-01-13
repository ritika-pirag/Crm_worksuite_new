import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import AddButton from "../../../components/ui/AddButton";
import {
  paymentsAPI,
  invoicesAPI,
  projectsAPI,
} from "../../../api";
import {
  IoAdd,
  IoClose,
  IoSearch,
  IoFilter,
  IoDownload,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisVertical,
  IoCheckmarkCircle,
  IoTrash,
  IoCreate,
  IoEye,
  IoPrint,
  IoGrid,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward,
  IoList,
  IoBarChart,
  IoCash,
} from "react-icons/io5";

const Payments = () => {
  const navigate = useNavigate();
  const companyId = parseInt(localStorage.getItem("companyId") || 1, 10);
  const userId = parseInt(localStorage.getItem("userId") || 1, 10);

  // Tab state
  const [activeTab, setActiveTab] = useState("payment-received");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Data states
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [currencyFilter, setCurrencyFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    invoice_id: "",
    payment_method: "",
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    note: "",
  });

  // Payment methods list
  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "PayPal Payments Standard",
    "Paytm",
    "Stripe",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Cheque",
  ];

  // Currency options
  const currencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"];

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch functions
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { company_id: companyId };
      const response = await paymentsAPI.getAll(params);
      if (response.data.success) {
        setPayments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await invoicesAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setInvoices(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [companyId]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchProjects();
  }, [fetchPayments, fetchInvoices, fetchProjects]);

  // Reset form
  const resetForm = () => {
    setFormData({
      invoice_id: "",
      payment_method: "",
      payment_date: new Date().toISOString().split("T")[0],
      amount: "",
      note: "",
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.invoice_id) {
      alert("Please select an invoice");
      return;
    }
    if (!formData.payment_method) {
      alert("Please select a payment method");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const paymentData = {
        company_id: companyId,
        user_id: userId,
        invoice_id: parseInt(formData.invoice_id),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        amount: parseFloat(formData.amount),
        note: formData.note || null,
      };

      if (isEditModalOpen && selectedPayment) {
        const response = await paymentsAPI.update(selectedPayment.id, paymentData, { company_id: companyId });
        if (response.data.success) {
          alert("Payment updated successfully!");
          await fetchPayments();
          setIsEditModalOpen(false);
          setSelectedPayment(null);
          resetForm();
        }
      } else {
        const response = await paymentsAPI.create(paymentData);
        if (response.data.success) {
          alert("Payment added successfully!");
          await fetchPayments();
          await fetchInvoices();
          setIsAddModalOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      alert(error.response?.data?.error || "Failed to save payment");
    }
  };

  // Handle edit
  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      invoice_id: payment.invoice_id?.toString() || "",
      payment_method: payment.payment_method || "",
      payment_date: payment.payment_date ? payment.payment_date.split("T")[0] : new Date().toISOString().split("T")[0],
      amount: payment.amount?.toString() || "",
      note: payment.note || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (payment) => {
    if (window.confirm(`Are you sure you want to delete this payment of $${payment.amount}?`)) {
      try {
        const response = await paymentsAPI.delete(payment.id, { company_id: companyId });
        if (response.data.success) {
          alert("Payment deleted successfully!");
          await fetchPayments();
          await fetchInvoices();
        }
      } catch (error) {
        console.error("Error deleting payment:", error);
        alert(error.response?.data?.error || "Failed to delete payment");
      }
    }
  };

  // Handle view invoice
  const handleViewInvoice = (invoiceId) => {
    if (invoiceId) {
      navigate(`/app/admin/invoices/${invoiceId}`);
    }
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Received List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Payment Received List</h1>
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Payment date</th>
                <th>Payment method</th>
                <th>Note</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.map((payment) => `
                <tr>
                  <td>INV #${payment.invoice_id || payment.id}</td>
                  <td>${formatDate(payment.payment_date)}</td>
                  <td>${payment.payment_method || "-"}</td>
                  <td>${payment.note || "-"}</td>
                  <td>$${parseFloat(payment.amount || 0).toFixed(2)}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">Total:</td>
                <td>$${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
  };

  // Handle export Excel
  const handleExportExcel = () => {
    const csvData = filteredPayments.map((payment) => ({
      "Invoice ID": `INV #${payment.invoice_id || payment.id}`,
      "Payment date": formatDate(payment.payment_date),
      "Payment method": payment.payment_method || "-",
      "Note": payment.note || "-",
      "Amount": payment.amount,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((h) => `"${row[h] || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filter handlers
  const handleApplyFilters = () => {
    fetchPayments();
  };

  const handleResetFilters = () => {
    setPaymentMethodFilter("All");
    setCurrencyFilter("All");
    setProjectFilter("All");
    setPeriodFilter("monthly");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setCustomDateStart("");
    setCustomDateEnd("");
    setSearchQuery("");
    setShowFilterPanel(false);
    fetchPayments();
  };

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get invoice display with due amount
  const getInvoiceDisplay = (invoice) => {
    const invoiceNum = invoice.invoice_number || `INV #${invoice.id}`;
    const dueAmount = parseFloat(invoice.due_amount || invoice.total || 0) - parseFloat(invoice.paid_amount || 0);
    return `${invoiceNum} (Due: $${dueAmount.toFixed(2)})`;
  };

  // Handle invoice selection - auto-fill amount
  const handleInvoiceSelect = (invoiceId) => {
    setFormData({ ...formData, invoice_id: invoiceId });
    if (invoiceId) {
      const selectedInvoice = invoices.find(inv => inv.id === parseInt(invoiceId));
      if (selectedInvoice) {
        const dueAmount = parseFloat(selectedInvoice.due_amount || selectedInvoice.total || 0) - parseFloat(selectedInvoice.paid_amount || 0);
        setFormData(prev => ({ ...prev, invoice_id: invoiceId, amount: dueAmount > 0 ? dueAmount.toFixed(2) : "" }));
      }
    }
  };

  // Filtered payments
  const filteredPayments = payments.filter((payment) => {
    if (!payment) return false;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const invoiceId = `INV #${payment.invoice_id || payment.id}`.toLowerCase();
      const note = (payment.note || "").toLowerCase();
      const method = (payment.payment_method || "").toLowerCase();
      if (!invoiceId.includes(searchLower) && !note.includes(searchLower) && !method.includes(searchLower)) {
        return false;
      }
    }

    // Payment method filter
    if (paymentMethodFilter !== "All" && payment.payment_method !== paymentMethodFilter) {
      return false;
    }

    // Project filter
    if (projectFilter !== "All") {
      const projectId = parseInt(projectFilter);
      if (payment.project_id !== projectId) {
        return false;
      }
    }

    // Date filters
    const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;

    if (periodFilter === "monthly" && paymentDate) {
      if (paymentDate.getFullYear() !== selectedYear || paymentDate.getMonth() + 1 !== selectedMonth) {
        return false;
      }
    }

    if (periodFilter === "yearly" && paymentDate) {
      if (paymentDate.getFullYear() !== selectedYear) {
        return false;
      }
    }

    if (customDateStart && paymentDate) {
      if (paymentDate < new Date(customDateStart)) return false;
    }

    if (customDateEnd && paymentDate) {
      const endDate = new Date(customDateEnd);
      endDate.setHours(23, 59, 59, 999);
      if (paymentDate > endDate) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Total amount
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  // Get invoices with pending due amounts
  const invoicesWithDue = invoices.filter(inv => {
    const dueAmount = parseFloat(inv.due_amount || inv.total || 0) - parseFloat(inv.paid_amount || 0);
    return dueAmount > 0;
  });

  return (
    <div className="space-y-4 bg-gray-100 min-h-screen p-4">
      {/* Top Navigation - Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left Side - Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("payment-received")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "payment-received" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <IoCash className="inline mr-2" size={16} />
              Payment Received
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <IoList className="inline mr-2" size={16} />
              List
            </button>
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "chart" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <IoBarChart className="inline mr-2" size={16} />
              Chart
            </button>
          </div>

          {/* Right Side - Add Button */}
          <AddButton
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            label="+ Add payment"
            className="bg-green-500 hover:bg-green-600"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <IoGrid size={18} className="text-gray-500" />
            </button>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-colors ${
                showFilterPanel ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <IoAdd size={16} />
              + Add new filter
            </button>
          </div>

          {/* Right Side - Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Method Dropdown */}
            <div className="relative">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg outline-none bg-white"
              >
                <option value="All">- Payment method -</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Currency Dropdown */}
            <div className="relative">
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg outline-none bg-white"
              >
                <option value="All">- Currency -</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Project Dropdown */}
            <div className="relative">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg outline-none bg-white"
              >
                <option value="All">- Project -</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.project_name || project.name}</option>
                ))}
              </select>
              <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Period Buttons */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {["monthly", "yearly", "custom", "dynamic"].map((period) => (
                <button
                  key={period}
                  onClick={() => setPeriodFilter(period)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    periodFilter === period ? "bg-white shadow text-gray-800" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Month Selector */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  if (selectedMonth === 1) {
                    setSelectedMonth(12);
                    setSelectedYear(y => y - 1);
                  } else {
                    setSelectedMonth(m => m - 1);
                  }
                }}
                className="px-2 py-2 hover:bg-gray-100 border-r border-gray-300"
              >
                <IoChevronBack size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[140px] text-center">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </span>
              <button
                onClick={() => {
                  if (selectedMonth === 12) {
                    setSelectedMonth(1);
                    setSelectedYear(y => y + 1);
                  } else {
                    setSelectedMonth(m => m + 1);
                  }
                }}
                className="px-2 py-2 hover:bg-gray-100 border-l border-gray-300"
              >
                <IoChevronForward size={16} />
              </button>
            </div>

            {/* Apply & Reset Buttons */}
            <button onClick={handleApplyFilters} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600" title="Apply filters">
              <IoCheckmark size={18} />
            </button>
            <button onClick={handleResetFilters} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" title="Reset filters">
              <IoClose size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilterPanel && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search payments..."
                    className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg outline-none"
                  />
                  <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => { setCustomDateStart(""); setCustomDateEnd(""); setSearchQuery(""); }}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => { handleApplyFilters(); setShowFilterPanel(false); }}
                  className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice ID</th>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment date</th>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment method</th>
                <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Note</th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="w-[13%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading payments...</td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payments found</td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewInvoice(payment.invoice_id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        INV #{payment.invoice_id || payment.id}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {payment.payment_method || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-600 truncate max-w-xs" title={payment.note || ""}>
                      {payment.note || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <IoCreate size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <IoTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination and Total */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredPayments.length > 0 ? `${startIndex + 1}-${Math.min(endIndex, filteredPayments.length)}` : "0"} / {filteredPayments.length}
            </span>
          </div>
          <div className="text-sm font-bold text-gray-700">
            Total: {formatCurrency(totalAmount)}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 border border-gray-300 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <IoChevronBack size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-1.5 border border-gray-300 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              <IoChevronForward size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Payment Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedPayment(null); resetForm(); }}
        title={isEditModalOpen ? "Edit payment" : "Add payment"}
      >
        <div className="space-y-4">
          {/* Invoice */}
          <div className="flex items-center">
            <label className="w-36 text-sm font-medium text-gray-700">Invoice</label>
            <select
              value={formData.invoice_id}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Invoice</option>
              {invoicesWithDue.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {getInvoiceDisplay(invoice)}
                </option>
              ))}
              {/* Also show all invoices if editing */}
              {isEditModalOpen && invoices.filter(inv => !invoicesWithDue.find(i => i.id === inv.id)).map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number || `INV #${invoice.id}`} (Paid)
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="flex items-center">
            <label className="w-36 text-sm font-medium text-gray-700">Payment method</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Payment Date */}
          <div className="flex items-center">
            <label className="w-36 text-sm font-medium text-gray-700">Payment date</label>
            <Input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="flex-1"
            />
          </div>

          {/* Amount */}
          <div className="flex items-center">
            <label className="w-36 text-sm font-medium text-gray-700">Amount</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              className="flex-1"
            />
          </div>

          {/* Note */}
          <div className="flex items-start">
            <label className="w-36 text-sm font-medium text-gray-700 pt-2">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note (optional)..."
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedPayment(null); resetForm(); }}
            >
              Close
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <IoCheckmark size={18} className="mr-1" /> Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
