import { FC } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
}

const dialogVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export const Dialog: FC<Props> = ({ isOpen, onClose, title, onDelete }) => {
  return (
    <motion.div
      variants={dialogVariants}
      initial="initial"
      animate={isOpen ? 'animate' : 'initial'}
      className={`${isOpen ? 'block' : 'hidden'} h-full w-full bg-[#0006] backdrop-blur-sm fixed z-50 inset-0 flex items-center justify-center`}
    >
      <div className="bg-gray-100 text-slate-900 gap-3 p-3 rounded-md flex flex-col items-center text-center select-none">
        <h3 className="text-4xl">🤔</h3>
        <p>{title}</p>

        <div className="flex items-center gap-2 justify-between w-full">
          <button className="flex-1 bg-gray-300 py-1 px-2 rounded-md hover:bg-gray-400 transition-colors duration-100" onClick={onClose}>
            Cancel
          </button>
          <button className="flex-1 bg-red-600 text-white py-1 px-2 rounded-md hover:bg-red-800 transition-colors duration-100" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};
