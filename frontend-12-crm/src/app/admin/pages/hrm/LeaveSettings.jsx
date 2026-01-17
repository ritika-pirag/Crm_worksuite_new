import { useState, useEffect } from 'react'
import { hrAPI } from '../../../../api/hr'
import { toast } from 'react-hot-toast'
import Button from '../../../../components/ui/Button'
import Input from '../../../../components/ui/Input'
import RightSideModal from '../../../../components/ui/RightSideModal'
import DataTable from '../../../../components/ui/DataTable'
import { IoAdd, IoTrash, IoCalendar } from 'react-icons/io5'

const LeaveSettings = () => {
    const [leaveTypes, setLeaveTypes] = useState([])
    const [loading, setLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Form Data
    const [formData, setFormData] = useState({
        type_name: '',
        color: '#217E45',
        no_of_leaves: 12,
        is_paid: true,
        period: 'monthly'
    })

    useEffect(() => {
        fetchLeaveTypes()
    }, [])

    const fetchLeaveTypes = async () => {
        try {
            setLoading(true)
            const response = await hrAPI.getLeaveTypes()
            if (response.data.success) {
                setLeaveTypes(response.data.data)
            }
        } catch (error) {
            toast.error('Failed to load leave types')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        try {
            if (!formData.type_name) return toast.error('Name required')
            await hrAPI.createLeaveType(formData)
            toast.success('Leave type created')
            setIsAddModalOpen(false)
            fetchLeaveTypes()
            setFormData({ type_name: '', color: '#217E45', no_of_leaves: 12, is_paid: true, period: 'monthly' })
        } catch (error) {
            toast.error('Failed to create leave type')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this leave type?')) return
        try {
            await hrAPI.deleteLeaveType(id)
            toast.success('Leave type deleted')
            fetchLeaveTypes()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const columns = [
        {
            key: 'type_name',
            label: 'Leave Type',
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }}></span>
                    <span className="font-medium text-gray-900">{val}</span>
                </div>
            )
        },
        { key: 'no_of_leaves', label: 'Days Allowed', render: (val) => <span className="font-semibold text-gray-700">{val}</span> },
        {
            key: 'is_paid',
            label: 'Type',
            render: (val) => val ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Paid</span> : <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Unpaid</span>
        },
        { key: 'period', label: 'Frequency', render: (val) => <span className="capitalize text-gray-600">{val}</span> },
    ]

    const actions = (row) => (
        <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
            <IoTrash size={18} />
        </button>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Leave Settings</h2>
                <p className="text-gray-500 text-sm">Configure leave types and policies</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <IoCalendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Leave Types</h3>
                            <p className="text-xs text-gray-500">Define leaves available to employees</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border-b-4 border-gray-100 active:shadow-none active:border-0 active:translate-y-1 transition-all"
                    >
                        <IoAdd className="mr-1" /> Add New Type
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={leaveTypes}
                    loading={loading}
                    actions={actions}
                    emptyMessage="No leave types configured."
                />
            </div>

            <RightSideModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Leave Type"
                width="w-[400px]"
            >
                <div className="space-y-5">
                    <Input label="Name" placeholder="e.g. Privilege Leave" value={formData.type_name} onChange={(e) => setFormData({ ...formData, type_name: e.target.value })} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input type="number" label="No. of Leaves" value={formData.no_of_leaves} onChange={(e) => setFormData({ ...formData, no_of_leaves: e.target.value })} />
                        <Input type="color" label="Color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="h-[42px] p-1" />
                    </div>

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.is_paid} onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })} className="rounded text-green-600 focus:ring-green-500" />
                            <span className="text-sm text-gray-700">Is Paid Leave?</span>
                        </label>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                            <select
                                className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500 text-sm p-2.5"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleAdd}>Create Leave Type</Button>
                    </div>
                </div>
            </RightSideModal>
        </div>
    )
}

export default LeaveSettings
