import { NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const line_user_id = searchParams.get('userId');
    if (!line_user_id) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('line_user_id', line_user_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || null }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { line_user_id, categories, alert_level } = await req.json();

    if (!line_user_id) {
      return NextResponse.json({ error: 'Missing line_user_id' }, { status: 400 });
    }

    // Ensure categories is an array
    const selectedCategories = Array.isArray(categories) ? categories : [];
    const finalAlertLevel = alert_level || 'ALL';

    // Upsert the user preferences in Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(
        { 
          line_user_id: line_user_id, 
          categories: selectedCategories,
          alert_level: finalAlertLevel,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'line_user_id' }
      )
      .select();

    if (error) {
      console.error('Error upserting preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('API preferences error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
