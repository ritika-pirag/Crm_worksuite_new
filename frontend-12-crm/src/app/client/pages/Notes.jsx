import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import AddButton from '../../../components/ui/AddButton'
import RightSideModal from '../../../components/ui/RightSideModal'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { notesAPI } from '../../../api'
import { IoCreate, IoTrash, IoReader, IoAdd } from 'react-icons/io5'

const Notes = () => {
  const { user } = useAuth()
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const userId = user?.id || localStorage.getItem('userId')
  
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    if (companyId) {
      fetchNotes()
    }
  }, [companyId])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await notesAPI.getAll({
        company_id: companyId,
        client_id: userId
      })
      if (response.data.success) {
        setNotes(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setFormData({ title: '', content: '' })
    setSelectedNote(null)
    setIsAddModalOpen(true)
  }

  const handleEdit = (note) => {
    setSelectedNote(note)
    setFormData({
      title: note.title || '',
      content: note.content || note.note || '',
    })
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.content.trim()) {
      alert('Please enter note content')
      return
    }

    try {
      const noteData = {
        ...formData,
        company_id: companyId,
        client_id: userId,
        user_id: userId,
      }

      if (selectedNote) {
        await notesAPI.update(selectedNote.id, noteData, { company_id: companyId })
        alert('Note updated successfully!')
      } else {
        await notesAPI.create(noteData)
        alert('Note created successfully!')
      }
      
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setFormData({ title: '', content: '' })
      fetchNotes()
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(id, { company_id: companyId })
        alert('Note deleted successfully!')
        fetchNotes()
      } catch (error) {
        console.error('Error deleting note:', error)
        alert('Failed to delete note')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Notes</h1>
          <p className="text-secondary-text mt-1">Manage your notes</p>
        </div>
        <AddButton onClick={handleAdd} label="Add Note" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center">
          <IoReader size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Notes Found</h3>
          <p className="text-secondary-text mb-4">Create your first note to get started.</p>
          <Button
            variant="primary"
            onClick={handleAdd}
            className="inline-flex items-center gap-2"
          >
            <IoAdd size={18} />
            Add Note
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  {note.title && (
                    <h3 className="font-semibold text-primary-text truncate">{note.title}</h3>
                  )}
                  <p className="text-xs text-secondary-text mt-1">
                    {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
                    title="Edit"
                  >
                    <IoCreate size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete"
                  >
                    <IoTrash size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-primary-text whitespace-pre-wrap line-clamp-4">
                {note.content || note.note || 'No content'}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <RightSideModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setFormData({ title: '', content: '' })
        }}
        title={selectedNote ? 'Edit Note' : 'Add Note'}
      >
        <div className="space-y-4">
          <Input
            label="Title (Optional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter note title..."
          />
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Note Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none resize-none"
              placeholder="Enter your note..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false)
                setIsEditModalOpen(false)
                setFormData({ title: '', content: '' })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {selectedNote ? 'Update' : 'Save'} Note
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default Notes

