import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import type { Month } from "../types";
import { getCategoryById } from "./categoryUtils";
import { getMonthName, getTotalForMonth } from "./monthUtils";

if (typeof pdfMake !== "undefined" && pdfMake.vfs === undefined) {
	pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
}

/**
 * Generuje PDF raport dla wybranych miesięcy z profesjonalnym, księgowym wyglądem
 * Używa pdfmake z pełnym wsparciem Unicode dla polskich znaków
 */
export async function generatePDFReport(
	months: Month[],
	title?: string,
	t?: (key: string) => string
): Promise<void> {
	const defaultTitle = t ? t("pdf.title") : "Raport Rachunków";
	const reportTitle = title || defaultTitle;
	const sortedMonths = [...months].sort((a, b) => a.date.getTime() - b.date.getTime());

	const docDefinition: TDocumentDefinitions = {
		pageSize: "A4",
		pageMargins: [40, 60, 40, 60],
		info: {
			title: reportTitle,
			author: "MyPaids",
			subject: t ? t("pdf.subject") : "Raport Rachunków",
		},
		header: {
			margin: [40, 20, 40, 0],
			table: {
				widths: ["*"],
				body: [
					[
						{
							text: reportTitle,
							style: "header",
							fillColor: "#1f2937",
							color: "#ffffff",
							margin: [15, 10, 15, 10],
						},
					],
				],
			},
		},
		content: [
			{
				text: `${t ? t("pdf.generated") : "Wygenerowano:"} ${new Date().toLocaleDateString(
					"pl-PL",
					{
						year: "numeric",
						month: "long",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					}
				)}`,
				style: "subheader",
				margin: [0, 0, 0, 20],
			},
			...(await Promise.all(sortedMonths.map(async (month, index) => {
				const monthName = getMonthName(month.date, t);
				const year = month.date.getFullYear();
				const total = getTotalForMonth(month);
				const paymentDate = month.date.toLocaleDateString("pl-PL");

				const tableData = [
					[
						{
							text: t ? t("pdf.billName") : "Nazwa rachunku",
							style: "tableHeader",
							fillColor: "#4b5563",
							color: "#ffffff",
						},
						{
							text: t ? t("pdf.amount") : "Kwota",
							style: "tableHeader",
							fillColor: "#4b5563",
							color: "#ffffff",
							alignment: "right",
						},
						{
							text: t ? t("pdf.category") : "Kategoria",
							style: "tableHeader",
							fillColor: "#4b5563",
							color: "#ffffff",
						},
						{
							text: t ? t("pdf.notes") : "Uwagi",
							style: "tableHeader",
							fillColor: "#4b5563",
							color: "#ffffff",
						},
					],
					...(await Promise.all(month.bills.map(async (bill, billIndex) => {
						const category = bill.categoryId ? await getCategoryById(bill.categoryId, t) : null;
						const categoryName = category?.name || "-";
						const currency = t ? t("bills.currency") : "zł";
						const amount = bill.amount !== null ? `${bill.amount.toFixed(2)} ${currency}` : "-";
						const comment = bill.comment || "";

						return [
							{ text: bill.name, fillColor: billIndex % 2 === 0 ? "#ffffff" : "#f9fafb" },
							{
								text: amount,
								alignment: "right",
								fillColor: billIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
							},
							{ text: categoryName, fillColor: billIndex % 2 === 0 ? "#ffffff" : "#f9fafb" },
							{
								text: comment,
								style: "comment",
								fillColor: billIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
							},
						];
					})))
				];

				if (month.bills.length === 0) {
					tableData.push([
						{
							text: t ? t("pdf.noBills") : "Brak rachunków",
							colSpan: 4,
							alignment: "center",
							italics: true,
							color: "#6b7280",
						},
					]);
				}

				return {
					stack: [
						{
							table: {
								widths: ["*"],
								body: [
									[
										{
											stack: [
												{
													text: `${monthName} ${year}`,
													style: "monthHeader",
													color: "#ffffff",
												},
												{
													text: `${t ? t("pdf.paymentDate") : "Data wpłaty:"} ${paymentDate}`,
													style: "monthSubheader",
													color: "#ffffff",
												},
											],
											fillColor: "#3b82f6",
											margin: [10, 8, 10, 8],
										},
									],
								],
							},
							margin: [0, 0, 0, 10],
						},
						{
							table: {
								headerRows: 1,
								widths: [90, 50, 60, "*"],
								body: tableData,
							},
							margin: [0, 0, 0, 10],
						},
						{
							table: {
								widths: ["*"],
								body: [
									[
										{
											columns: [
												{ text: t ? t("pdf.monthTotal") : "Suma miesiąca:", style: "totalLabel" },
												{
													text: `${total.toFixed(2)} ${t ? t("bills.currency") : "zł"}`,
													style: "totalValue",
													alignment: "right",
												},
											],
											fillColor: "#f3f4f6",
											margin: [10, 8, 10, 8],
										},
									],
								],
							},
							margin: [0, 0, 0, 10],
						},
						...(month.notes
							? [
									{
										stack: [
											{ text: t ? t("pdf.notesLabel") : "Notatki:", style: "notesLabel" },
											{ text: month.notes, style: "notesText" },
										],
										margin: [0, 0, 0, 20],
									},
								]
							: []),
						...(index < sortedMonths.length - 1
							? [
									{
										canvas: [
											{
												type: "line",
												x1: 0,
												y1: 0,
												x2: 515,
												y2: 0,
												lineWidth: 0.5,
												lineColor: "#e5e7eb",
											},
										],
										margin: [0, 20, 0, 20],
									},
								]
							: []),
					],
				};
			}))),
			...(sortedMonths.length > 1
				? [
						{ text: "", pageBreak: "before" },
						{
							text: t ? t("pdf.summary") : "Podsumowanie",
							style: "header",
							fillColor: "#1f2937",
							color: "#ffffff",
							margin: [0, 0, 0, 20],
						},
						{
							table: {
								headerRows: 1,
								widths: [80, 70, 60, 60],
								body: [
									[
										{
											text: t ? t("pdf.month") : "Miesiąc",
											style: "tableHeader",
											fillColor: "#3b82f6",
											color: "#ffffff",
										},
										{
											text: t ? t("pdf.paymentDateHeader") : "Data wpłaty",
											style: "tableHeader",
											fillColor: "#3b82f6",
											color: "#ffffff",
										},
										{
											text: t ? t("pdf.billsCount") : "Liczba rachunków",
											style: "tableHeader",
											fillColor: "#3b82f6",
											color: "#ffffff",
											alignment: "center",
										},
										{
											text: t ? t("pdf.total") : "Suma",
											style: "tableHeader",
											fillColor: "#3b82f6",
											color: "#ffffff",
											alignment: "right",
										},
									],
									...sortedMonths.map((month, monthIndex) => {
										const monthName = getMonthName(month.date);
										const year = month.date.getFullYear();
										const total = getTotalForMonth(month);
										const currency = t ? t("bills.currency") : "zł";
										return [
											{
												text: `${monthName} ${year}`,
												fillColor: monthIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
											},
											{
												text: month.date.toLocaleDateString("pl-PL"),
												fillColor: monthIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
											},
											{
												text: month.bills.length.toString(),
												alignment: "center",
												fillColor: monthIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
											},
											{
												text: `${total.toFixed(2)} ${currency}`,
												alignment: "right",
												fillColor: monthIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
											},
										];
									}),
									[
										{
											text: t ? t("pdf.totalLabel") : "RAZEM",
											style: "footerLabel",
											fillColor: "#1f2937",
											color: "#ffffff",
											bold: true,
										},
										{
											text: t
												? t("pdf.monthsCount").replace("{count}", sortedMonths.length.toString())
												: `${sortedMonths.length} miesięcy`,
											style: "footerLabel",
											fillColor: "#1f2937",
											color: "#ffffff",
										},
										{
											text: sortedMonths.reduce((sum, m) => sum + m.bills.length, 0).toString(),
											alignment: "center",
											style: "footerLabel",
											fillColor: "#1f2937",
											color: "#ffffff",
										},
										{
											text: `${sortedMonths.reduce((sum, m) => sum + getTotalForMonth(m), 0).toFixed(2)} ${t ? t("bills.currency") : "zł"}`,
											alignment: "right",
											style: "footerLabel",
											fillColor: "#1f2937",
											color: "#ffffff",
											bold: true,
										},
									],
									[
										{
											text: t ? t("pdf.averageLabel") : "ŚREDNIA",
											style: "footerLabel",
											fillColor: "#1f2937",
											color: "#ffffff",
											bold: true,
										},
										{ text: "", fillColor: "#1f2937" },
										{ text: "", fillColor: "#1f2937" },
										{
											text: `${(sortedMonths.reduce((sum, m) => sum + getTotalForMonth(m), 0) / sortedMonths.length).toFixed(2)} ${t ? t("bills.currency") : "zł"}`,
											alignment: "right",
											style: "footerLabel",
											fillColor: "#1f2937",
											color: "#ffffff",
											bold: true,
										},
									],
								],
							},
						},
					]
				: []),
		],
		footer: function (currentPage: number, pageCount: number) {
			const pageText = t
				? t("pdf.page")
						.replace("{current}", currentPage.toString())
						.replace("{total}", pageCount.toString())
				: `Strona ${currentPage} z ${pageCount}`;
			return {
				text: pageText,
				alignment: "center",
				fontSize: 8,
				color: "#6b7280",
				margin: [0, 10, 0, 0],
			};
		},
		styles: {
			header: {
				fontSize: 20,
				bold: true,
			},
			subheader: {
				fontSize: 10,
				color: "#6b7280",
			},
			monthHeader: {
				fontSize: 14,
				bold: true,
			},
			monthSubheader: {
				fontSize: 9,
			},
			tableHeader: {
				fontSize: 9,
				bold: true,
			},
			totalLabel: {
				fontSize: 11,
				bold: true,
			},
			totalValue: {
				fontSize: 11,
				bold: true,
			},
			notesLabel: {
				fontSize: 9,
				italics: true,
				color: "#4b5563",
			},
			notesText: {
				fontSize: 8,
				margin: [5, 5, 0, 0],
			},
			comment: {
				fontSize: 8,
				italics: true,
			},
			footerLabel: {
				fontSize: 10,
				bold: true,
			},
		},
		defaultStyle: {
			font: "Roboto",
			fontSize: 9,
		},
	};

	pdfMake
		.createPdf(docDefinition)
		.download(`raport-rachunkow-${new Date().toISOString().split("T")[0]}.pdf`);
}
