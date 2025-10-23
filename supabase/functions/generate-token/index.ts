import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Get request body
    const { mealType, mealDate } = await req.json()

    if (!mealType) {
      return new Response(
        JSON.stringify({ error: 'Meal type is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Generate unique token code
    const tokenCode = `MT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    
    // Create QR code data (JSON string with token info)
    const qrCodeData = JSON.stringify({
      tokenCode,
      userId: user.id,
      mealType,
      mealDate: mealDate || new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString()
    })

    // Insert token into database
    const { data: token, error: insertError } = await supabaseClient
      .from('tokens')
      .insert({
        user_id: user.id,
        token_code: tokenCode,
        meal_type: mealType,
        meal_date: mealDate || new Date().toISOString().split('T')[0],
        qr_code_data: qrCodeData,
        is_used: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate token', details: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Token generated successfully:', tokenCode);

    return new Response(
      JSON.stringify({ 
        success: true, 
        token,
        message: 'Token generated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})