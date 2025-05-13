
import React, { useState, useEffect } from 'react';
import { getExamplesByDifficulty, getPracticeByUser, savePracticeResult } from '@/lib/database';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import stringSimilarity from 'string-similarity';
import { Difficulty } from './Dashboard';

type ExampleWord = {
  word: string;
  type: string;
  pronunciation: string;
};

type ExampleDefinition = {
  definition: string;
  tblword?: ExampleWord;
};

type Example = {
  exampleid: number;
  english: string;
  persian: string;
  definitionid: number;
  tbldefinition?: ExampleDefinition;
};

type PracticeItem = {
  id: number;
  exampleid: number;
  score: number;
  tblexample: Example;
};

type PracticeSessionProps = {
  userId: number;
  difficulty: Difficulty;
};

const PracticeSession: React.FC<PracticeSessionProps> = ({ userId, difficulty }) => {
  const [loading, setLoading] = useState(true);
  const [currentExample, setCurrentExample] = useState<Example | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showWord, setShowWord] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [practiceId, setPracticeId] = useState<number | null>(null);
  
  const loadExample = async () => {
    setLoading(true);
    try {
      // Check if the user has practice items with scores less than 1000
      const practiceItems = await getPracticeByUser(userId, difficulty, 10);
      
      if (practiceItems && practiceItems.length >= 10) {
        // Randomly select one of the practice items
        const randomIndex = Math.floor(Math.random() * practiceItems.length);
        const selectedPractice = practiceItems[randomIndex] as unknown as PracticeItem;
        
        setCurrentExample(selectedPractice.tblexample);
        setPracticeId(selectedPractice.id);
      } else {
        // Randomly select an example based on difficulty
        const examples = await getExamplesByDifficulty(difficulty);
        
        if (examples && examples.length > 0) {
          const randomIndex = Math.floor(Math.random() * examples.length);
          const selectedExample = examples[randomIndex] as unknown as Example;
          
          setCurrentExample(selectedExample);
          setPracticeId(null);
        } else {
          toast({
            title: "No examples found",
            description: "No examples found for the selected difficulty level",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error loading example:', error);
      toast({
        title: "Error loading examples",
        description: "An error occurred while loading examples",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadExample();
    // Reset states when difficulty changes
    setUserAnswer('');
    setShowWord(false);
    setShowAnswer(false);
    setSimilarityScore(null);
  }, [userId, difficulty]);
  
  const handleSubmit = () => {
    if (!currentExample || !userAnswer.trim()) return;
    
    // Calculate similarity between user answer and correct answer
    const similarity = stringSimilarity.compareTwoStrings(
      userAnswer.toLowerCase().trim(),
      currentExample.english.toLowerCase().trim()
    );
    
    // Convert to a score out of 100
    const score = Math.round(similarity * 100);
    setSimilarityScore(score);
    
    // Save the practice result
    const saveScore = async () => {
      try {
        await savePracticeResult(userId, currentExample.exampleid, score);
      } catch (error) {
        console.error('Error saving practice result:', error);
      }
    };
    
    saveScore();
  };
  
  const handleNextExample = () => {
    setUserAnswer('');
    setShowWord(false);
    setShowAnswer(false);
    setSimilarityScore(null);
    loadExample();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Translation Practice (Top {difficulty} Words)</span>
          <Button variant="outline" size="sm" onClick={handleNextExample}>
            Next Example
          </Button>
        </CardTitle>
      </CardHeader>
      
      {loading ? (
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </CardContent>
      ) : currentExample ? (
        <>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500">Translate this phrase:</h3>
              <div className="p-4 bg-blue-50 rounded-md text-xl rtl" dir="rtl">
                {currentExample.persian}
              </div>
            </div>
            
            {showWord && currentExample.tbldefinition?.tblword && (
              <div className="p-4 bg-yellow-50 rounded-md">
                <h3 className="font-medium text-gray-500 mb-2">Key Word:</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-xl font-semibold">{currentExample.tbldefinition.tblword.word}</p>
                  {currentExample.tbldefinition.tblword.type && (
                    <p className="text-sm text-gray-500">Type: {currentExample.tbldefinition.tblword.type}</p>
                  )}
                  {currentExample.tbldefinition.tblword.pronunciation && (
                    <p className="text-sm text-gray-500">Pronunciation: {currentExample.tbldefinition.tblword.pronunciation}</p>
                  )}
                </div>
              </div>
            )}
            
            {showAnswer && (
              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="font-medium text-gray-500 mb-1">Correct Translation:</h3>
                <p className="text-xl">{currentExample.english}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-500">Your Translation:</h3>
              <Textarea
                placeholder="Type your English translation here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={3}
                disabled={similarityScore !== null}
              />
            </div>
            
            {similarityScore !== null && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-500">Similarity Score:</h3>
                <Progress value={similarityScore} className="h-3" />
                <p className="text-right font-medium">{similarityScore}%</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2 justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowWord(true)}
                disabled={showWord}
              >
                Show Word
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAnswer(true)}
                disabled={showAnswer}
              >
                Show Answer
              </Button>
            </div>
            
            <div>
              <Button
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || similarityScore !== null}
              >
                Check Answer
              </Button>
            </div>
          </CardFooter>
        </>
      ) : (
        <CardContent>
          <p className="text-center py-8 text-gray-500">No examples available. Try another difficulty level.</p>
        </CardContent>
      )}
    </Card>
  );
};

export default PracticeSession;
