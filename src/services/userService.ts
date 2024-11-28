import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export const userService = {
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getUserById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async searchUsers(query: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name')
      .limit(10);

    if (error) throw error;
    return data || [];
  }
};