import { createClient } from "$lib/supabase/client";
import type { Month, Bill } from "$lib/types";

export async function loadMonthsFromSupabase(): Promise<Month[]> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return [];
	}

	const { data: monthsData, error: monthsError } = await supabase
		.from("months")
		.select("*")
		.eq("user_id", user.id)
		.order("date", { ascending: false });

	if (monthsError) {
		console.error("Error loading months:", monthsError);
		return [];
	}

	if (!monthsData || monthsData.length === 0) {
		return [];
	}

	const monthIds = monthsData.map((m) => m.id);

	const { data: billsData, error: billsError } = await supabase
		.from("bills")
		.select("*")
		.in("month_id", monthIds)
		.order("created_at", { ascending: true });

	if (billsError) {
		console.error("Error loading bills:", billsError);
	}

	const billsMap = new Map<string, Bill[]>();
	if (billsData) {
		for (const bill of billsData) {
			const monthId = bill.month_id;
			if (!billsMap.has(monthId)) {
				billsMap.set(monthId, []);
			}
			billsMap.get(monthId)!.push({
				id: bill.id,
				name: bill.name,
				amount: bill.amount ? Number(bill.amount) : null,
				categoryId: bill.category_id || undefined,
				comment: bill.comment || undefined,
			});
		}
	}

	return monthsData.map((m) => ({
		id: m.id,
		date: new Date(m.date),
		notes: m.notes || undefined,
		bills: billsMap.get(m.id) || [],
	}));
}

export async function saveMonthToSupabase(month: Month): Promise<void> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return;
	}

	const dateStr = month.date.toISOString().split("T")[0];

	const { data: monthData, error: monthError } = await supabase
		.from("months")
		.upsert({
			id: month.id,
			user_id: user.id,
			date: dateStr,
			notes: month.notes || null,
		}, {
			onConflict: "id",
		})
		.select()
		.single();

	if (monthError) {
		console.error("Error saving month:", monthError);
		return;
	}

	if (month.bills.length > 0) {
		const billsToInsert = month.bills.map((bill) => ({
			id: bill.id,
			month_id: monthData.id,
			name: bill.name,
			amount: bill.amount,
			category_id: bill.categoryId || null,
			comment: bill.comment || null,
		}));

		const { error: billsError } = await supabase
			.from("bills")
			.upsert(billsToInsert, {
				onConflict: "id",
			});

		if (billsError) {
			console.error("Error saving bills:", billsError);
		}
	}
}

export async function deleteMonthFromSupabase(monthId: string): Promise<void> {
	const supabase = createClient();
	const { error } = await supabase.from("months").delete().eq("id", monthId);

	if (error) {
		throw error;
	}
}

export async function saveBillToSupabase(bill: Bill, monthId: string): Promise<void> {
	const supabase = createClient();
	const { error } = await supabase
		.from("bills")
		.upsert({
			id: bill.id,
			month_id: monthId,
			name: bill.name,
			amount: bill.amount,
			category_id: bill.categoryId || null,
			comment: bill.comment || null,
		}, {
			onConflict: "id",
		});

	if (error) {
		throw error;
	}
}

export async function deleteBillFromSupabase(billId: string): Promise<void> {
	const supabase = createClient();
	
	console.log("[deleteBillFromSupabase] Starting deletion for bill ID:", billId);
	console.log("[deleteBillFromSupabase] Bill ID type:", typeof billId);
	console.log("[deleteBillFromSupabase] Bill ID length:", billId?.length);
	
	const { data: { user }, error: authError } = await supabase.auth.getUser();

	if (authError) {
		console.error("[deleteBillFromSupabase] Auth error:", authError);
		throw new Error(`Authentication error: ${authError.message}`);
	}

	if (!user) {
		console.error("[deleteBillFromSupabase] User not authenticated");
		throw new Error("User not authenticated");
	}

	console.log("[deleteBillFromSupabase] User authenticated:", user.id);

	const { data: billData, error: billError } = await supabase
		.from("bills")
		.select("id, month_id, name")
		.eq("id", billId)
		.single();

	if (billError) {
		console.error("[deleteBillFromSupabase] Error checking bill existence:", billError);
		console.error("[deleteBillFromSupabase] Check error code:", billError.code);
		console.error("[deleteBillFromSupabase] Check error message:", billError.message);
		throw new Error(`Bill not found or access denied: ${billError.message}`);
	}

	if (!billData) {
		console.error("[deleteBillFromSupabase] Bill not found with ID:", billId);
		throw new Error("Bill not found");
	}

	console.log("[deleteBillFromSupabase] Bill found:", billData);

	const { data: monthData, error: monthError } = await supabase
		.from("months")
		.select("id, user_id")
		.eq("id", billData.month_id)
		.single();

	if (monthError) {
		console.error("[deleteBillFromSupabase] Error checking month:", monthError);
		throw new Error(`Month not found: ${monthError.message}`);
	}

	if (!monthData) {
		console.error("[deleteBillFromSupabase] Month not found for bill:", billData.month_id);
		throw new Error("Month not found");
	}

	if (monthData.user_id !== user.id) {
		console.error("[deleteBillFromSupabase] User does not own this month. User ID:", user.id, "Month user_id:", monthData.user_id);
		throw new Error("You do not have permission to delete this bill");
	}

	console.log("[deleteBillFromSupabase] Permission verified. Deleting bill...");
	console.log("[deleteBillFromSupabase] Deleting bill with ID:", billId, "from month:", billData.month_id);
	console.log("[deleteBillFromSupabase] About to execute: DELETE FROM bills WHERE id =", billId);

	const deleteQuery = supabase
		.from("bills")
		.delete()
		.eq("id", billId)
		.select();

	console.log("[deleteBillFromSupabase] Delete query prepared, executing...");

	const { error, data } = await deleteQuery;

	console.log("[deleteBillFromSupabase] Delete query executed");
	console.log("[deleteBillFromSupabase] Error:", error);
	console.log("[deleteBillFromSupabase] Data:", data);
	console.log("[deleteBillFromSupabase] Data type:", typeof data);
	console.log("[deleteBillFromSupabase] Data length:", data?.length);

	if (error) {
		console.error("[deleteBillFromSupabase] Error deleting bill:", error);
		console.error("[deleteBillFromSupabase] Error code:", error.code);
		console.error("[deleteBillFromSupabase] Error message:", error.message);
		console.error("[deleteBillFromSupabase] Error details:", error.details);
		console.error("[deleteBillFromSupabase] Error hint:", error.hint);
		throw error;
	}

	if (!data || data.length === 0) {
		console.error("[deleteBillFromSupabase] ⚠️ CRITICAL: No bill was deleted! This indicates RLS policy issue.");
		console.error("[deleteBillFromSupabase] Attempted to delete bill ID:", billId);
		console.error("[deleteBillFromSupabase] Month ID:", billData.month_id);
		console.error("[deleteBillFromSupabase] User ID:", user.id);
		console.error("[deleteBillFromSupabase] Month user_id:", monthData.user_id);
		
		const { data: verifyBill } = await supabase
			.from("bills")
			.select("id, month_id, name")
			.eq("id", billId)
			.single();
		
		console.error("[deleteBillFromSupabase] Bill still exists in database:", verifyBill);
		
		throw new Error("No bill was deleted. This may indicate an RLS policy issue. Check console for details.");
	}

	console.log("[deleteBillFromSupabase] ✅ Bill deleted successfully:", data);
	console.log("[deleteBillFromSupabase] Deleted bill count:", data.length);
}

