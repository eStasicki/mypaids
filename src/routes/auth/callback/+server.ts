import { createClient } from "$lib/supabase/server";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get("code");
	const next = event.url.searchParams.get("next") ?? "/";

	if (code) {
		const supabase = createClient(event);
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			throw redirect(303, next);
		}
	}

	throw redirect(303, "/auth/error");
};
