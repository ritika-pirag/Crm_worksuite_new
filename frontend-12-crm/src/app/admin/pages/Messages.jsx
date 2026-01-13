import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import { messagesAPI } from '../../../api'
import { 
  IoSend, 
  IoSearch, 
  IoEllipsisVertical, 
  IoCheckmark, 
  IoCheckmarkDone,
  IoPerson,
  IoPeople,
  IoBriefcase
} from 'react-icons/io5'

const Messages = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const userRole = user?.role || localStorage.getItem('userRole')

  const [activeTab, setActiveTab] = useState('clients') // 'clients' or 'employees'
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessageText, setNewMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (userId && companyId && userRole) {
      fetchConversations()
      fetchAvailableUsers()
    }
  }, [userId, companyId, userRole])

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.other_user_id)
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        fetchConversationMessages(selectedConversation.other_user_id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await messagesAPI.getAll({ 
        user_id: userId, 
        company_id: companyId 
      })
      if (response.data.success) {
        setConversations(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, companyId])

  const fetchAvailableUsers = async () => {
    try {
      const response = await messagesAPI.getAvailableUsers({ 
        user_id: userId, 
        company_id: companyId,
        user_role: userRole 
      })
      if (response.data.success) {
        setAvailableUsers(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching available users:', error)
    }
  }

  const fetchConversationMessages = async (otherUserId) => {
    try {
      const response = await messagesAPI.getConversation(otherUserId, { 
        user_id: userId, 
        company_id: companyId 
      })
      if (response.data.success) {
        setMessages(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!newMessageText.trim() || !selectedConversation) return

    try {
      setSending(true)
      const response = await messagesAPI.create({
        to_user_id: selectedConversation.other_user_id,
        subject: 'Chat Message',
        message: newMessageText.trim(),
        user_id: userId,
        company_id: companyId
      })

      if (response.data.success) {
        setNewMessageText('')
        fetchConversationMessages(selectedConversation.other_user_id)
        fetchConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleSelectUser = (user) => {
    setSelectedConversation({
      other_user_id: user.id || user.other_user_id,
      other_user_name: user.display_name || user.name || user.other_user_name,
      other_user_email: user.email || user.other_user_email,
      other_user_role: user.role || user.other_user_role,
      unread_count: user.unread_count || 0
    })
  }

  // Filter users based on active tab and search
  const filteredUsers = availableUsers.filter(user => {
    // Filter by role tab
    if (activeTab === 'clients' && user.role !== 'CLIENT') return false
    if (activeTab === 'employees' && user.role !== 'EMPLOYEE') return false
    
    // Filter by search query
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    )
  })

  // Merge with existing conversations and apply search filter
  const displayUsers = [
    ...conversations.filter(conv => {
      // Filter by role tab
      if (activeTab === 'clients' && conv.other_user_role !== 'CLIENT') return false
      if (activeTab === 'employees' && conv.other_user_role !== 'EMPLOYEE') return false
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          conv.other_user_name?.toLowerCase().includes(query) ||
          conv.other_user_email?.toLowerCase().includes(query)
        )
      }
      return true
    }),
    ...filteredUsers.filter(u => 
      !conversations.some(c => c.other_user_id === u.id)
    ).map(u => ({
      other_user_id: u.id,
      other_user_name: u.display_name || u.name,
      other_user_email: u.email,
      other_user_role: u.role,
      last_message: null,
      last_message_time: null,
      unread_count: 0
    }))
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto"></div>
          <p className="mt-4 text-secondary-text">Loading messages...</p>
        </div>
      </div>
    )
  }

  // SuperAdmin has no messaging
  if (userRole === 'SUPERADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Messages</h1>
          <p className="text-secondary-text mt-1">Manage conversations</p>
        </div>
        <Card className="p-12 text-center">
          <IoPerson size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">Messaging Not Available</h3>
          <p className="text-secondary-text">
            SuperAdmin role does not have access to messaging system.
            <br />
            Messaging is only available for Admin, Client, and Employee roles.
          </p>
        </Card>
      </div>
    )
  }

  // Client/Employee only see admins (no tabs needed)
  const showTabs = userRole === 'ADMIN'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Messages</h1>
        <p className="text-secondary-text mt-1">Manage conversations</p>
      </div>

      {/* WhatsApp-style Layout - Reversed (Chat Left, List Right) */}
      <Card className="overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex h-full">
          {/* LEFT SIDE - Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-accent flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-text">{selectedConversation.other_user_name}</h3>
                      <p className="text-xs text-secondary-text flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {selectedConversation.other_user_email}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <IoEllipsisVertical size={20} />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-secondary-text">
                      <div className="text-center">
                        <IoPerson size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-xs mt-1">Start a conversation</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMyMessage = msg.from_user_id === parseInt(userId)
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isMyMessage
                                ? 'bg-primary-accent text-white'
                                : 'bg-white text-primary-text border border-gray-200'
                            }`}
                          >
                            {!isMyMessage && (
                              <p className="text-xs opacity-70 mb-1">{msg.from_user_name}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <div className={`flex items-center gap-1 justify-end mt-1 text-xs ${
                              isMyMessage ? 'text-white opacity-70' : 'text-secondary-text'
                            }`}>
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isMyMessage && (
                                msg.is_read ? 
                                  <IoCheckmarkDone size={14} className="text-blue-400" /> : 
                                  <IoCheckmark size={14} />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessageText.trim()}
                      className="w-12 h-12 rounded-full bg-primary-accent text-white flex items-center justify-center hover:bg-primary-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoSend size={20} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center text-secondary-text bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                    <IoPerson size={64} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-text mb-2">Select a conversation to view messages</h3>
                  <p className="text-sm">
                    {userRole === 'ADMIN' && 'Choose a client or employee from the right to start messaging'}
                    {userRole === 'CLIENT' && 'Choose your admin from the right to start messaging'}
                    {userRole === 'EMPLOYEE' && 'Choose your admin from the right to start messaging'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE - User List with Tabs */}
          <div className="w-full md:w-96 border-l border-gray-200 flex flex-col bg-white">
            {/* Tabs (Only for Admin) */}
            {showTabs && (
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === 'clients'
                      ? 'border-primary-accent text-primary-accent bg-blue-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IoPerson size={18} />
                  Clients
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`flex-1 px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center justify-center gap-2 ${
                    activeTab === 'employees'
                      ? 'border-primary-accent text-primary-accent bg-blue-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IoPeople size={18} />
                  Employees
                </button>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                />
              </div>
            </div>

            {/* Role Info */}
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
              <p className="text-xs text-blue-800 flex items-center gap-1">
                <IoBriefcase size={14} />
                {userRole === 'ADMIN' && `${activeTab === 'clients' ? 'Your Clients' : 'Your Employees'}`}
                {userRole === 'CLIENT' && 'Your Admin'}
                {userRole === 'EMPLOYEE' && 'Your Admin'}
              </p>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {displayUsers.length === 0 ? (
                <div className="p-6 text-center text-secondary-text">
                  <IoPerson size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No {activeTab} found</p>
                  <p className="text-xs mt-1">
                    {userRole === 'ADMIN' && `Add ${activeTab} to start messaging`}
                    {userRole === 'CLIENT' && 'No admin available'}
                    {userRole === 'EMPLOYEE' && 'No admin available'}
                  </p>
                </div>
              ) : (
                displayUsers.map((conv) => (
                  <div
                    key={conv.other_user_id}
                    onClick={() => handleSelectUser(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.other_user_id === conv.other_user_id ? 'bg-blue-50 border-l-4 border-l-primary-accent' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary-accent flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {conv.other_user_name ? conv.other_user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                        </span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-primary-text truncate">
                            {conv.other_user_name}
                          </h4>
                          {conv.last_message_time && (
                            <span className="text-xs text-secondary-text">
                              {new Date(conv.last_message_time).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-secondary-text truncate">
                            {conv.last_message || conv.other_user_email}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-primary-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        {conv.other_user_role && (
                          <Badge variant="default" className="text-xs mt-1">
                            {conv.other_user_role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Messages
