import { motion } from "framer-motion";

interface SelectIssueHintProps {
  scrollProgress: number;
}

export function SelectIssueHint({ scrollProgress }: SelectIssueHintProps) {
  return (
    <motion.div 
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: scrollProgress > 0.1 ? 1 : 0
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <span className="text-sm text-gray-600">Select the issue number</span>
    </motion.div>
  );
} 