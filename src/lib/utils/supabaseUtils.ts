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
	const { error } = await supabase.from("bills").delete().eq("id", billId);

	if (error) {
		throw error;
	}
}

