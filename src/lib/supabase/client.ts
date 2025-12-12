import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";

export function createClient() {
	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
		throw new Error(
			"Missing Supabase environment variables. Please check your .env file and ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set. You may need to restart your development server."
		);
	}

	return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
