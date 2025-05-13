
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
  const { data, error } = await supabase
    .from('tbuser')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();
  
  if (error) {
    console.error("Authentication error:", error);
    return null;
  }
  
  return data;
}

export async function getExamplesByDifficulty(difficulty: string) {
  const { data, error } = await supabase
    .from('tblexample')
    .select(`
      exampleid,
      english,
      persian,
      definitionid,
      tbldefinition!definitionid (
        definition,
        tblword!wordid (
          word,
          type,
          pronunciation
        )
      )
    `)
    .eq('tbldefinition.tblword.difficulty', difficulty);
  
  if (error) {
    console.error("Error fetching examples:", error);
    return [];
  }
  
  return data;
}

export async function getPracticeByUser(userId: number, difficulty: string, limit = 10) {
  const { data, error } = await supabase
    .from('tbpractice')
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
        tbldefinition!definitionid (
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
    .from('tbpractice')
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
      .from('tbpractice')
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
      .from('tbpractice')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    
    const newId = maxIdData ? maxIdData.id + 1 : 1;
    
    // Create new record with the generated id
    const { data, error } = await supabase
      .from('tbpractice')
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
        tblexample!definitionid (
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
    .from('tbpractice')
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
    .from('tbpractice')
    .insert(practiceRecords)
    .select();
  
  if (error) {
    console.error("Error adding examples to practice:", error);
    return null;
  }
  
  return data;
}
