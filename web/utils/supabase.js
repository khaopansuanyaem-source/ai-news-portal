import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzhzweijflchlvharhsj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_3k8O461MarrxJtbt5ud7lw_b8pK8RwH';

export const supabase = createClient(supabaseUrl, supabaseKey);
