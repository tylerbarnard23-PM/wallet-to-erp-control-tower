import { Info } from 'lucide-react';

export default function InfoTooltip({ what, drivers = [], note }) {
  return (
    <div className="relative group inline-flex">
      <Info
        size={13}
        className="text-slate-600 hover:text-slate-400 cursor-default transition-colors flex-shrink-0"
      />
      {/* Opens downward, left-aligned to the icon so it never clips right edge */}
      <div className="absolute top-5 left-0 z-50 w-64 pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl">
          {what && (
            <p className="text-xs text-slate-300 leading-relaxed mb-2">{what}</p>
          )}
          {drivers.length > 0 && (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Driven by
              </div>
              <ul className="space-y-1">
                {drivers.map((d) => (
                  <li key={d} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="mt-1 w-1 h-1 rounded-full bg-slate-500 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </>
          )}
          {note && (
            <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-500 italic">
              {note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
