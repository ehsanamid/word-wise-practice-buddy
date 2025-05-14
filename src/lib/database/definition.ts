
import { supabase } from "./client";

export async function getRandomDefinitionByWordId(wordId: number) {
  console.log("Fetching random definition for wordId:", wordId);
  
  const { data, error } = await supabase
    .from('tbldefinition')
    .select('definitionid, definition')
    .eq('wordid', wordId);
  
  if (error) {
    console.error("Error fetching definitions by wordId:", error);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.log("No definitions found for wordId:", wordId);
    return null;
  }
  
  // Randomly select one definition
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}
