'use server';

/**
 * @fileOverview Summarizes a session's income and cash out using generative AI.
 *
 * - summarizeSession - A function that handles the session summarization process.
 * - SummarizeSessionInput - The input type for the summarizeSession function.
 * - SummarizeSessionOutput - The return type for the summarizeSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSessionInputSchema = z.object({
  income: z
    .string()
    .describe('A description of the income for the session.'),
  cashOut: z.string().describe('The description of the cash out for the session.'),
});
export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

const SummarizeSessionOutputSchema = z.object({
  summary: z.string().describe('A summary of the session including net flow and insights.'),
});
export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;

export async function summarizeSession(input: SummarizeSessionInput): Promise<SummarizeSessionOutput> {
  return summarizeSessionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSessionPrompt',
  input: {schema: SummarizeSessionInputSchema},
  output: {schema: SummarizeSessionOutputSchema},
  prompt: `You are a financial advisor summarizing income and cash out for a session.

  Income: {{{income}}}
  Cash Out: {{{cashOut}}}

  Provide a summary of the session including net flow and insights.
  `,
});

const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: SummarizeSessionInputSchema,
    outputSchema: SummarizeSessionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
