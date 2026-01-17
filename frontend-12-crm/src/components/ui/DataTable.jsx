import React, { useState, useRef, useEffect } from 'react'
import { IoSearch, IoFilter, IoChevronBack, IoChevronForward, IoEllipsisVertical, IoClose, IoGrid, IoChevronDown } from 'react-icons/io5'

const DataTable = ({
  columns,
  data,
  searchPlaceholder = 'Search...',
  onSearch,
  filters,
  filterConfig = [], // Array of filter configs: { key, label, type: 'select'|'date'|'daterange'|'text', options: [] }
  onRowClick,
  actions,
  pagination = false,
  mobileColumns = 2, // Number of columns to show on mobile before "more"
  bulkActions = false,
  selectedRows: externalSelectedRows,
  onSelectAll: externalOnSelectAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [internalSelectedRows, setInternalSelectedRows] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnToggle, setShowColumnToggle] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [visibleColumns, setVisibleColumns] = useState(
    (columns || []).reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  )
  const columnToggleRef = useRef(null)

  const selectedRows = externalSelectedRows !== undefined ? externalSelectedRows : internalSelectedRows
  const setSelectedRows = externalSelectedRows !== undefined ? () => { } : setInternalSelectedRows

  // Close column dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnToggleRef.current && !columnToggleRef.current.contains(event.target)) {
        setShowColumnToggle(false)
      }
    }

    if (showColumnToggle) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColumnToggle])

  const filteredData = (data || []).filter((row) => {
    // Search filter
    if (searchTerm) {
      const matchesSearch = Object.values(row).some((value) =>
        String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (!matchesSearch) return false
    }

    // Advanced filters
    if (filterConfig && Array.isArray(filterConfig)) {
      for (const filter of filterConfig) {
        if (!filter || !filter.key) continue
        const filterValue = activeFilters[filter.key]
        if (filterValue === undefined || filterValue === '' || filterValue === null) continue

        if (filter.type === 'select') {
          if (row[filter.key] !== filterValue) return false
        } else if (filter.type === 'daterange') {
          if (!filterValue || (!filterValue.start && !filterValue.end)) continue
          const rowDateValue = row[filter.key]
          if (!rowDateValue) return false

          // Handle different date formats
          let rowDate
          if (typeof rowDateValue === 'string') {
            // Try to parse date string (could be ISO format or locale format)
            rowDate = new Date(rowDateValue)
          } else if (rowDateValue instanceof Date) {
            rowDate = rowDateValue
          } else {
            return false
          }

          if (isNaN(rowDate.getTime())) return false

          const startDate = filterValue.start ? new Date(filterValue.start) : null
          const endDate = filterValue.end ? new Date(filterValue.end) : null

          // Set time to start/end of day for proper comparison
          if (startDate) {
            startDate.setHours(0, 0, 0, 0)
            if (rowDate < startDate) return false
          }
          if (endDate) {
            endDate.setHours(23, 59, 59, 999)
            if (rowDate > endDate) return false
          }
        } else if (filter.type === 'date') {
          if (!filterValue) continue
          const rowDateValue = row[filter.key]
          if (!rowDateValue) return false

          const rowDate = new Date(rowDateValue)
          const filterDate = new Date(filterValue)

          if (isNaN(rowDate.getTime()) || isNaN(filterDate.getTime())) return false

          // Compare dates (ignore time)
          if (rowDate.toDateString() !== filterDate.toDateString()) return false
        } else if (filter.type === 'text') {
          if (!String(row[filter.key] || '').toLowerCase().includes(String(filterValue).toLowerCase())) return false
        }
      }
    }

    return true
  })

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (onSearch) onSearch(value)
  }

  const handleSelectAll = (e) => {
    if (externalOnSelectAll) {
      externalOnSelectAll()
    } else {
      if (e.target.checked) {
        setInternalSelectedRows(filteredData.map((row) => row.id))
      } else {
        setInternalSelectedRows([])
      }
    }
  }

  const handleSelectRow = (id) => {
    if (externalSelectedRows === undefined) {
      setInternalSelectedRows((prev) =>
        prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
      )
    }
  }

  // Get primary columns for mobile view (first 2-3 columns)
  const primaryColumns = columns.slice(0, mobileColumns)
  const secondaryColumns = columns.slice(mobileColumns)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible relative">
      {/* Search and Filters Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 relative z-[50]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative order-2 sm:order-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white placeholder-gray-400"
            />
          </div>

          {/* Button Group */}
          <div className="flex items-center gap-2 order-1 sm:order-2 flex-shrink-0">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-md transition-all flex-shrink-0 ${showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <IoFilter size={16} />
              <span className="hidden xs:inline">Filters</span>
              <IoChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Column Visibility Dropdown */}
            <div className="relative" ref={columnToggleRef}>
              <button
                onClick={() => setShowColumnToggle(!showColumnToggle)}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-md transition-all flex-shrink-0 ${showColumnToggle
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <IoGrid size={16} />
                <span className="hidden xs:inline">Columns</span>
              </button>

              {/* Column Visibility Dropdown Menu */}
              {showColumnToggle && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden" style={{ position: 'absolute', top: '100%' }}>
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Show Columns
                    </span>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {columns.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.key] !== false}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm text-gray-700">{col.label || col.header}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Rows Indicator */}
        {bulkActions && selectedRows.length > 0 && (
          <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-700">
              {selectedRows.length} row(s) selected
            </p>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 overflow-visible relative z-30">
            {filterConfig.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filterConfig.map((filter) => (
                  <div key={filter.key} className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 truncate">
                      {filter.label}
                    </label>
                    {filter.type === 'select' && (
                      <select
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => setActiveFilters({ ...activeFilters, [filter.key]: e.target.value })}
                        className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="">All</option>
                        {filter.options?.map((opt) => (
                          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                            {typeof opt === 'object' ? opt.label : opt}
                          </option>
                        ))}
                      </select>
                    )}
                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => setActiveFilters({ ...activeFilters, [filter.key]: e.target.value })}
                        className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    )}
                    {filter.type === 'daterange' && (
                      <div className="flex flex-col xs:flex-row gap-2">
                        <div className="flex-1">
                          <input
                            type="date"
                            placeholder="Start"
                            value={activeFilters[filter.key]?.start || ''}
                            onChange={(e) => setActiveFilters({
                              ...activeFilters,
                              [filter.key]: { ...activeFilters[filter.key], start: e.target.value }
                            })}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="date"
                            placeholder="End"
                            value={activeFilters[filter.key]?.end || ''}
                            onChange={(e) => setActiveFilters({
                              ...activeFilters,
                              [filter.key]: { ...activeFilters[filter.key], end: e.target.value }
                            })}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                          />
                        </div>
                      </div>
                    )}
                    {filter.type === 'text' && (
                      <input
                        type="text"
                        placeholder={filter.placeholder || `Filter by ${filter.label}`}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => setActiveFilters({ ...activeFilters, [filter.key]: e.target.value })}
                        className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No filters configured for this table.</p>
              </div>
            )}
            {filterConfig.length > 0 && Object.values(activeFilters).some(v => v !== '' && v !== null && v !== undefined && (typeof v === 'object' ? (v.start || v.end) : true)) && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full overflow-x-auto">
                  {Object.entries(activeFilters).map(([key, value]) => {
                    if (!value || value === '' || (typeof value === 'object' && !value.start && !value.end)) return null
                    const filter = filterConfig.find(f => f.key === key)
                    if (!filter) return null
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0"
                      >
                        <span className="truncate max-w-[80px] sm:max-w-[120px]">{filter.label}:</span>
                        <span className="truncate max-w-[60px] sm:max-w-[100px]">{typeof value === 'object' ? `${value.start || ''} - ${value.end || ''}` : value}</span>
                        <button
                          onClick={() => {
                            const newFilters = { ...activeFilters }
                            delete newFilters[key]
                            setActiveFilters(newFilters)
                          }}
                          className="hover:text-blue-900 transition-colors flex-shrink-0"
                        >
                          <IoClose size={12} />
                        </button>
                      </span>
                    )
                  })}
                </div>
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible">
        <table className="w-full" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {(actions || bulkActions) && (
                <th key="bulk-actions" className="w-10 px-2 py-2 text-left sticky left-0 bg-gray-50 z-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.filter(col => visibleColumns[col.key] !== false).map((col, index) => (
                <th
                  key={col.key || `col-${index}`}
                  className={`px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${col.className || 'text-left'}`}
                  style={col.width ? { width: col.width, minWidth: col.width } : {}}
                >
                  {col.label || col.header}
                </th>
              ))}
              {actions && (
                <th key="actions-header" className="px-2 sm:px-3 py-2 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + ((actions || bulkActions) ? 2 : 0)}
                  className="px-4 py-8 sm:py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">No data found</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={row.id || row.company_id || `row-${index}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`bg-white hover:bg-blue-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {(actions || bulkActions) && (
                    <td className="px-2 py-2 sticky left-0 bg-white z-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.filter(col => visibleColumns[col.key] !== false).map((col, colIndex) => (
                    <td
                      key={`${row.id || index}-${col.key || colIndex}`}
                      className={`px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 ${col.className || ''}`}
                      style={col.width ? { width: col.width, minWidth: col.width } : {}}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-2 sm:px-3 py-2 text-right sticky right-0 bg-white z-10" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100">
        {filteredData.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 font-medium text-sm">No data found</p>
            </div>
          </div>
        ) : (
          filteredData.map((row, index) => (
            <div
              key={row.id || row.company_id || `row-${index}`}
              className={`p-3 sm:p-4 bg-white hover:bg-blue-50/50 transition-colors active:bg-blue-100/50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {/* Primary Info */}
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0 overflow-hidden">
                  {primaryColumns.map((col, idx) => (
                    <div key={col.key || idx} className={idx === 0 ? 'mb-0.5 sm:mb-1' : ''}>
                      {idx === 0 ? (
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 truncate">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {actions && (
                  <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 -mr-1">
                    {actions(row)}
                  </div>
                )}
              </div>

              {/* Secondary Info */}
              {secondaryColumns.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {secondaryColumns.slice(0, 4).map((col, idx) => (
                      <div key={col.key || idx} className="min-w-0 overflow-hidden">
                        <div className="text-[9px] sm:text-[10px] uppercase text-gray-400 tracking-wide font-medium truncate">{col.label || col.header}</div>
                        <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5 truncate">
                          {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                  {secondaryColumns.length > 4 && (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
                      {secondaryColumns.slice(4).map((col, idx) => (
                        <div key={col.key || idx} className="min-w-0 overflow-hidden">
                          <div className="text-[9px] sm:text-[10px] uppercase text-gray-400 tracking-wide font-medium truncate">{col.label || col.header}</div>
                          <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5 truncate">
                            {col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer with count */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span>
            <span className="hidden xs:inline">Showing </span>
            <span className="font-medium text-gray-900">{filteredData.length}</span>
            <span className="hidden xs:inline"> of </span>
            <span className="xs:hidden">/</span>
            <span className="font-medium text-gray-900">{data?.length || 0}</span>
            <span className="hidden xs:inline"> entries</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default DataTable
