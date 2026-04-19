'use client';

interface SessionPlanProps {
  plan: string[];
  onChange: (plan: string[]) => void;
  completed?: boolean[];
  onToggle?: (index: number) => void;
  currentIndex?: number;
  compact?: boolean;
  readOnly?: boolean;
  ownerName?: string;
}

export default function SessionPlan({ plan, onChange, completed = [], onToggle, currentIndex, compact = false, readOnly = false, ownerName }: SessionPlanProps) {
  const hasProgress = onToggle !== undefined || completed.length > 0;

  function handleChange(index: number, value: string) {
    const updated = [...plan];
    updated[index] = value;
    onChange(updated);
  }

  function handleRemove(index: number) {
    onChange(plan.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([...plan, '']);
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Backspace' && plan[index] === '' && plan.length > 1) {
      e.preventDefault();
      handleRemove(index);
    }
  }

  const activePlan = plan.filter(s => s.trim());
  const completedCount = completed.filter(Boolean).length;

  return (
    <div className={`w-full max-w-lg animate-fade-in ${compact ? 'mb-6' : 'mt-10'}`}>
      <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-1 text-center">
        {ownerName ? `${ownerName}'s Plan` : 'My Plan'}
      </h3>
      {hasProgress && activePlan.length > 0 && (
        <p className="text-foreground/25 text-xs text-center mb-3">
          {completedCount} of {activePlan.length} completed
        </p>
      )}
      {!(hasProgress && activePlan.length > 0) && <div className="mb-4" />}
      <div className="bg-card-bg border border-card-border rounded-2xl p-5">
        <div className="space-y-3">
          {plan.map((item, index) => {
            const isCompleted = completed[index] ?? false;
            const isCurrent = currentIndex !== undefined && index === currentIndex;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 ${
                  isCurrent && hasProgress ? 'bg-accent/10 rounded-lg px-2 py-1' : ''
                }`}
              >
                {/* Checkbox / number */}
                {hasProgress ? (
                  <button
                    onClick={() => onToggle?.(index)}
                    className={`shrink-0 focus:outline-none ${readOnly ? 'pointer-events-none' : ''}`}
                    aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    tabIndex={readOnly ? -1 : 0}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`w-4 h-4 rounded-full border transition-colors ${
                        readOnly ? '' : 'hover:border-accent/50'
                      } ${
                        isCurrent ? 'border-accent' : 'border-foreground/20'
                      }`} />
                    )}
                  </button>
                ) : (
                  <span className="text-foreground/30 text-sm font-mono w-5 text-right shrink-0">
                    {index + 1}
                  </span>
                )}

                {readOnly ? (
                  <span className={`flex-1 text-sm ${
                    isCompleted ? 'line-through text-foreground/30' : 'text-foreground/50'
                  }`}>
                    {item || `Pom ${index + 1}`}
                  </span>
                ) : (
                  <>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder={`Pom ${index + 1} target...`}
                      className={`flex-1 bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-colors ${
                        isCompleted ? 'line-through text-foreground/30' : ''
                      }`}
                    />
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-foreground/20 hover:text-foreground/50 transition-colors p-1 shrink-0"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {!readOnly && (
          <button
            onClick={handleAdd}
            className="mt-3 w-full py-2 text-sm text-foreground/30 hover:text-foreground/50 border border-dashed border-card-border hover:border-foreground/20 rounded-lg transition-colors"
          >
            + Add another
          </button>
        )}
      </div>
    </div>
  );
}
