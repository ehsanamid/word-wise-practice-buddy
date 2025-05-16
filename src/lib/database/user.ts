
import { supabase, toast } from "./client";

export async function getUserById(userId: number) {
  const { data, error } = await supabase
    .from('tbluser')
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
    .from('tbluser')
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
    .from('tbluser')
    .select('userid')
    .order('userid', { ascending: false })
    .limit(1)
    .single();
  
  const newUserId = maxIdData ? maxIdData.userid + 1 : 1;
  
  const { data, error } = await supabase
    .from('tbluser')
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
      .from('tbluser')
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
