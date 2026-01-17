import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { ModulesProvider } from './context/ModulesContext.jsx'
import { PermissionsProvider } from './context/PermissionsContext.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import PwaInstallPrompt from './components/ui/PwaInstallPrompt.jsx'

function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <ModulesProvider>
              <PermissionsProvider>
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <AppRoutes />
                  {/* PWA Install Prompt - shows when app can be installed */}
                  <PwaInstallPrompt />
                </BrowserRouter>
              </PermissionsProvider>
            </ModulesProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SettingsProvider>
  )
}

export default App
