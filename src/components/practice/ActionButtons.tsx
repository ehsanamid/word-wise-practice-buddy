
import React from 'react';
import { Button } from "@/components/ui/button";

type ActionButtonsProps = {
  showWord: boolean;
  showAnswer: boolean;
  onShowWord: () => void;
  onShowAnswer: () => void;
  onSubmit: () => void;
  disableSubmit: boolean;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  showWord,
  showAnswer,
  onShowWord,
  onShowAnswer,
  onSubmit,
  disableSubmit
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-between">
      <div className="space-x-2">
        <Button
          variant="outline"
          onClick={onShowWord}
          disabled={showWord}
        >
          Show Word
        </Button>
        <Button
          variant="outline"
          onClick={onShowAnswer}
          disabled={showAnswer}
        >
          Show Answer
        </Button>
      </div>
      
      <div>
        <Button
          onClick={onSubmit}
          disabled={disableSubmit}
        >
          Check Answer
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
