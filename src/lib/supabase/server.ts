import { createServerClient } from "@supabase/ssr";
import type { RequestEvent } from "@sveltejs/kit";
import type { Database } from "./types";
import { env } from "$env/dynamic/public";

export function createClient(event: RequestEvent) {
	const supabaseUrl = env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			"Missing Supabase environment variables. Please check your .env file and ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set. You may need to restart your development server."
		);
	}

	return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						event.cookies.set(name, value, {
							...options,
							path: options?.path ?? "/",
						})
					);
				} catch {
				}
			},
		},
	});
}
