import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';

export async function POST(req) {
  try {
    const { line_uid, display_name, picture_url, preferences } = await req.json();

    if (!line_uid) {
      return NextResponse.json({ error: 'line_uid is required' }, { status: 400 });
    }

    // Upsert (Insert or Update if exists) the member record in Supabase
    const { data, error } = await supabase
      .from('members')
      .upsert({ 
        line_uid, 
        display_name, 
        picture_url, 
        preferences: preferences || {} 
      }, { onConflict: 'line_uid' });

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, member: data }, { status: 200 });
  } catch (error) {
    console.error('Register Member Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
