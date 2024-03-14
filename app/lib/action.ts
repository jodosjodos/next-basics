'use server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
// schema
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'please select a customer',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'amount must be greater than zero' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'please select  status of invoice',
  }),
  date: z.date(),
});

//  state
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const prisma = new PrismaClient();
const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(prevData: State, invoice: FormData) {
  const validFields = CreateInvoice.safeParse({
    customerId: invoice.get('customerId'),
    amount: invoice.get('amount'),
    status: invoice.get('status'),
  });
  if (!validFields.success) {
    return {
      errors: validFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { amount, customerId, status } = validFields.data;
  const amountInCent = amount * 100;
  const date = new Date().toISOString();
  try {
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
export async function updateInvoice(
  id: string,
  prevState: State,
  invoice: FormData,
) {
  try {
    const validFields = UpdateInvoice.safeParse({
      customerId: invoice.get('customerId'),
      amount: invoice.get('amount'),
      status: invoice.get('status'),
    });
    if (!validFields.success) {
      return {
        message: 'error during  editing invoice',
        errors: validFields.error.flatten().fieldErrors,
      };
    }
    const { amount, customerId, status } = validFields.data;
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

 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}