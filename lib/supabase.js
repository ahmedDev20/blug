import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default createClient(supabaseUrl, supabaseAnonKey);

export const COVERS_BUCKET_ID = 'covers';
export const AVATARS_BUCKET_ID = 'avatars';
