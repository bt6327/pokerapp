"use client";

import { useState } from 'react';
import type { Transaction } from '@/lib/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Icons } from '@/components/icons';
import { TransactionForm } from '@/components/transaction-form';
import { SummaryCard } from '@/components/summary-card';
import { ReportTable } from '@/components/report-table';
import { useToast } from "@/hooks/use-toast";
import { SummaryDialog, type SummaryData } from '@/components/summary-dialog';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

export function DashboardClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [comment, setComment] = useState('');
  const [clubName, setClubName] = useState('');

  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions((prev) => [
      ...prev,
      { ...transaction, id: crypto.randomUUID(), date: new Date() },
    ]);
  };
  
  const handleSummarize = async () => {
    if (transactions.length === 0) {
      toast({
        title: "Nada que resumir",
        description: "Añada algunas transacciones primero.",
      });
      return;
    }

    const memberSummary: { [key: string]: { name: string, totalIncome: number; totalCashOut: number } } = {};

    transactions.forEach(transaction => {
      const upperCaseName = transaction.source.toUpperCase();
      if (!memberSummary[upperCaseName]) {
        memberSummary[upperCaseName] = { name: transaction.source, totalIncome: 0, totalCashOut: 0 };
      }
      if (transaction.type === 'income') {
        memberSummary[upperCaseName].totalIncome += transaction.amount;
      } else {
        memberSummary[upperCaseName].totalCashOut += transaction.amount;
      }
    });

    const dataForDialog: SummaryData[] = Object.values(memberSummary).map((totals) => ({
      name: totals.name,
      totalIncome: totals.totalIncome,
      totalCashOut: totals.totalCashOut,
      netFlow: totals.totalIncome - totals.totalCashOut,
    }));

    setSummaryData(dataForDialog);
    setIsSummaryDialogOpen(true);
  };
  
  const handlePrintSummary = () => {
    const doc = new jsPDF();
    const tableData = summaryData.map(d => [d.name, `$${d.totalIncome.toFixed(2)}`, `$${d.totalCashOut.toFixed(2)}`, `$${d.netFlow.toFixed(2)}`]);
    
    const totalIncome = summaryData.reduce((acc, item) => acc + item.totalIncome, 0);
    const totalCashOut = summaryData.reduce((acc, item) => acc + item.totalCashOut, 0);
    const netFlow = totalIncome - totalCashOut;

    tableData.push(['TOTALES', `$${totalIncome.toFixed(2)}`, `$${totalCashOut.toFixed(2)}`, `$${netFlow.toFixed(2)}`]);

    const currentDate = new Date().toLocaleDateString();
    const filename = `ResumenDeSesión-${currentDate}.pdf`;


    doc.setFontSize(18);
    doc.text("Resumen de la sesión", 14, 22);
    if (clubName) {
      doc.setFontSize(14);
      doc.text(clubName, 14, 29);
    }
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${currentDate}`, 14, clubName ? 36 : 29);

    (doc as any).autoTable({
      startY: clubName ? 42 : 35,
      head: [['Nombre', 'Ingreso Total', 'Salida Total', 'Flujo Neto']],
      body: tableData,
      foot: [['TOTALES', `$${totalIncome.toFixed(2)}`, `$${totalCashOut.toFixed(2)}`, `$${netFlow.toFixed(2)}`]],
      footStyles: { fontStyle: 'bold' },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3 && data.cell.text[0].includes('-')) {
          data.cell.styles.textColor = [255, 0, 0];
        }
        if (data.section === 'foot' && data.column.index === 3 && netFlow < 0) {
            data.cell.styles.textColor = [255, 0, 0];
        }
      }
    });

    doc.save(filename);
    setIsSummaryDialogOpen(false);
  };

  const nextTicketNumber = transactions.length + 1;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between space-x-4">
          <div className="flex gap-2 items-center">
            <Icons.logo className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Administrador de entradas y salidas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="club-name" className="whitespace-nowrap">Nombre del club</Label>
            <Input 
              id="club-name" 
              placeholder="Nombre del club" 
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 container">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 flex flex-col gap-8">
            <TransactionForm type="income" onAddTransaction={handleAddTransaction} nextTicketNumber={nextTicketNumber} />
            <TransactionForm type="cash-out" onAddTransaction={handleAddTransaction} nextTicketNumber={nextTicketNumber} />
          </div>
          <div className="md:col-span-2 flex flex-col gap-8">
            <ReportTable transactions={transactions} clubName={clubName} />
            <SummaryCard
              summary={summary}
              isLoading={isSummarizing}
              onSummarize={handleSummarize}
              hasTransactions={transactions.length > 0}
            />
          </div>
        </div>
      </main>
      <footer className="w-full border-t bg-secondary mt-auto">
        <div className="container py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Byron Tunja</h3>
            <p className="text-sm text-muted-foreground">&copy; 2024. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Contacto</h3>
            <p className="text-sm text-muted-foreground">Teléfono: 0998183019</p>
            <p className="text-sm text-muted-foreground">Correo: btunjaaltamirano@gmail.com</p>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg">Comentarios</h3>
            <form 
              action={`mailto:btunjaaltamirano@gmail.com?subject=Comentarios&body=${encodeURIComponent(comment)}`}
              method="post"
              encType="text/plain"
              className="flex flex-col gap-2"
            >
              <Label htmlFor="comment-box" className="sr-only">Comment</Label>
              <Textarea
                id="comment-box"
                placeholder="Escriba sus comentarios aquí..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button type="submit" variant="secondary">Enviar Comentario</Button>
            </form>
          </div>
        </div>
      </footer>
      <SummaryDialog
        isOpen={isSummaryDialogOpen}
        onClose={() => setIsSummaryDialogOpen(false)}
        summaryData={summaryData}
        onPrintSummary={handlePrintSummary}
        isPrinting={false}
      />
    </div>
  );
}
