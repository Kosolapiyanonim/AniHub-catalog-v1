import { NextResponse } from "next/server";
import createClient from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { access_token, refresh_token } = await request.json();
  
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Tokens are required" }, { status: 400 });
  }

  const supabase = await createClient();
  
  // Set the session using the tokens from client
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data.user });
}
