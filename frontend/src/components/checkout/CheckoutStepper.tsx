'use client'

/**
 * T2-03: Visual checkout progress stepper.
 * Shows 3 steps: Παραγγελία → Στοιχεία → Πληρωμή
 * Reduces cart abandonment by showing progress, especially on mobile.
 */

interface Step {
  label: string
  icon: string
}

const steps: Step[] = [
  { label: 'Παραγγελία', icon: '🛒' },
  { label: 'Στοιχεία', icon: '📋' },
  { label: 'Πληρωμή', icon: '💳' },
]

interface CheckoutStepperProps {
  /** 1-indexed current step (1 = order, 2 = details, 3 = payment) */
  currentStep: number
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-between mb-6" data-testid="checkout-stepper">
      {steps.map((step, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isCurrent = stepNum === currentStep

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-initial">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isCurrent
                      ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-2'
                      : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs mt-1.5 whitespace-nowrap ${
                  isCurrent ? 'font-semibold text-primary' : 'text-neutral-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {stepNum < steps.length && (
              <div className="flex-1 mx-2 mb-5">
                <div
                  className={`h-0.5 w-full transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-neutral-200'
                  }`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
