/**
 * Base URL Configuration
 * API base URL for all backend requests
 */

// In development with Vite, use empty string to leverage proxy
// In production, use full URL or environment variable
let BaseUrl = ''

if (import.meta.env.VITE_API_BASE_URL) {
  // Use environment variable if set
  BaseUrl = import.meta.env.VITE_API_BASE_URL
} else if (import.meta.env.MODE === 'development' || import.meta.env.DEV) {
  // Development mode - use empty string to leverage Vite proxy
  BaseUrl = ''
} else {
  // Production mode - use default localhost or set production URL
  BaseUrl = 'http://localhost:5000'
}

// Production URLs (uncomment when deploying):
// BaseUrl = 'https://crm-worksuite-production.up.railway.app'
// BaseUrl = 'https://ws.kiaantechnology.com'

export default BaseUrl
