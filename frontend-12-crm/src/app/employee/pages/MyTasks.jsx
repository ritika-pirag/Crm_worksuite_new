import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { tasksAPI } from '../../../api'
import { IoEye, IoCreate, IoCloudUpload, IoDocumentText, IoDownload, IoTrash } from 'react-icons/io5'

const MyTasks = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (userId && companyId) {
      fetchTasks()
    }
  }, [userId, companyId])

  useEffect(() => {
    if (selectedTask) {
      fetchTaskDetails()
    }
  }, [selectedTask])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      // Fetch only tasks assigned to this employee
      const response = await tasksAPI.getAll({ 
        assigned_to: userId,
        company_id: companyId 
      })
      if (response.data.success) {
        const fetchedTasks = response.data.data || []
        const transformedTasks = fetchedTasks.map(task => ({
          id: task.id,
          task: task.title || `Task #${task.id}`,
          project: task.project_name || task.projectName || 'N/A',
          priority: task.priority || 'Medium',
          status: task.status || 'Pending',
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
          ...task
        }))
        setTasks(transformedTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      alert(error.response?.data?.error || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaskDetails = async () => {
    if (!selectedTask) return

    try {
      // Fetch full task details with comments and files - include company_id
      const params = { company_id: companyId, user_id: userId }
      const [taskResponse, commentsResponse, filesResponse] = await Promise.all([
        tasksAPI.getById(selectedTask.id, params),
        tasksAPI.getComments(selectedTask.id, params),
        tasksAPI.getFiles(selectedTask.id, params)
      ])

      if (taskResponse.data.success) {
        setSelectedTask({ ...selectedTask, ...taskResponse.data.data })
      }
      if (commentsResponse.data.success) {
        setComments(commentsResponse.data.data || [])
      }
      if (filesResponse.data.success) {
        setFiles(filesResponse.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching task details:', error)
    }
  }

  const handleView = async (task) => {
    setSelectedTask(task)
    setNewStatus(task.status || '')
    setIsViewModalOpen(true)
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setNewStatus(task.status || '')
    setIsEditModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedTask || !newStatus) {
      alert('Please select a status')
      return
    }

    try {
      const response = await tasksAPI.update(selectedTask.id, { status: newStatus }, { company_id: companyId })
      if (response.data.success) {
        alert('Task status updated successfully!')
        await fetchTasks()
        setIsEditModalOpen(false)
        setIsViewModalOpen(false)
        setSelectedTask(null)
      } else {
        alert(response.data.error || 'Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert(error.response?.data?.error || 'Failed to update task status')
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert('Please enter a comment')
      return
    }

    try {
      const commentData = { 
        comment: commentText,
        company_id: companyId,
        user_id: userId
      }
      const response = await tasksAPI.addComment(selectedTask.id, commentData, { company_id: companyId })
      if (response.data.success) {
        alert('Comment added successfully!')
        setCommentText('')
        await fetchTaskDetails()
        setIsCommentModalOpen(false)
      } else {
        alert(response.data.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert(error.response?.data?.error || 'Failed to add comment')
    }
  }

  const handleUploadFile = async () => {
    if (!uploadFile) {
      alert('Please select a file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('company_id', companyId)
      formData.append('user_id', userId)
      
      const response = await tasksAPI.uploadFile(selectedTask.id, formData, { company_id: companyId })
      if (response.data.success) {
        alert('File uploaded successfully!')
        setUploadFile(null)
        await fetchTaskDetails()
      } else {
        alert(response.data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(error.response?.data?.error || 'Failed to upload file')
    }
  }

  const handleDownloadFile = async (file) => {
    try {
      // File download logic - you may need to implement a download endpoint
      window.open(file.file_path, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  const columns = [
    { key: 'task', label: 'Task' },
    { key: 'project', label: 'Project' },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => {
        const priorityColors = {
          High: 'danger',
          Medium: 'warning',
          Low: 'info',
        }
        return <Badge variant={priorityColors[value] || 'default'}>{value}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Pending: 'warning',
          'In Progress': 'info',
          Completed: 'success',
          'Incomplete': 'warning',
          'Doing': 'info',
          'Done': 'success',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
    { key: 'dueDate', label: 'Due Date' },
  ]

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
        title="View Details"
      >
        <IoEye size={18} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(row)
        }}
        className="p-2 text-warning hover:bg-warning hover:bg-opacity-10 rounded transition-colors"
        title="Update Status"
      >
        <IoCreate size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">My Tasks</h1>
        <p className="text-secondary-text mt-1">View and manage your assigned tasks</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-secondary-text">Loading tasks...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tasks}
          searchPlaceholder="Search tasks..."
          filters={true}
          filterConfig={[
            { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed', 'Incomplete', 'Doing', 'Done'] },
            { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
            { key: 'project', label: 'Project', type: 'text' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      {/* View Task Modal */}
      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTask(null)
          setComments([])
          setFiles([])
        }}
        title="Task Details"
        width="max-w-5xl"
      >
        {selectedTask && (
          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Task Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Task</label>
                <p className="text-primary-text mt-1 font-semibold">{selectedTask.task || selectedTask.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Project</label>
                <p className="text-primary-text mt-1">{selectedTask.project || selectedTask.project_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Priority</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedTask.priority === 'High'
                        ? 'danger'
                        : selectedTask.priority === 'Medium'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {selectedTask.priority || 'Medium'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedTask.status === 'Completed' || selectedTask.status === 'Done'
                        ? 'success'
                        : selectedTask.status === 'In Progress' || selectedTask.status === 'Doing'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {selectedTask.status || 'Pending'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Due Date</label>
                <p className="text-primary-text mt-1">
                  {selectedTask.dueDate || (selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'N/A')}
                </p>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1">{selectedTask.description}</p>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary-text">Comments</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCommentModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <IoCreate size={16} />
                  Add Comment
                </Button>
              </div>
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-secondary-text text-sm">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-primary-text">{comment.user_name || 'Unknown'}</p>
                          <p className="text-primary-text mt-1">{comment.comment}</p>
                          <p className="text-xs text-secondary-text mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Files Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary-text">Files</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.onchange = (e) => {
                      if (e.target.files[0]) {
                        setUploadFile(e.target.files[0])
                        handleUploadFile()
                      }
                    }
                    input.click()
                  }}
                  className="flex items-center gap-2"
                >
                  <IoCloudUpload size={16} />
                  Upload File
                </Button>
              </div>
              <div className="space-y-2">
                {files.length === 0 ? (
                  <p className="text-secondary-text text-sm">No files uploaded</p>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IoDocumentText size={24} className="text-primary-accent" />
                        <div>
                          <p className="text-sm font-medium text-primary-text">{file.file_name}</p>
                          <p className="text-xs text-secondary-text">
                            {(file.file_size / 1024).toFixed(2)} KB • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded transition-colors"
                        title="Download"
                      >
                        <IoDownload size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Edit Status Modal */}
      <RightSideModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTask(null)
          setNewStatus('')
        }}
        title="Update Task Status"
        width="max-w-md"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Task</label>
              <p className="text-primary-text">{selectedTask.task || selectedTask.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                <option value="Incomplete">Incomplete</option>
                <option value="Doing">Doing</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedTask(null)
                  setNewStatus('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateStatus} className="flex-1">
                Update Status
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>

      {/* Add Comment Modal */}
      <RightSideModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false)
          setCommentText('')
        }}
        title="Add Comment"
        width="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">Comment</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              placeholder="Enter your comment..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentModalOpen(false)
                setCommentText('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddComment} className="flex-1">
              Add Comment
            </Button>
          </div>
        </div>
      </RightSideModal>
    </div>
  )
}

export default MyTasks
