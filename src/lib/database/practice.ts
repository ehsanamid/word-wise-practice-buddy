
import { supabase } from "./client";

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
