import { Outlet } from 'react-router-dom'
import { FaChartLine, FaUsers, FaCog } from 'react-icons/fa'
import premiumBg from '../assets/premium_bg.png'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-main-bg flex">
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-center items-center relative bg-cover bg-center"
        style={{ backgroundImage: `url(${premiumBg})` }}
      >
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Develo CRM</h1>
          <p className="text-secondary-accent text-lg mb-8">
            Manage your business, teams, and clients all in one place.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary-accent p-3 rounded-lg">
                <FaChartLine size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Analytics Dashboard</h3>
                <p className="text-gray-300 text-sm">Track your business metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary-accent p-3 rounded-lg">
                <FaUsers size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Team Collaboration</h3>
                <p className="text-gray-300 text-sm">Work together seamlessly</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary-accent p-3 rounded-lg">
                <FaCog size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Customizable Workflows</h3>
                <p className="text-gray-300 text-sm">Adapt to your needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

