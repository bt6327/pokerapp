
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export type SummaryData = {
  name: string;
  totalIncome: number;
  totalCashOut: number;
  netFlow: number;
};

type SummaryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  summaryData: SummaryData[];
  onPrintSummary: () => void;
  isPrinting: boolean;
  rakeAmount?: number;
};

export function SummaryDialog({ isOpen, onClose, summaryData, onPrintSummary, isPrinting, rakeAmount }: SummaryDialogProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalIncome = summaryData.reduce((acc, item) => acc + item.totalIncome, 0);
  const totalCashOut = summaryData.reduce((acc, item) => acc + item.totalCashOut, 0);
  const netFlow = totalIncome - totalCashOut;
  const netFlowWithRake = netFlow - (rakeAmount || 0);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Resumen por Miembro</DialogTitle>
          <DialogDescription>
            Un desglose de los ingresos y salidas para cada miembro.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Ingreso Total</TableHead>
                <TableHead className="text-right">Salida Total</TableHead>
                <TableHead className="text-right">Flujo Neto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.length > 0 ? (
                summaryData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.totalIncome)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(item.totalCashOut)}</TableCell>
                    <TableCell className={`text-right font-mono ${item.netFlow < 0 ? 'text-destructive' : ''}`}>{formatCurrency(item.netFlow)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No hay datos para resumir.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="font-bold">TOTALES</TableCell>
                    <TableCell className={`text-right font-bold ${netFlow < 0 ? 'text-destructive' : ''}`}>{formatCurrency(netFlow)}</TableCell>
                </TableRow>
                {rakeAmount !== undefined && rakeAmount > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold">Rake</TableCell>
                      <TableCell className="text-right font-bold text-destructive">{formatCurrency(rakeAmount * -1)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold">Neto con Rake</TableCell>
                      <TableCell className={`text-right font-bold ${netFlowWithRake < 0 ? 'text-destructive' : ''}`}>{formatCurrency(netFlowWithRake)}</TableCell>
                    </TableRow>
                  </>
                )}
            </TableFooter>
          </Table>
        </div>
        <DialogFooter>
            <Button onClick={onPrintSummary} disabled={isPrinting} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isPrinting ? 'Imprimiendo...' : 'Imprimir resultados'}
                <Printer className="ml-2 h-4 w-4" />
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    