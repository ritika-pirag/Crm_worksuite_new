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
} from "react-icons/io5";

const Invoices = () => {
  const navigate = useNavigate();
  // Get company_id and user_id from localStorage
  const companyId = parseInt(localStorage.getItem("companyId") || 1, 10);
  const userId = parseInt(localStorage.getItem("userId") || 1, 10);
  const [activeTab, setActiveTab] = useState("invoices"); // 'invoices' or 'recurring'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = useState(false);
  const [labels, setLabels] = useState([
    { name: 'Urgent', color: '#ef4444' },
    { name: 'Pending Review', color: '#eab308' },
    { name: 'Approved', color: '#22c55e' },
    { name: 'In Progress', color: '#3b82f6' }
  ]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#22c55e");

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;
    if (labels.some(l => l.name.toLowerCase() === newLabelName.trim().toLowerCase())) {
      alert("Label already exists");
      return;
    }
    setLabels([...labels, { name: newLabelName.trim(), color: newLabelColor }]);
    setNewLabelName("");
    setNewLabelColor("#22c55e");
  };

  const handleDeleteLabel = (labelName) => {
    if (!window.confirm(`Are you sure you want to delete the label "${labelName}"?`)) return;
    setLabels(labels.filter(l => l.name !== labelName));
  };
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [discountType, setDiscountType] = useState("%");
  const [showShippingAddress, setShowShippingAddress] = useState(false);

  // Product Templates Database (same as Expenses)
  const productTemplates = [
    {
      id: 1,
      name: "Electric Toothbrush",
      description:
        "Rechargeable electric toothbrush with multiple cleaning modes.",
      unitPrice: 973,
      unit: "Pcs",
    },
    {
      id: 2,
      name: "Smart Camera",
      description:
        "4K Ultra HD security camera with night vision and motion detection.",
      unitPrice: 2450,
      unit: "Pcs",
    },
    {
      id: 3,
      name: "Handheld Vacuum Cleaner",
      description: "Cordless handheld vacuum cleaner with powerful suction.",
      unitPrice: 1899,
      unit: "Pcs",
    },
    {
      id: 4,
      name: "Gaming Headset",
      description:
        "Wireless gaming headset with surround sound and noise cancellation.",
      unitPrice: 3299,
      unit: "Pcs",
    },
    {
      id: 5,
      name: "Women's Fashion Handbag",
      description: "Premium leather handbag with multiple compartments.",
      unitPrice: 4599,
      unit: "Pcs",
    },
    {
      id: 6,
      name: "Smart Watch",
      description: "Fitness tracking smartwatch with heart rate monitor.",
      unitPrice: 12999,
      unit: "Pcs",
    },
    {
      id: 7,
      name: "Electric Screwdriver",
      description:
        "Cordless electric screwdriver with multiple torque settings.",
      unitPrice: 2499,
      unit: "Pcs",
    },
    {
      id: 8,
      name: "Power Bank",
      description: "20000mAh portable power bank with fast charging.",
      unitPrice: 1499,
      unit: "Pcs",
    },
  ];

  const taxOptions = [
    { value: "", label: "Nothing selected" },
    { value: "GST 10%", label: "GST 10%", rate: 10 },
    { value: "CGST 18%", label: "CGST 18%", rate: 18 },
    { value: "VAT 10%", label: "VAT 10%", rate: 10 },
    { value: "IGST 10%", label: "IGST 10%", rate: 10 },
    { value: "UTGST 10%", label: "UTGST 10%", rate: 10 },
  ];

  const unitOptions = ["Pcs", "Kg", "Hours", "Days"];
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]); // Clients filtered by company
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]); // Projects filtered by client
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    company: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "USD ($)",
    exchangeRate: 1,
    client: "",
    project: "",
    calculateTax: "After Discount",
    tax: "",
    taxRate: 0,
    secondTax: "",
    secondTaxRate: 0,
    tds: "",
    isRecurring: false,
    bankAccount: "",
    paymentDetails: "",
    billingAddress: "",
    shippingAddress: "",
    generatedBy: "Developo",
    labels: "",
    note: "",
    terms: "Thank you for your business.",
    discount: 0,
    discountType: "%",
    // Time Log specific
    timeLogFrom: "",
    timeLogTo: "",
    // Recurring specific
    billingFrequency: "Monthly",
    startDate: "",
    totalCount: "",
    repeatEvery: 1,
    repeatType: "Month(s)", // Day(s), Week(s), Month(s), Year(s)
    cycles: "", // Optional, empty means unlimited
  });

  // Memoize fetch functions to prevent recreation
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await companiesAPI.getAll();
      if (response.data.success) {
        setCompanies(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      // Fetch only clients belonging to the logged-in admin's company
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error("Invalid companyId for fetchClients:", companyId);
        setClients([]);
        setFilteredClients([]);
        return;
      }
      const response = await clientsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setClients(response.data.data || []);
        setFilteredClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
      setFilteredClients([]);
    }
  }, [companyId]);

  const fetchProjects = useCallback(
    async (clientId = null) => {
      try {
        if (!companyId || isNaN(companyId) || companyId <= 0) {
          console.error("Invalid companyId for fetchProjects:", companyId);
          setProjects([]);
          return;
        }
        const params = { company_id: companyId };
        if (clientId) {
          params.client_id = clientId;
        }
        const response = await projectsAPI.getAll(params);
        if (response.data.success) {
          setProjects(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    [companyId]
  );

  // Clients are already filtered by company_id from localStorage - just use the clients array directly
  useEffect(() => {
    if (Array.isArray(clients) && clients.length > 0) {
      setFilteredClients(clients);
    }
  }, [clients]);

  // Fetch projects when client changes - Client → Project dependency
  useEffect(() => {
    if (formData.client) {
      const clientId = parseInt(formData.client);
      if (!isNaN(clientId)) {
        fetchProjects(clientId);
      } else {
        setFilteredProjects([]);
      }
    } else {
      setFilteredProjects([]);
    }
  }, [formData.client, fetchProjects]);

  // Filter projects by client (which is already filtered by company)
  useEffect(() => {
    if (formData.client && Array.isArray(projects) && projects.length > 0) {
      const clientId = parseInt(formData.client);
      if (isNaN(clientId)) {
        setFilteredProjects([]);
        return;
      }
      const filtered = projects.filter((project) => {
        if (!project) return false;
        // Check multiple possible field names for client_id
        const projectClientId =
          project.client_id || project.clientId || project.client;
        if (projectClientId === undefined || projectClientId === null)
          return false;
        const parsedClientId = parseInt(projectClientId);
        return !isNaN(parsedClientId) && parsedClientId === clientId;
      });
      setFilteredProjects(filtered);
    } else if (!formData.client) {
      // If no client selected, show all projects (or empty)
      setFilteredProjects(projects);
    } else {
      setFilteredProjects([]);
    }
  }, [formData.client, projects]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      if (!companyId || isNaN(companyId) || companyId <= 0) {
        console.error("Invalid companyId for fetchInvoices:", companyId);
        setInvoices([]);
        setLoading(false);
        return;
      }
      const params = { company_id: companyId };
      if (clientFilter !== "All") {
        params.client_id = clientFilter;
      }

      const response = await invoicesAPI.getAll(params);
      if (response.data.success) {
        const fetchedInvoices = response.data.data || [];
        // Transform API data to match component format
        const transformedInvoices = fetchedInvoices.map((invoice) => {
          const total = parseFloat(invoice.total || invoice.total_amount || 0);
          const paid = parseFloat(invoice.paid || invoice.paid_amount || 0);
          const unpaid = total - paid;

          // Determine status based on payments
          let status = "Unpaid";
          if (paid === 0) {
            status = "Unpaid";
          } else if (paid >= total) {
            status = "Fully Paid";
          } else if (paid > 0) {
            status = "Partially Paid";
          }
          if (invoice.status === "Draft") status = "Draft";
          if (invoice.status === "Credited") status = "Credited";

          return {
            id: invoice.id,
            code: invoice.project_code || "",
            invoiceNumber: invoice.invoice_number || `INV #${invoice.id}`,
            company_id: invoice.company_id,
            company_name: invoice.company_name || "--",
            project: invoice.project_name || "",
            client: {
              name: invoice.client_name || "Unknown Client",
              company: invoice.company_name || "Unknown Company",
              avatar: invoice.client_name
                ? invoice.client_name.substring(0, 2).toUpperCase()
                : "UC",
            },
            total: total,
            paid: paid,
            unpaid: unpaid,
            invoiceDate:
              invoice.bill_date ||
              invoice.invoice_date ||
              invoice.created_at ||
              "",
            dueDate: invoice.due_date || "",
            status: status,
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
  }, [clientFilter]); // Only depends on clientFilter

  // Fetch initial data (companies, clients, projects) only once on mount
  useEffect(() => {
    // Parallelize initial data fetch for better performance
    Promise.all([fetchCompanies(), fetchClients(), fetchProjects()]);
  }, [fetchCompanies, fetchClients, fetchProjects]);

  // Fetch invoices on mount and when clientFilter changes
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest(".dropdown-container")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // Filter products based on search
  const filteredProducts = productTemplates.filter((product) =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const nextNum = invoices.length + 1;
    return `INV#${String(nextNum).padStart(3, "0")}`;
  };

  // Add product as invoice item
  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    const product = productTemplates.find(
      (p) => p.id === parseInt(selectedProduct)
    );
    if (!product) return;

    const newItem = {
      id: Date.now(),
      itemName: product.name,
      description: product.description,
      quantity: 1,
      unit: product.unit,
      unitPrice: product.unitPrice,
      tax: "",
      taxRate: 0,
      file: null,
      amount: product.unitPrice,
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setSelectedProduct("");
    setProductSearchQuery("");
    setShowProductDropdown(false);
  };

  // Add blank invoice item
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      itemName: "",
      description: "",
      quantity: 1,
      unit: "Pcs",
      unitPrice: 0,
      tax: "",
      taxRate: 0,
      file: null,
      amount: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // Update invoice item
  const handleItemChange = (id, field, value) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };

          if (field === "tax") {
            const taxOption = taxOptions.find((t) => t.value === value);
            updatedItem.taxRate = taxOption ? taxOption.rate : 0;
          }

          const quantity = updatedItem.quantity || 0;
          const unitPrice = updatedItem.unitPrice || 0;
          const subtotal = quantity * unitPrice;
          const taxAmount = updatedItem.taxRate
            ? (subtotal * updatedItem.taxRate) / 100
            : 0;
          updatedItem.amount = subtotal + taxAmount;

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Remove invoice item
  const handleRemoveItem = (id) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
  };

  // Handle file upload
  const handleFileUpload = (id, file) => {
    setInvoiceItems(
      invoiceItems.map((item) => (item.id === id ? { ...item, file } : item))
    );
  };

  // Calculate totals
  const calculateSubTotal = () => {
    return invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const calculateTaxTotal = () => {
    return invoiceItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const taxAmount = item.taxRate ? (subtotal * item.taxRate) / 100 : 0;
      return sum + taxAmount;
    }, 0);
  };

  const calculateDiscount = () => {
    const subTotal = calculateSubTotal();
    if (discountType === "%") {
      return (subTotal * formData.discount) / 100;
    }
    return formData.discount;
  };

  const calculateGrandTotal = () => {
    const subTotal = calculateSubTotal();
    const taxTotal = calculateTaxTotal();
    const discount = calculateDiscount();
    return subTotal + taxTotal - discount;
  };

  const resetForm = async () => {
    // Auto-set company from session
    setFormData({
      company: companyId, // Auto-set from localStorage
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().split("T")[0],
      billDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      currency: "USD ($)",
      exchangeRate: 1,
      client: "",
      project: "",
      calculateTax: "After Discount",
      tax: "",
      taxRate: 0,
      secondTax: "",
      secondTaxRate: 0,
      tds: "",
      isRecurring: false,
      bankAccount: "",
      paymentDetails: "",
      billingAddress: "",
      shippingAddress: "",
      generatedBy: "Developo",
      labels: "",
      note: "",
      terms: "Thank you for your business.",
      discount: 0,
      discountType: "%",
      timeLogFrom: "",
      timeLogTo: "",
      billingFrequency: "Monthly",
      startDate: "",
      totalCount: "",
      repeatEvery: 1,
      repeatType: "Month(s)",
      cycles: "",
    });
    setInvoiceItems([]);
    setSelectedProduct("");
    setProductSearchQuery("");
    setShowShippingAddress(false);
    setFilteredProjects([]);

    // Auto-fetch clients for admin's company
    try {
      const response = await clientsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setFilteredClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
    setInvoiceItems([]);
    setSelectedProduct("");
    setProductSearchQuery("");
    setShowShippingAddress(false);

    // Auto-fetch clients for admin's company
    try {
      const response = await clientsAPI.getAll({ company_id: companyId });
      if (response.data.success) {
        setFilteredClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
    setFilteredProjects([]);
  };

  const handleSave = async (asDraft = false) => {
    // Validation
    if (!formData.client) {
      alert("Client is required");
      return;
    }
    if (!formData.billDate && !formData.invoiceDate) {
      alert("Bill Date is required");
      return;
    }
    if (!formData.dueDate) {
      alert("Due Date is required");
      return;
    }
    if (formData.client && !formData.project) {
      alert("Project is required when client is selected");
      return;
    }

    // Recurring validation
    if (formData.isRecurring) {
      if (!formData.repeatEvery || formData.repeatEvery < 1) {
        alert("Repeat every must be at least 1");
        return;
      }
      if (!formData.repeatType) {
        alert("Please select a frequency type (Day/Week/Month/Year)");
        return;
      }
    }

    try {
      const selectedClient = clients.find(
        (c) => c.id === parseInt(formData.client)
      );
      const selectedProject =
        filteredProjects.find((p) => p.id === parseInt(formData.project)) ||
        projects.find((p) => p.id === parseInt(formData.project));

      // Use admin's company_id from localStorage
      const adminCompanyId = companyId; // Auto-set from session

      const invoiceData = {
        company_id: parseInt(adminCompanyId),
        user_id: userId,
        created_by: userId,
        invoice_number: formData.invoiceNumber || generateInvoiceNumber(),
        bill_date: formData.billDate || formData.invoiceDate,
        invoice_date: formData.billDate || formData.invoiceDate,
        due_date: formData.dueDate,
        client_id: parseInt(formData.client),
        project_id: selectedProject?.id || null,
        status: asDraft ? "Draft" : "Unpaid",
        currency: formData.currency?.split(" ")[0] || "USD",
        exchange_rate: formData.exchangeRate || 1,
        discount: formData.discount || 0,
        discount_type: formData.discountType || "%",
        note: formData.note || null,
        terms: formData.terms || null,
        labels: formData.labels || null,
        tax: formData.tax || null,
        tax_rate: formData.taxRate || 0,
        second_tax: formData.secondTax || null,
        second_tax_rate: formData.secondTaxRate || 0,
        tds: formData.tds || null,
        calculate_tax: formData.calculateTax || "After Discount",
        is_recurring: formData.isRecurring ? 1 : 0,
        // Recurring fields
        repeat_every: formData.isRecurring ? formData.repeatEvery || 1 : null,
        repeat_type: formData.isRecurring ? formData.repeatType : null,
        cycles: formData.isRecurring ? formData.cycles || null : null,
        billing_frequency: formData.isRecurring ? formData.repeatType : null,
        items:
          invoiceItems && invoiceItems.length > 0
            ? invoiceItems.map((item) => ({
              item_name: item.itemName,
              description: item.description || null,
              quantity: item.quantity || 1,
              unit: item.unit || "Pcs",
              unit_price: item.unitPrice || 0,
              tax: item.tax || null,
              tax_rate: item.taxRate || 0,
              amount: item.amount || item.unitPrice * item.quantity,
            }))
            : [],
      };

      if (isEditModalOpen && selectedInvoice) {
        const response = await invoicesAPI.update(
          selectedInvoice.id,
          invoiceData
        );
        if (response.data.success) {
          alert("Invoice updated successfully!");
          await fetchInvoices();
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
          resetForm();
        } else {
          alert(response.data.error || "Failed to update invoice");
        }
      } else {
        const response = await invoicesAPI.create(invoiceData);
        if (response.data.success) {
          alert("Invoice created successfully!");
          await fetchInvoices();
          setIsAddModalOpen(false);
          resetForm();
        } else {
          alert(response.data.error || "Failed to create invoice");
        }
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(error.response?.data?.error || "Failed to save invoice");
    }
  };

  const handleEdit = async (invoice) => {
    try {
      // Fetch full invoice data
      const response = await invoicesAPI.getById(invoice.id);
      if (response.data.success) {
        const data = response.data.data;

        // Fetch client to get company_id if not in invoice
        let companyId = data.company_id?.toString() || "";
        if (!companyId && data.client_id) {
          try {
            // Get company_id from localStorage for the API call
            const adminCompanyId = parseInt(
              localStorage.getItem("companyId") || 1,
              10
            );
            const clientResponse = await clientsAPI.getById(data.client_id, {
              company_id: adminCompanyId,
            });
            if (clientResponse.data.success) {
              companyId = clientResponse.data.data.company_id?.toString() || "";
            }
          } catch (err) {
            console.error("Error fetching client:", err);
          }
        }

        setSelectedInvoice(invoice);
        const clientId = data.client_id?.toString() || "";
        const projectId = data.project_id?.toString() || "";

        setFormData({
          company: companyId,
          invoiceNumber: data.invoice_number || invoice.invoiceNumber || "",
          invoiceDate: data.invoice_date
            ? data.invoice_date.split("T")[0]
            : invoice.invoiceDate || "",
          dueDate: data.due_date
            ? data.due_date.split("T")[0]
            : invoice.dueDate || "",
          currency: data.currency || "USD ($)",
          exchangeRate: data.exchange_rate || 1,
          client: clientId,
          project: projectId,
          calculateTax: data.calculate_tax || "After Discount",
          bankAccount: data.bank_account || "",
          paymentDetails: data.payment_details || "",
          billingAddress: data.billing_address || "",
          shippingAddress: data.shipping_address || "",
          generatedBy: data.generated_by || "Developo",
          note: data.note || "",
          terms: data.terms || "Thank you for your business.",
          discount: data.discount || 0,
          discountType: data.discount_type || "%",
          labels: data.labels || "",
          tax: data.tax || "",
          taxRate: data.tax_rate || 0,
          secondTax: data.second_tax || "",
          secondTaxRate: data.second_tax_rate || 0,
          tds: data.tds || "",
          isRecurring: data.is_recurring || false,
          timeLogFrom: data.time_log_from || "",
          timeLogTo: data.time_log_to || "",
          billingFrequency: data.billing_frequency || "Monthly",
          startDate: data.recurring_start_date || "",
          totalCount: data.recurring_total_count || "",
        });
        setInvoiceItems(data.items || invoice.items || []);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Failed to load invoice details");
    }
  };

  // PDF Generation and Print Functions
  const handleGeneratePDF = async (invoice) => {
    try {
      const response = await invoicesAPI.generatePDF(invoice.id);
      if (response.data.success) {
        const invoiceData = response.data.data;
        // Open print dialog with invoice data
        handlePrint(invoiceData);
      } else {
        alert("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  };

  // Export invoices to Excel (CSV)
  const handleExportExcel = () => {
    const csvData = filteredInvoices.map((inv) => ({
      "Invoice #": inv.invoice_number || inv.invoiceNumber || "",
      Client: inv.client_name || inv.clientName || "",
      "Bill Date": inv.invoice_date || inv.billDate || "",
      "Due Date": inv.due_date || inv.dueDate || "",
      Total: inv.total || 0,
      "Payment Received": inv.paid || inv.payment_received || 0,
      Due: inv.unpaid || inv.due || 0,
      Status: inv.status || "",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((h) => `"${row[h] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Print all invoices list
  const handlePrintList = () => {
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
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Invoices List</h1>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Bill Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInvoices
        .map(
          (inv) => `
                <tr>
                  <td>${inv.invoice_number || inv.invoiceNumber || ""}</td>
                  <td>${inv.client_name || inv.clientName || ""}</td>
                  <td>${inv.invoice_date || inv.billDate || ""}</td>
                  <td>${inv.due_date || inv.dueDate || ""}</td>
                  <td>$${parseFloat(inv.total || 0).toFixed(2)}</td>
                  <td>$${parseFloat(
            inv.paid || inv.payment_received || 0
          ).toFixed(2)}</td>
                  <td>$${parseFloat(inv.unpaid || inv.due || 0).toFixed(2)}</td>
                  <td>${inv.status || ""}</td>
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
  };

  const handlePrint = (invoiceData) => {
    // If called without parameters, print the list
    if (!invoiceData && !selectedInvoice) {
      handlePrintList();
      return;
    }
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    const invoice = invoiceData || selectedInvoice;

    if (!invoice) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number || invoice.invoiceNumber
      }</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .client-info, .company-info { width: 45%; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { text-align: right; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Invoice #: ${invoice.invoice_number || invoice.invoiceNumber}</p>
        </div>
        <div class="invoice-info">
          <div class="company-info">
            <h3>From:</h3>
            <p>${invoice.company_name || "Company Name"}</p>
          </div>
          <div class="client-info">
            <h3>To:</h3>
            <p>${invoice.client_name || invoice.client?.name || "Client Name"
      }</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Tax</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || [])
        .map(
          (item) => `
              <tr>
                <td>${item.item_name || ""}</td>
                <td>${item.description || ""}</td>
                <td>${item.quantity || 0}</td>
                <td>$${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                <td>${item.tax_rate || 0}%</td>
                <td>$${parseFloat(item.amount || 0).toFixed(2)}</td>
              </tr>
            `
        )
        .join("")}
          </tbody>
        </table>
        <div class="totals">
          <p>Sub Total: $${parseFloat(
          invoice.sub_total || invoice.total || 0
        ).toFixed(2)}</p>
          <p>Discount: $${parseFloat(invoice.discount_amount || 0).toFixed(
          2
        )}</p>
          <p>Tax: $${parseFloat(invoice.tax_amount || 0).toFixed(2)}</p>
          <h3>Total: $${parseFloat(invoice.total || 0).toFixed(2)}</h3>
        </div>
        ${invoice.terms
        ? `<div class="footer"><p>${invoice.terms}</p></div>`
        : ""
      }
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDownloadPDF = async (invoice) => {
    await handleGeneratePDF(invoice);
  };

  const handleDelete = async (invoice) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${invoice.invoiceNumber}?`
      )
    ) {
      try {
        const response = await invoicesAPI.delete(invoice.id);
        if (response.data.success) {
          alert("Invoice deleted successfully!");
          await fetchInvoices();
        } else {
          alert(response.data.error || "Failed to delete invoice");
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

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  const columns = [
    {
      key: "invoiceNumber",
      label: "Invoice ID",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.status && row.status !== "-" && (
            <IoDocumentText className="text-gray-400" size={18} />
          )}
          <button
            onClick={() => handleView(row)}
            className={`font-medium hover:underline ${row.total < 0 ? "text-red-600" : "text-blue-600"
              }`}
          >
            {value}
          </button>
        </div>
      ),
    },
    {
      key: "client",
      label: "Client",
      render: (value, row) => (
        <button
          onClick={() => handleView(row)}
          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {row.client?.name || "Unknown Client"}
        </button>
      ),
    },
    {
      key: "project",
      label: "Project",
      render: (value) => (
        <span className="text-primary-text">{value || "-"}</span>
      ),
    },
    {
      key: "invoiceDate",
      label: "Bill date",
      render: (value) => (
        <span className="text-primary-text">{formatDate(value)}</span>
      ),
    },
    {
      key: "dueDate",
      label: "Due date",
      render: (value) => (
        <span className="text-primary-text">{formatDate(value) || "-"}</span>
      ),
    },
    {
      key: "total",
      label: "Total invoiced",
      render: (value) => {
        const amount = parseFloat(value) || 0;
        return (
          <span
            className={`font-medium ${amount < 0 ? "text-red-600" : "text-primary-text"
              }`}
          >
            {amount < 0 ? "-" : ""}$
            {Math.abs(amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "paid",
      label: "Payment Received",
      render: (value) => {
        const amount = parseFloat(value) || 0;
        return (
          <span className="text-primary-text">
            $
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "unpaid",
      label: "Due",
      render: (value) => {
        const amount = parseFloat(value) || 0;
        return (
          <span className="text-primary-text">
            $
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        if (!value || value === "-") {
          return <span className="text-primary-text">-</span>;
        }
        const statusStyles = {
          "Fully Paid": "bg-blue-800 text-white",
          "Fully paid": "bg-blue-800 text-white",
          "Partially Paid": "bg-blue-100 text-blue-800",
          "Partially paid": "bg-blue-100 text-blue-800",
          "Not paid": "bg-yellow-100 text-yellow-800",
          Unpaid: "bg-yellow-100 text-yellow-800",
          Draft: "bg-gray-100 text-gray-800",
          Paid: "bg-green-100 text-green-800",
        };
        const normalizedStatus =
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        const statusKey =
          normalizedStatus === "Fully paid"
            ? "Fully Paid"
            : normalizedStatus === "Partially paid"
              ? "Partially Paid"
              : normalizedStatus === "Not paid"
                ? "Not paid"
                : normalizedStatus;
        return (
          <Badge
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[statusKey] || "bg-gray-100 text-gray-800"
              }`}
          >
            {normalizedStatus}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (value, row) => {
        // Only show actions if invoice has a valid status (not draft/pending)
        if (!row.status || row.status === "-" || row.status === "Draft") {
          return <span></span>;
        }
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="View Document"
            >
              <IoDocumentText size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(openDropdownId === row.id ? null : row.id);
              }}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors relative"
              title="More actions"
            >
              <IoEllipsisVertical size={16} />
              {openDropdownId === row.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row);
                      setOpenDropdownId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(row);
                      setOpenDropdownId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </button>
          </div>
        );
      },
    },
  ];

  const filteredInvoices = (invoices || []).filter((invoice) => {
    if (!invoice) return false;
    if (
      searchQuery &&
      !invoice.invoiceNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !invoice.project?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (clientFilter !== "All") {
      const clientId = (clients || []).find(
        (c) =>
          c.company_name === clientFilter || c.id.toString() === clientFilter
      )?.id;
      if (!clientId || invoice.client_id !== clientId) {
        return false;
      }
    }
    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`pb-2 px-1 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "invoices"
                ? "border-primary-blue text-primary-blue"
                : "border-transparent text-secondary-text hover:text-primary-text"
                }`}
            >
              Invoices
            </button>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManageLabelsModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
            >
              <IoPricetag size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Manage labels</span>
            </Button>
            <AddButton
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              label="Add invoice"
            />
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "invoices" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
                >
                  <IoDownload size={14} className="sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Excel</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
                >
                  <IoPrint size={14} className="sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
              </div>
              <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full sm:w-auto pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-xs sm:text-sm"
                  />
                  <IoSearch
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                Recently Updated
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Bill date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Due date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Total invoiced
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Payment Received
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-8 text-center text-secondary-text"
                      >
                        Loading invoices...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-8 text-center text-secondary-text"
                      >
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[0].render(invoice.invoiceNumber, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[1].render(invoice.client, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[2].render(invoice.project, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[3].render(invoice.invoiceDate, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[4].render(invoice.dueDate, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[5].render(invoice.total, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[6].render(invoice.paid, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[7].render(invoice.unpaid, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[8].render(invoice.status, invoice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {columns[9].render(null, invoice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredInvoices.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-right font-semibold text-primary-text"
                      >
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-primary-text font-bold">
                        $
                        {filteredInvoices
                          .reduce(
                            (sum, inv) => sum + (parseFloat(inv.total) || 0),
                            0
                          )
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-primary-text font-bold">
                        $
                        {filteredInvoices
                          .reduce(
                            (sum, inv) => sum + (parseFloat(inv.paid) || 0),
                            0
                          )
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-primary-text font-bold">
                        $
                        {filteredInvoices
                          .reduce(
                            (sum, inv) => sum + (parseFloat(inv.unpaid) || 0),
                            0
                          )
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"></td>
                      <td className="px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="px-3 sm:px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary-text">
                <span>Show</span>
                <select className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-xs sm:text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span>entries</span>
              </div>
              <div className="text-xs sm:text-sm text-secondary-text">
                Showing {filteredInvoices.length} to {filteredInvoices.length}{" "}
                of {filteredInvoices.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === "recurring" && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Recurring Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase cursor-pointer">
                      Invoice ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Next recurring
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Repeat every
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Cycles
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase cursor-pointer">
                      Total invoiced
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices
                    .filter(
                      (inv) =>
                        inv.is_recurring === 1 || inv.is_recurring === true
                    )
                    .map((invoice) => {
                      const nextRecurring = invoice.recurring_start_date
                        ? new Date(
                          new Date(invoice.recurring_start_date).setMonth(
                            new Date(
                              invoice.recurring_start_date
                            ).getMonth() +
                            (invoice.recurring_total_count || 0)
                          )
                        )
                        : null;
                      const cyclesCompleted =
                        invoice.recurring_total_count || 0;
                      const cyclesTotal = invoice.recurring_total_count
                        ? `${cyclesCompleted}/∞`
                        : "0/∞";

                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="text-primary-accent font-medium cursor-pointer hover:underline">
                              {invoice.invoice_number || `INV #${invoice.id}`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-primary-accent cursor-pointer hover:underline">
                              {invoice.client_name || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-primary-accent cursor-pointer hover:underline">
                              {invoice.project_name || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-primary-text">
                            {nextRecurring
                              ? nextRecurring.toLocaleDateString("en-GB")
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-primary-text">
                            {invoice.billing_frequency || "1 Month(s)"}
                          </td>
                          <td className="px-4 py-3 text-primary-text">
                            {cyclesTotal}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                invoice.status === "Active"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {invoice.status || "Active"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-primary-text font-semibold">
                            {invoice.currency || "$"}
                            {parseFloat(invoice.total || 0).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative dropdown-container">
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === invoice.id
                                      ? null
                                      : invoice.id
                                  )
                                }
                                className="p-2 hover:bg-gray-100 rounded"
                              >
                                <IoEllipsisVertical size={18} />
                              </button>
                              {openDropdownId === invoice.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => {
                                      handleView(invoice);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-primary-text hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <IoEye size={16} />
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleEdit(invoice);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-primary-text hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <IoCreate size={16} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this invoice?"
                                        )
                                      ) {
                                        handleDelete(invoice.id);
                                      }
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <IoTrash size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-3 text-right font-semibold text-primary-text"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-primary-text font-bold">
                      {invoices
                        .filter(
                          (inv) =>
                            inv.is_recurring === 1 || inv.is_recurring === true
                        )
                        .reduce(
                          (sum, inv) => sum + parseFloat(inv.total || 0),
                          0
                        )
                        .toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {invoices.filter(
              (inv) => inv.is_recurring === 1 || inv.is_recurring === true
            ).length === 0 && (
                <div className="text-center py-8 text-secondary-text">
                  <p>No recurring invoices found</p>
                </div>
              )}
          </div>
        </Card>
      )}

      {/* View Invoice Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        title="Invoice Details"
        width="800px"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Invoice Number
              </label>
              <p className="text-primary-text mt-1 text-base font-semibold">
                {selectedInvoice.invoiceNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Client
              </label>
              <p className="text-primary-text mt-1 text-base">
                {selectedInvoice.client?.name ||
                  selectedInvoice.client?.company}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Project
              </label>
              <p className="text-primary-text mt-1 text-base">
                {selectedInvoice.project}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={
                    selectedInvoice.status === "Paid"
                      ? "success"
                      : selectedInvoice.status === "Draft"
                        ? "warning"
                        : "danger"
                  }
                >
                  {selectedInvoice.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Invoice Date
              </label>
              <p className="text-primary-text mt-1 text-base">
                {formatDate(selectedInvoice.invoiceDate)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Due Date
              </label>
              <p className="text-primary-text mt-1 text-base">
                {formatDate(selectedInvoice.dueDate)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Total Amount
              </label>
              <p className="text-primary-text mt-1 text-base font-semibold">
                ${selectedInvoice.total.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Paid Amount
              </label>
              <p className="text-primary-text mt-1 text-base">
                ${selectedInvoice.paid.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-text">
                Unpaid Amount
              </label>
              <p className="text-primary-text mt-1 text-base">
                ${selectedInvoice.unpaid.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedInvoice);
                }}
                className="flex-1"
              >
                Edit Invoice
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedInvoice(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Create Invoice Modal - Simplified to match UI */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
          resetForm();
        }}
        title={isEditModalOpen ? "Edit Invoice" : "Add Invoice"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Form Fields - Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Bill date
                </label>
                <Input
                  type="date"
                  value={
                    formData.billDate ||
                    formData.invoiceDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoiceDate: e.target.value,
                      billDate: e.target.value,
                    })
                  }
                  placeholder="Bill date"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Client
                </label>
                <div className="relative">
                  <select
                    value={formData.client}
                    onChange={async (e) => {
                      const newClientId = e.target.value;
                      setFormData({
                        ...formData,
                        client: newClientId,
                        project: "", // Reset project when client changes
                      });
                      // Fetch projects for selected client
                      if (newClientId) {
                        const clientIdNum = parseInt(newClientId);
                        if (!isNaN(clientIdNum)) {
                          await fetchProjects(clientIdNum);
                          // Projects will be filtered by useEffect hook based on client_id
                        }
                      } else {
                        setFilteredProjects([]);
                      }
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
                    required
                  >
                    <option value="">Client</option>
                    {clients.length === 0 ? (
                      <option value="" disabled>
                        No clients found
                      </option>
                    ) : (
                      clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.client_name ||
                            client.name ||
                            client.company_name ||
                            `Client #${client.id}`}
                        </option>
                      ))
                    )}
                  </select>
                  <IoChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  TAX
                </label>
                <div className="relative">
                  <select
                    value={formData.tax || ""}
                    onChange={(e) => {
                      const selectedTax = taxOptions.find(
                        (t) => t.value === e.target.value
                      );
                      setFormData({
                        ...formData,
                        tax: e.target.value,
                        taxRate: selectedTax ? selectedTax.rate : 0,
                      });
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
                  >
                    <option value="">-</option>
                    {taxOptions
                      .filter((t) => t.value)
                      .map((tax) => (
                        <option key={tax.value} value={tax.value}>
                          {tax.label}
                        </option>
                      ))}
                  </select>
                  <IoChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring || false}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        isRecurring: e.target.checked,
                        // Clear recurring fields when unchecked
                        ...(e.target.checked
                          ? {}
                          : {
                            repeatEvery: 1,
                            repeatType: "Month(s)",
                            cycles: "",
                          }),
                      });
                    }}
                    className="w-4 h-4 text-primary-accent rounded focus:ring-primary-accent"
                  />
                  <span className="text-sm font-medium text-primary-text">
                    Recurring
                  </span>
                  <IoHelpCircle
                    size={16}
                    className="text-gray-400"
                    title="Enable recurring invoice"
                  />
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Due date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  placeholder="Due date"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Project
                </label>
                <div className="relative">
                  <select
                    value={formData.project}
                    onChange={(e) =>
                      setFormData({ ...formData, project: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!formData.client}
                    required={formData.client ? true : false}
                  >
                    <option value="">Project</option>
                    {!formData.client ? (
                      <option value="" disabled>
                        Select Client First
                      </option>
                    ) : filteredProjects.length === 0 ? (
                      <option value="" disabled>
                        No projects found for this client
                      </option>
                    ) : (
                      filteredProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name || project.name}
                        </option>
                      ))
                    )}
                  </select>
                  <IoChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Second TAX
                </label>
                <div className="relative">
                  <select
                    value={formData.secondTax || ""}
                    onChange={(e) => {
                      const selectedTax = taxOptions.find(
                        (t) => t.value === e.target.value
                      );
                      setFormData({
                        ...formData,
                        secondTax: e.target.value,
                        secondTaxRate: selectedTax ? selectedTax.rate : 0,
                      });
                    }}
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
                  >
                    <option value="">-</option>
                    {taxOptions
                      .filter((t) => t.value)
                      .map((tax) => (
                        <option key={tax.value} value={tax.value}>
                          {tax.label}
                        </option>
                      ))}
                  </select>
                  <IoChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  TDS
                </label>
                <div className="relative">
                  <select
                    value={formData.tds || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tds: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
                  >
                    <option value="">-</option>
                    {taxOptions
                      .filter((t) => t.value)
                      .map((tax) => (
                        <option key={tax.value} value={tax.value}>
                          {tax.label}
                        </option>
                      ))}
                  </select>
                  <IoChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Section - Shows when checkbox is checked */}
          {formData.isRecurring && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Repeat every
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={formData.repeatEvery || 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          repeatEvery: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      required={formData.isRecurring}
                    />
                    <select
                      value={formData.repeatType || "Month(s)"}
                      onChange={(e) =>
                        setFormData({ ...formData, repeatType: e.target.value })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none appearance-none"
                      required={formData.isRecurring}
                    >
                      <option value="Day(s)">Day(s)</option>
                      <option value="Week(s)">Week(s)</option>
                      <option value="Month(s)">Month(s)</option>
                      <option value="Year(s)">Year(s)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    <span>Cycles</span>
                    <IoHelpCircle
                      size={16}
                      className="inline-block ml-2 text-gray-400"
                      title="Leave empty for infinite recurrence"
                    />
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cycles || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cycles: e.target.value ? parseInt(e.target.value) : "",
                      })
                    }
                    placeholder="Cycles"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  />
                  <p className="text-xs text-secondary-text mt-1">
                    Leave empty for infinite recurrence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Note and Labels Section */}
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Note
              </label>
              <textarea
                value={formData.note || ""}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Note"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Labels
              </label>
              <Input
                value={formData.labels || ""}
                onChange={(e) =>
                  setFormData({ ...formData, labels: e.target.value })
                }
                placeholder="Labels"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => alert("Upload File functionality")}
              className="flex items-center gap-2"
            >
              <IoAttach size={18} />
              Upload File
            </Button>
            <button
              onClick={() => alert("Voice input functionality")}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <IoMic size={18} />
            </button>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedInvoice(null);
                  resetForm();
                }}
                className="flex items-center gap-2"
              >
                <IoClose size={18} />
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave(false)}
                className="flex items-center gap-2"
              >
                <IoCheckmarkCircle size={18} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Create Time Log Invoice Modal */}
      <RightSideModal
        isOpen={isTimeLogModalOpen}
        onClose={() => {
          setIsTimeLogModalOpen(false);
          resetForm();
        }}
        title="Create TimeLog Invoice"
        width="max-w-7xl"
      >
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Invoice Details */}
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.invoiceNumber || generateInvoiceNumber()}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                  placeholder="Auto generated"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Project
                </label>
                <select
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">--</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Client
                </label>
                <select
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">--</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Invoice Date
                </label>
                <Input
                  type="date"
                  value={
                    formData.invoiceDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="INR (₹)">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Exchange Rate <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.exchangeRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      exchangeRate: parseFloat(e.target.value) || 1,
                    })
                  }
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Time Log From
                </label>
                <Input
                  type="date"
                  value={formData.timeLogFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLogFrom: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Time Log To
                </label>
                <Input
                  type="date"
                  value={formData.timeLogTo}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLogTo: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Calculate Tax
                </label>
                <select
                  value={formData.calculateTax}
                  onChange={(e) =>
                    setFormData({ ...formData, calculateTax: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="Before Discount">Before Discount</option>
                  <option value="After Discount">After Discount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Generated By
                </label>
                <select
                  value={formData.generatedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, generatedBy: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="Developo">Developo</option>
                  <option value="System">System</option>
                  <option value="User">User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Same Items Section as Create Invoice */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              Invoice Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Tax
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "itemName",
                                e.target.value
                              )
                            }
                            placeholder="Item Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter Description (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          />
                          <select
                            value={item.unit || "Pcs"}
                            onChange={(e) =>
                              handleItemChange(item.id, "unit", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.tax}
                          onChange={(e) =>
                            handleItemChange(item.id, "tax", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                        >
                          {taxOptions.map((tax) => (
                            <option key={tax.value} value={tax.value}>
                              {tax.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-primary-text">
                          {formData.currency.split(" ")[1] || "$"}
                          {item.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded"
                        >
                          <IoClose size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleAddItem}
                className="flex items-center gap-2"
              >
                <IoAdd size={18} />
                Add Item
              </Button>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Note for the recipient
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    rows={4}
                    placeholder="e.g. Thank you for your business"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) =>
                      setFormData({ ...formData, terms: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="w-80">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">
                      Sub Total
                    </span>
                    <span className="text-sm font-semibold text-primary-text">
                      {formData.currency.split(" ")[1] || "$"}
                      {calculateSubTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">
                      Discount
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      />
                      <select
                        value={discountType}
                        onChange={(e) => {
                          setDiscountType(e.target.value);
                          setFormData({
                            ...formData,
                            discountType: e.target.value,
                          });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      >
                        <option value="%">%</option>
                        <option value="Flat">Flat</option>
                      </select>
                      <span className="text-sm font-semibold text-primary-text">
                        {formData.currency.split(" ")[1] || "$"}
                        {calculateDiscount().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">Tax</span>
                    <span className="text-sm font-semibold text-primary-text">
                      {formData.currency.split(" ")[1] || "$"}
                      {calculateTaxTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-base font-semibold text-primary-text">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary-text">
                      {formData.currency.split(" ")[1] || "$"}
                      {calculateGrandTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsTimeLogModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(false)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* Recurring Invoice Modal */}
      <RightSideModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          resetForm();
        }}
        title="Add Recurring Invoice"
        width="max-w-7xl"
      >
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Invoice Details */}
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.client}
                  onChange={(e) => {
                    const newClientId = e.target.value;
                    setFormData({
                      ...formData,
                      client: newClientId,
                      project: "", // Reset project when client changes
                    });
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  required
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName ||
                        client.company_name ||
                        client.name ||
                        "Unknown Client"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Project
                </label>
                <select
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!formData.client}
                >
                  <option value="">-- Select Project (Optional) --</option>
                  {!formData.client ? (
                    <option value="" disabled>
                      Select Client First
                    </option>
                  ) : filteredProjects.length === 0 ? (
                    <option value="" disabled>
                      No projects found for this client
                    </option>
                  ) : (
                    filteredProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_name ||
                          project.name ||
                          `Project #${project.id}`}
                      </option>
                    ))
                  )}
                </select>
                {formData.client && filteredProjects.length === 0 && (
                  <p className="text-xs text-secondary-text mt-1">
                    No projects available for this client
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="INR (₹)">INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Calculate Tax
                </label>
                <select
                  value={formData.calculateTax}
                  onChange={(e) =>
                    setFormData({ ...formData, calculateTax: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="Before Discount">Before Discount</option>
                  <option value="After Discount">After Discount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Bank Account
                </label>
                <select
                  value={formData.bankAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccount: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                >
                  <option value="">--</option>
                  <option value="Bank Account 1">Bank Account 1</option>
                  <option value="Bank Account 2">Bank Account 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recurring Settings */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              Recurring Settings
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Billing Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.billingFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingFrequency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                  required
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Total Count <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.totalCount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCount: e.target.value })
                  }
                  placeholder="-1 for infinite"
                />
              </div>
            </div>
            {/* Auto Info Box */}
            {formData.billingFrequency && formData.startDate && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>
                    Customer will be charged {formData.billingFrequency}
                  </strong>
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  First Invoice will be generated on{" "}
                  {formatDate(formData.startDate)}
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  Next Invoice Date will be{" "}
                  {(() => {
                    if (!formData.startDate) return "--";
                    const date = new Date(formData.startDate);
                    const frequency = formData.billingFrequency;
                    if (frequency === "Daily") date.setDate(date.getDate() + 1);
                    else if (frequency === "Weekly")
                      date.setDate(date.getDate() + 7);
                    else if (frequency === "Monthly")
                      date.setMonth(date.getMonth() + 1);
                    else if (frequency === "Yearly")
                      date.setFullYear(date.getFullYear() + 1);
                    return formatDate(date.toISOString().split("T")[0]);
                  })()}
                </p>
                <p className="text-sm text-blue-900 mt-1">And so on...</p>
              </div>
            )}
          </div>

          {/* Invoice Items Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              Invoice Items
            </h3>
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Tax
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "itemName",
                                e.target.value
                              )
                            }
                            placeholder="Item Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter Description (optional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          />
                          <select
                            value={item.unit || "Pcs"}
                            onChange={(e) =>
                              handleItemChange(item.id, "unit", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <select
                            value={item.tax || ""}
                            onChange={(e) =>
                              handleItemChange(item.id, "tax", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none text-sm"
                          >
                            {taxOptions.map((tax) => (
                              <option key={tax.value} value={tax.value}>
                                {tax.label}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-accent transition-colors">
                            <IoCloudUpload
                              className="text-gray-400 mr-2"
                              size={18}
                            />
                            <span className="text-sm text-secondary-text">
                              Choose a file
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(item.id, e.target.files[0])
                              }
                            />
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-primary-text">
                          {formData.currency.split(" ")[1] || "$"}
                          {item.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded"
                        >
                          <IoClose size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleAddItem}
                className="flex items-center gap-2"
              >
                <IoAdd size={18} />
                Add Item
              </Button>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Note for the recipient
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    rows={4}
                    placeholder="e.g. Thank you for your business"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) =>
                      setFormData({ ...formData, terms: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="w-80">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">
                      Sub Total
                    </span>
                    <span className="text-sm font-semibold text-primary-text">
                      {formData.currency.split(" ")[1] || "$"}
                      {calculateSubTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">
                      Discount
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      />
                      <select
                        value={discountType}
                        onChange={(e) => {
                          setDiscountType(e.target.value);
                          setFormData({
                            ...formData,
                            discountType: e.target.value,
                          });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      >
                        <option value="%">%</option>
                        <option value="Flat">Flat</option>
                      </select>
                      <span className="text-sm font-semibold text-primary-text">
                        {formData.currency.split(" ")[1] || "$"}
                        {calculateDiscount().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-text">Tax</span>
                    <span className="text-sm font-semibold text-primary-text">
                      {formData.currency.split(" ")[1] || "$"}
                      {calculateTaxTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-base font-semibold text-primary-text">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary-text">
                      {formData.currency.split(" ")[1] || "$"}
                      {calculateGrandTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsRecurringModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(false)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <IoCheckmarkCircle size={18} />
              Save
            </Button>
          </div>
        </div>
      </RightSideModal>

      {/* Manage Labels Modal */}
      <Modal
        isOpen={isManageLabelsModalOpen}
        onClose={() => {
          setIsManageLabelsModalOpen(false);
          setNewLabelName("");
          setNewLabelColor("#22c55e");
        }}
        title="Manage Labels"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <IoAdd className="text-primary-accent" /> Create New Label
            </h4>

            <div className="space-y-4">
              {/* Color Selection - Premium Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                {[
                  '#22c55e', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6',
                  '#ef4444', '#f97316', '#eab308', '#ec4899', '#64748b',
                  '#166534', '#065f46', '#1e40af', '#3730a3', '#5b21b6',
                  '#991b1b', '#9a3412', '#854d0e', '#9d174d', '#334155'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`group relative w-full aspect-square rounded-lg transition-all duration-200 ${newLabelColor === color ? 'ring-2 ring-primary-accent ring-offset-2 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  >
                    {newLabelColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <IoCheckmarkCircle className="text-white drop-shadow-sm" size={14} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name (e.g. Urgent, Paid, Pending)"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent outline-none transition-all shadow-sm group-hover:border-gray-300"
                  />
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: newLabelColor }}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleAddLabel}
                  disabled={!newLabelName.trim()}
                  className="flex items-center gap-2 rounded-xl transition-all active:scale-95"
                >
                  <IoAdd size={20} />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </div>

          {/* List of Labels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <IoPricetag className="text-gray-400" /> Existing Labels
                {labels.length > 0 && <span className="text-xs font-normal text-gray-400">({labels.length})</span>}
              </h4>
            </div>

            {labels.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {labels.map((label, idx) => (
                  <div
                    key={`${label.name}-${idx}`}
                    className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all animate-in fade-in slide-in-from-left-2"
                    style={{ borderLeft: `4px solid ${label.color}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setNewLabelName(label.name);
                          setNewLabelColor(label.color);
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-accent hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <IoCreate size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLabel(label.name);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <IoTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <IoPricetag size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No custom labels created yet</p>
                <p className="text-xs text-gray-400 mt-1">Start by adding labels from above</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setIsManageLabelsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-primary-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
