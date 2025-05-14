
import React from 'react';

type WordHintProps = {
  word: string;
  type?: string;
  pronunciation?: string;
  show: boolean;
};

const WordHint: React.FC<WordHintProps> = ({ word, type, pronunciation, show }) => {
  if (!show) return null;
  
  return (
    <div className="p-4 bg-yellow-50 rounded-md">
      <h3 className="font-medium text-gray-500 mb-2">Key Word:</h3>
      <div className="flex flex-col gap-1">
        <p className="text-xl font-semibold">{word}</p>
        {type && (
          <p className="text-sm text-gray-500">Type: {type}</p>
        )}
        {pronunciation && (
          <p className="text-sm text-gray-500">Pronunciation: {pronunciation}</p>
        )}
      </div>
    </div>
  );
};

export default WordHint;
