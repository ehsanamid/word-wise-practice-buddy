
import { supabase, toast } from "./client";

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
          tblword!tbldefinition_wordid_fkey (
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
  console.log(`Inside savePracticeResult: userId=${userId}, exampleId=${exampleId}, score=${score}`);
  
  try {
    // First check if the practice record already exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from('tblpractice')
      .select('*')
      .eq('userid', userId)
      .eq('exampleid', exampleId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error checking for existing practice record:", fetchError);
      toast({
        title: "Database Error",
        description: "Could not check for existing practice record", 
        variant: "destructive"
      });
      return null;
    }
    
    if (existingRecord) {
      console.log("Updating existing practice record:", existingRecord);
      // Update existing record - ADD the new score to the existing score (accumulative)
      const updatedScore = (existingRecord.score || 0) + score;
      console.log(`Adding score ${score} to existing score ${existingRecord.score} = ${updatedScore}`);
      
      const { data, error } = await supabase
        .from('tblpractice')
        .update({ score: updatedScore })
        .eq('id', existingRecord.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating practice record:", error);
        toast({
          title: "Update Error",
          description: "Could not update your practice score", 
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Updated practice record:", data);
      return data;
    } else {
      console.log("Creating new practice record for exampleId:", exampleId);
      
      // Get the next available ID
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('tblpractice')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
      
      if (maxIdError && maxIdError.code !== 'PGRST116') {
        console.error("Error getting max ID:", maxIdError);
        toast({
          title: "Database Error",
          description: "Could not generate a new practice ID", 
          variant: "destructive"
        });
        return null;
      }
      
      const newId = maxIdData ? maxIdData.id + 1 : 1;
      console.log("Generated new ID for practice record:", newId);
      
      // Create new record with the required ID
      const { data, error } = await supabase
        .from('tblpractice')
        .insert({
          id: newId, // Add the ID here
          userid: userId,
          exampleid: exampleId,
          score: score
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving practice record:", error);
        toast({
          title: "Insert Error",
          description: "Could not save your practice score", 
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Created new practice record:", data);
      return data;
    }
  } catch (err) {
    console.error("Unexpected error in savePracticeResult:", err);
    return null;
  }
}

export async function addExamplesToPractice(userId: number, exampleIds: number[]) {
  // Get the highest existing id
  const { data: maxIdData, error: maxIdError } = await supabase
    .from('tblpractice')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();
  
  if (maxIdError && maxIdError.code !== 'PGRST116') {
    console.error("Error getting max ID:", maxIdError);
    toast({
      title: "Database Error",
      description: "Could not generate new practice IDs", 
      variant: "destructive"
    });
    return null;
  }
  
  let nextId = maxIdData ? maxIdData.id + 1 : 1;
  
  // Create an array of practice records with proper IDs
  const practiceRecords = exampleIds.map(exampleId => ({
    id: nextId++, // Add ID for each record
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
    toast({
      title: "Insert Error",
      description: "Could not add examples to practice", 
      variant: "destructive"
    });
    return null;
  }
  
  return data;
}
