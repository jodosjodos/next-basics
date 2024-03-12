// Import PrismaClient
import { PrismaClient } from '@prisma/client';

// Initialize PrismaClient
const prisma = new PrismaClient();

// Update fetchRevenue function
export async function fetchRevenue() {
  try {
    const revenueData = await prisma.revenue.findMany();
    return revenueData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// Update fetchLatestInvoices function
export async function fetchLatestInvoices() {
  try {
    const latestInvoices = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
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
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// Update fetchCardData function
export async function fetchCardData() {
  try {
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

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices: totalPaidInvoices._sum.amount,
      totalPendingInvoices: totalPendingInvoices._sum.amount,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
const ITEMS_PER_PAGE = 6;

// Update fetchFilteredInvoices function
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const ITEMS_PER_PAGE = 6;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const filteredInvoices = await prisma.invoice.findMany({
      where: {
        OR: [
          { amount: parseInt(query) || undefined }, // Parse query to number for amount
          { status: { contains: query } },
          { customer: { name: { contains: query } } },
          { customer: { email: { contains: query } } },
        ],
      },
      include: {
        customer: {
          select: {
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

    return filteredInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}
// Update fetchInvoicesPages function
export async function fetchInvoicesPages(query: string) {
  try {
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
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found.');
    }

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
  }
}
