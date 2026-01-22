
'use client';

import { useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';

type ReportTableProps = {
  transactions: Transaction[];
  clubName: string;
};

export function ReportTable({ transactions, clubName }: ReportTableProps) {
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

  const handlePrintTicket = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Use a smaller, ticket-like size. Format is [width, height] in mm.
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [72.07, 95] 
    });
    
    const scale = 0.9;
    const leftMargin = 7;
    let currentY = 15;

    doc.setFontSize(14 * scale);
    doc.setFont('helvetica', 'bold');
    doc.text(clubName || 'Recibo', doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += (10 * scale);
    
    doc.setFontSize(10 * scale);
    doc.setFont('helvetica', 'normal');

    const transactionType = transaction.type === 'income' ? 'Ingreso' : 'Salida';
    doc.text(transactionType, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += (8 * scale);

    doc.text(`Ticket: #${transaction.ticket}`, leftMargin, currentY);
    currentY += (7 * scale);
    
    doc.text(`Nombre: ${transaction.source}`, leftMargin, currentY);
    currentY += (7 * scale);

    doc.text(`Método de pago: ${transaction.paymentMethod?.replace('-', ' ') ?? 'N/A'}`, leftMargin, currentY);
    currentY += (7 * scale);

    doc.text(`Fecha: ${transaction.date.toLocaleDateString()}`, leftMargin, currentY);
    currentY += (7 * scale);

    doc.text(`Hora: ${transaction.date.toLocaleTimeString()}`, leftMargin, currentY);
    currentY += (10 * scale);
    
    doc.setFontSize(12 * scale);
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad:', leftMargin, currentY);
    doc.text(formatCurrency(transaction.amount), doc.internal.pageSize.getWidth() - leftMargin, currentY, { align: 'right' });
    currentY += (10 * scale);

    doc.setLineDash([1, 1], 0);
    doc.line(leftMargin, currentY, doc.internal.pageSize.getWidth() - leftMargin, currentY);

    doc.autoPrint();
    doc.output('dataurlnewwindow');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Reporte de Movimientos</CardTitle>
              <CardDescription>
                Detalle de los movimientos de entrada y salida del miembro
              </CardDescription>
            </div>
          </div>
          {clubName && <p className="text-sm font-semibold">{clubName}</p>}
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
                <TableHead className="w-[80px]">Acción</TableHead>
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
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handlePrintTicket(t.id)}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Imprimir Ticket</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aún no hay transacciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="font-bold">Ingreso total</TableCell>
                <TableHead className="text-right font-bold">{formatCurrency(totalIncome)}</TableHead>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="font-bold">Total de retiros</TableCell>
                <TableHead className="text-right font-bold">{formatCurrency(totalCashOut)}</TableHead>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="font-bold text-lg">Flujo Neto</TableCell>
                <TableHead className="text-right font-bold text-lg text-destructive">{formatCurrency(netFlow)}</TableHead>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
