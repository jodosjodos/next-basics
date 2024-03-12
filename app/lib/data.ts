// Import PrismaClient
import { PrismaClient } from '@prisma/client';
import {unstable_noStore as noStore} from "next/cache"
const dynamic = "forc"
// Initialize PrismaClient
const prisma = new PrismaClient();

// Update fetchRevenue function
export async function fetchRevenue() {
  try {
    noStore()
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const revenueData = await prisma.revenue.findMany();
    console.log('Data fetch completed after 3 seconds.');
    return revenueData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// Update fetchLatestInvoices function
export async function fetchLatestInvoices() {
  try {
    noStore()
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const latestInvoices = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true, // Convert amount to string
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });
    console.log('Data fetch completed after 3 seconds.');
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}
// Update fetchCardData function
export async function fetchCardData() {
  try {
    noStore()
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const numberOfInvoices = await prisma.invoice.count();
    const numberOfCustomers = await prisma.customer.count();
    const totalPaidInvoices = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'pending',
      },
    });
    const totalPendingInvoices = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'pending',
      },
    });
    console.log('Data fetch completed after 3 seconds.');
    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices: totalPaidInvoices?._sum?.amount??0,
      totalPendingInvoices: totalPendingInvoices?._sum?.amount??0,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// Update fetchFilteredInvoices function
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore()

  const ITEMS_PER_PAGE = 6;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const filteredInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { amount:Number(query)|| undefined }, // Parse query to number for amount
          { status: { contains: query } },
          { customer: { name: { contains: query } } },
          { customer: { email: { contains: query } } },
        ],
      },
      include: {
        customer: {
          select: {
            id:true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });
console.log('Data fetch completed after 3 seconds.');
    return filteredInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}
// Update fetchInvoicesPages function
export async function fetchInvoicesPages(query: string) {
  try {
    noStore()
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const count = await prisma.invoice.count({
      where: {
        OR: [
          { amount:  parseInt( query) || undefined },
          { status: { contains: query } },
          { customer: { name: { contains: query } } },
          { customer: { email: { contains: query } } },
        ],
      },
    });
    const ITEMS_PER_PAGE = 6;
    console.log('Data fetch completed after 3 seconds.');
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

// Update fetchInvoiceById function
export async function fetchInvoiceById(id: string) {
  try {
    noStore()
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found.');
    }
    console.log('Data fetch completed after 3 seconds.');
    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
  }
}
