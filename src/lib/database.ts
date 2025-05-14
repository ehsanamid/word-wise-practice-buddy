import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export async function getUserById(userId: number) {
  const { data, error } = await supabase
    .from('tbuser')
    .select('*')
    .eq('userid', userId)
    .single();
  
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  
  return data;
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('tbuser')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching user:", error);
    return null;
  }
  
  return data;
}

export async function createUser(username: string, email: string, password: string) {
  // First check if a user with this username already exists
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    toast({
      title: "Username already exists",
      description: "Please choose a different username",
      variant: "destructive"
    });
    return null;
  }

  // Generate a new userid value
  const { data: maxIdData } = await supabase
    .from('tbuser')
    .select('userid')
    .order('userid', { ascending: false })
    .limit(1)
    .single();
  
  const newUserId = maxIdData ? maxIdData.userid + 1 : 1;
  
  const { data, error } = await supabase
    .from('tbuser')
    .insert({
      userid: newUserId,
      username,
      email,
      password
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating user:", error);
    if (error.code === '23505') {
      toast({
        title: "Username already exists",
        description: "Please choose a different username",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    }
    return null;
  }
  
  return data;
}

export async function authenticateUser(username: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('tbuser')
      .select('*')
      .eq('username', username)
      .eq('password', password);
    
    if (error) {
      console.error("Database error during authentication:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log("No matching user found for the provided credentials");
      return null;
    }
    
    return data[0];
  } catch (error) {
    console.error("Unexpected error during authentication:", error);
    return null;
  }
}

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

export async function getPracticeByUser(userId: number, difficulty: string, limit = 10) {
  // Fix: Use the specific relationship name as suggested in the error
  const { data, error } = await supabase
    .from('tblpractice')
    .select(`
      id,
      userid,
      exampleid,
      score,
      tblexample!exampleid (
        exampleid,
        english,
        persian,
        definitionid,
        tbldefinition!tblexample_definitionid_fkey (
          definition,
          tblword!wordid (
            word,
            type,
            pronunciation
          )
        )
      )
    `)
    .eq('userid', userId)
    .lt('score', 1000)
    .eq('tblexample.tbldefinition.tblword.difficulty', difficulty)
    .limit(limit);
  
  if (error) {
    console.error("Error fetching practice records:", error);
    return [];
  }
  
  return data;
}

export async function savePracticeResult(userId: number, exampleId: number, score: number) {
  // First check if the practice record already exists
  const { data: existingRecord, error: fetchError } = await supabase
    .from('tblpractice')
    .select('*')
    .eq('userid', userId)
    .eq('exampleid', exampleId)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error checking for existing practice record:", fetchError);
    return null;
  }
  
  if (existingRecord) {
    // Update existing record
    const { data, error } = await supabase
      .from('tblpractice')
      .update({ score })
      .eq('id', existingRecord.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating practice record:", error);
      return null;
    }
    
    return data;
  } else {
    // Generate a new id value
    const { data: maxIdData } = await supabase
      .from('tblpractice')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    
    const newId = maxIdData ? maxIdData.id + 1 : 1;
    
    // Create new record with the generated id
    const { data, error } = await supabase
      .from('tblpractice')
      .insert({
        id: newId,
        userid: userId,
        exampleid: exampleId,
        score: score
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving practice record:", error);
      return null;
    }
    
    return data;
  }
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

export async function addExamplesToPractice(userId: number, exampleIds: number[]) {
  // Get the highest existing id
  const { data: maxIdData } = await supabase
    .from('tblpractice')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  
  let nextId = maxIdData ? maxIdData.id + 1 : 1;
  
  // Create an array of practice records with proper IDs
  const practiceRecords = exampleIds.map(exampleId => ({
    id: nextId++,
    userid: userId,
    exampleid: exampleId,
    score: 0
  }));
  
  const { data, error } = await supabase
    .from('tblpractice')
    .insert(practiceRecords)
    .select();
  
  if (error) {
    console.error("Error adding examples to practice:", error);
    return null;
  }
  
  return data;
}
