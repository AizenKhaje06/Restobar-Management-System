import { Check } from "lucide-react"

interface BookingProgressProps {
  currentStep: number
}

const steps = [
  { number: 1, label: "Event Details" },
  { number: 2, label: "Venue & Package" },
  { number: 3, label: "Add-ons" },
  { number: 4, label: "Customization" },
  { number: 5, label: "Review & Submit" },
]

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-full border-2 transition-all
                    ${
                      currentStep > step.number
                        ? "bg-green-600 border-green-600"
                        : currentStep === step.number
                        ? "bg-amber-600 border-amber-600 ring-4 ring-amber-600/20"
                        : "bg-background border-muted"
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="size-5 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-bold ${
                        currentStep === step.number
                          ? "text-white"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.number}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    currentStep >= step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-6">
                  <div
                    className={`h-full transition-all ${
                      currentStep > step.number
                        ? "bg-green-600"
                        : "bg-muted"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps[currentStep - 1].label}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
