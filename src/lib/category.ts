import { supabase } from './supabase';
import { CartItem } from '../types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }

  return data || [];
}
