import { createClient } from "./client";
import { user, session } from "../stores";
import { PUBLIC_DEV_MODE } from "$env/static/public";

export function isDevMode(): boolean {
	return PUBLIC_DEV_MODE === "true";
}

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

	if (typeof window !== "undefined") {
		window.location.href = "/";
	}
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
	
	// Check if user is authenticated first
	const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
	
	if (authError || !authUser) {
		throw new Error("User must be authenticated");
	}

	const targetUserId = userId || authUser.id;

	if (!targetUserId) {
		throw new Error("User ID is required");
	}

	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", targetUserId)
		.single();

	if (error) {
		// If profile doesn't exist, return null instead of throwing
		if (error.code === "PGRST116") {
			return null;
		}
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

export async function signInWithEmail(email: string, password: string) {
	if (!isDevMode()) {
		throw new Error("Email/password login is only available in development mode");
	}

	const supabase = createClient();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw error;
	}

	session.set(data.session);
	user.set(data.session?.user ?? null);

	return data;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
	if (!isDevMode()) {
		throw new Error("Email/password registration is only available in development mode");
	}

	const supabase = createClient();
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: fullName,
			},
		},
	});

	if (error) {
		throw error;
	}

	if (data.session) {
		session.set(data.session);
		user.set(data.session.user);
	}

	return data;
}

export async function updatePassword(newPassword: string) {
	const supabase = createClient();
	const { error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) {
		throw error;
	}
}

export async function updateUserMetadata(metadata: Record<string, any>) {
	const supabase = createClient();
	const { error } = await supabase.auth.updateUser({
		data: metadata,
	});

	if (error) {
		throw error;
	}

	await getUser();
}

export async function uploadAvatar(file: File): Promise<string> {
	const supabase = createClient();
	const currentUser = await getUser();

	if (!currentUser?.id) {
		throw new Error("User must be authenticated");
	}

	// Validate file type
	if (!file.type.startsWith("image/")) {
		throw new Error("File must be an image");
	}

	// Validate file size (max 5MB)
	const maxSize = 5 * 1024 * 1024; // 5MB
	if (file.size > maxSize) {
		throw new Error("File size must be less than 5MB");
	}

	// Generate unique filename
	const fileExt = file.name.split(".").pop();
	const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
	const filePath = `avatars/${fileName}`;

	// Upload file to Supabase Storage
	const { error: uploadError } = await supabase.storage
		.from("avatars")
		.upload(filePath, file, {
			cacheControl: "3600",
			upsert: false,
		});

	if (uploadError) {
		if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("does not exist")) {
			throw new Error("Bucket 'avatars' nie istnieje. Utwórz go w Supabase Dashboard > Storage.");
		}
		throw uploadError;
	}

	// Get public URL
	const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

	if (!data.publicUrl) {
		throw new Error("Failed to get public URL for uploaded file");
	}

	return data.publicUrl;
}

export async function deleteAvatar(avatarUrl: string): Promise<void> {
	const supabase = createClient();
	
	// Extract file path from URL
	const urlParts = avatarUrl.split("/avatars/");
	if (urlParts.length < 2) {
		return; // Not a storage URL, skip deletion
	}

	const filePath = `avatars/${urlParts[1]}`;

	// Delete file from Supabase Storage
	const { error } = await supabase.storage.from("avatars").remove([filePath]);

	if (error) {
		console.error("Failed to delete avatar:", error);
		// Don't throw - it's okay if deletion fails
	}
}
