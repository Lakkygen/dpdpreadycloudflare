import { motion } from 'framer-motion';

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`rounded-full border-gray-200 border-t-blue-600 ${sizes[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="mt-4 text-sm text-gray-500">{text}</p>}
    </div>
  );
}
