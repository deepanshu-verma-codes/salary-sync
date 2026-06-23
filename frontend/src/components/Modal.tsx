import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, maxWidth?: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="min-h-screen px-4 text-center flex items-center justify-center py-10">
        <div className={`w-full ${maxWidth} bg-white rounded-2xl text-left shadow-2xl flex flex-col relative`} onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
