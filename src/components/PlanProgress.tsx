'use client';

interface PlanProgressProps {
  plan: string[];
  currentIndex: number;
}

export default function PlanProgress({ plan, currentIndex }: PlanProgressProps) {
  if (plan.length === 0) return null;

  return (
    <div className="w-full max-w-sm mb-6 animate-fade-in">
      <div className="text-center mb-3">
        <span className="text-foreground/40 text-sm font-medium">
          Pom {Math.min(currentIndex + 1, plan.length)} of {plan.length}
        </span>
      </div>
      <div className="bg-card-bg border border-card-border rounded-xl p-3">
        <div className="space-y-1.5">
          {plan.map((item, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm px-2 py-1 rounded-lg ${
                  isCurrent ? 'bg-accent/10' : ''
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={`w-4 h-4 rounded-full border shrink-0 ${
                    isCurrent ? 'border-accent' : 'border-foreground/15'
                  }`} />
                )}
                <span className={
                  isCompleted
                    ? 'text-foreground/30 line-through'
                    : isCurrent
                    ? 'text-foreground/80'
                    : 'text-foreground/40'
                }>
                  {item || `Pom ${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
