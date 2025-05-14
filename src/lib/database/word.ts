
import { supabase } from "./client";

export async function getRandomWordByDifficulty(difficulty: string) {
  console.log("Fetching random word for difficulty:", difficulty);
  
  const { data, error } = await supabase
    .from('tblword')
    .select('wordid, word, type, pronunciation')
    .eq('difficulty', difficulty);
  
  if (error) {
    console.error("Error fetching words by difficulty:", error);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.log("No words found for difficulty:", difficulty);
    return null;
  }
  
  // Randomly select one word
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function getExamplesByWord(word: string) {
  const { data, error } = await supabase
    .from('tblword')
    .select(`
      wordid,
      word,
      type,
      pronunciation,
      difficulty,
      tbldefinition!wordid (
        definitionid,
        definition,
        tblexample!tblexample_definitionid_fkey (
          exampleid,
          english,
          persian
        )
      )
    `)
    .ilike('word', `%${word}%`);
  
  if (error) {
    console.error("Error fetching examples by word:", error);
    return [];
  }
  
  // Flatten the nested structure to get all examples
  const examples = data?.flatMap(word => 
    word.tbldefinition?.flatMap(def => 
      def.tblexample || []
    ) || []
  ) || [];
  
  return examples;
}
