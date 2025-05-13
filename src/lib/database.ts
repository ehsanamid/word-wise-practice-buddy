
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
  const { data, error } = await supabase
    .from('tbuser')
    .insert([{ username, email, password }])
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
      *,
      tbldefinition:definitionid (
        *,
        tblword:wordid (*)
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
      *,
      tblexample:exampleid (
        *,
        tbldefinition:definitionid (
          *,
          tblword:wordid (*)
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
    // Create new record
    const { data, error } = await supabase
      .from('tbpractice')
      .insert([{ userid: userId, exampleid: exampleId, score }])
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
      *,
      tbldefinition:tbldefinition (
        *,
        tblexample:tblexample (*)
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
  // Create an array of practice records
  const practiceRecords = exampleIds.map(exampleId => ({
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
