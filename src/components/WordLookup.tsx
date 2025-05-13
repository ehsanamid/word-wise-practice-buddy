
import React, { useState } from 'react';
import { getExamplesByWord, addExamplesToPractice } from '@/lib/database';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

type Example = {
  exampleid: number;
  english: string;
  persian: string;
  definitionid?: number; // Make definitionid optional since it might not be present in all returned examples
};

type WordLookupProps = {
  userId: number;
};

const WordLookup: React.FC<WordLookupProps> = ({ userId }) => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState<Example[]>([]);
  const [selectedExamples, setSelectedExamples] = useState<number[]>([]);
  
  const handleLookup = async () => {
    if (!word.trim()) return;
    
    setLoading(true);
    setExamples([]);
    setSelectedExamples([]);
    
    try {
      const foundExamples = await getExamplesByWord(word.trim());
      // Cast the foundExamples to Example[] to handle missing definitionid
      setExamples(foundExamples as Example[]);
      
      if (foundExamples.length === 0) {
        toast({
          title: "No examples found",
          description: `No examples found for "${word.trim()}"`,
        });
      }
    } catch (error) {
      console.error('Error looking up word:', error);
      toast({
        title: "Error looking up word",
        description: "An error occurred while looking up examples",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleExampleSelection = (exampleId: number) => {
    setSelectedExamples(prev => 
      prev.includes(exampleId)
        ? prev.filter(id => id !== exampleId)
        : [...prev, exampleId]
    );
  };
  
  const handleAddToPractice = async () => {
    if (selectedExamples.length === 0) {
      toast({
        title: "No examples selected",
        description: "Please select at least one example to add to your practice",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await addExamplesToPractice(userId, selectedExamples);
      
      toast({
        title: "Examples added to practice",
        description: `${selectedExamples.length} example(s) added to your practice`,
      });
      
      setSelectedExamples([]);
    } catch (error) {
      console.error('Error adding examples to practice:', error);
      toast({
        title: "Error adding examples",
        description: "An error occurred while adding examples to practice",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedExamples.length === examples.length) {
      // If all are selected, deselect all
      setSelectedExamples([]);
    } else {
      // Otherwise, select all
      setSelectedExamples(examples.map(ex => ex.exampleid));
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Word Lookup</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter a word to look up..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          <Button onClick={handleLookup} disabled={loading || !word.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : examples.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Examples ({examples.length})</h3>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedExamples.length === examples.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <div className="border rounded-md divide-y">
              {examples.map((example) => (
                <div key={example.exampleid} className="p-3 flex items-center space-x-3">
                  <Checkbox
                    id={`example-${example.exampleid}`}
                    checked={selectedExamples.includes(example.exampleid)}
                    onCheckedChange={() => toggleExampleSelection(example.exampleid)}
                  />
                  <div className="flex-1">
                    <div className="mb-1">{example.english}</div>
                    <div className="text-gray-500 rtl" dir="rtl">{example.persian}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">
            {word.trim() ? "No examples found. Try another word." : "Enter a word to search for examples."}
          </p>
        )}
      </CardContent>
      
      {examples.length > 0 && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleAddToPractice}
            disabled={loading || selectedExamples.length === 0}
          >
            Add Selected to Practice ({selectedExamples.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WordLookup;
