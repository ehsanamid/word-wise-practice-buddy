import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PracticeSession from './PracticeSession';
import WordLookup from './WordLookup';
import { toast } from '@/components/ui/use-toast';

export type Difficulty = "100" | "1000" | "3000" | "5000" | "10000";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("100");
  const [activeTab, setActiveTab] = useState("practice");
  
  useEffect(() => {
    if (user) {
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.username}`
      });
    }
  }, [user]);

  const handleDifficultyChange = (difficulty: Difficulty) => {
    console.log("Difficulty changed to:", difficulty);
    setSelectedDifficulty(difficulty);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">WordWise Practice Buddy</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Logged in as <span className="font-semibold">{user?.username}</span>
            </span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Difficulty Level</CardTitle>
              <CardDescription>Select the word difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(['100', '1000', '3000', '5000', '10000'] as const).map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleDifficultyChange(difficulty)}
                    disabled={activeTab !== "practice"}
                  >
                    Top {difficulty} words
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            <Tabs defaultValue="practice" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="practice">Practice Session</TabsTrigger>
                <TabsTrigger value="lookup">Word Lookup</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice" className="mt-4">
                {user && (
                  <PracticeSession 
                    userId={user.userid} 
                    difficulty={selectedDifficulty} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="lookup" className="mt-4">
                {user && <WordLookup userId={user.userid} />}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
