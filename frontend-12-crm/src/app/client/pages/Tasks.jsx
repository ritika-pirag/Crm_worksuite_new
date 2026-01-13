import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import RightSideModal from '../../../components/ui/RightSideModal'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { tasksAPI } from '../../../api'
import { IoEye, IoChatbubbleEllipses } from 'react-icons/io5'

const Tasks = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  useEffect(() => {
    if (userId && companyId) {
      fetchTasks()
    }
  }, [userId, companyId])

  useEffect(() => {
    if (selectedTask) {
      fetchComments(selectedTask.id)
    }
  }, [selectedTask])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksAPI.getAll({
        company_id: companyId,
        client_id: userId
      })
      if (response.data.success) {
        const fetchedTasks = response.data.data || []
        const transformedTasks = fetchedTasks.map(task => ({
          id: task.id,
          task: task.title || task.task || `Task #${task.id}`,
          project: task.project_name || task.projectName || 'N/A',
          status: task.status || 'Pending',
          priority: task.priority || 'Medium',
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
          assignedTo: task.assigned_to_name || task.assignedTo || 'Unassigned',
          ...task
        }))
        setTasks(transformedTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (taskId) => {
    try {
      const response = await tasksAPI.getById(taskId, { company_id: companyId })
      if (response.data.success && response.data.data.comments) {
        setComments(response.data.data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setComments([])
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return

    try {
      setAddingComment(true)
      const response = await tasksAPI.addComment(selectedTask.id, { 
        comment: newComment,
        company_id: companyId,
        user_id: userId 
      })
      if (response.data.success) {
        setNewComment('')
        await fetchComments(selectedTask.id)
      } else {
        alert(response.data.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert(error.response?.data?.error || 'Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  const columns = [
    { key: 'task', label: 'Task' },
    { key: 'project', label: 'Project' },
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
    { key: 'dueDate', label: 'Due Date' },
    { key: 'assignedTo', label: 'Assigned To' },
  ]

  const handleView = (task) => {
    setSelectedTask(task)
    setIsViewModalOpen(true)
  }

  const actions = (row) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleView(row)
        }}
        className="p-2 text-primary-accent hover:bg-primary-accent hover:bg-opacity-10 rounded-md transition-all duration-200"
        title="View Details"
      >
        <IoEye size={18} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Tasks</h1>
        <p className="text-secondary-text mt-1">View your assigned tasks</p>
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
            { key: 'dueDate', label: 'Due Date', type: 'daterange' },
          ]}
          actions={actions}
          bulkActions={false}
        />
      )}

      <RightSideModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTask(null)
          setComments([])
          setNewComment('')
        }}
        title="Task Details"
        width="max-w-2xl"
      >
        {selectedTask && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-text">Task</label>
                <p className="text-primary-text mt-1 text-base font-semibold">{selectedTask.task}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Project</label>
                <p className="text-primary-text mt-1 text-base">{selectedTask.project}</p>
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
                    {selectedTask.status}
                  </Badge>
                </div>
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
                    {selectedTask.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Due Date</label>
                <p className="text-primary-text mt-1 text-base">{selectedTask.dueDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-text">Assigned To</label>
                <p className="text-primary-text mt-1 text-base">{selectedTask.assignedTo}</p>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <label className="text-sm font-medium text-secondary-text">Description</label>
                <p className="text-primary-text mt-1 text-base">{selectedTask.description}</p>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <IoChatbubbleEllipses size={20} className="text-primary-accent" />
                <h3 className="text-lg font-semibold text-primary-text">Comments</h3>
              </div>

              {/* Add Comment */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                  >
                    {addingComment ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-secondary-text text-sm text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-primary-text">
                          {comment.user_name || comment.user?.name || 'User'}
                        </p>
                        <span className="text-xs text-secondary-text">
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-primary-text">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false)
                  setSelectedTask(null)
                  setComments([])
                  setNewComment('')
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </RightSideModal>
    </div>
  )
}

export default Tasks
