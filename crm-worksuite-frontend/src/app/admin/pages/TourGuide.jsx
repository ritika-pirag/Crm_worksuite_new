import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { IoHelpCircle, IoCheckmarkCircle, IoArrowForward, IoHome, IoBusiness, IoPeople, IoKey } from 'react-icons/io5'

const TourGuide = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])

  const tourSteps = [
    {
      id: 1,
      title: 'Welcome to Super Admin Dashboard',
      description: 'This is your central command center for managing all companies, users, and system settings.',
      icon: IoHome,
      path: '/app/admin/dashboard',
    },
    {
      id: 2,
      title: 'Manage Companies',
      description: 'Add new companies, view company details, assign packages, and impersonate company accounts.',
      icon: IoBusiness,
      path: '/app/admin/companies',
    },
    {
      id: 3,
      title: 'Company Packages',
      description: 'Define subscription plans (Free, Basic, Pro) with features and pricing. Assign packages to companies.',
      icon: IoBusiness,
      path: '/app/admin/company-packages',
    },
    {
      id: 4,
      title: 'Staff Management',
      description: 'Manage all staff accounts across all companies. Add, edit, assign roles, and set permissions.',
      icon: IoPeople,
      path: '/app/admin/users',
    },
    {
      id: 5,
      title: 'License Management',
      description: 'View active licenses, domain/IP bindings, check status, and force re-validation.',
      icon: IoKey,
      path: '/app/admin/license-management',
    },
  ]

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      if (!completedSteps.includes(tourSteps[currentStep].id)) {
        setCompletedSteps([...completedSteps, tourSteps[currentStep].id])
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setCurrentStep(tourSteps.length)
  }

  const handleStartTour = () => {
    setCurrentStep(0)
    setCompletedSteps([])
  }

  const currentTourStep = tourSteps[currentStep]

  if (currentStep >= tourSteps.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Tour Guide</h1>
          <p className="text-secondary-text mt-1">Interactive walkthrough for new admins</p>
        </div>

        <Card className="p-12 bg-white rounded-lg shadow-sm text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoCheckmarkCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-primary-text mb-2">Tour Completed!</h2>
            <p className="text-secondary-text mb-6">
              You've completed the tour. You can restart it anytime or explore the system on your own.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={handleStartTour}>
                Restart Tour
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/app/admin/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-text">Tour Guide</h1>
        <p className="text-secondary-text mt-1">Interactive walkthrough for new admins</p>
      </div>

      {/* Tour Progress */}
      <Card className="p-6 bg-white rounded-lg shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-text">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <span className="text-sm text-secondary-text">
              {Math.round(((currentStep + 1) / tourSteps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        {currentTourStep && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <currentTourStep.icon className="text-primary-accent" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-primary-text mb-3">{currentTourStep.title}</h2>
            <p className="text-lg text-secondary-text mb-6 max-w-2xl mx-auto">
              {currentTourStep.description}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                Previous
              </Button>
              {currentStep < tourSteps.length - 1 ? (
                <>
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                  <Button variant="primary" onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <IoArrowForward size={18} />
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={handleNext} className="flex items-center gap-2">
                  Complete Tour
                  <IoCheckmarkCircle size={18} />
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* All Steps Overview */}
      <Card className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-primary-text mb-4">Tour Steps</h2>
        <div className="space-y-3">
          {tourSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = index === currentStep

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'border-primary-accent bg-primary-accent/5'
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isCurrent
                      ? 'bg-primary-accent/10'
                      : isCompleted
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={isCurrent ? 'text-primary-accent' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                    size={20}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-primary-text">{step.title}</h3>
                    {isCompleted && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <IoCheckmarkCircle size={12} />
                        Completed
                      </Badge>
                    )}
                    {isCurrent && <Badge variant="info">Current</Badge>}
                  </div>
                  <p className="text-sm text-secondary-text mt-1">{step.description}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(index)}
                  className="flex-shrink-0"
                >
                  Go to Step
                </Button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default TourGuide

