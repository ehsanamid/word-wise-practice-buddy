
import React from 'react';
import { Progress } from "@/components/ui/progress";

type SimilarityScoreProps = {
  score: number | null;
};

const SimilarityScore: React.FC<SimilarityScoreProps> = ({ score }) => {
  if (score === null) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-500">Similarity Score:</h3>
      <Progress value={score} className="h-3" />
      <p className="text-right font-medium">{score}%</p>
    </div>
  );
};

export default SimilarityScore;
