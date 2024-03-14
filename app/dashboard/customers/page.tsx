import {  getFormattedCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';

export default async function page() {
const formattedCustomers = await getFormattedCustomers()
  return (
    <div>
      <CustomersTable customers={formattedCustomers} />
    </div>
  );
}
