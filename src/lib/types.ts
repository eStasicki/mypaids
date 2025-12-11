export interface Bill {
	id: string;
	name: string;
	amount: number | null;
	categoryId?: string;
	comment?: string;
}

export interface Month {
	id: string;
	date: Date;
	bills: Bill[];
	notes?: string;
}

export interface BillTemplate {
	id: string;
	name: string;
	amount: number | null;
	categoryId?: string;
	autoAdd: boolean; // Czy automatycznie dodawać do nowych miesięcy
}
