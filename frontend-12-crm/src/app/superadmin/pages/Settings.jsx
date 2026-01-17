import { useState, useEffect } from 'react'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import DataTable from '../../../components/ui/DataTable'
import Modal from '../../../components/ui/Modal'
import axiosInstance from '../../../api/axiosInstance'
import { 
  IoSettings, 
  IoCheckmarkCircle, 
  IoMail, 
  IoCloud, 
  IoDocument, 
  IoShield, 
  IoTime,
  IoGlobe,
  IoSend,
  IoRefresh,
  IoEye,
  IoEyeOff,
  IoWarning,
  IoCheckmark,
  IoClose,
  IoCloudUpload,
  IoFootsteps,
  IoLink,
  IoList,
  IoAlertCircle
} from 'react-icons/io5'

const Settings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)

  const [formData, setFormData] = useState({
    // General Settings
    system_name: 'Develo CRM',
    default_currency: 'USD',
    default_timezone: 'UTC',
    session_timeout: '30',
    
    // File Upload Settings
    max_file_size: '10',
    allowed_file_types: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,zip',
    
    // Email/SMTP Settings
    email_from: 'noreply@develo.com',
    email_from_name: 'Develo CRM',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    
    // Backup Settings
    backup_frequency: 'daily',
    last_backup_time: null,
    
    // Audit Log
    enable_audit_log: true,

    // Footer Settings
    footer_company_address: '',
    footer_privacy_link: '',
    footer_terms_link: '',
    footer_refund_link: '',
    footer_custom_link_1_text: '',
    footer_custom_link_1_url: '',
    footer_custom_link_2_text: '',
    footer_custom_link_2_url: '',
  })

  const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CNY', label: 'CNY - Chinese Yuan' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs()
    }
  }, [activeTab])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/superadmin/settings')
      if (response.data.success) {
        setFormData(prev => ({ ...prev, ...response.data.data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      showToast('Failed to load settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true)
      const response = await axiosInstance.get('/superadmin/audit-logs', {
        params: { limit: 100, module: 'system_settings' }
      })
      if (response.data.success) {
        setAuditLogs(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setAuditLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await axiosInstance.put('/superadmin/settings', formData)
      if (response.data.success) {
        showToast('System settings saved successfully!', 'success')
        fetchSettings()
        if (formData.enable_audit_log) {
          fetchAuditLogs()
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast(error.response?.data?.error || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      showToast('Please enter a test email address', 'error')
      return
    }

    try {
      setTestingEmail(true)
      const response = await axiosInstance.post('/superadmin/settings/test-email', {
        test_email: testEmail
      })
      if (response.data.success) {
        showToast(response.data.message || 'Test email sent successfully!', 'success')
        setTestEmailModalOpen(false)
        setTestEmail('')
      }
    } catch (error) {
      console.error('Error testing email:', error)
      showToast(error.response?.data?.error || 'Failed to send test email', 'error')
    } finally {
      setTestingEmail(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: IoSettings },
    { id: 'files', label: 'File Upload', icon: IoCloudUpload },
    { id: 'email', label: 'Email/SMTP', icon: IoMail },
    { id: 'backup', label: 'Backup', icon: IoCloud },
    { id: 'footer', label: 'Login Footer', icon: IoFootsteps },
    { id: 'audit', label: 'Audit Log', icon: IoShield },
  ]

  const auditColumns = [
    {
      key: 'created_at',
      label: 'Date/Time',
      render: (value) => new Date(value).toLocaleString()
    },
    { key: 'admin_name', label: 'Admin' },
    { key: 'action', label: 'Action' },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (value) => <span className="font-mono text-xs">{value || 'N/A'}</span>
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto"></div>
          <p className="mt-4 text-secondary-text">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? <IoCheckmarkCircle size={20} /> : <IoWarning size={20} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 hover:opacity-80">
            <IoClose size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">System Settings</h1>
          <p className="text-secondary-text mt-1">Configure system-wide settings for your CRM</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <IoCheckmark size={18} />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-accent text-primary-accent'
                    : 'border-transparent text-secondary-text hover:text-primary-text hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-6">
              <IoSettings size={24} className="text-primary-accent" />
              <h2 className="text-lg font-semibold text-primary-text">General Settings</h2>
            </div>
            <div className="space-y-5">
              <Input
                label="System Name"
                value={formData.system_name}
                onChange={(e) => setFormData({ ...formData, system_name: e.target.value })}
                placeholder="Enter system name"
                helperText="This name will appear in emails, headers, and branding"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Default Currency
                  </label>
                  <select
                    value={formData.default_currency}
                    onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white text-gray-900"
                  >
                    {currencies.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-secondary-text mt-1">Used for invoices, billing, and prices</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Default Timezone
                  </label>
                  <select
                    value={formData.default_timezone}
                    onChange={(e) => setFormData({ ...formData, default_timezone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white text-gray-900"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-secondary-text mt-1">Used for all date/time displays</p>
                </div>
              </div>

              <div>
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.session_timeout}
                  onChange={(e) => setFormData({ ...formData, session_timeout: e.target.value })}
                  placeholder="30"
                />
                <p className="text-xs text-secondary-text mt-1">Users will be logged out after this period of inactivity (1-1440 minutes)</p>
              </div>
            </div>
          </Card>
        )}

        {/* File Upload Settings Tab */}
        {activeTab === 'files' && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-6">
              <IoCloudUpload size={24} className="text-primary-accent" />
              <h2 className="text-lg font-semibold text-primary-text">File Upload Settings</h2>
            </div>
            <div className="space-y-5">
              <div>
                <Input
                  label="Maximum File Size (MB)"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_file_size}
                  onChange={(e) => setFormData({ ...formData, max_file_size: e.target.value })}
                  placeholder="10"
                />
                <p className="text-xs text-secondary-text mt-1">Maximum allowed file size for uploads (1-100 MB)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Allowed File Types
                </label>
                <textarea
                  value={formData.allowed_file_types}
                  onChange={(e) => setFormData({ ...formData, allowed_file_types: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white text-gray-900"
                  placeholder="pdf,doc,docx,jpg,png"
                />
                <p className="text-xs text-secondary-text mt-1">Comma-separated list of allowed file extensions (without dots)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <IoAlertCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">File validation is enforced on:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Frontend (before upload starts)</li>
                      <li>Backend (before saving file)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Email/SMTP Settings Tab */}
        {activeTab === 'email' && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <IoMail size={24} className="text-primary-accent" />
                <h2 className="text-lg font-semibold text-primary-text">Email/SMTP Settings</h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setTestEmailModalOpen(true)}
                className="flex items-center gap-2"
              >
                <IoSend size={16} />
                Test Email
              </Button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="From Email"
                  type="email"
                  value={formData.email_from}
                  onChange={(e) => setFormData({ ...formData, email_from: e.target.value })}
                  placeholder="noreply@example.com"
                />
                <Input
                  label="From Name"
                  value={formData.email_from_name}
                  onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })}
                  placeholder="Develo CRM"
                />
              </div>

              <Input
                label="SMTP Host"
                value={formData.smtp_host}
                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="SMTP Port"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                  placeholder="587"
                />
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-2">
                    Encryption
                  </label>
                  <select
                    value={formData.smtp_encryption}
                    onChange={(e) => setFormData({ ...formData, smtp_encryption: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <Input
                  label="SMTP Username"
                  value={formData.smtp_username}
                  onChange={(e) => setFormData({ ...formData, smtp_username: e.target.value })}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="relative">
                <Input
                  label="SMTP Password"
                  type={showSmtpPassword ? 'text' : 'password'}
                  value={formData.smtp_password}
                  onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
                  placeholder="Enter SMTP password or app password"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  className="absolute right-3 top-9 text-secondary-text hover:text-primary-text"
                >
                  {showSmtpPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <IoWarning className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium mb-1">Security Note:</p>
                    <p>SMTP password is encrypted before storage. For Gmail, use an App Password instead of your regular password.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Backup Settings Tab */}
        {activeTab === 'backup' && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-6">
              <IoCloud size={24} className="text-primary-accent" />
              <h2 className="text-lg font-semibold text-primary-text">Backup Settings</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">
                  Backup Frequency
                </label>
                <select
                  value={formData.backup_frequency}
                  onChange={(e) => setFormData({ ...formData, backup_frequency: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white text-gray-900"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-xs text-secondary-text mt-1">How often the system should create automatic backups</p>
              </div>

              {formData.last_backup_time && (
                <div className="flex items-center gap-2 text-sm text-secondary-text">
                  <IoTime size={16} />
                  <span>Last backup: {new Date(formData.last_backup_time).toLocaleString()}</span>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <IoCheckmarkCircle className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-green-700">
                    <p className="font-medium mb-1">Backup Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Backups are stored securely on the server</li>
                      <li>Database and uploaded files are included</li>
                      <li>Cron jobs run based on selected frequency</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Login Footer Settings Tab */}
        {activeTab === 'footer' && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-6">
              <IoLink size={24} className="text-primary-accent" />
              <h2 className="text-lg font-semibold text-primary-text">Login Page Footer Settings</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-2">Company Address</label>
                <textarea
                  value={formData.footer_company_address || ''}
                  onChange={(e) => setFormData({ ...formData, footer_company_address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent bg-white text-gray-900"
                  placeholder="Enter company address to display on login page"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Privacy Policy Link"
                  value={formData.footer_privacy_link || ''}
                  onChange={(e) => setFormData({ ...formData, footer_privacy_link: e.target.value })}
                  placeholder="https://example.com/privacy"
                />
                <Input
                  label="Terms & Conditions Link"
                  value={formData.footer_terms_link || ''}
                  onChange={(e) => setFormData({ ...formData, footer_terms_link: e.target.value })}
                  placeholder="https://example.com/terms"
                />
                <Input
                  label="Refund Policy Link"
                  value={formData.footer_refund_link || ''}
                  onChange={(e) => setFormData({ ...formData, footer_refund_link: e.target.value })}
                  placeholder="https://example.com/refund"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-primary-text mb-4">Additional Custom Links</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Link 1 Text"
                    value={formData.footer_custom_link_1_text || ''}
                    onChange={(e) => setFormData({ ...formData, footer_custom_link_1_text: e.target.value })}
                    placeholder="e.g. Cookie Policy"
                  />
                  <Input
                    label="Link 1 URL"
                    value={formData.footer_custom_link_1_url || ''}
                    onChange={(e) => setFormData({ ...formData, footer_custom_link_1_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Link 2 Text"
                    value={formData.footer_custom_link_2_text || ''}
                    onChange={(e) => setFormData({ ...formData, footer_custom_link_2_text: e.target.value })}
                    placeholder="e.g. Help Center"
                  />
                  <Input
                    label="Link 2 URL"
                    value={formData.footer_custom_link_2_url || ''}
                    onChange={(e) => setFormData({ ...formData, footer_custom_link_2_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IoShield size={24} className="text-primary-accent" />
                  <h2 className="text-lg font-semibold text-primary-text">Audit Log Settings</h2>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-primary-text">Enable Audit Logging</p>
                  <p className="text-sm text-secondary-text">Track all system settings changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enable_audit_log}
                    onChange={(e) => setFormData({ ...formData, enable_audit_log: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-accent/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-accent"></div>
                </label>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary-text flex items-center gap-2">
                  <IoList size={20} />
                  Recent Audit Logs
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAuditLogs}
                  disabled={auditLoading}
                  className="flex items-center gap-2"
                >
                  <IoRefresh size={16} className={auditLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
              </div>

              {auditLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent mx-auto"></div>
                  <p className="mt-2 text-secondary-text">Loading audit logs...</p>
                </div>
              ) : auditLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <DataTable
                    data={auditLogs}
                    columns={auditColumns}
                    emptyMessage="No audit logs found"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-text">
                  <IoShield size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No audit logs available</p>
                  <p className="text-sm mt-1">Changes to system settings will be logged here</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      <Modal
        isOpen={testEmailModalOpen}
        onClose={() => setTestEmailModalOpen(false)}
        title="Send Test Email"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-secondary-text text-sm">
            Enter an email address to send a test email and verify your SMTP settings are working correctly.
          </p>
          <Input
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setTestEmailModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleTestEmail}
              disabled={testingEmail || !testEmail}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {testingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <IoSend size={16} />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings
