
import { supabase } from "./client";
import { getRandomWordByDifficulty } from "./word";
import { getRandomDefinitionByWordId } from "./definition";

export async function getRandomExampleByDefinitionId(definitionId: number) {
  console.log("Fetching random example for definitionId:", definitionId);
  
  const { data, error } = await supabase
    .from('tblexample')
    .select('exampleid, english, persian')
    .eq('definitionid', definitionId);
  
  if (error) {
    console.error("Error fetching examples by definitionId:", error);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.log("No examples found for definitionId:", definitionId);
    return null;
  }
  
  // Randomly select one example
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function getExamplesByDifficulty(difficulty: string) {
  console.log("Using new implementation for getExamplesByDifficulty:", difficulty);
  
  const randomWord = await getRandomWordByDifficulty(difficulty);
  if (!randomWord) {
    return [];
  }
  
  const randomDefinition = await getRandomDefinitionByWordId(randomWord.wordid);
  if (!randomDefinition) {
    return [];
  }
  
  const randomExample = await getRandomExampleByDefinitionId(randomDefinition.definitionid);
  if (!randomExample) {
    return [];
  }
  
  // Format the result to match the expected structure of the old function
  return [{
    ...randomExample,
    exampleid: randomExample.exampleid,
    english: randomExample.english,
    persian: randomExample.persian,
    definitionid: randomDefinition.definitionid,
    tbldefinition: {
      definition: randomDefinition.definition,
      tblword: {
        word: randomWord.word,
        type: randomWord.type,
        pronunciation: randomWord.pronunciation
      }
    }
  }];
}
