import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import Card from '../../../components/ui/Card'
import DataTable from '../../../components/ui/DataTable'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { attendanceAPI } from '../../../api'
import { FaCheckCircle, FaClock } from 'react-icons/fa'
import { IoCalendar } from 'react-icons/io5'

const Attendance = () => {
  const { user } = useAuth()
  const userId = user?.id || localStorage.getItem('userId')
  const companyId = user?.company_id || localStorage.getItem('companyId')
  
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [monthlyCalendar, setMonthlyCalendar] = useState([])
  const [attendancePercentage, setAttendancePercentage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (userId && companyId) {
      fetchAttendance()
      fetchMonthlyCalendar()
      fetchAttendancePercentage()
    }
  }, [selectedMonth, selectedYear, userId, companyId])

  useEffect(() => {
    // Check if user is already checked in today
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
      // Fallback to old method if endpoint not available
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
          // Format date - handle YYYY-MM-DD format from backend
          let formattedDate = 'N/A'
          if (att.date) {
            // Add T00:00:00 to prevent timezone issues with YYYY-MM-DD format
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
          
          // Format check-in time
          let checkIn = att.check_in || '--'
          
          // Format check-out time
          let checkOut = att.check_out || '--'
          
          // Format hours
          let hours = '--'
          if (att.total_hours !== null && att.total_hours !== undefined && att.total_hours >= 0) {
            const h = Math.floor(att.total_hours)
            const m = Math.round((att.total_hours - h) * 60)
            hours = m > 0 ? `${h}h ${m}m` : `${h}h`
          } else if (att.check_in && att.check_out) {
            // Calculate hours if not provided
            const checkInParts = att.check_in.split(':')
            const checkOutParts = att.check_out.split(':')
            if (checkInParts.length >= 2 && checkOutParts.length >= 2) {
              const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1])
              const checkOutMinutes = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1])
              let totalMinutes = checkOutMinutes - checkInMinutes
              // Handle overnight shifts (check-out next day)
              if (totalMinutes < 0) {
                totalMinutes += 24 * 60 // Add 24 hours
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

  const getCalendarDays = () => {
    const year = selectedYear
    const month = selectedMonth - 1 // JavaScript months are 0-indexed
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

    const days = []
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayAttendance = monthlyCalendar.find(att => att.date === dateStr)
      days.push({
        day,
        date: dateStr,
        attendance: dayAttendance
      })
    }
    return days
  }

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'hours', label: 'Hours' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColors = {
          Present: 'success',
          Absent: 'danger',
          Late: 'warning',
          'Half Day': 'info',
        }
        return <Badge variant={statusColors[value] || 'default'}>{value}</Badge>
      },
    },
  ]

  const calendarDays = getCalendarDays()
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
              <Button variant="primary" size="md" onClick={handleCheckIn}>
                Check In
              </Button>
            </>
          ) : (
            <>
              <FaCheckCircle size={48} className="text-primary-accent mx-auto mb-4" />
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

      {/* Monthly Calendar and Attendance Percentage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-text flex items-center gap-2">
              <IoCalendar size={24} />
              Monthly Calendar
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-accent focus:border-primary-accent outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-secondary-text py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }
              const attendance = day.attendance
              const isToday = day.date === new Date().toISOString().split('T')[0]
              
              // Build tooltip text
              let tooltipText = ''
              if (attendance) {
                tooltipText = `${attendance.status || 'Present'}`
                if (attendance.check_in) {
                  tooltipText += `\nCheck In: ${attendance.check_in}`
                }
                if (attendance.check_out) {
                  tooltipText += `\nCheck Out: ${attendance.check_out}`
                }
                if (attendance.total_hours) {
                  tooltipText += `\nHours: ${attendance.total_hours}h`
                }
              }
              
              return (
                <div
                  key={day.day}
                  title={tooltipText}
                  className={`aspect-square border border-gray-200 rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                    isToday ? 'ring-2 ring-primary-accent' : ''
                  } ${
                    attendance?.status === 'Present'
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : attendance?.status === 'Absent'
                      ? 'bg-red-50 border-red-300 hover:bg-red-100'
                      : attendance?.status === 'Late'
                      ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                      : attendance?.status === 'Half Day'
                      ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-primary-accent' : 'text-primary-text'}`}>
                    {day.day}
                  </span>
                  {attendance && (
                    <div className="flex flex-col items-center mt-0.5">
                      {attendance.check_in && (
                        <span className="text-[9px] text-green-600 font-medium leading-tight">
                          In: {attendance.check_in}
                        </span>
                      )}
                      {attendance.check_out && (
                        <span className="text-[9px] text-red-600 font-medium leading-tight">
                          Out: {attendance.check_out}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Attendance Percentage */}
        <Card>
          <h2 className="text-xl font-semibold text-primary-text mb-4">Attendance Percentage</h2>
          <div className="text-center py-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(attendancePercentage / 100) * 351.86} 351.86`}
                  className="text-primary-accent transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-text">{attendancePercentage.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-secondary-text text-sm">
              {selectedMonth}/{selectedYear}
            </p>
          </div>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <h2 className="text-xl font-semibold text-primary-text mb-4">Attendance History</h2>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-secondary-text">Loading attendance...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={attendanceHistory}
            searchPlaceholder="Search attendance..."
            filters={true}
            filterConfig={[
              { key: 'status', label: 'Status', type: 'select', options: ['Present', 'Absent', 'Late', 'Half Day'] },
              { key: 'date', label: 'Date', type: 'daterange' },
            ]}
            bulkActions={false}
          />
        )}
      </Card>
    </div>
  )
}

export default Attendance
