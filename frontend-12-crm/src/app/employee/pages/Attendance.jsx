import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { attendanceAPI } from '../../../api'
import { FaCheckCircle, FaClock } from 'react-icons/fa'
import { 
  IoCalendar, 
  IoDownloadOutline, 
  IoListOutline, 
  IoGridOutline,
  IoChevronBack,
  IoChevronForward
} from 'react-icons/io5'

const Attendance = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const primaryColor = theme?.primaryAccent || '#217E45'
  
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  const employeeId = user?.employee_id || localStorage.getItem('employeeId')
  
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [monthlyCalendar, setMonthlyCalendar] = useState([])
  const [attendancePercentage, setAttendancePercentage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Status config
  const statusConfig = {
    present: { symbol: '✓', color: 'text-green-600', bg: 'bg-green-50', label: 'Present' },
    absent: { symbol: '✗', color: 'text-red-600', bg: 'bg-red-50', label: 'Absent' },
    half_day: { symbol: '½', color: 'text-orange-600', bg: 'bg-orange-50', label: 'Half Day' },
    late: { symbol: '⏱', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Late' },
    on_leave: { symbol: '✉', color: 'text-purple-600', bg: 'bg-purple-50', label: 'On Leave' },
    holiday: { symbol: '★', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Holiday' },
    day_off: { symbol: '🏠', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Day Off' },
  }

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    if (userId && companyId) {
      fetchAttendance()
      fetchMonthlyCalendar()
      fetchAttendancePercentage()
    }
  }, [selectedMonth, selectedYear, userId, companyId])

  useEffect(() => {
    if (userId && companyId) {
      checkTodayStatus()
    }
  }, [userId, companyId])

  const checkTodayStatus = async () => {
    try {
      const response = await attendanceAPI.getTodayStatus({ 
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        const todayStatus = response.data.data
        if (todayStatus.checked_in && !todayStatus.checked_out) {
          setCheckedIn(true)
          setCheckInTime(todayStatus.check_in)
        } else if (todayStatus.checked_out) {
          setCheckedIn(false)
          setCheckInTime(null)
        }
      }
    } catch (error) {
      console.error('Error checking today status:', error)
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await attendanceAPI.getAll({ 
          date: today,
          company_id: companyId,
          user_id: userId
        })
        if (response.data.success && response.data.data.length > 0) {
          const todayAttendance = response.data.data[0]
          if (todayAttendance.check_in && !todayAttendance.check_out) {
            setCheckedIn(true)
            setCheckInTime(todayAttendance.check_in)
          }
        }
      } catch (e) {
        console.error('Fallback check today status error:', e)
      }
    }
  }

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await attendanceAPI.getAll({ 
        month: selectedMonth, 
        year: selectedYear,
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        const attendance = response.data.data || []
        const transformedAttendance = attendance.map(att => {
          let formattedDate = 'N/A'
          if (att.date) {
            const dateStr = att.date.includes('T') ? att.date : att.date + 'T00:00:00'
            const dateObj = new Date(dateStr)
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            }
          }
          
          let checkIn = att.check_in || '--'
          let checkOut = att.check_out || '--'
          
          let hours = '--'
          if (att.total_hours !== null && att.total_hours !== undefined && att.total_hours >= 0) {
            const h = Math.floor(att.total_hours)
            const m = Math.round((att.total_hours - h) * 60)
            hours = m > 0 ? `${h}h ${m}m` : `${h}h`
          } else if (att.check_in && att.check_out) {
            const checkInParts = att.check_in.split(':')
            const checkOutParts = att.check_out.split(':')
            if (checkInParts.length >= 2 && checkOutParts.length >= 2) {
              const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1])
              const checkOutMinutes = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1])
              let totalMinutes = checkOutMinutes - checkInMinutes
              if (totalMinutes < 0) {
                totalMinutes += 24 * 60
              }
              if (totalMinutes > 0) {
                const h = Math.floor(totalMinutes / 60)
                const m = totalMinutes % 60
                hours = m > 0 ? `${h}h ${m}m` : `${h}h`
              }
            }
          }
          
          return {
            id: att.id,
            date: formattedDate,
            rawDate: att.date,
            checkIn: checkIn,
            checkOut: checkOut,
            status: att.status || 'Present',
            hours: hours,
            ...att
          }
        })
        setAttendanceHistory(transformedAttendance)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyCalendar = async () => {
    try {
      const response = await attendanceAPI.getMonthlyCalendar({ 
        month: selectedMonth, 
        year: selectedYear,
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        setMonthlyCalendar(response.data.data.calendar || [])
        setAttendancePercentage(response.data.data.attendance_percentage || 0)
      }
    } catch (error) {
      console.error('Error fetching monthly calendar:', error)
    }
  }

  const fetchAttendancePercentage = async () => {
    try {
      const response = await attendanceAPI.getAttendancePercentage({ 
        month: selectedMonth, 
        year: selectedYear,
        company_id: companyId,
        user_id: userId
      })
      if (response.data.success) {
        setAttendancePercentage(response.data.data.attendance_percentage || 0)
      }
    } catch (error) {
      console.error('Error fetching attendance percentage:', error)
    }
  }

  const handleCheckIn = async () => {
    try {
      const response = await attendanceAPI.checkIn({ company_id: companyId, user_id: userId })
      if (response.data.success) {
        const now = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
        setCheckInTime(now)
        setCheckedIn(true)
        await fetchAttendance()
        await fetchMonthlyCalendar()
        await fetchAttendancePercentage()
      } else {
        alert(response.data.error || 'Failed to check in')
      }
    } catch (error) {
      console.error('Error checking in:', error)
      alert(error.response?.data?.error || 'Failed to check in')
    }
  }

  const handleCheckOut = async () => {
    try {
      const response = await attendanceAPI.checkOut({ company_id: companyId, user_id: userId })
      if (response.data.success) {
        const totalHours = response.data.data?.total_hours || ''
        setCheckedIn(false)
        setCheckInTime(null)
        alert(`Checked out successfully! ${totalHours ? `Total hours: ${totalHours}` : ''}`)
        await fetchAttendance()
        await fetchMonthlyCalendar()
        await fetchAttendancePercentage()
      } else {
        alert(response.data.error || 'Failed to check out')
      }
    } catch (error) {
      console.error('Error checking out:', error)
      alert(error.response?.data?.error || 'Failed to check out')
    }
  }

  // Get days in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Get day name
  const getDayName = (day) => {
    const date = new Date(selectedYear, selectedMonth - 1, day)
    return date.toLocaleDateString('en', { weekday: 'short' })
  }

  // Check if weekend
  const isWeekend = (day) => {
    const date = new Date(selectedYear, selectedMonth - 1, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  // Get attendance for a specific day
  const getAttendanceForDay = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return attendanceHistory.find(att => att.rawDate === dateStr || att.date?.includes(String(day)))
  }

  // Navigate months
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Export attendance
  const handleExport = () => {
    const csvData = attendanceHistory.map(att => ({
      Date: att.date,
      'Check In': att.checkIn,
      'Check Out': att.checkOut,
      Status: att.status,
      Hours: att.hours
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `attendance_${selectedMonth}_${selectedYear}.csv`
    link.click()
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Present': { bg: 'bg-green-100', text: 'text-green-700' },
      'Absent': { bg: 'bg-red-100', text: 'text-red-700' },
      'Late': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'Half Day': { bg: 'bg-orange-100', text: 'text-orange-700' },
      'On Leave': { bg: 'bg-purple-100', text: 'text-purple-700' },
      'Holiday': { bg: 'bg-amber-100', text: 'text-amber-700' },
      'Day Off': { bg: 'bg-blue-100', text: 'text-blue-700' },
    }
    const style = statusMap[status] || statusMap['Present']
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Attendance</h1>
        <p className="text-secondary-text mt-1">Track your attendance</p>
      </div>

      {/* Check In/Out Card */}
      <Card>
        <div className="text-center py-8">
          {!checkedIn ? (
            <>
              <FaClock size={48} className="text-secondary-text mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                Ready to Check In?
              </h3>
              <p className="text-secondary-text mb-6">Click the button below to check in</p>
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleCheckIn}
                style={{ backgroundColor: primaryColor }}
              >
                Check In
              </Button>
            </>
          ) : (
            <>
              <FaCheckCircle size={48} className="mx-auto mb-4" style={{ color: primaryColor }} />
              <h3 className="text-xl font-semibold text-primary-text mb-2">Checked In</h3>
              <p className="text-secondary-text mb-2">Check In Time: {checkInTime}</p>
              <p className="text-muted-text text-sm mb-6">You are currently checked in</p>
              <Button variant="danger" size="md" onClick={handleCheckOut}>
                Check Out
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Month/Year Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoChevronBack size={20} />
            </button>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': primaryColor }}
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx + 1}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IoChevronForward size={20} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <IoDownloadOutline size={18} /> Export
            </button>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'text-white' : 'hover:bg-gray-50'}`}
                style={viewMode === 'grid' ? { backgroundColor: primaryColor } : {}}
              >
                <IoGridOutline size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'text-white' : 'hover:bg-gray-50'}`}
                style={viewMode === 'list' ? { backgroundColor: primaryColor } : {}}
              >
                <IoListOutline size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-gray-500 font-medium">Status Legend:</span>
          {Object.entries(statusConfig).map(([key, config]) => (
            <span key={key} className="flex items-center gap-1">
              <span className={`w-5 h-5 rounded flex items-center justify-center ${config.bg} ${config.color}`}>
                {config.symbol}
              </span>
              <span className="text-gray-600">{config.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Attendance Grid View */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] z-10">
                    Day
                  </th>
                  {daysArray.map(day => (
                    <th
                      key={day}
                      className={`px-2 py-2 text-center text-xs font-medium uppercase tracking-wider min-w-[50px] ${
                        isWeekend(day) ? 'bg-gray-100 text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <div>{getDayName(day)}</div>
                      <div className="font-bold">{day}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 z-10">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span>{user?.name || 'My Attendance'}</span>
                    </div>
                  </td>
                  {daysArray.map(day => {
                    const attendance = getAttendanceForDay(day)
                    const status = attendance?.status?.toLowerCase().replace(' ', '_') || ''
                    const config = statusConfig[status]
                    const isToday = new Date().getDate() === day && 
                                   new Date().getMonth() + 1 === selectedMonth && 
                                   new Date().getFullYear() === selectedYear

                    return (
                      <td
                        key={day}
                        className={`px-2 py-2 text-center ${
                          isWeekend(day) ? 'bg-gray-50' : ''
                        } ${isToday ? 'ring-2 ring-inset' : ''}`}
                        style={isToday ? { '--tw-ring-color': primaryColor } : {}}
                        title={attendance ? `${attendance.status}\nIn: ${attendance.checkIn}\nOut: ${attendance.checkOut}\nHours: ${attendance.hours}` : ''}
                      >
                        {config ? (
                          <div className={`w-8 h-8 mx-auto rounded flex items-center justify-center ${config.bg}`}>
                            <span className={config.color}>{config.symbol}</span>
                          </div>
                        ) : isWeekend(day) ? (
                          <div className="w-8 h-8 mx-auto rounded flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">-</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 mx-auto rounded flex items-center justify-center bg-gray-50">
                            <span className="text-gray-300">-</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Row */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="font-medium text-gray-700">Summary:</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>Present: {attendanceHistory.filter(a => a.status === 'Present').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Absent: {attendanceHistory.filter(a => a.status === 'Absent').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>Late: {attendanceHistory.filter(a => a.status === 'Late').length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span>Half Day: {attendanceHistory.filter(a => a.status === 'Half Day').length}</span>
              </span>
              <span className="font-semibold ml-auto" style={{ color: primaryColor }}>
                Attendance: {attendancePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceHistory.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {att.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={att.checkIn !== '--' ? 'text-green-600 font-medium' : ''}>
                          {att.checkIn}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={att.checkOut !== '--' ? 'text-red-600 font-medium' : ''}>
                          {att.checkOut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {att.hours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(att.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* List Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Showing {attendanceHistory.length} records for {months[selectedMonth - 1]} {selectedYear}
              </span>
              <span className="font-semibold" style={{ color: primaryColor }}>
                Attendance Rate: {attendancePercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Percentage Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center py-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke={primaryColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(attendancePercentage / 100) * 263.89} 263.89`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-primary-text">{attendancePercentage.toFixed(0)}%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Attendance Rate</h3>
            <p className="text-xs text-gray-400 mt-1">{months[selectedMonth - 1]} {selectedYear}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center py-6">
            <div className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
              {attendanceHistory.filter(a => a.status === 'Present').length}
            </div>
            <h3 className="text-sm font-medium text-gray-500">Days Present</h3>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </Card>

        <Card>
          <div className="text-center py-6">
            <div className="text-4xl font-bold mb-2 text-red-500">
              {attendanceHistory.filter(a => a.status === 'Absent').length}
            </div>
            <h3 className="text-sm font-medium text-gray-500">Days Absent</h3>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Attendance
