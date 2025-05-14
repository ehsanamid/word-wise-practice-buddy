
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

type TranslationInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
};

const TranslationInput: React.FC<TranslationInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-500">Your Translation:</h3>
      <Textarea
        placeholder="Type your English translation here..."
        value={value}
        onChange={onChange}
        rows={3}
        disabled={disabled}
      />
    </div>
  );
};

export default TranslationInput;
