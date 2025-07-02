import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Book, GraduationCap, Settings } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Link to="/api-management">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                onClick={() => setIsExpanded(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                API Setup
              </Button>
            </Link>
            <Link to="/discovery">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg"
                onClick={() => setIsExpanded(false)}
              >
                <Book className="h-4 w-4 mr-2" />
                Discover Words
              </Button>
            </Link>
            <Link to="/quiz">
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white shadow-lg"
                onClick={() => setIsExpanded(false)}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            </Link>
          </motion.div>
        )}

        <Button
          className="rounded-full w-14 h-14 shadow-xl"
          onClick={toggleExpand}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </>
  );
};
