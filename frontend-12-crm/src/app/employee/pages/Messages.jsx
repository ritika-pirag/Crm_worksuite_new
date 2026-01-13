import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import { messagesAPI } from '../../../api'
import { 
  IoSend, 
  IoSearch, 
  IoCheckmark, 
  IoCheckmarkDone,
  IoPerson
} from 'react-icons/io5'

const Messages = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const userRole = 'EMPLOYEE'

  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [availableAdmins, setAvailableAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessageText, setNewMessageText] = useState('')

  useEffect(() => {
    if (userId && companyId) {
      fetchAvailableAdmins()
    }
  }, [userId, companyId])

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.other_user_id)
      const interval = setInterval(() => {
        fetchConversationMessages(selectedConversation.other_user_id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const fetchAvailableAdmins = async () => {
    try {
      setLoading(true)
      const response = await messagesAPI.getAvailableUsers({ 
        user_id: userId, 
        company_id: companyId,
        user_role: userRole 
      })
      if (response.data.success) {
        const admins = response.data.data || []
        setAvailableAdmins(admins)
        // Auto-select first admin if available
        if (admins.length > 0 && !selectedConversation) {
          handleSelectAdmin(admins[0])
        }
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
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
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleSelectAdmin = (admin) => {
    setSelectedConversation({
      other_user_id: admin.id,
      other_user_name: admin.name,
      other_user_email: admin.email,
      other_user_role: admin.role
    })
  }

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Messages</h1>
        <p className="text-secondary-text mt-1">Chat with your admin</p>
      </div>

      <Card className="overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex h-full">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-accent flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedConversation.other_user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-text">{selectedConversation.other_user_name}</h3>
                      <p className="text-xs text-secondary-text">Admin • {selectedConversation.other_user_email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-secondary-text">
                      <div className="text-center">
                        <IoPerson size={48} className="mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-xs mt-1">Start a conversation with your admin</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMyMessage = msg.from_user_id === parseInt(userId)
                      return (
                        <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isMyMessage
                              ? 'bg-primary-accent text-white'
                              : 'bg-white text-primary-text border border-gray-200'
                          }`}>
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
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessageText.trim()}
                      className="px-6 py-3 rounded-full bg-primary-accent text-white font-semibold hover:bg-primary-accent/90 transition-colors disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-secondary-text bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <IoPerson size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-primary-text mb-2">No admin available</h3>
                  <p className="text-sm">Contact your system administrator</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin List (Right) */}
          <div className="w-80 border-l border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-primary-text">Your Admin</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {availableAdmins.length === 0 ? (
                <div className="p-6 text-center text-secondary-text">
                  <IoPerson size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No admin found</p>
                </div>
              ) : (
                availableAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    onClick={() => handleSelectAdmin(admin)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.other_user_id === admin.id ? 'bg-blue-50 border-l-4 border-l-primary-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-accent flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {admin.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary-text">{admin.name}</h4>
                        <p className="text-xs text-secondary-text">{admin.email}</p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">ADMIN</span>
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
