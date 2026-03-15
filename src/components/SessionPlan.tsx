'use client';

interface SessionPlanProps {
  plan: string[];
  onChange: (plan: string[]) => void;
}

export default function SessionPlan({ plan, onChange }: SessionPlanProps) {
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

  return (
    <div className="w-full max-w-lg mt-10 animate-fade-in">
      <h3 className="text-foreground/40 text-sm uppercase tracking-widest mb-4 text-center">
        Session Plan
      </h3>
      <div className="bg-card-bg border border-card-border rounded-2xl p-5">
        <div className="space-y-3">
          {plan.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-foreground/30 text-sm font-mono w-5 text-right shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={`Pom ${index + 1} target...`}
                autoFocus={index === plan.length - 1}
                className="flex-1 bg-background border border-card-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-colors"
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
            </div>
          ))}
        </div>
        <button
          onClick={handleAdd}
          className="mt-3 w-full py-2 text-sm text-foreground/30 hover:text-foreground/50 border border-dashed border-card-border hover:border-foreground/20 rounded-lg transition-colors"
        >
          + Add another
        </button>
      </div>
    </div>
  );
}
