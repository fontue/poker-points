import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';

const referenceSections = [
  {
    id: 'general-rules',
    title: 'Общие правила',
    content: 'Тестовый контент раздела «Общие правила».'
  },
  {
    id: 'table-actions',
    title: 'Правила действий за столом',
    content: 'Тестовый контент раздела «Правила действий за столом».'
  },
  {
    id: 'card-opening',
    title: 'Правила открытия карт',
    content: 'Тестовый контент раздела «Правила открытия карт».'
  },
  {
    id: 'dealing-errors',
    title: 'Решение ошибок при раздаче',
    content: 'Тестовый контент раздела «Решение ошибок при раздаче».'
  },
  {
    id: 'tournament-settings',
    title: 'Параметры турнира',
    content: 'Тестовый контент раздела «Параметры турнира».'
  }
];

export function ReferenceDialog({ onClose }) {
  const [activeSection, setActiveSection] = useState(null);
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
              {referenceSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex w-full items-center justify-between rounded-3xl bg-zinc-900 p-4 text-left ring-1 ring-white/10 active:scale-[0.99]"
                >
                  <span className="text-base font-bold">{section.title}</span>
                  <ChevronLeft size={18} className="rotate-180 text-zinc-500" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-900 p-4 ring-1 ring-white/10">
              <p className="text-sm leading-6 text-zinc-300">{currentSection.content}</p>
            </div>
          )}
        </main>
      </motion.div>
    </div>
  );
}
