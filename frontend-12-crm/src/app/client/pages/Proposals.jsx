import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { useSettings } from "../../../context/SettingsContext";
import DataTable from "../../../components/ui/DataTable";
import { proposalsAPI } from "../../../api";
import { 
  IoEye, 
  IoDownload, 
  IoCheckmark, 
  IoClose, 
  IoPrint,
  IoChevronDown,
  IoChevronUp,
  IoFilter,
  IoSearch
} from "react-icons/io5";

const Proposals = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const userId = user?.id || localStorage.getItem("userId");
  const companyId = user?.company_id || localStorage.getItem("companyId");
  const clientId = user?.client_id || localStorage.getItem("clientId");
  const primaryColor = theme?.primaryAccent || '#0891b2';

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });

  useEffect(() => {
    if (companyId) {
      fetchProposals();
    }
  }, [companyId, clientId]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await proposalsAPI.getAll({
        company_id: companyId,
        client_id: clientId || userId,
      });
      if (response.data.success) {
        const fetchedProposals = response.data.data || [];
        const transformed = fetchedProposals.map((p) => ({
          ...p,
          id: p.id,
          title: p.title || `Proposal #${p.id}`,
          proposal_number: p.proposal_number || `PROP-${String(p.id).padStart(4, '0')}`,
          total: parseFloat(p.total || 0),
          status: p.status || "Pending",
          valid_till: p.valid_till,
          created_at: p.created_at,
          description: p.description || "",
          client_name: p.client_name || user?.name || "Client",
        }));
        setProposals(transformed);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (proposal) => {
    navigate(`/app/client/proposals/${proposal.id}`);
  };

  const handleAccept = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to accept this proposal?")) {
      try {
        await proposalsAPI.updateStatus(id, "Accepted", { company_id: companyId });
        alert("Proposal accepted successfully!");
        fetchProposals();
      } catch (error) {
        console.error("Error accepting proposal:", error);
        alert("Failed to accept proposal");
      }
    }
  };

  const handleReject = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to reject this proposal?")) {
      try {
        await proposalsAPI.updateStatus(id, "Rejected", { company_id: companyId });
        alert("Proposal rejected!");
        fetchProposals();
      } catch (error) {
        console.error("Error rejecting proposal:", error);
        alert("Failed to reject proposal");
      }
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    let matches = true;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        p.title?.toLowerCase().includes(query) ||
        p.proposal_number?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter) {
      matches = matches && p.status === statusFilter;
    }
    
    if (dateFilter.start) {
      matches = matches && new Date(p.created_at) >= new Date(dateFilter.start);
    }
    
    if (dateFilter.end) {
      matches = matches && new Date(p.created_at) <= new Date(dateFilter.end);
    }
    
    return matches;
  });

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
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "proposal_number",
      label: "Proposal #",
      render: (value, row) => (
        <span 
          className="font-semibold cursor-pointer hover:underline"
          style={{ color: primaryColor }}
          onClick={() => handleView(row)}
        >
          {value}
        </span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "total",
      label: "Amount",
      render: (value) => (
        <span className="font-semibold">${parseFloat(value || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "valid_till",
      label: "Valid Till",
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value) => (
        <span className="text-sm text-secondary-text">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
        </span>
      ),
    },
  ];

  const actions = (row) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); handleView(row); }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        style={{ color: primaryColor }}
        title="View"
      >
        <IoEye size={18} />
      </button>
      {row.status === "Sent" && (
        <>
          <button
            onClick={(e) => handleAccept(row.id, e)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Accept"
          >
            <IoCheckmark size={18} />
          </button>
          <button
            onClick={(e) => handleReject(row.id, e)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Reject"
          >
            <IoClose size={18} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-text">Proposals</h1>
          <p className="text-secondary-text mt-1">View and respond to proposals</p>
        </div>
        
        {/* Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isFilterOpen ? 'text-white border-transparent' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            style={isFilterOpen ? { backgroundColor: primaryColor } : {}}
          >
            <IoFilter size={18} />
            <span className="text-sm font-medium">Filters</span>
            {isFilterOpen ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search proposals..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Sent">Sent</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setDateFilter({ start: "", end: "" });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Proposals Table */}
      {loading ? (
        <div className="text-center py-12">
          <div 
            className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-transparent"
            style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}
          ></div>
          <p className="text-secondary-text mt-4">Loading proposals...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProposals}
            searchPlaceholder="Search proposals..."
            filters={false}
            actions={actions}
            bulkActions={false}
            emptyMessage="No proposals found"
            onRowClick={handleView}
          />
        </div>
      )}
    </div>
  );
};

export default Proposals;
