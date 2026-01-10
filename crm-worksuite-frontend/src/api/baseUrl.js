/**
 * Base URL Configuration
 * API base URL for all backend requests
 */

// Use environment variable if available, otherwise use localhost:5000
const BaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

// Production URLs (uncomment when deploying):
// const BaseUrl = 'https://crm-worksuite-production.up.railway.app'
// const BaseUrl = 'https://ws.kiaantechnology.com'

export default BaseUrl
