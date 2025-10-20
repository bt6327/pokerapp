export type PaymentMethod = "efectivo" | "transferencia" | "adeudo" | "cash-back";

export interface Transaction {
  id: string;
  type: "income" | "cash-out";
  source: string; // or method for cash-out
  amount: number;
  date: Date;
  paymentMethod?: PaymentMethod;
  ticket?: string;
}
