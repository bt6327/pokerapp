"use server";

import { summarizeSession, type SummarizeSessionInput } from '@/ai/flows/summarize-session';
import type { Transaction } from '@/lib/types';

export async function getSummaryAction(transactions: Transaction[]): Promise<string> {
  if (transactions.length === 0) {
    return 'No transactions to summarize.';
  }

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const cashOutTransactions = transactions.filter((t) => t.type === 'cash-out');

  const incomeDescription = incomeTransactions.length > 0
    ? incomeTransactions.map((t) => `${t.source}: $${t.amount.toFixed(2)}`).join(', ')
    : 'No income.';

  const cashOutDescription = cashOutTransactions.length > 0
    ? cashOutTransactions.map((t) => `${t.source}: $${t.amount.toFixed(2)}`).join(', ')
    : 'No cash out.';

  // The AI summary functionality is no longer used in the UI, but we'll keep the action.
  const input: SummarizeSessionInput = {
    income: incomeDescription,
    cashOut: cashOutDescription,
  };

  try {
    const result = await summarizeSession(input);
    return result.summary;
  } catch (error) {
    console.error('AI summarization failed:', error);
    return 'Failed to generate summary. Please try again.';
  }
}
