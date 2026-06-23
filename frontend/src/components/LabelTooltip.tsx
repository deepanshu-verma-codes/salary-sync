import { Info } from "lucide-react";

interface LabelTooltipProps {
  label: string;
  tooltip: string;
}

export default function LabelTooltip({ label, tooltip }: LabelTooltipProps) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5 group relative w-fit">
      {label}
      <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs bg-slate-800 text-white text-xs font-normal rounded-lg py-2 px-3 z-50 shadow-xl pointer-events-none">
        {tooltip}
        {/* Triangle arrow pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </label>
  );
}
