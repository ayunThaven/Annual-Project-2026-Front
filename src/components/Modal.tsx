'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}