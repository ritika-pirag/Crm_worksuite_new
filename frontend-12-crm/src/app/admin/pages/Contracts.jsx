import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import AddButton from "../../../components/ui/AddButton";
import {
  contractsAPI,
  clientsAPI,
  projectsAPI,
  leadsAPI,
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
  IoDocumentText,
  IoCopy,
  IoAttach,
  IoMic,
} from "react-icons/io5";

const Contracts = () => {
  const navigate = useNavigate();
  const companyId = parseInt(localStorage.getItem("companyId") || 1, 10);
  const userId = parseInt(localStorage.getItem("userId") || 1, 10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Data states
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("yearly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    contract_date: new Date().toISOString().split("T")[0],
    valid_until: "",
    client_id: "",
    lead_id: "",
    project_id: "",
    tax: "",
    second_tax: "",
    note: "",
    amount: 0,
    status: "Draft",
  });

  // Status options
  const statusOptions = ["Draft", "Sent", "Accepted", "Declined", "Expired"];

  // Tax options
  const taxOptions = [
    { value: "", label: "-" },
    { value: "GST: 10%", label: "GST: 10%", rate: 10 },
    { value: "CGST: 18%", label: "CGST: 18%", rate: 18 },
    { value: "VAT: 10%", label: "VAT: 10%", rate: 10 },
  ];

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch functions
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { company_id: companyId };
      const response = await contractsAPI.getAll(params);
      if (response.data.success) {
        const fetchedContracts = response.data.data || [];
        const transformedContracts = fetchedContracts.map((contract) => {
          const contractNum = contract.contract_number || `CONTRACT #${contract.id}`;
          return {
            id: contract.id,
            contractNumber: contractNum,
            title: contract.title || contract.subject || "-",
            client_id: contract.client_id,
            client_name: contract.client_name || "-",
            project_id: contract.project_id,
            project_name: contract.project_name || "-",
            contract_date: contract.contract_date || contract.start_date || "",
            valid_until: contract.valid_until || contract.end_date || "",
            amount: parseFloat(contract.amount || contract.total || 0),
            status: contract.status || "Draft",
            note: contract.note || contract.description || "",
            items: contract.items || [],
          };
        });
        setContracts(transformedContracts);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await clientsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, [companyId]);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await leadsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
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
    fetchContracts();
    fetchClients();
    fetchLeads();
    fetchProjects();
  }, [fetchContracts, fetchClients, fetchLeads, fetchProjects]);

  // Filter projects by client
  useEffect(() => {
    if (formData.client_id) {
      const clientId = parseInt(formData.client_id);
      const filtered = projects.filter((p) => p.client_id === clientId);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [formData.client_id, projects]);

  // Reset form
  const resetForm = () => {
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setMonth(validUntil.getMonth() + 1);

    setFormData({
      title: "",
      contract_date: today.toISOString().split("T")[0],
      valid_until: validUntil.toISOString().split("T")[0],
      client_id: "",
      lead_id: "",
      project_id: "",
      tax: "",
      second_tax: "",
      note: "",
      amount: 0,
      status: "Draft",
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.title) {
      alert("Title is required");
      return;
    }
    if (!formData.client_id && !formData.lead_id) {
      alert("Please select a client or lead");
      return;
    }

    try {
      const contractData = {
        company_id: companyId,
        user_id: userId,
        created_by: userId,
        title: formData.title,
        subject: formData.title,
        contract_date: formData.contract_date,
        start_date: formData.contract_date,
        valid_until: formData.valid_until,
        end_date: formData.valid_until,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        lead_id: formData.lead_id ? parseInt(formData.lead_id) : null,
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        tax: formData.tax || null,
        second_tax: formData.second_tax || null,
        note: formData.note || null,
        description: formData.note || null,
        amount: formData.amount || 0,
        status: formData.status || "Draft",
      };

      if (isEditModalOpen && selectedContract) {
        const response = await contractsAPI.update(selectedContract.id, contractData, { company_id: companyId });
        if (response.data.success) {
          alert("Contract updated successfully!");
          await fetchContracts();
          setIsEditModalOpen(false);
          setSelectedContract(null);
          resetForm();
        }
      } else {
        const response = await contractsAPI.create(contractData);
        if (response.data.success) {
          alert("Contract created successfully!");
          await fetchContracts();
          setIsAddModalOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      alert(error.response?.data?.error || "Failed to save contract");
    }
  };

  // Handle edit
  const handleEdit = async (contract) => {
    try {
      const response = await contractsAPI.getById(contract.id, { company_id: companyId });
      if (response.data.success) {
        const data = response.data.data;
        setSelectedContract(contract);
        setFormData({
          title: data.title || data.subject || "",
          contract_date: data.contract_date ? data.contract_date.split("T")[0] : "",
          valid_until: data.valid_until ? data.valid_until.split("T")[0] : "",
          client_id: data.client_id?.toString() || "",
          lead_id: data.lead_id?.toString() || "",
          project_id: data.project_id?.toString() || "",
          tax: data.tax || "",
          second_tax: data.second_tax || "",
          note: data.note || data.description || "",
          amount: data.amount || 0,
          status: data.status || "Draft",
        });
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
      alert("Failed to load contract details");
    }
  };

  // Handle delete
  const handleDelete = async (contract) => {
    if (window.confirm(`Are you sure you want to delete ${contract.contractNumber}?`)) {
      try {
        const response = await contractsAPI.delete(contract.id, { company_id: companyId });
        if (response.data.success) {
          alert("Contract deleted successfully!");
          await fetchContracts();
        }
      } catch (error) {
        console.error("Error deleting contract:", error);
        alert(error.response?.data?.error || "Failed to delete contract");
      }
    }
  };

  // Handle view
  const handleView = (contract) => {
    navigate(`/app/admin/contracts/${contract.id}`);
  };

  // Handle copy
  const handleCopy = async (contract) => {
    try {
      const response = await contractsAPI.getById(contract.id, { company_id: companyId });
      if (response.data.success) {
        const data = response.data.data;
        const copyData = {
          ...data,
          title: `${data.title || data.subject} (Copy)`,
          status: "Draft",
        };
        delete copyData.id;
        delete copyData.created_at;
        delete copyData.updated_at;
        copyData.company_id = companyId;

        const createResponse = await contractsAPI.create(copyData);
        if (createResponse.data.success) {
          alert("Contract copied successfully!");
          await fetchContracts();
        }
      }
    } catch (error) {
      console.error("Error copying contract:", error);
      alert("Failed to copy contract");
    }
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contracts List</title>
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
          <h1>Contracts List</h1>
          <table>
            <thead>
              <tr>
                <th>Contract</th>
                <th>Title</th>
                <th>Client</th>
                <th>Project</th>
                <th>Contract date</th>
                <th>Valid until</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredContracts.map((contract) => `
                <tr>
                  <td>${contract.contractNumber}</td>
                  <td>${contract.title}</td>
                  <td>${contract.client_name}</td>
                  <td>${contract.project_name || "-"}</td>
                  <td>${formatDate(contract.contract_date)}</td>
                  <td>${formatDate(contract.valid_until)}</td>
                  <td>$${parseFloat(contract.amount || 0).toFixed(2)}</td>
                  <td>${contract.status}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;">Total:</td>
                <td>$${totalAmount.toFixed(2)}</td>
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

  // Handle export Excel
  const handleExportExcel = () => {
    const csvData = filteredContracts.map((contract) => ({
      "Contract": contract.contractNumber,
      "Title": contract.title,
      "Client": contract.client_name,
      "Project": contract.project_name || "-",
      "Contract date": formatDate(contract.contract_date),
      "Valid until": formatDate(contract.valid_until),
      "Amount": contract.amount,
      "Status": contract.status,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((h) => `"${row[h] || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `contracts_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filter handlers
  const handleApplyFilters = () => {
    fetchContracts();
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setPeriodFilter("yearly");
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth() + 1);
    setCustomDateStart("");
    setCustomDateEnd("");
    setSearchQuery("");
    setShowFilterPanel(false);
    fetchContracts();
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

  // Status styles
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "accepted":
        return "bg-blue-500 text-white";
      case "sent":
        return "bg-sky-400 text-white";
      case "draft":
        return "bg-gray-500 text-white";
      case "declined":
        return "bg-red-500 text-white";
      case "expired":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Filtered contracts
  const filteredContracts = contracts.filter((contract) => {
    if (!contract) return false;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !contract.contractNumber?.toLowerCase().includes(searchLower) &&
        !contract.title?.toLowerCase().includes(searchLower) &&
        !contract.client_name?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "All" && contract.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Date filters
    const contractDate = contract.contract_date ? new Date(contract.contract_date) : null;

    if (periodFilter === "monthly" && contractDate) {
      if (contractDate.getFullYear() !== selectedYear || contractDate.getMonth() + 1 !== selectedMonth) {
        return false;
      }
    }

    if (periodFilter === "yearly" && contractDate) {
      if (contractDate.getFullYear() !== selectedYear) {
        return false;
      }
    }

    if (customDateStart && contractDate) {
      if (contractDate < new Date(customDateStart)) return false;
    }

    if (customDateEnd && contractDate) {
      const endDate = new Date(customDateEnd);
      endDate.setHours(23, 59, 59, 999);
      if (contractDate > endDate) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  // Total amount
  const totalAmount = filteredContracts.reduce((sum, contract) => sum + (parseFloat(contract.amount) || 0), 0);

  return (
    <div className="space-y-4 bg-gray-100 min-h-screen p-4">
      {/* Top Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left Side - Title */}
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <IoDocumentText className="text-gray-600" size={24} />
            Contracts
          </h1>

          {/* Right Side - Add Button */}
          <AddButton
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            label="+ Add contract"
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
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg outline-none bg-white"
              >
                <option value="All">- Status -</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
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

            {/* Year Selector */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedYear(y => y - 1)}
                className="px-2 py-2 hover:bg-gray-100 border-r border-gray-300"
              >
                <IoChevronBack size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[80px] text-center">
                {selectedYear}
              </span>
              <button
                onClick={() => setSelectedYear(y => y + 1)}
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
                    placeholder="Search contracts..."
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

      {/* Contracts Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contract</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contract date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valid until</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading contracts...</td>
                </tr>
              ) : paginatedContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No contracts found</td>
                </tr>
              ) : (
                paginatedContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleView(contract)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {contract.contractNumber}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-gray-700 max-w-xs truncate" title={contract.title}>
                      {contract.title}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                      {contract.client_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {contract.project_name || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(contract.contract_date)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(contract.valid_until)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {formatCurrency(contract.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleCopy(contract)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Copy">
                          <IoCopy size={16} />
                        </button>
                        <button onClick={() => handleEdit(contract)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Edit">
                          <IoCreate size={16} />
                        </button>
                        <button onClick={() => handleDelete(contract)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                          <IoClose size={16} />
                        </button>
                        <button onClick={() => handleView(contract)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="More">
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
              {filteredContracts.length > 0 ? `${startIndex + 1}-${Math.min(endIndex, filteredContracts.length)}` : "0"} / {filteredContracts.length}
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

      {/* Add/Edit Contract Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedContract(null); resetForm(); }}
        title={isEditModalOpen ? "Edit contract" : "Add contract"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Title */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter contract title"
              className="flex-1"
            />
          </div>

          {/* Contract date */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Contract date</label>
            <Input
              type="date"
              value={formData.contract_date}
              onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
              className="flex-1"
            />
          </div>

          {/* Valid until */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Valid until</label>
            <Input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              className="flex-1"
            />
          </div>

          {/* Client/Lead */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Client/Lead</label>
            <select
              value={formData.client_id || formData.lead_id}
              onChange={(e) => {
                const value = e.target.value;
                const isLead = value.startsWith("lead_");
                if (isLead) {
                  setFormData({ ...formData, lead_id: value.replace("lead_", ""), client_id: "", project_id: "" });
                } else {
                  setFormData({ ...formData, client_id: value, lead_id: "", project_id: "" });
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="">Select Client or Lead</option>
              <optgroup label="Clients">
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.client_name || client.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Leads">
                {leads.map((lead) => (
                  <option key={`lead_${lead.id}`} value={`lead_${lead.id}`}>
                    {lead.name || lead.company_name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Project */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Project</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
              disabled={!formData.client_id}
            >
              <option value="">Select Project</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name || project.name}
                </option>
              ))}
            </select>
          </div>

          {/* TAX */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">TAX</label>
            <select
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              {taxOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Second TAX */}
          <div className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700">Second TAX</label>
            <select
              value={formData.second_tax}
              onChange={(e) => setFormData({ ...formData, second_tax: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              {taxOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedContract(null); resetForm(); }}
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
    </div>
  );
};

export default Contracts;
