import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-sage/15 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-sage" />
        </div>
      )}
      <h3 className="text-xl font-serif font-bold text-forest mb-2">{title}</h3>
      {description && (
        <p className="text-charcoal/60 font-sans max-w-sm mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
