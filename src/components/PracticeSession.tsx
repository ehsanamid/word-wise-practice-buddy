
import React, { useState, useEffect } from 'react';
import { getExamplesByDifficulty, getPracticeByUser, savePracticeResult } from '@/lib/database';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import stringSimilarity from 'string-similarity';
import { Difficulty } from './Dashboard';
import { Example } from './practice/types';

// Import all the components we created
import TranslationPrompt from './practice/TranslationPrompt';
import WordHint from './practice/WordHint';
import CorrectAnswer from './practice/CorrectAnswer';
import TranslationInput from './practice/TranslationInput';
import SimilarityScore from './practice/SimilarityScore';
import ActionButtons from './practice/ActionButtons';
import LoadingSpinner from './practice/LoadingSpinner';
import EmptyState from './practice/EmptyState';

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
      console.log("Loading examples for difficulty:", difficulty);
      
      // Check if the user has practice items with scores less than 1000
      const practiceItems = await getPracticeByUser(userId, difficulty, 10);
      console.log("Practice items:", practiceItems);
      
      if (practiceItems && practiceItems.length > 0) {
        // Randomly select one of the practice items
        const randomIndex = Math.floor(Math.random() * practiceItems.length);
        const selectedPractice = practiceItems[randomIndex] as any;
        
        console.log("Selected practice:", selectedPractice);
        setCurrentExample(selectedPractice.tblexample);
        setPracticeId(selectedPractice.id);
      } else {
        // Randomly select an example based on difficulty
        const examples = await getExamplesByDifficulty(difficulty);
        console.log("Examples by difficulty:", examples);
        
        if (examples && examples.length > 0) {
          const randomIndex = Math.floor(Math.random() * examples.length);
          const selectedExample = examples[randomIndex] as any;
          
          console.log("Selected example:", selectedExample);
          setCurrentExample(selectedExample);
          setPracticeId(null);
        } else {
          console.log("No examples found for difficulty:", difficulty);
          toast({
            title: "No examples found",
            description: `No examples found for difficulty level: ${difficulty}`,
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
        console.log(`Saving score ${score} for example ${currentExample.exampleid}`);
        const result = await savePracticeResult(userId, currentExample.exampleid, score);
        
        if (result) {
          console.log("Practice result saved successfully:", result);
          toast({
            title: "Progress saved",
            description: `Your score (${score}%) has been added to your total progress`,
          });
        } else {
          console.error("Failed to save practice result");
          toast({
            title: "Error saving progress",
            description: "Your score could not be saved",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error saving practice result:', error);
        toast({
          title: "Error saving progress",
          description: "An error occurred while saving your score",
          variant: "destructive"
        });
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
  
  const handleUserAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserAnswer(e.target.value);
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
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      ) : currentExample ? (
        <>
          <CardContent className="space-y-6">
            <TranslationPrompt persian={currentExample.persian} />
            
            {currentExample.tbldefinition?.tblword && (
              <WordHint 
                word={currentExample.tbldefinition.tblword.word}
                type={currentExample.tbldefinition.tblword.type}
                pronunciation={currentExample.tbldefinition.tblword.pronunciation}
                show={showWord}
              />
            )}
            
            <CorrectAnswer 
              english={currentExample.english} 
              show={showAnswer} 
            />
            
            <TranslationInput 
              value={userAnswer}
              onChange={handleUserAnswerChange}
              disabled={similarityScore !== null}
            />
            
            <SimilarityScore score={similarityScore} />
          </CardContent>
          
          <CardFooter>
            <ActionButtons 
              showWord={showWord}
              showAnswer={showAnswer}
              onShowWord={() => setShowWord(true)}
              onShowAnswer={() => setShowAnswer(true)}
              onSubmit={handleSubmit}
              disableSubmit={!userAnswer.trim() || similarityScore !== null}
            />
          </CardFooter>
        </>
      ) : (
        <CardContent>
          <EmptyState />
        </CardContent>
      )}
    </Card>
  );
};

export default PracticeSession;
