type SegmentedOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "xs";
  /** 모달/카드 내부에서 클릭 전파 차단 */
  stopPropagation?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  stopPropagation = false,
}: SegmentedControlProps<T>) {
  const pad =
    size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <div
      className="inline-flex gap-0.5 rounded-full border border-brand-line/80 bg-gradient-to-b from-white to-brand-surface p-0.5 shadow-[inset_0_1px_2px_rgba(10,36,101,0.05)]"
      role="tablist"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`${pad} rounded-full font-semibold transition-all ${
            value === opt.value
              ? "bg-gradient-to-br from-white to-brand-surface text-brand-navy shadow-[0_2px_10px_rgba(123,97,255,0.18)] ring-1 ring-brand-violet/25"
              : "text-brand-slate hover:text-brand-navy"
          }`}
          onClick={(e) => {
            if (stopPropagation) e.stopPropagation();
            onChange(opt.value);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
