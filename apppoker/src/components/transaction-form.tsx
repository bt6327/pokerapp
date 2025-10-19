'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Transaction, PaymentMethod } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  source: z.string().min(2, 'La fuente debe tener al menos 2 caracteres.'),
  amount: z.coerce.number().positive('La cantidad debe ser positiva.'),
  paymentMethod: z.enum(["cash", "transferencia", "adeudo", "cash-back"]).optional(),
});

type TransactionFormProps = {
  type: 'income' | 'cash-out';
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
};

export function TransactionForm({ type, onAddTransaction }: TransactionFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: '',
      amount: undefined,
      paymentMethod: type === 'income' ? 'cash' : 'cash',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddTransaction({ ...values, type, paymentMethod: values.paymentMethod as PaymentMethod | undefined });
    toast({
        title: `${type === 'income' ? 'Miembro ingresado' : 'Salida de cash registrada'}!`,
        description: `${values.source}: $${values.amount.toFixed(2)}`,
    })
    form.reset({ source: '', amount: undefined, paymentMethod: form.getValues('paymentMethod') });
  };

  const title = type === 'income' ? 'Ingresar miembro' : 'Registro de salidas de cash';
  const description =
    type === 'income'
      ? 'Añadir un nuevo miembro.'
      : 'Pago o cash out realizado al miembro';
  const sourceLabel = 'Nombre';
  const Icon = type === 'income' ? ArrowDownLeft : ArrowUpRight;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6" />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{sourceLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={'p.ej. John Doe'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de pago</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un método de pago" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="adeudo">Adeudo</SelectItem>
                      <SelectItem value="cash-back">Cash Back</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {type === 'income' ? 'Ingresar Miembro' : 'Registrar Salida'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
