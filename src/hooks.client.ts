import "$lib/i18n";
import { createClient } from "$lib/supabase/client";
import { user, session } from "$lib/stores";
import type { HandleClientError } from "@sveltejs/kit";

const supabase = createClient();

supabase.auth.onAuthStateChange((_event, currentSession) => {
	session.set(currentSession);
	user.set(currentSession?.user ?? null);
});

supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
	session.set(currentSession);
	user.set(currentSession?.user ?? null);
});

export const handleError: HandleClientError = ({ error, event }) => {
	console.error("Client error:", error, event);
	return {
		message: "An unexpected error occurred",
	};
};
