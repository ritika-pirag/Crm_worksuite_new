import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import RightSideModal from '../../../components/ui/RightSideModal'
import AddButton from '../../../components/ui/AddButton'
import { IoHelpCircle, IoAdd, IoCreate, IoTrash } from 'react-icons/io5'

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: 'How do I create a new company?',
      answer: 'Go to Companies page and click Add Company button. Fill in the required details and save.',
      category: 'Companies',
      status: 'Published'
    },
    {
      id: 2,
      question: 'How do I assign a package to a company?',
      answer: 'Go to Companies page, edit the company, and select a package from the dropdown.',
      category: 'Packages',
      status: 'Published'
    }
  ])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    status: 'Published'
  })

  const handleSave = () => {
    if (selectedFAQ) {
      setFaqs(faqs.map(faq => faq.id === selectedFAQ.id ? { ...formData, id: faq.id } : faq))
    } else {
      setFaqs([...faqs, { ...formData, id: Date.now() }])
    }
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleEdit = (faq) => {
    setSelectedFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status
    })
    setIsAddModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(faq => faq.id !== id))
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      status: 'Published'
    })
    setSelectedFAQ(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-text">Admin FAQ</h1>
          <p className="text-secondary-text mt-1">Manage frequently asked questions for administrators</p>
        </div>
        <AddButton onClick={() => { resetForm(); setIsAddModalOpen(true) }} />
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <IoHelpCircle size={24} className="text-primary-accent" />
                  <h3 className="text-lg font-semibold text-primary-text">{faq.question}</h3>
                </div>
                <p className="text-secondary-text mb-3">{faq.answer}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{faq.category}</Badge>
                  <Badge variant={faq.status === 'Published' ? 'success' : 'warning'}>
                    {faq.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-2 text-primary-accent hover:bg-primary-accent hover:text-white rounded-lg transition-colors"
                >
                  <IoCreate size={18} />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                >
                  <IoTrash size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          resetForm()
        }}
        title={selectedFAQ ? 'Edit FAQ' : 'Add FAQ'}
      >
        <div className="space-y-4">
          <Input
            label="Question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Enter question"
            required
          />

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Answer
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter answer"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              >
                <option value="General">General</option>
                <option value="Companies">Companies</option>
                <option value="Packages">Packages</option>
                <option value="Billing">Billing</option>
                <option value="Users">Users</option>
              </select>
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
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                resetForm()
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {selectedFAQ ? 'Update' : 'Create'} FAQ
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default AdminFAQ

