import { Suspense } from 'react';
import AddLoan from './AddLoan';
import LoanTable from './LoanTable';
import { getBook, getLoans, getUsers } from '@/lib/getdata/getBooks';

async function LoansContent() {
  // TODO: fetch loans, members, books (Promise.all)
  const loans = await getLoans()
  console.log(loans)
  const members = await getUsers();
  const books = await getBook();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AddLoan members={members} books={books} />
      </div>
      <LoanTable loans={loans} />
    </>
  );
}

function LoansSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton ml-auto h-10 w-48" />
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-64 w-full" />
    </div>
  );
}

export default function LoansPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-bold">Loans</h1>
      <Suspense fallback={<LoansSkeleton />}>
        <LoansContent />
      </Suspense>
    </div>
  );
}