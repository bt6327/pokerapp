
'use client';

import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type SummaryCardProps = {
  summary: string;
  isLoading: boolean;
  onSummarize: () => void;
  hasTransactions: boolean;
};

export function SummaryCard({ summary, isLoading, onSummarize, hasTransactions }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Resumen de movimientos</CardTitle>
            <CardDescription>
              Resultados de los movimientos realizados durante la sesión
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : summary ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground text-center pt-6">
            Haga clic en "Resumir sesión" para generar un resumen.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onSummarize} disabled={isLoading || !hasTransactions} className="w-full bg-accent hover:bg-accent/90">
          {isLoading ? 'Generando...' : 'Resumir Sesión'}
          <Wand2 className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
