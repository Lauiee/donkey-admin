import type { ProjectItem } from "../api";

interface ProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  projects: ProjectItem[];
  placeholder?: string;
  className?: string;
}

const ProjectIcon = ({ active }: { active?: boolean }) => (
  <svg
    className={`w-4 h-4 shrink-0 ${
      active ? "text-indigo-500" : "text-slate-400"
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

export function ProjectSelect({
  value,
  onChange,
  projects,
  placeholder = "전체 프로젝트",
  className = "",
}: ProjectSelectProps) {
  if (projects.length === 0) return null;

  const hasSelection = Boolean(value);

  return (
    <div
      className={`
        inline-flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-lg
        border transition-all min-w-[160px]
        ${
          hasSelection
            ? "border-indigo-200 bg-indigo-50/50"
            : "border-slate-200 bg-white hover:border-slate-300"
        }
        focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-300
        shadow-sm hover:shadow
        ${className}
      `}
    >
      <ProjectIcon active={hasSelection} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none bg-transparent border-none outline-none
          text-sm font-medium min-w-0 flex-1 cursor-pointer
          focus:ring-0 py-0.5 pr-5
          text-slate-700
        "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
          backgroundSize: "1rem",
        }}
      >
        <option value="">{placeholder}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
