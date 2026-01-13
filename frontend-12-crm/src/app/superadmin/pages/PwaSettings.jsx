import { useState, useEffect, useRef } from 'react'
import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import axiosInstance from '../../../api/axiosInstance'
import { IoPhonePortrait, IoColorPalette, IoImage, IoCheckmarkCircle, IoCloudUpload, IoRefresh } from 'react-icons/io5'
import BaseUrl from '../../../api/baseUrl'

const PwaSettings = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [iconPreview, setIconPreview] = useState(null)
    const [iconFile, setIconFile] = useState(null)
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        enabled: false,
        app_name: 'Develo CRM',
        short_name: 'CRM',
        description: 'A powerful CRM solution for your business',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        icon_url: null
    })

    useEffect(() => {
        fetchPwaSettings()
    }, [])

    const fetchPwaSettings = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get('/pwa')
            if (response.data.success) {
                setFormData(response.data.data)
                if (response.data.data.icon_url) {
                    // Set icon preview from existing URL
                    const iconUrl = response.data.data.icon_url.startsWith('http')
                        ? response.data.data.icon_url
                        : `${BaseUrl}${response.data.data.icon_url}`
                    setIconPreview(iconUrl)
                }
            }
        } catch (error) {
            console.error('Error fetching PWA settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleIconChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
                alert('Please upload a PNG, JPEG, or WebP image')
                return
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Icon file must be less than 2MB')
                return
            }

            setIconFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setIconPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // Validate required fields
            if (!formData.app_name || formData.app_name.trim() === '') {
                alert('App Name is required')
                return
            }
            if (!formData.short_name || formData.short_name.trim() === '') {
                alert('Short Name is required')
                return
            }

            // Validate HEX colors
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
            if (!hexRegex.test(formData.theme_color)) {
                alert('Theme Color must be a valid HEX color (e.g., #6366f1)')
                return
            }
            if (!hexRegex.test(formData.background_color)) {
                alert('Background Color must be a valid HEX color (e.g., #ffffff)')
                return
            }

            let response

            if (iconFile) {
                // Use FormData for file upload
                const formDataToSend = new FormData()
                formDataToSend.append('enabled', formData.enabled ? '1' : '0')
                formDataToSend.append('app_name', formData.app_name)
                formDataToSend.append('short_name', formData.short_name)
                formDataToSend.append('description', formData.description || '')
                formDataToSend.append('theme_color', formData.theme_color)
                formDataToSend.append('background_color', formData.background_color)
                formDataToSend.append('icon', iconFile)

                response = await axiosInstance.put('/pwa', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
            } else {
                // Send JSON data without file
                response = await axiosInstance.put('/pwa', formData)
            }

            if (response.data.success) {
                alert('PWA settings saved successfully!')
                setIconFile(null) // Clear selected file after save
                fetchPwaSettings() // Refresh data

                // Update theme color meta tag immediately
                updateThemeColor(formData.theme_color)
            }
        } catch (error) {
            console.error('Error saving PWA settings:', error)
            alert(error.response?.data?.error || 'Failed to save PWA settings')
        } finally {
            setSaving(false)
        }
    }

    const updateThemeColor = (color) => {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-accent mx-auto"></div>
                    <p className="mt-4 text-secondary-text">Loading PWA settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-text">PWA Settings</h1>
                    <p className="text-secondary-text mt-1">Configure Progressive Web App settings for mobile installation</p>
                </div>
            </div>

            {/* PWA Status Card */}
            <Card className="p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formData.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <IoPhonePortrait size={24} className={formData.enabled ? 'text-green-600' : 'text-gray-400'} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-primary-text">PWA Status</h2>
                            <p className="text-sm text-secondary-text">
                                {formData.enabled
                                    ? 'PWA is enabled - Users can install the app on their devices'
                                    : 'PWA is disabled - Install option will not appear'}
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.enabled}
                            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </Card>

            {/* App Identity */}
            <Card className="p-5">
                <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
                    <IoPhonePortrait size={20} />
                    App Identity
                </h2>
                <div className="space-y-4">
                    <Input
                        label="App Name *"
                        value={formData.app_name}
                        onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                        placeholder="Develo CRM"
                        helperText="Full name of your app (shown in app store and install dialogs)"
                    />

                    <Input
                        label="Short Name *"
                        value={formData.short_name}
                        onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                        placeholder="CRM"
                        helperText="Short name for home screen (max 12 characters recommended)"
                    />

                    <div>
                        <label className="block text-sm font-medium text-primary-text mb-2">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                            placeholder="Describe your app..."
                        />
                        <p className="text-xs text-secondary-text mt-1">Brief description of your app</p>
                    </div>
                </div>
            </Card>

            {/* App Appearance */}
            <Card className="p-5">
                <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
                    <IoColorPalette size={20} />
                    App Appearance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-text mb-2">Theme Color *</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.theme_color}
                                onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                                type="text"
                                value={formData.theme_color}
                                onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white uppercase"
                                placeholder="#6366f1"
                                maxLength={7}
                            />
                        </div>
                        <p className="text-xs text-secondary-text mt-1">Status bar color on mobile devices</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-text mb-2">Background Color *</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.background_color}
                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                                type="text"
                                value={formData.background_color}
                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white uppercase"
                                placeholder="#ffffff"
                                maxLength={7}
                            />
                        </div>
                        <p className="text-xs text-secondary-text mt-1">Splash screen background color</p>
                    </div>
                </div>
            </Card>

            {/* App Icon */}
            <Card className="p-5">
                <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
                    <IoImage size={20} />
                    App Icon
                </h2>
                <div className="flex items-start gap-6">
                    {/* Icon Preview */}
                    <div className="flex-shrink-0">
                        <div
                            className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: formData.background_color }}
                        >
                            {iconPreview ? (
                                <img
                                    src={iconPreview}
                                    alt="PWA Icon Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <IoImage size={32} className="text-gray-400" />
                            )}
                        </div>
                        <p className="text-xs text-center text-secondary-text mt-2">192×192 px</p>
                    </div>

                    {/* Upload Section */}
                    <div className="flex-1">
                        <p className="text-sm text-secondary-text mb-3">
                            Upload a square icon (192×192 pixels recommended). This icon will appear on the home screen when users install your app.
                        </p>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleIconChange}
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <IoCloudUpload size={18} />
                                Upload Icon
                            </Button>
                            {iconPreview && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setIconPreview(null)
                                        setIconFile(null)
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = ''
                                        }
                                    }}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-secondary-text mt-2">Supported formats: PNG, JPEG, WebP (max 2MB)</p>
                    </div>
                </div>
            </Card>

            {/* PWA Preview */}
            <Card className="p-5">
                <h2 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
                    <IoCheckmarkCircle size={20} />
                    Installation Preview
                </h2>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <div className="max-w-sm mx-auto">
                        {/* Mock Phone Screen */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden border-4 border-gray-300 dark:border-gray-600">
                            {/* Status Bar */}
                            <div
                                className="h-8 flex items-center justify-center"
                                style={{ backgroundColor: formData.theme_color }}
                            >
                                <span className="text-white text-xs font-medium">9:41</span>
                            </div>

                            {/* Install Dialog Mock */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                                        style={{ backgroundColor: formData.background_color }}
                                    >
                                        {iconPreview ? (
                                            <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                                                style={{ backgroundColor: formData.theme_color }}
                                            >
                                                {formData.short_name?.charAt(0) || 'C'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{formData.app_name || 'Develo CRM'}</h3>
                                        <p className="text-xs text-gray-500">{formData.short_name || 'CRM'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formData.description || 'A powerful CRM solution for your business'}
                                </p>
                                <button
                                    className="w-full mt-4 py-2 rounded-lg text-white font-medium"
                                    style={{ backgroundColor: formData.theme_color }}
                                >
                                    Install App
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-secondary-text mt-4">
                        This is how your app will appear in the install dialog
                    </p>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={fetchPwaSettings}
                    className="flex items-center gap-2"
                >
                    <IoRefresh size={18} />
                    Reset
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-primary-accent text-white hover:bg-primary-accent/90 flex items-center gap-2"
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <IoCheckmarkCircle size={18} />
                            Save Settings
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default PwaSettings
