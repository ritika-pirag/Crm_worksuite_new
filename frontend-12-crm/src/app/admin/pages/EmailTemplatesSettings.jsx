/**
 * Email Templates Settings Page
 * Secondary sidebar with categories and template editing
 * Route: /app/admin/email-templates
 */

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { emailTemplatesAPI } from '../../../api'
import { toast } from 'react-hot-toast'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import {
  IoChevronDown,
  IoChevronUp,
  IoDocumentText,
  IoMail,
  IoSave,
  IoRefresh,
  IoEye,
  IoCheckmarkCircle,
  IoClose,
} from 'react-icons/io5'

// Email Template Categories with exact submenu items from screenshots
const EMAIL_TEMPLATE_CATEGORIES = [
  {
    id: 'contract',
    label: 'Contract',
    templates: [
      { key: 'contract_sent', label: 'Contract sent' },
      { key: 'contract_accepted', label: 'Contract accepted' },
      { key: 'contract_rejected', label: 'Contract rejected' },
    ],
  },
  {
    id: 'estimate',
    label: 'Estimate',
    templates: [
      { key: 'estimate_sent', label: 'Estimate sent' },
      { key: 'estimate_accepted', label: 'Estimate accepted' },
      { key: 'estimate_rejected', label: 'Estimate rejected' },
      { key: 'estimate_request_received', label: 'Estimate request received' },
      { key: 'estimate_commented', label: 'Estimate commented' },
    ],
  },
  {
    id: 'event',
    label: 'Event',
    templates: [
      { key: 'upcoming_event', label: 'Upcoming event' },
    ],
  },
  {
    id: 'invoice',
    label: 'Invoice',
    templates: [
      { key: 'send_invoice', label: 'Send invoice' },
      { key: 'invoice_payment_confirmation', label: 'Invoice payment confirmation' },
      { key: 'invoice_due_reminder', label: 'Invoice due reminder before due date' },
      { key: 'invoice_overdue_reminder', label: 'Invoice overdue reminder' },
      { key: 'recurring_invoice_creation', label: 'Recurring invoice creation reminder' },
      { key: 'invoice_manual_payment', label: 'Invoice manual payment added' },
      { key: 'send_credit_note', label: 'Send credit note' },
    ],
  },
  {
    id: 'message',
    label: 'Message',
    templates: [
      { key: 'message_received', label: 'Message received' },
    ],
  },
  {
    id: 'order',
    label: 'Order',
    templates: [
      { key: 'new_order_received', label: 'New order received' },
      { key: 'order_status_updated', label: 'Order status updated' },
    ],
  },
  {
    id: 'project',
    label: 'Project',
    templates: [
      { key: 'project_completed', label: 'Project completed' },
      { key: 'project_task_deadline', label: 'Project task deadline reminder' },
    ],
  },
  {
    id: 'proposal',
    label: 'Proposal',
    templates: [
      { key: 'proposal_sent', label: 'Proposal sent' },
      { key: 'proposal_accepted', label: 'Proposal accepted' },
      { key: 'proposal_rejected', label: 'Proposal rejected' },
      { key: 'proposal_commented', label: 'Proposal commented' },
    ],
  },
  {
    id: 'reminder',
    label: 'Reminder',
    templates: [
      { key: 'upcoming_reminder', label: 'Upcoming reminder' },
    ],
  },
  {
    id: 'subscription',
    label: 'Subscription',
    templates: [
      { key: 'subscription_request_sent', label: 'Subscription request sent' },
      { key: 'subscription_started', label: 'Subscription started' },
      { key: 'subscription_cancelled', label: 'Subscription cancelled' },
      { key: 'subscription_invoice_cron', label: 'Subscription invoice created via Cron Job' },
      { key: 'subscription_renewal_reminder', label: 'Subscription renewal reminder' },
    ],
  },
  {
    id: 'task',
    label: 'Task',
    templates: [
      { key: 'task_commented', label: 'Task commented' },
      { key: 'task_assigned', label: 'Task assigned' },
      { key: 'task_general', label: 'Task general' },
    ],
  },
  {
    id: 'ticket',
    label: 'Ticket',
    templates: [
      { key: 'ticket_created', label: 'Ticket created' },
      { key: 'ticket_commented', label: 'Ticket commented' },
      { key: 'ticket_closed', label: 'Ticket closed' },
      { key: 'ticket_reopened', label: 'Ticket reopened' },
    ],
  },
]

// Common merge tags for email templates
const MERGE_TAGS = {
  common: [
    '{{company_name}}',
    '{{company_logo}}',
    '{{company_email}}',
    '{{company_phone}}',
    '{{company_address}}',
    '{{current_date}}',
    '{{current_time}}',
  ],
  client: [
    '{{client_name}}',
    '{{client_email}}',
    '{{client_phone}}',
    '{{client_company}}',
  ],
  invoice: [
    '{{invoice_number}}',
    '{{invoice_amount}}',
    '{{invoice_due_date}}',
    '{{invoice_link}}',
    '{{payment_link}}',
  ],
  project: [
    '{{project_name}}',
    '{{project_deadline}}',
    '{{project_status}}',
    '{{project_link}}',
  ],
  task: [
    '{{task_title}}',
    '{{task_deadline}}',
    '{{task_assignee}}',
    '{{task_priority}}',
  ],
  contract: [
    '{{contract_title}}',
    '{{contract_value}}',
    '{{contract_link}}',
  ],
  estimate: [
    '{{estimate_number}}',
    '{{estimate_amount}}',
    '{{estimate_link}}',
  ],
  proposal: [
    '{{proposal_title}}',
    '{{proposal_amount}}',
    '{{proposal_link}}',
  ],
  ticket: [
    '{{ticket_id}}',
    '{{ticket_subject}}',
    '{{ticket_status}}',
    '{{ticket_link}}',
  ],
  subscription: [
    '{{subscription_name}}',
    '{{subscription_amount}}',
    '{{subscription_renewal_date}}',
  ],
}

const EmailTemplatesSettings = () => {
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'
  
  // State
  const [expandedCategories, setExpandedCategories] = useState({})
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templates, setTemplates] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
  })

  // Get company_id
  const getCompanyId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.company_id || localStorage.getItem('company_id') || 1
  }

  /**
   * Fetch all email templates
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const companyId = getCompanyId()
      const response = await emailTemplatesAPI.getAll({ company_id: companyId })
      
      if (response.data?.success) {
        // Convert array to object keyed by template type
        const templatesMap = {}
        response.data.data.forEach(template => {
          if (template.type) {
            templatesMap[template.type] = template
          }
        })
        setTemplates(templatesMap)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  /**
   * Toggle category expansion
   */
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  /**
   * Select a template for editing
   */
  const handleSelectTemplate = (templateKey, templateLabel, categoryId) => {
    // Check for unsaved changes
    if (hasChanges && selectedTemplate) {
      if (!window.confirm('You have unsaved changes. Discard and continue?')) {
        return
      }
    }

    setSelectedTemplate({
      key: templateKey,
      label: templateLabel,
      category: categoryId,
    })

    // Load existing template data or set defaults
    const existingTemplate = templates[templateKey]
    if (existingTemplate) {
      setFormData({
        subject: existingTemplate.subject || '',
        body: existingTemplate.body || '',
      })
    } else {
      // Generate default template
      setFormData({
        subject: getDefaultSubject(templateKey, templateLabel),
        body: getDefaultBody(templateKey, templateLabel),
      })
    }
    
    setHasChanges(false)
    setPreviewMode(false)
  }

  /**
   * Generate default subject based on template type
   */
  const getDefaultSubject = (key, label) => {
    const subjects = {
      contract_sent: 'New Contract: {{contract_title}}',
      contract_accepted: 'Contract Accepted: {{contract_title}}',
      contract_rejected: 'Contract Rejected: {{contract_title}}',
      estimate_sent: 'New Estimate #{{estimate_number}}',
      estimate_accepted: 'Estimate Accepted #{{estimate_number}}',
      estimate_rejected: 'Estimate Rejected #{{estimate_number}}',
      estimate_request_received: 'New Estimate Request Received',
      estimate_commented: 'New Comment on Estimate #{{estimate_number}}',
      upcoming_event: 'Reminder: Upcoming Event',
      send_invoice: 'Invoice #{{invoice_number}} from {{company_name}}',
      invoice_payment_confirmation: 'Payment Received - Invoice #{{invoice_number}}',
      invoice_due_reminder: 'Payment Reminder: Invoice #{{invoice_number}} Due Soon',
      invoice_overdue_reminder: 'Overdue: Invoice #{{invoice_number}}',
      recurring_invoice_creation: 'New Recurring Invoice Generated',
      invoice_manual_payment: 'Manual Payment Added to Invoice #{{invoice_number}}',
      send_credit_note: 'Credit Note from {{company_name}}',
      message_received: 'New Message from {{company_name}}',
      new_order_received: 'New Order Received',
      order_status_updated: 'Order Status Update',
      project_completed: 'Project Completed: {{project_name}}',
      project_task_deadline: 'Task Deadline Reminder: {{task_title}}',
      proposal_sent: 'New Proposal: {{proposal_title}}',
      proposal_accepted: 'Proposal Accepted: {{proposal_title}}',
      proposal_rejected: 'Proposal Rejected: {{proposal_title}}',
      proposal_commented: 'New Comment on Proposal',
      upcoming_reminder: 'Reminder: {{reminder_title}}',
      subscription_request_sent: 'Subscription Request',
      subscription_started: 'Your Subscription Has Started',
      subscription_cancelled: 'Subscription Cancelled',
      subscription_invoice_cron: 'Subscription Invoice Generated',
      subscription_renewal_reminder: 'Subscription Renewal Reminder',
      task_commented: 'New Comment on Task: {{task_title}}',
      task_assigned: 'Task Assigned: {{task_title}}',
      task_general: 'Task Update: {{task_title}}',
      ticket_created: 'Ticket Created: {{ticket_subject}}',
      ticket_commented: 'New Reply on Ticket #{{ticket_id}}',
      ticket_closed: 'Ticket Closed: {{ticket_subject}}',
      ticket_reopened: 'Ticket Reopened: {{ticket_subject}}',
    }
    return subjects[key] || `${label} Notification`
  }

  /**
   * Generate default body based on template type
   */
  const getDefaultBody = (key, label) => {
    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="{{company_logo}}" alt="{{company_name}}" style="max-height: 60px;" />
  </div>
  
  <h2 style="color: #333; margin-bottom: 20px;">${label}</h2>
  
  <p style="color: #666; line-height: 1.6;">
    Dear {{client_name}},
  </p>
  
  <p style="color: #666; line-height: 1.6;">
    This is a notification regarding your ${label.toLowerCase()}.
  </p>
  
  <p style="color: #666; line-height: 1.6;">
    Please log in to your account for more details.
  </p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px;">
      Best regards,<br/>
      {{company_name}}<br/>
      {{company_email}}<br/>
      {{company_phone}}
    </p>
  </div>
</div>
    `.trim()
  }

  /**
   * Handle form changes
   */
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  /**
   * Save template
   */
  const handleSave = async () => {
    if (!selectedTemplate) return
    
    try {
      setSaving(true)
      const companyId = getCompanyId()
      
      const templateData = {
        company_id: parseInt(companyId),
        name: selectedTemplate.label,
        type: selectedTemplate.key,
        subject: formData.subject,
        body: formData.body,
      }

      const existingTemplate = templates[selectedTemplate.key]
      
      let response
      if (existingTemplate?.id) {
        response = await emailTemplatesAPI.update(existingTemplate.id, templateData)
      } else {
        response = await emailTemplatesAPI.create(templateData)
      }

      if (response.data?.success) {
        toast.success('Template saved successfully!')
        setHasChanges(false)
        await fetchTemplates()
      } else {
        toast.error(response.data?.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Insert merge tag at cursor
   */
  const insertMergeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + ' ' + tag
    }))
    setHasChanges(true)
  }

  /**
   * Get relevant merge tags for selected template
   */
  const getRelevantMergeTags = () => {
    if (!selectedTemplate) return MERGE_TAGS.common

    const category = selectedTemplate.category
    let tags = [...MERGE_TAGS.common, ...MERGE_TAGS.client]

    if (MERGE_TAGS[category]) {
      tags = [...tags, ...MERGE_TAGS[category]]
    }

    return tags
  }

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Secondary Sidebar - Categories */}
      <div 
        className="w-64 flex-shrink-0 border-r overflow-y-auto"
        style={{
          backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
          borderColor: isDark ? '#374151' : '#E5E7EB',
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
          <h2 className="font-semibold text-primary-text flex items-center gap-2">
            <IoMail className="text-primary-accent" />
            Email Templates
          </h2>
        </div>

        <div className="py-2">
          {EMAIL_TEMPLATE_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories[category.id]
            const hasSelectedChild = selectedTemplate?.category === category.id

            return (
              <div key={category.id}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
                  style={{
                    backgroundColor: hasSelectedChild 
                      ? (isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)')
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!hasSelectedChild) {
                      e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#F3F4F6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!hasSelectedChild) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span 
                    className="font-medium text-sm"
                    style={{ color: isDark ? '#E5E7EB' : '#374151' }}
                  >
                    {category.label}
                  </span>
                  {isExpanded ? (
                    <IoChevronUp size={16} style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />
                  ) : (
                    <IoChevronDown size={16} style={{ color: isDark ? '#9CA3AF' : '#6B7280' }} />
                  )}
                </button>

                {/* Submenu Items */}
                {isExpanded && (
                  <div className="py-1">
                    {category.templates.map((template) => {
                      const isSelected = selectedTemplate?.key === template.key
                      const hasContent = templates[template.key]

                      return (
                        <button
                          key={template.key}
                          onClick={() => handleSelectTemplate(template.key, template.label, category.id)}
                          className="w-full text-left px-6 py-2 text-sm transition-colors flex items-center gap-2"
                          style={{
                            backgroundColor: isSelected 
                              ? (isDark ? '#374151' : '#E5E7EB')
                              : 'transparent',
                            color: isSelected
                              ? (isDark ? '#ffffff' : '#111827')
                              : (isDark ? '#D1D5DB' : '#4B5563'),
                            borderLeft: isSelected ? '3px solid var(--color-primary-accent, #217E45)' : '3px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#F3F4F6'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          }}
                        >
                          <span className="flex-1">{template.label}</span>
                          {hasContent && (
                            <IoCheckmarkCircle 
                              size={14} 
                              className="text-green-500 flex-shrink-0" 
                              title="Template configured"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content - Template Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTemplate ? (
          <>
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{
                backgroundColor: isDark ? '#1F2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            >
              <div>
                <h3 className="text-lg font-semibold text-primary-text">
                  {selectedTemplate.label}
                </h3>
                <p className="text-sm text-secondary-text">
                  Configure the email template for this notification
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <span className="text-sm text-amber-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Unsaved changes
                  </span>
                )}
                
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: previewMode ? 'var(--color-primary-accent)' : 'transparent',
                    color: previewMode ? '#ffffff' : (isDark ? '#E5E7EB' : '#374151'),
                    borderColor: isDark ? '#4B5563' : '#D1D5DB',
                  }}
                >
                  <IoEye size={18} />
                  <span className="text-sm">Preview</span>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: hasChanges ? 'var(--color-primary-accent, #217E45)' : '#9CA3AF',
                  }}
                >
                  <IoSave size={18} />
                  <span className="text-sm">{saving ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>
              {previewMode ? (
                /* Preview Mode */
                <div 
                  className="max-w-2xl mx-auto rounded-xl shadow-lg overflow-hidden"
                  style={{ backgroundColor: isDark ? '#1F2937' : '#ffffff' }}
                >
                  <div className="p-4 border-b" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
                    <p className="text-xs text-secondary-text mb-1">Subject:</p>
                    <p className="font-medium text-primary-text">{formData.subject}</p>
                  </div>
                  <div className="p-6">
                    <div 
                      dangerouslySetInnerHTML={{ __html: formData.body }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Subject */}
                  <div 
                    className="rounded-xl p-6"
                    style={{ backgroundColor: isDark ? '#1F2937' : '#ffffff' }}
                  >
                    <label className="block text-sm font-medium text-primary-text mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary-accent outline-none"
                      style={{
                        backgroundColor: isDark ? '#111827' : '#ffffff',
                        borderColor: isDark ? '#374151' : '#D1D5DB',
                        color: isDark ? '#E5E7EB' : '#1F2937',
                      }}
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Merge Tags */}
                  <div 
                    className="rounded-xl p-6"
                    style={{ backgroundColor: isDark ? '#1F2937' : '#ffffff' }}
                  >
                    <label className="block text-sm font-medium text-primary-text mb-3">
                      Available Merge Tags (Click to insert)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getRelevantMergeTags().map((tag) => (
                        <button
                          key={tag}
                          onClick={() => insertMergeTag(tag)}
                          className="px-3 py-1.5 text-xs rounded-lg border transition-colors hover:bg-primary-accent hover:text-white hover:border-primary-accent"
                          style={{
                            backgroundColor: isDark ? '#111827' : '#F9FAFB',
                            borderColor: isDark ? '#374151' : '#D1D5DB',
                            color: isDark ? '#D1D5DB' : '#4B5563',
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Body */}
                  <div 
                    className="rounded-xl p-6"
                    style={{ backgroundColor: isDark ? '#1F2937' : '#ffffff' }}
                  >
                    <label className="block text-sm font-medium text-primary-text mb-2">
                      Email Body (HTML supported)
                    </label>
                    <div 
                      className="border rounded-lg overflow-hidden"
                      style={{ borderColor: isDark ? '#374151' : '#D1D5DB' }}
                    >
                      <textarea
                        value={formData.body}
                        onChange={(e) => handleFormChange('body', e.target.value)}
                        rows={20}
                        className="w-full px-4 py-3 font-mono text-sm outline-none resize-none"
                        style={{
                          backgroundColor: isDark ? '#111827' : '#ffffff',
                          color: isDark ? '#E5E7EB' : '#1F2937',
                        }}
                        placeholder="Enter email body HTML..."
                      />
                    </div>
                    <p className="text-xs text-secondary-text mt-2">
                      Tip: Use merge tags like {'{{client_name}}'} for personalization. HTML is fully supported.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No Template Selected */
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>
            <div className="text-center">
              <IoDocumentText size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-primary-text mb-2">
                Select an Email Template
              </h3>
              <p className="text-secondary-text max-w-md">
                Choose a template category and item from the sidebar to start editing.
                Templates are used for automated email notifications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailTemplatesSettings

