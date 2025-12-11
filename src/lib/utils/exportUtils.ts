import type { Month } from '../types';

export function exportToJSON(months: Month[]): string {
	const data = months.map((m) => ({
		...m,
		date: m.date.toISOString()
	}));
	return JSON.stringify(data, null, 2);
}

export function exportToCSV(months: Month[]): string {
	const headers = ['Data', 'Nazwa Rachunku', 'Kwota'];
	const rows: string[] = [headers.join(',')];

	months.forEach((month) => {
		const dateStr = month.date.toLocaleDateString('pl-PL');
		if (month.bills.length === 0) {
			rows.push(`${dateStr},,`);
		} else {
			month.bills.forEach((bill) => {
				const amount = bill.amount !== null ? bill.amount.toFixed(2) : '';
				const name = `"${bill.name.replace(/"/g, '""')}"`;
				rows.push(`${dateStr},${name},${amount}`);
			});
		}
	});

	return rows.join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
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
			throw new Error('Invalid format: expected array');
		}
		return parsed.map((m: any) => ({
			...m,
			date: new Date(m.date),
			bills: m.bills || []
		}));
	} catch (error) {
		throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export function parseImportedCSV(content: string): Month[] {
	const lines = content.split('\n').filter((line) => line.trim());
	if (lines.length < 2) {
		throw new Error('CSV file is empty or invalid');
	}

	const monthsMap = new Map<string, Month>();

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const parts: string[] = [];
		let current = '';
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
			} else if (char === ',' && !inQuotes) {
				parts.push(current);
				current = '';
			} else {
				current += char;
			}
		}
		parts.push(current);

		if (parts.length < 3) continue;

		const [dateStr, nameStr, amountStr] = parts;
		const date = parseDate(dateStr.trim());
		if (!date) continue;

		const name = nameStr.trim();
		if (!name) continue;

		const amount = amountStr.trim() === '' ? null : parseFloat(amountStr.trim().replace(',', '.'));

		const dateKey = date.toISOString().split('T')[0];
		if (!monthsMap.has(dateKey)) {
			monthsMap.set(dateKey, {
				id: crypto.randomUUID(),
				date,
				bills: []
			});
		}

		const month = monthsMap.get(dateKey)!;
		month.bills.push({
			id: crypto.randomUUID(),
			name,
			amount: isNaN(amount ?? 0) ? null : amount
		});
	}

	return Array.from(monthsMap.values());
}

function parseDate(dateStr: string): Date | null {
	const formats = [
		/^\d{4}-\d{2}-\d{2}$/,
		/^\d{2}\.\d{2}\.\d{4}$/,
		/^\d{2}\/\d{2}\/\d{4}$/
	];

	for (const format of formats) {
		if (format.test(dateStr)) {
			const date = new Date(dateStr.replace(/\./g, '-').replace(/\//g, '-'));
			if (!isNaN(date.getTime())) {
				return date;
			}
		}
	}

	return null;
}

