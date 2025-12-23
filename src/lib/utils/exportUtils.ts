import type { Month } from "../types";

export function exportToJSON(months: Month[]): string {
	const data = months.map((m) => ({
		...m,
		date: m.date.toISOString(),
	}));
	return JSON.stringify(data, null, 2);
}

export function exportToCSV(months: Month[], t?: (key: string) => string): string {
	const headers = [
		t ? t("export.headers.date") : "Data",
		t ? t("export.headers.billName") : "Nazwa Rachunku",
		t ? t("export.headers.amount") : "Kwota",
	];
	const rows: string[] = [headers.join(",")];

	months.forEach((month) => {
		const dateStr = month.date.toLocaleDateString("pl-PL");
		if (month.bills.length === 0) {
			rows.push(`${dateStr},,`);
		} else {
			month.bills.forEach((bill) => {
				const amount = bill.amount !== null ? bill.amount.toFixed(2) : "";
				const name = `"${bill.name.replace(/"/g, '""')}"`;
				rows.push(`${dateStr},${name},${amount}`);
			});
		}
	});

	return rows.join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function parseImportedJSON(content: string): Month[] {
	try {
		const parsed = JSON.parse(content);
		if (!Array.isArray(parsed)) {
			throw new Error("Invalid format: expected array");
		}
		return parsed.map((m: any) => ({
			...m,
			date: new Date(m.date),
			bills: m.bills || [],
		}));
	} catch (error) {
		throw new Error(
			`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

export function parseImportedCSV(content: string): Month[] {
	const lines = content.split("\n");
	if (lines.length < 1) {
		throw new Error("CSV file is empty or invalid");
	}

	const firstLine = lines[0].trim();
	if (firstLine.startsWith("Rachunki")) {
		return parseLegacyCSVFormat(lines);
	}

	return parseStandardCSVFormat(lines);
}

function parseLegacyCSVFormat(lines: string[]): Month[] {
	const monthsMap = new Map<string, Month>();
	let currentDate: Date | null = null;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed === ",") continue;

		if (trimmed.startsWith("Rachunki")) {
			const dateMatch = trimmed.match(/Rachunki\s+(\d{2}\.\d{2}\.\d{4})/);
			if (dateMatch) {
				const dateStr = dateMatch[1];
				const date = parseDate(dateStr);
				if (date) {
					currentDate = date;
					const dateKey = date.toISOString().split("T")[0];
					if (!monthsMap.has(dateKey)) {
						monthsMap.set(dateKey, {
							id: crypto.randomUUID(),
							date,
							bills: [],
						});
					}
				} else {
					console.warn(`Failed to parse date: ${dateStr}`);
				}
			} else {
				console.warn(`Failed to match date pattern in: ${trimmed}`);
			}
			continue;
		}

		if (!currentDate) {
			continue;
		}

		if (trimmed.includes(":")) {
			const colonIndex = trimmed.indexOf(":");
			const name = trimmed.substring(0, colonIndex).trim();
			let amountStr = trimmed.substring(colonIndex + 1).trim();

			if (!name) continue;

			if (amountStr.startsWith(",")) {
				amountStr = amountStr.substring(1).trim();
			}

			let amount: number | null = null;
			if (amountStr && amountStr !== "-") {
				const cleaned = amountStr.replace(/,/g, "");
				const parsed = parseFloat(cleaned);
				if (!isNaN(parsed)) {
					amount = parsed;
				}
			}

			const dateKey = currentDate.toISOString().split("T")[0];
			const month = monthsMap.get(dateKey);
			if (month) {
				month.bills.push({
					id: crypto.randomUUID(),
					name,
					amount,
				});
			}
		}
	}

	return Array.from(monthsMap.values());
}

function parseStandardCSVFormat(lines: string[]): Month[] {
	const filteredLines = lines.filter((line) => line.trim());
	if (filteredLines.length < 2) {
		throw new Error("CSV file is empty or invalid");
	}

	const monthsMap = new Map<string, Month>();

	for (let i = 1; i < filteredLines.length; i++) {
		const line = filteredLines[i].trim();
		if (!line) continue;

		const parts: string[] = [];
		let current = "";
		let inQuotes = false;

		for (let j = 0; j < line.length; j++) {
			const char = line[j];
			if (char === '"') {
				if (inQuotes && line[j + 1] === '"') {
					current += '"';
					j++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === "," && !inQuotes) {
				parts.push(current);
				current = "";
			} else {
				current += char;
			}
		}
		parts.push(current);

		if (parts.length < 3) continue;

		const [dateStr, nameStr, amountStr] = parts;
		const date = parseDate(dateStr.trim());
		if (!date) continue;

		const name = nameStr.trim().replace(/^"|"$/g, "");
		if (!name) continue;

		const amount = amountStr.trim() === "" ? null : parseFloat(amountStr.trim().replace(",", "."));

		const dateKey = date.toISOString().split("T")[0];
		if (!monthsMap.has(dateKey)) {
			monthsMap.set(dateKey, {
				id: crypto.randomUUID(),
				date,
				bills: [],
			});
		}

		const month = monthsMap.get(dateKey)!;
		month.bills.push({
			id: crypto.randomUUID(),
			name,
			amount: isNaN(amount ?? 0) ? null : amount,
		});
	}

	return Array.from(monthsMap.values());
}

function parseDate(dateStr: string): Date | null {
	const yyyyMMdd = /^(\d{4})-(\d{2})-(\d{2})$/;
	const ddmmyyyy = /^(\d{2})\.(\d{2})\.(\d{4})$/;
	const ddmmyyyySlash = /^(\d{2})\/(\d{2})\/(\d{4})$/;

	if (yyyyMMdd.test(dateStr)) {
		const date = new Date(dateStr);
		if (!isNaN(date.getTime())) {
			return date;
		}
	}

	if (ddmmyyyy.test(dateStr)) {
		const match = dateStr.match(ddmmyyyy);
		if (match) {
			const [, day, month, year] = match;
			const date = new Date(`${year}-${month}-${day}`);
			if (!isNaN(date.getTime())) {
				return date;
			}
		}
	}

	if (ddmmyyyySlash.test(dateStr)) {
		const match = dateStr.match(ddmmyyyySlash);
		if (match) {
			const [, day, month, year] = match;
			const date = new Date(`${year}-${month}-${day}`);
			if (!isNaN(date.getTime())) {
				return date;
			}
		}
	}

	return null;
}
