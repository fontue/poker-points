import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { MarkdownContent } from '@/components/common/MarkdownContent';
import { referenceSections } from '@/content/referenceSections';

type ReferenceDialogProps = {
  onClose: () => void;
};

export function ReferenceDialog({ onClose }: ReferenceDialogProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const currentSection = referenceSections.find((section) => section.id === activeSection);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col bg-gradient-to-b from-zinc-950 via-black to-black"
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <button
            onClick={currentSection ? () => setActiveSection(null) : onClose}
            className="rounded-2xl bg-zinc-900 p-2 text-zinc-200 active:scale-95"
          >
            {currentSection ? <ChevronLeft size={20} /> : <X size={20} />}
          </button>

          <h2 className="min-w-0 flex-1 truncate text-center text-base font-black">
            {currentSection ? currentSection.title : 'Справочник'}
          </h2>

          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain">
          {!currentSection ? (
            <div className="space-y-3">
              {referenceSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-3xl bg-zinc-900/85 p-4 text-left ring-1 ring-white/10 active:scale-[0.99]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-violet-600/15 text-sm font-black text-violet-200 ring-1 ring-violet-400/15">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-black text-zinc-100">{section.title}</span>
                  </span>
                  <ChevronLeft size={18} className="rotate-180 text-zinc-500" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-900/75 p-3 ring-1 ring-white/10">
              <MarkdownContent content={currentSection.content} />
            </div>
          )}
        </main>
      </motion.div>
    </div>
  );
}
