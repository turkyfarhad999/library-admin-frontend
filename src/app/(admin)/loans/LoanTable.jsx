'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { returnLoan, payLoanFine } from '@/lib/editBooks/editBooks';

const FINE_PER_DAY = 5;

// copy status (loan.copies.Status) -> label + badge style
const STATUS_UI = {
  ACTIVE: { label: 'Available', className: 'badge-success' },
  ONLOAN: { label: 'On loan', className: 'badge-info' },
  LOST: { label: 'Lost', className: 'badge-error' },
};

const dhakaDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Dhaka',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // -> "2026-10-20"

const todayStr = () => dhakaDay.format(new Date());

// "YYYY-MM-DD" -> whole day number
const dayNumber = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

// whole calendar days late (Dhaka time), minimum 0
const lateDaysBetween = (dueDate, endStr) => {
  if (!dueDate || !endStr) return 0;
  return Math.max(0, dayNumber(endStr) - dayNumber(dhakaDay.format(new Date(dueDate))));
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

// what to show in the Fine column
function getFineInfo(loan) {
  if (loan?.SubmitDate) {
    const amount = Number(loan.fineAmount) || 0;
    if (amount <= 0) return { kind: 'none', amount: 0 };
    return loan.findeDue ? { kind: 'due', amount } : { kind: 'cleared', amount };
  }
  // not returned yet: running fine, calculated live in the browser
  const days = lateDaysBetween(loan?.returnDate, todayStr());
  return days > 0
    ? { kind: 'running', amount: days * FINE_PER_DAY, days }
    : { kind: 'none', amount: 0 };
}

function FineCell({ loan }) {
  const fine = getFineInfo(loan);
  if (fine.kind === 'none') return <span className="opacity-60">No fine</span>;
  if (fine.kind === 'cleared') return <span className="text-success">Cleared</span>;
  return (
    <div>
      <div className="font-semibold text-error">{fine.amount} ৳</div>
      <div className="text-xs opacity-70">
        {fine.kind === 'running' ? `${fine.days} days late (running)` : 'Unpaid'}
      </div>
    </div>
  );
}

export default function LoanTable({ loans = [] }) {
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const [loanToReturn, setLoanToReturn] = useState(null); // loan shown in the return modal
  const [returnDate, setReturnDate] = useState(''); // "YYYY-MM-DD"
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'loanDate', dir: 'desc' }); // dir: 'asc' | 'desc'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleLoans = useMemo(() => {
    const q = search.trim().toLowerCase();
    const today = todayStr();

    const matchesFilter = (loan) => {
      const returned = Boolean(loan?.SubmitDate);
      const late = !returned && lateDaysBetween(loan?.returnDate, today) > 0;
      switch (filter) {
        case 'notReturned':
          return !returned;
        case 'overdue':
          return late;
        case 'fineDue':
          return returned && Boolean(loan?.findeDue);
        case 'completed':
          return returned && !loan?.findeDue;
        default:
          return true;
      }
    };

    const rows = loans.filter((loan) => {
      if (!matchesFilter(loan)) return false;
      if (!q) return true;
      return (
        loan?.user?.name?.toLowerCase().includes(q) ||
        loan?.user?.email?.toLowerCase().includes(q) ||
        loan?.copies?.book?.Name?.toLowerCase().includes(q)
      );
    });

    const valueOf = (loan) => {
      switch (sort.key) {
        case 'loanDate':
          return new Date(loan?.CreatedDate).getTime();
        case 'dueDate':
          return new Date(loan?.returnDate).getTime();
        case 'fine': {
          const f = getFineInfo(loan);
          return f.kind === 'cleared' || f.kind === 'none' ? 0 : f.amount;
        }
        case 'status':
          return loan?.copies?.Status ?? '';
        default:
          return 0;
      }
    };

    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [loans, search, filter, sort]);

  function toggleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  function openReturnModal(loan) {
    setLoanToReturn(loan);
    setReturnDate(todayStr());
  }

  function closeReturnModal() {
    if (submitting) return;
    setLoanToReturn(null);
    setReturnDate('');
  }

  // fine preview inside the modal
  const modalLateDays = lateDaysBetween(loanToReturn?.returnDate, returnDate);
  const modalFine = modalLateDays * FINE_PER_DAY;

  async function handleReturn(payNow) {
    if (submitting) return;
    if (!returnDate) {
      setToast({ type: 'error', message: 'Return date is required.' });
      return;
    }

    const owed = modalFine > 0;

    setSubmitting(true);
    const result = await returnLoan({
      loanId: loanToReturn?.id,
      returnDate,
      payNow,
    });
    setSubmitting(false);

    if (result?.error) {
      setToast({ type: 'error', message: result.error }); // modal stays open
      return;
    }

    setLoanToReturn(null);
    setReturnDate('');
    setToast({
      type: 'success',
      message:
        owed && !payNow ? 'Book returned. Fine is still due.' : 'Book returned successfully.',
    });
  }

  async function handlePayFine(loanId) {
    if (submitting) return;

    setSubmitting(true);
    const result = await payLoanFine(loanId);
    setSubmitting(false);

    if (result?.error) {
      setToast({ type: 'error', message: result.error });
      return;
    }
    setToast({ type: 'success', message: 'Fine marked as paid.' });
  }

  return (
    <div>
      {/* ---------- Toolbar ---------- */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="input input-bordered flex w-full items-center gap-2 md:max-w-sm">
          <Search size={16} />
          <input
            type="text"
            className="grow"
            placeholder="Search by member or book"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="select select-bordered w-full md:w-56"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="notReturned">Not returned yet</option>
          <option value="overdue">Overdue</option>
          <option value="fineDue">Fine due (unpaid)</option>
          <option value="completed">Completed</option>
        </select>

        <span className="text-sm opacity-70 md:ml-auto">{visibleLoans.length} loans found</span>
      </div>

      {/* ---------- Table ---------- */}
      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Member</th>
              <th>Book</th>
              <th>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => toggleSort('loanDate')}
                >
                  Loan date <ArrowUpDown size={14} />
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => toggleSort('dueDate')}
                >
                  Due date <ArrowUpDown size={14} />
                </button>
              </th>
              <th>Returned date</th>
              <th>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => toggleSort('status')}
                >
                  Status <ArrowUpDown size={14} />
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => toggleSort('fine')}
                >
                  Fine <ArrowUpDown size={14} />
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleLoans.map((loan) => {
              const copyStatus = loan?.copies?.Status;
              const ui = STATUS_UI[copyStatus] ?? {
                label: copyStatus ?? '—',
                className: 'badge-ghost',
              };
              const isReturned = Boolean(loan?.SubmitDate);
              const isOverdue = !isReturned && lateDaysBetween(loan?.returnDate, todayStr()) > 0;

              return (
                <tr key={loan.id} className={isOverdue ? 'bg-error/10' : ''}>
                  <td>#{loan.id}</td>
                  <td>
                    <div className="font-medium">{loan.user?.name}</div>
                    <div className="text-xs opacity-70">{loan.user?.email}</div>
                  </td>
                  <td>
                    <div className="font-medium">{loan.copies?.book?.Name}</div>
                    <div className="text-xs opacity-70">Copy #{loan.copies?.id}</div>
                  </td>
                  <td>{fmtDate(loan.CreatedDate)}</td>
                  <td>{fmtDate(loan.returnDate)}</td>
                  <td>{fmtDate(loan.SubmitDate)}</td>
                  <td>
                    <span className={`badge ${ui.className}`}>{ui.label}</span>
                  </td>
                  <td>
                    <FineCell loan={loan} />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {!isReturned && (
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          disabled={submitting}
                          onClick={() => openReturnModal(loan)}
                        >
                          Return
                        </button>
                      )}
                      {isReturned && loan?.findeDue && (
                        <button
                          type="button"
                          className="btn btn-warning btn-xs"
                          disabled={submitting}
                          onClick={() => handlePayFine(loan.id)}
                        >
                          Mark fine paid
                        </button>
                      )}
                      {/* no delete button: loan history is permanent */}
                    </div>
                  </td>
                </tr>
              );
            })}

            {visibleLoans.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center opacity-60">
                  No loans found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Return modal ---------- */}
      {loanToReturn && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Return book</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={closeReturnModal}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 space-y-1 text-sm">
              <div>
                <b>{loanToReturn?.copies?.book?.Name}</b> (Copy #{loanToReturn?.copies?.id})
              </div>
              <div className="opacity-70">
                {loanToReturn?.user?.name} · Due: {fmtDate(loanToReturn?.returnDate)}
              </div>
            </div>

            <label className="mb-1 block font-semibold" htmlFor="returnLoanDate">
              Return date
            </label>
            <input
              id="returnLoanDate"
              type="date"
              className="input input-bordered w-full"
              value={returnDate}
              min={dhakaDay.format(new Date(loanToReturn?.CreatedDate))}
              onChange={(e) => setReturnDate(e.target.value)}
            />

            <div className="mt-4 rounded-box bg-base-200 p-3 text-sm">
              {modalFine > 0 ? (
                <>
                  <div>
                    {modalLateDays} days late × {FINE_PER_DAY} ৳
                  </div>
                  <div className="mt-1 text-lg font-bold text-error">Fine: {modalFine} ৳</div>
                </>
              ) : (
                <div className="font-semibold text-success">No fine</div>
              )}
            </div>

            <div className="modal-action">
              {modalFine > 0 ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={submitting}
                    onClick={() => handleReturn(false)}
                  >
                    Pay later
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submitting}
                    onClick={() => handleReturn(true)}
                  >
                    {submitting && <span className="loading loading-spinner loading-sm" />}
                    Pay now
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={submitting}
                  onClick={() => handleReturn(true)}
                >
                  {submitting && <span className="loading loading-spinner loading-sm" />}
                  Confirm return
                </button>
              )}
            </div>
          </div>

          <div className="modal-backdrop bg-black/40" onClick={closeReturnModal} />
        </dialog>
      )}

      {toast && (
        <div className="toast toast-top toast-end z-[1000]">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}