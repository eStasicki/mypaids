import { createClient } from "./client";
import { user, session } from "../stores";

export async function signInWithOAuth(provider: "google" | "github" | "facebook" | "twitter" | "discord") {
	const supabase = createClient();
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: `${window.location.origin}/auth/callback`,
		},
	});

	if (error) {
		throw error;
	}

	return data;
}

export async function signOut() {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		throw error;
	}

	user.set(null);
	session.set(null);
}

export async function getSession() {
	const supabase = createClient();
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		throw error;
	}

	session.set(data.session);
	user.set(data.session?.user ?? null);

	return data.session;
}

export async function getUser() {
	const supabase = createClient();
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		throw error;
	}

	user.set(data.user);
	return data.user;
}

export async function getProfile(userId?: string) {
	const supabase = createClient();
	const targetUserId = userId || (await getUser())?.id;

	if (!targetUserId) {
		throw new Error("User ID is required");
	}

	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", targetUserId)
		.single();

	if (error) {
		throw error;
	}

	return data;
}

export async function updateProfile(updates: {
	full_name?: string;
	avatar_url?: string;
}) {
	const supabase = createClient();
	const currentUser = await getUser();

	if (!currentUser?.id) {
		throw new Error("User must be authenticated");
	}

	const { data, error } = await supabase
		.from("profiles")
		.update(updates)
		.eq("id", currentUser.id)
		.select()
		.single();

	if (error) {
		throw error;
	}

	return data;
}
