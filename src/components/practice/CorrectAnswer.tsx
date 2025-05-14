
import React from 'react';

type CorrectAnswerProps = {
  english: string;
  show: boolean;
};

const CorrectAnswer: React.FC<CorrectAnswerProps> = ({ english, show }) => {
  if (!show) return null;
  
  return (
    <div className="p-4 bg-green-50 rounded-md">
      <h3 className="font-medium text-gray-500 mb-1">Correct Translation:</h3>
      <p className="text-xl">{english}</p>
    </div>
  );
};

export default CorrectAnswer;
