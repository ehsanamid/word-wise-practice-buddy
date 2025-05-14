
import React from 'react';

type TranslationPromptProps = {
  persian: string;
};

const TranslationPrompt: React.FC<TranslationPromptProps> = ({ persian }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-500">Translate this phrase:</h3>
      <div className="p-4 bg-blue-50 rounded-md text-xl rtl" dir="rtl">
        {persian}
      </div>
    </div>
  );
};

export default TranslationPrompt;
