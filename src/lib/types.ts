export interface Bill {
	id: string;
	name: string;
	amount: number | null;
}

export interface Month {
	id: string;
	date: Date;
	bills: Bill[];
}

