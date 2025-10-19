'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Transaction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

type ReportTableProps = {
  transactions: Transaction[];
};

export function ReportTable({ transactions }: ReportTableProps) {
  const { totalIncome, totalCashOut, netFlow } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const cashOut = transactions
      .filter((t) => t.type === 'cash-out')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalCashOut: cashOut,
      netFlow: income - cashOut,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Reporte de Movimientos</CardTitle>
            <CardDescription>
              Detalle de los movimientos de entrada y salida del miembro
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Método de pago</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.source}</TableCell>
                    <TableCell>{t.paymentMethod?.replace('-', ' ') ?? 'N/A'}</TableCell>
                    <TableCell>{t.date.toLocaleDateString()}</TableCell>
                    <TableCell>{t.date.toLocaleTimeString()}</TableCell>
                    <TableCell className="text-right font-mono">
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aún no hay transacciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-bold">Ingreso total</TableCell>
                <TableHead className="text-right font-bold">{formatCurrency(totalIncome)}</TableHead>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="font-bold">Total de retiros</TableCell>
                <TableHead className="text-right font-bold">{formatCurrency(totalCashOut)}</TableHead>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="font-bold text-lg">Flujo Neto</TableCell>
                <TableHead className="text-right font-bold text-lg text-destructive">{formatCurrency(netFlow)}</TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
