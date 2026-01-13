import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/ui/AddButton";
import RightSideModal from "../../../components/ui/RightSideModal";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import {
  invoicesAPI,
  clientsAPI,
  projectsAPI,
  companiesAPI,
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
  IoCloudUpload,
  IoTrash,
  IoCreate,
  IoEye,
  IoRefresh,
  IoTime,
  IoInformationCircle,
  IoHelpCircle,
  IoPrint,
  IoOpenOutline,
  IoPricetag,
  IoCash,
  IoAttach,
  IoMic,
  IoDocumentText,
  IoGrid,
  IoCheckmark,
  IoChevronBack,
  IoChevronForward,
  IoCopy,
  IoWarning,
  IoColorPalette,
  IoNotifications,
} from "react-icons/io5";

const Invoices = () => {
  const navigate = useNavigate();
  const companyId = parseInt(localStorage.getItem("companyId") || 1, 10);
  const userId = parseInt(localStorage.getItem("userId") || 1, 10);

  // Tab state
  const [activeTab, setActiveTab] = useState("invoices");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Labels state
  const [labels, setLabels] = useState([
    { name: 'Urgent', color: '#ef4444' },
    { name: 'Pending Review', color: '#eab308' },
    { name: 'Approved', color: '#22c55e' },
    { name: 'In Progress', color: '#3b82f6' },
    { name: 'Taxable', color: '#8b5cf6' },
  ]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#22c55e");

  // Data states
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("yearly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Invoice items state
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    client: "",
    project: "",
    currency: "USD",
    tax: "",
    taxRate: 0,
    secondTax: "",
    secondTaxRate: 0,
    tds: "",
    note: "",
    labels: "",
    isRecurring: true,
    repeatEvery: 1,
    repeatType: "Month",
    cycles: "",
    discount: 0,
    discountType: "%",
  });

  // Fetch functions
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = { company_id: companyId };
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }
      const response = await invoicesAPI.getAll(params);
      if (response.data.success) {
        const fetchedInvoices = response.data.data || [];
        const transformedInvoices = fetchedInvoices.map((invoice) => {
          let invNumber = invoice.invoice_number || "";
          const numMatch = invNumber.match(/\d+/);
          const numPart = numMatch ? numMatch[0] : String(invoice.id);
          const formattedInvoiceNumber = `INV #${numPart}`;

          return {
            id: invoice.id,
            invoiceNumber: formattedInvoiceNumber,
            client: {
              name: invoice.client_name || "Unknown Client",
            },
            project: invoice.project_name || "-",
            invoiceDate: invoice.bill_date || invoice.invoice_date || "",
            dueDate: invoice.due_date || "",
            total: parseFloat(invoice.total || 0),
            paid: parseFloat(invoice.paid_amount || 0),
            unpaid: parseFloat(invoice.due_amount || invoice.total || 0),
            status: (invoice.status || "Unpaid").charAt(0).toUpperCase() + (invoice.status || "Unpaid").slice(1).toLowerCase(),
            labels: invoice.labels || "",
            items: invoice.items || [],
          };
        });
        setInvoices(transformedInvoices);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, statusFilter]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await clientsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setClients(response.data.data || []);
        setFilteredClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
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
    fetchInvoices();
    fetchClients();
    fetchProjects();
  }, [fetchInvoices, fetchClients, fetchProjects]);

  useEffect(() => {
    if (formData.client) {
      const clientId = parseInt(formData.client);
      const filtered = projects.filter((p) => p.client_id === clientId);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [formData.client, projects]);

  const generateInvoiceNumber = () => {
    const nextNum = invoices.length + 1;
    return `INV#${String(nextNum).padStart(3, "0")}`;
  };

  const resetForm = () => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);

    setFormData({
      invoiceNumber: generateInvoiceNumber(),
      billDate: today.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      client: "",
      project: "",
      currency: "USD",
      tax: "",
      taxRate: 0,
      secondTax: "",
      secondTaxRate: 0,
      tds: "",
      note: "",
      labels: "",
      isRecurring: true,
      repeatEvery: 1,
      repeatType: "Month",
      cycles: "",
      discount: 0,
      discountType: "%",
    });
    setInvoiceItems([]);
  };

  const handleSave = async () => {
    if (!formData.client) {
      alert("Client is required");
      return;
    }
    if (!formData.dueDate) {
      alert("Due Date is required");
      return;
    }

    try {
      const invoiceData = {
        company_id: companyId,
        user_id: userId,
        created_by: userId,
        invoice_number: formData.invoiceNumber || generateInvoiceNumber(),
        bill_date: formData.billDate,
        invoice_date: formData.billDate,
        due_date: formData.dueDate,
        client_id: parseInt(formData.client),
        project_id: formData.project ? parseInt(formData.project) : null,
        status: "Unpaid",
        currency: formData.currency,
        discount: formData.discount || 0,
        discount_type: formData.discountType || "%",
        note: formData.note || null,
        labels: formData.labels || null,
        tax: formData.tax || null,
        tax_rate: formData.taxRate || 0,
        second_tax: formData.secondTax || null,
        second_tax_rate: formData.secondTaxRate || 0,
        tds: formData.tds || null,
        is_recurring: formData.isRecurring ? 1 : 0,
        repeat_every: formData.isRecurring ? formData.repeatEvery : null,
        repeat_type: formData.isRecurring ? formData.repeatType : null,
        cycles: formData.isRecurring ? formData.cycles || null : null,
        items: invoiceItems.map((item) => ({
          item_name: item.itemName,
          description: item.description || null,
          quantity: item.quantity || 1,
          unit: item.unit || "Pcs",
          unit_price: item.unitPrice || 0,
          amount: item.amount || item.unitPrice * item.quantity,
        })),
      };

      if (isEditModalOpen && selectedInvoice) {
        const response = await invoicesAPI.update(selectedInvoice.id, invoiceData);
        if (response.data.success) {
          alert("Invoice updated successfully!");
          await fetchInvoices();
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
          resetForm();
        }
      } else {
        const response = await invoicesAPI.create(invoiceData);
        if (response.data.success) {
          alert("Invoice created successfully!");
          await fetchInvoices();
          setIsAddModalOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(error.response?.data?.error || "Failed to save invoice");
    }
  };

  const handleEdit = async (invoice) => {
    try {
      const response = await invoicesAPI.getById(invoice.id);
      if (response.data.success) {
        const data = response.data.data;
        setSelectedInvoice(invoice);
        setFormData({
          invoiceNumber: data.invoice_number || invoice.invoiceNumber,
          billDate: data.bill_date ? data.bill_date.split("T")[0] : "",
          dueDate: data.due_date ? data.due_date.split("T")[0] : "",
          client: data.client_id?.toString() || "",
          project: data.project_id?.toString() || "",
          currency: data.currency || "USD",
          tax: data.tax || "",
          taxRate: data.tax_rate || 0,
          secondTax: data.second_tax || "",
          secondTaxRate: data.second_tax_rate || 0,
          tds: data.tds || "",
          note: data.note || "",
          labels: data.labels || "",
          isRecurring: data.is_recurring || false,
          repeatEvery: data.repeat_every || 1,
          repeatType: data.repeat_type || "Month",
          cycles: data.cycles || "",
          discount: data.discount || 0,
          discountType: data.discount_type || "%",
        });
        setInvoiceItems(data.items || []);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Failed to load invoice details");
    }
  };

  const handleDelete = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete ${invoice.invoiceNumber}?`)) {
      try {
        const response = await invoicesAPI.delete(invoice.id);
        if (response.data.success) {
          alert("Invoice deleted successfully!");
          await fetchInvoices();
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert(error.response?.data?.error || "Failed to delete invoice");
      }
    }
  };

  const handleView = (invoice) => {
    navigate(`/app/admin/invoices/${invoice.id}`);
  };

  const handleCopy = async (invoice) => {
    try {
      const response = await invoicesAPI.getById(invoice.id);
      if (response.data.success) {
        const data = response.data.data;
        const copyData = {
          ...data,
          invoice_number: generateInvoiceNumber(),
          status: "Unpaid",
        };
        delete copyData.id;
        delete copyData.created_at;
        delete copyData.updated_at;

        const createResponse = await invoicesAPI.create(copyData);
        if (createResponse.data.success) {
          alert("Invoice copied successfully!");
          await fetchInvoices();
        }
      }
    } catch (error) {
      console.error("Error copying invoice:", error);
      alert("Failed to copy invoice");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoices List</title>
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
          <h1>Invoices List</h1>
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Bill date</th>
                <th>Due date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices.map((inv) => `
                <tr>
                  <td>${inv.invoiceNumber}</td>
                  <td>${inv.client?.name || ""}</td>
                  <td>${formatDate(inv.invoiceDate)}</td>
                  <td>${formatDate(inv.dueDate)}</td>
                  <td>$${parseFloat(inv.total || 0).toFixed(2)}</td>
                  <td>${inv.status}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">Total:</td>
                <td>$${filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0).toFixed(2)}</td>
                <td></td>
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

  const handleExportExcel = () => {
    const csvData = filteredInvoices.map((inv) => ({
      "Invoice": inv.invoiceNumber,
      "Client": inv.client?.name || "",
      "Bill date": formatDate(inv.invoiceDate),
      "Due date": formatDate(inv.dueDate),
      "Amount": inv.total,
      "Status": inv.status,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((h) => `"${row[h] || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleApplyFilters = () => {
    fetchInvoices();
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setClientFilter("All");
    setPeriodFilter("yearly");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setCustomDateStart("");
    setCustomDateEnd("");
    setSearchQuery("");
    setShowFilterPanel(false);
    fetchInvoices();
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    if (labels.some((l) => l.name.toLowerCase() === newLabelName.trim().toLowerCase())) {
      alert("Label already exists");
      return;
    }
    setLabels([...labels, { name: newLabelName.trim(), color: newLabelColor }]);
    setNewLabelName("");
    setNewLabelColor("#22c55e");
  };

  const handleDeleteLabel = (labelName) => {
    if (!window.confirm(`Delete label "${labelName}"?`)) return;
    setLabels(labels.filter((l) => l.name !== labelName));
  };

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

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "paid":
      case "fully paid":
        return "bg-green-500 text-white";
      case "partially paid":
        return "bg-blue-500 text-white";
      case "unpaid":
      case "not paid":
        return "bg-yellow-500 text-white";
      case "overdue":
        return "bg-red-500 text-white";
      case "draft":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((invoice) => {
    if (!invoice) return false;

    if (searchQuery && !invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (statusFilter !== "All" && invoice.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    if (clientFilter !== "All") {
      const clientId = parseInt(clientFilter);
      const matchingClient = clients.find((c) => c.id === clientId);
      if (matchingClient && invoice.client?.name !== matchingClient.client_name && invoice.client?.name !== matchingClient.name) {
        return false;
      }
    }

    const invoiceDate = invoice.invoiceDate ? new Date(invoice.invoiceDate) : null;

    if (periodFilter === "yearly" && invoiceDate) {
      if (invoiceDate.getFullYear() !== selectedYear) return false;
    }

    if (periodFilter === "monthly" && invoiceDate) {
      if (invoiceDate.getFullYear() !== selectedYear || invoiceDate.getMonth() + 1 !== selectedMonth) return false;
    }

    if (customDateStart && invoiceDate) {
      if (invoiceDate < new Date(customDateStart)) return false;
    }

    if (customDateEnd && invoiceDate) {
      const endDate = new Date(customDateEnd);
      endDate.setHours(23, 59, 59, 999);
      if (invoiceDate > endDate) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Tax options
  const taxOptions = [
    { value: "", label: "-" },
    { value: "GST: 10%", label: "GST: 10%", rate: 10 },
    { value: "CGST: 18%", label: "CGST: 18%", rate: 18 },
    { value: "VAT: 10%", label: "VAT: 10%", rate: 10 },
  ];

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

  return (
    <div className="space-y-4 bg-gray-100 min-h-screen p-4">
      {/* Top Bar */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <IoGrid size={18} className="text-gray-500" />
            </button>

            {/* Filters Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Filters
                <IoChevronDown size={16} className="text-gray-500" />
              </button>
              {showFiltersDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => { setStatusFilter("All"); setShowFiltersDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    All Invoices
                  </button>
                  <button
                    onClick={() => { setStatusFilter("Paid"); setShowFiltersDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => { setStatusFilter("Unpaid"); setShowFiltersDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Not Paid
                  </button>
                  <button
                    onClick={() => { setStatusFilter("Overdue"); setShowFiltersDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Overdue
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab("credit-notes")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "credit-notes" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              + Credit Notes
            </button>

            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "invoices" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Invoices
            </button>

            <button
              onClick={() => setStatusFilter("Overdue")}
              className="p-2 text-orange-500 border border-orange-300 rounded-lg hover:bg-orange-50"
              title="View Overdue Invoices"
            >
              <IoNotifications size={18} />
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Excel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Print
            </button>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-48 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <AddButton
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              label="Add invoice"
              className="bg-green-500 hover:bg-green-600"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice</th>
                <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bill date</th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Due date</th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading invoices...</td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No invoices found</td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button onClick={() => handleView(invoice)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {invoice.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {invoice.client?.name || "Unknown Client"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">{formatDate(invoice.invoiceDate)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-medium">{formatCurrency(invoice.total)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(invoice.status)}`}>
                        {invoice.status === "Unpaid" ? "Not paid" : invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleCopy(invoice)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Copy">
                          <IoCopy size={16} />
                        </button>
                        <button onClick={() => handleEdit(invoice)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Edit">
                          <IoCreate size={16} />
                        </button>
                        <button onClick={() => handleDelete(invoice)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                          <IoClose size={16} />
                        </button>
                        <button onClick={() => handleView(invoice)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="More">
                          <IoEllipsisVertical size={16} />
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
              {startIndex + 1}-{Math.min(endIndex, filteredInvoices.length)} / {filteredInvoices.length}
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-700">
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

      {/* Add/Edit Invoice Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedInvoice(null); resetForm(); }}
        title={isEditModalOpen ? "Edit invoice" : "Add invoice"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Bill date & Due date */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Bill date</label>
            <Input
              type="date"
              value={formData.billDate}
              onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
              className="flex-1"
            />
          </div>

          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Due date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="flex-1"
            />
          </div>

          {/* Client */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Client</label>
            <select
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value, project: "" })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.client_name || client.name}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Project</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="">Select Project</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>{project.project_name || project.name}</option>
              ))}
            </select>
          </div>

          {/* TAX */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">TAX</label>
            <select
              value={formData.tax}
              onChange={(e) => {
                const t = taxOptions.find((o) => o.value === e.target.value);
                setFormData({ ...formData, tax: e.target.value, taxRate: t?.rate || 0 });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              {taxOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>

          {/* Second TAX */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Second TAX</label>
            <select
              value={formData.secondTax}
              onChange={(e) => {
                const t = taxOptions.find((o) => o.value === e.target.value);
                setFormData({ ...formData, secondTax: e.target.value, secondTaxRate: t?.rate || 0 });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              {taxOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>

          {/* TDS */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">TDS</label>
            <select
              value={formData.tds}
              onChange={(e) => setFormData({ ...formData, tds: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="">-</option>
              <option value="TDS 1%">TDS 1%</option>
              <option value="TDS 2%">TDS 2%</option>
              <option value="TDS 5%">TDS 5%</option>
            </select>
          </div>

          {/* Recurring Section */}
          <div className="flex items-start">
            <label className="w-32 text-sm font-medium text-gray-700 pt-2">Recurring</label>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-600">Enable recurring</span>
              </div>
              {formData.isRecurring && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">Repeat every:</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.repeatEvery}
                    onChange={(e) => setFormData({ ...formData, repeatEvery: parseInt(e.target.value) || 1 })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <select
                    value={formData.repeatType}
                    onChange={(e) => setFormData({ ...formData, repeatType: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Day">Day(s)</option>
                    <option value="Week">Week(s)</option>
                    <option value="Month">Month(s)</option>
                    <option value="Year">Year(s)</option>
                  </select>
                  <span className="text-sm text-gray-600">Cycles:</span>
                  <input
                    type="number"
                    placeholder="∞"
                    value={formData.cycles}
                    onChange={(e) => setFormData({ ...formData, cycles: e.target.value })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <IoHelpCircle className="text-gray-400" size={16} title="Leave empty for infinite cycles" />
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start">
            <label className="w-32 text-sm font-medium text-gray-700 pt-2">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add a note..."
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none"
            />
          </div>

          {/* Labels */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Labels</label>
            <Input
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              placeholder="Urgent, Taxable"
              className="flex-1"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                <IoAttach size={16} /> Upload File
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                <IoMic size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedInvoice(null); resetForm(); }}
              >
                Close
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                <IoCheckmark size={18} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Manage Labels Modal */}
      <Modal isOpen={isManageLabelsModalOpen} onClose={() => setIsManageLabelsModalOpen(false)} title="Manage Labels">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Label name" />
            </div>
            <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
            <Button onClick={handleAddLabel} className="bg-blue-600 hover:bg-blue-700 text-white">
              <IoAdd size={18} /> Add
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {labels.map((label) => (
              <div key={label.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: label.color }}></div>
                  <span className="font-medium" style={{ color: label.color }}>{label.name}</span>
                </div>
                <button onClick={() => handleDeleteLabel(label.name)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <IoTrash size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsManageLabelsModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
