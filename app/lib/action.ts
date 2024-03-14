'use server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// schema
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.date(),
});

const prisma = new PrismaClient();
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(invoice: FormData) {
  try {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: invoice.get('customerId'),
      amount: invoice.get('amount'),
      status: invoice.get('status'),
    });
    const amountInCent = amount * 100;
    const date = new Date().toISOString();
    await prisma.invoice.create({
      data: {
        amount: amountInCent,
        customerId,
        status,
        date,
      },
    });
  } catch (error) {
    return { message: 'error during creating invoice' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, invoice: FormData) {
  try {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: invoice.get('customerId'),
      amount: invoice.get('amount'),
      status: invoice.get('status'),
    });
    const amountCents = amount * 100;
    await prisma.invoice.update({
      where: {
        id: id,
      },
      data: {
        customerId,
        amount: amountCents,
        status,
      },
    });
  } catch (error) {
    return { message: 'error during creating invoice' };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: {
        id,
      },
    });
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    return { message: 'error during creating invoice' };
  }
}
