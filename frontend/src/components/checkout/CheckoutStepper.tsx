'use client'

/**
 * T2-03: Visual checkout progress stepper.
 * Shows 3 steps: Παραγγελία → Στοιχεία → Πληρωμή
 * Reduces cart abandonment by showing progress, especially on mobile.
 *
 * T4: Added ARIA semantics (role="list", aria-current="step", aria-label)
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
    <nav aria-label="Βήματα ολοκλήρωσης παραγγελίας" data-testid="checkout-stepper">
      <ol className="flex items-center justify-between mb-6" role="list">
        {steps.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <li
              key={step.label}
              className="flex items-center flex-1 last:flex-initial"
              aria-current={isCurrent ? 'step' : undefined}
            >
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
                  aria-hidden="true"
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span
                  className={`text-xs mt-1.5 whitespace-nowrap ${
                    isCurrent ? 'font-semibold text-primary' : 'text-neutral-500'
                  }`}
                >
                  {isCompleted ? `${step.label} ✓` : step.label}
                </span>
              </div>

              {/* Connecting line */}
              {stepNum < steps.length && (
                <div className="flex-1 mx-2 mb-5" aria-hidden="true">
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
