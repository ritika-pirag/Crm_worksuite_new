import { useState, useEffect } from 'react'
import AddButton from '../../../components/ui/AddButton'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import axiosInstance from '../../../api/axiosInstance'
import { IoCreate, IoTrash, IoEye, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'

const Packages = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    package_name: '',
    price: '',
    billing_cycle: 'Monthly',
    features: [],
    status: 'Active',
  })
  const [featureInput, setFeatureInput] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/packages')
      if (response.data.success) {
        setPackages(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features
      }

      if (selectedPackage) {
        await axiosInstance.put(`/superadmin/packages/${selectedPackage.id}`, payload)
      } else {
        await axiosInstance.post('/superadmin/packages', payload)
      }

      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedPackage(null)
      resetForm()
      fetchPackages()
    } catch (error) {
      console.error('Error saving package:', error)
      alert(error.response?.data?.error || 'Failed to save package')
    }
  }

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg)
    
    // Parse features if it's a string
    let parsedFeatures = [];
    if (pkg.features) {
      if (typeof pkg.features === 'string') {
        try {
          parsedFeatures = JSON.parse(pkg.features);
        } catch (e) {
          parsedFeatures = pkg.features.split(',').map(f => f.trim()).filter(f => f);
        }
      } else if (Array.isArray(pkg.features)) {
        parsedFeatures = pkg.features;
      }
    }
    
    setFormData({
      package_name: pkg.package_name || '',
      price: pkg.price || '',
      billing_cycle: pkg.billing_cycle || 'Monthly',
      features: parsedFeatures,
      status: pkg.status || 'Active',
    })
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return

    try {
      await axiosInstance.delete(`/superadmin/packages/${id}`)
      fetchPackages()
    } catch (error) {
      console.error('Error deleting package:', error)
      alert(error.response?.data?.error || 'Failed to delete package')
    }
  }

  const resetForm = () => {
    setFormData({
      package_name: '',
      price: '',
      billing_cycle: 'Monthly',
      features: [],
      status: 'Active',
    })
    setFeatureInput('')
    setSelectedPackage(null)
  }

  const columns = [
    { key: 'package_name', label: 'Package Name' },
    {
      key: 'price',
      label: 'Price',
      render: (value, row) => (
        <span className="font-semibold">
          ${value}/{row.billing_cycle === 'Monthly' ? 'mo' : 'yr'}
        </span>
      ),
    },
    {
      key: 'billing_cycle',
      label: 'Billing Cycle',
      render: (value) => <Badge variant="info">{value}</Badge>,
    },
    {
      key: 'features',
      label: 'Features',
      render: (value, row) => {
        // Handle features as JSON string or array
        let featuresArray = []
        if (typeof value === 'string') {
          try {
            featuresArray = JSON.parse(value)
          } catch {
            featuresArray = value ? value.split(',').map(f => f.trim()) : []
          }
        } else if (Array.isArray(value)) {
          featuresArray = value
        }
        
        if (featuresArray.length === 0) {
          return <span className="text-secondary-text text-sm">No features</span>
        }
        
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {featuresArray.slice(0, 3).map((feature, idx) => (
              <Badge key={idx} variant="default" className="text-xs">
                <IoCheckmarkCircle size={12} className="mr-1 text-green-500" />
                {feature}
              </Badge>
            ))}
            {featuresArray.length > 3 && (
              <Badge variant="default" className="text-xs">
                +{featuresArray.length - 3} more
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: 'assigned_companies',
      label: 'Companies Using This Plan',
      render: (value, row) => {
        if (value && value.trim()) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.split(', ').map((company, idx) => (
                <Badge key={idx} variant="info" className="text-xs">
                  {company}
                </Badge>
              ))}
            </div>
          )
        }
        return <span className="text-secondary-text">No companies assigned</span>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-primary-accent hover:bg-primary-accent hover:text-white rounded-lg transition-colors"
          >
            <IoCreate size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <IoTrash size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">Packages</h1>
          <p className="text-secondary-text mt-1">Manage subscription packages for companies</p>
        </div>
        <AddButton onClick={() => { resetForm(); setIsAddModalOpen(true) }} label="Add Package" />
      </div>

      {/* Packages Table */}
      <Card className="p-0">
        <DataTable
          data={packages}
          columns={columns}
          loading={loading}
          emptyMessage="No packages found"
        />
      </Card>

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          resetForm()
        }}
        title={selectedPackage ? 'Edit Package' : 'Add Package'}
      >
        <div className="space-y-4">
          <Input
            label="Package Name"
            value={formData.package_name}
            onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
            placeholder="e.g., Professional, Enterprise"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Billing Cycle
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Features
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add feature"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
              />
              <Button onClick={handleAddFeature}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="info" className="flex items-center gap-2">
                  {feature}
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:text-red-600"
                  >
                    <IoCloseCircle size={16} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                resetForm()
              }}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSave} 
              className="px-6 py-2.5 bg-primary-accent text-white hover:bg-primary-accent/90"
            >
              {selectedPackage ? 'Update' : 'Create'} Package
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Packages

