import { motion } from 'framer-motion';

export function AppDialog({ children, align = 'bottom', onClose }) {
  const isTop = align === 'top';

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center overflow-hidden bg-black/60 px-4 ${
        isTop ? 'items-start pt-[10dvh]' : 'items-end pb-4'
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ y: isTop ? 16 : 40, opacity: 0, scale: isTop ? 0.98 : 1 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: isTop ? 16 : 40, opacity: 0, scale: isTop ? 0.98 : 1 }}
        className="w-full max-w-[430px] rounded-3xl bg-zinc-950 p-5 text-white shadow-2xl ring-1 ring-white/10"
      >
        {children}
      </motion.div>
    </div>
  );
}
