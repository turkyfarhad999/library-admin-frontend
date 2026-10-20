'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { createLoan } from '@/lib/postData/postData';

const MAX_BOOKS_PER_LOAN = 5;
const DEFAULT_LOAN_DAYS = 14;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const dhakaDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Dhaka',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}); // -> "2026-10-20"

const todayStr = () => dhakaDay.format(new Date());

const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export default function AddLoan({ members = [], books = [] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('existing'); // 'existing' | 'new'
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [returnDate, setReturnDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // available = only ACTIVE copies (ONLOAN / LOST are not counted)
  const booksWithAvailable = useMemo(
    () =>
      books.map((b) => ({
        ...b,
        available:
          typeof b?.available === 'number'
            ? b.available
            : (b?.Copies?.filter((c) => c?.Status === 'ACTIVE').length ?? 0),
      })),
    [books]
  );

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m?.name?.toLowerCase().includes(q) || m?.email?.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const filteredBooks = useMemo(() => {
    const q = bookSearch.trim().toLowerCase();
    if (!q) return booksWithAvailable;
    return booksWithAvailable.filter(
      (b) => b?.Name?.toLowerCase().includes(q) || b?.Author?.toLowerCase().includes(q)
    );
  }, [booksWithAvailable, bookSearch]);

  const atLimit = selectedBookIds.length >= MAX_BOOKS_PER_LOAN;

  function resetForm() {
    setTab('existing');
    setMemberSearch('');
    setBookSearch('');
    setSelectedMember(null);
    setNewName('');
    setNewEmail('');
    setSelectedBookIds([]);
    setReturnDate('');
  }

  function openModal() {
    resetForm();
    setReturnDate(addDays(todayStr(), DEFAULT_LOAN_DAYS));
    setOpen(true);
  }

  function closeModal() {
    if (submitting) return;
    setOpen(false);
    resetForm();
  }

  function toggleBook(book) {
    if (!book || book.available === 0) return;
    setSelectedBookIds((prev) => {
      if (prev.includes(book.id)) return prev.filter((id) => id !== book.id);
      if (prev.length >= MAX_BOOKS_PER_LOAN) return prev;
      return [...prev, book.id];
    });
  }

  function validate() {
    if (tab === 'existing') {
      if (!selectedMember?.id) return 'Please select a member.';
    } else {
      if (!newName.trim()) return 'Member name is required.';
      if (!EMAIL_RE.test(newEmail.trim())) return 'Please enter a valid email address.';
    }
    if (selectedBookIds.length === 0) return 'Please select at least one book.';
    if (!returnDate) return 'Return date is required.';
    if (returnDate < todayStr()) return 'Return date cannot be before today.';
    return null;
  }

  async function handleSubmit() {
    if (submitting) return;

    const problem = validate();
    if (problem) {
      setToast({ type: 'error', message: problem });
      return;
    }

    const count = selectedBookIds.length;
    const payload =
      tab === 'existing'
        ? { userId: selectedMember?.id, bookIds: selectedBookIds, returnDate }
        : {
            newUser: { name: newName.trim(), email: newEmail.trim().toLowerCase() },
            bookIds: selectedBookIds,
            returnDate,
          };

    setSubmitting(true);
    const result = await createLoan(payload);
    setSubmitting(false);

    if (result?.error) {
      setToast({ type: 'error', message: result.error }); // modal stays open
      return;
    }

    setOpen(false);
    resetForm();
    setToast({
      type: 'success',
      message: `${count} ${count === 1 ? 'book' : 'books'} lent successfully.`,
    });
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={openModal}>
        <Plus size={18} />
        Add Loan
      </button>

      {open && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Add Loan</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            {/* ---------- Member section ---------- */}
            <section className="mb-6">
              <h4 className="mb-2 font-semibold">Member</h4>

              <div role="tablist" className="tabs tabs-boxed mb-3">
                <button
                  type="button"
                  role="tab"
                  className={`tab ${tab === 'existing' ? 'tab-active' : ''}`}
                  onClick={() => setTab('existing')}
                >
                  Existing member
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`tab ${tab === 'new' ? 'tab-active' : ''}`}
                  onClick={() => setTab('new')}
                >
                  New member
                </button>
              </div>

              {tab === 'existing' && (
                <div>
                  <label className="input input-bordered mb-2 flex w-full items-center gap-2">
                    <Search size={16} />
                    <input
                      type="text"
                      className="grow"
                      placeholder="Search by name or email"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </label>

                  <ul className="menu max-h-48 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 p-1">
                    {filteredMembers.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          className={`flex flex-col items-start gap-0 ${
                            selectedMember?.id === m.id ? 'menu-active' : ''
                          }`}
                          onClick={() => setSelectedMember(m)}
                        >
                          <span className="font-medium">{m.name}</span>
                          <span className="text-xs opacity-70">{m.email}</span>
                        </button>
                      </li>
                    ))}
                    {filteredMembers.length === 0 && (
                      <li className="p-3 text-center text-sm opacity-60">No members found</li>
                    )}
                  </ul>

                  {selectedMember && (
                    <div className="mt-2 flex items-center justify-between rounded-box bg-base-200 px-3 py-2 text-sm">
                      <span>
                        Selected: <b>{selectedMember?.name}</b> ({selectedMember?.email})
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setSelectedMember(null)}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}

              {tab === 'new' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              )}
            </section>

            {/* ---------- Books section ---------- */}
            <section className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">Books</h4>
                <span className="text-sm opacity-70">
                  {selectedBookIds.length} / {MAX_BOOKS_PER_LOAN} selected
                </span>
              </div>

              <label className="input input-bordered mb-2 flex w-full items-center gap-2">
                <Search size={16} />
                <input
                  type="text"
                  className="grow"
                  placeholder="Search by book name or author"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
              </label>

              <ul className="menu max-h-56 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 p-1">
                {filteredBooks.map((b) => {
                  const isSelected = selectedBookIds.includes(b.id);
                  const unavailable = b.available === 0;
                  const disabled = unavailable || (atLimit && !isSelected);
                  return (
                    <li key={b.id} className={disabled ? 'disabled' : ''}>
                      <button
                        type="button"
                        disabled={disabled}
                        className={`flex w-full items-center justify-between ${
                          isSelected ? 'menu-active' : ''
                        }`}
                        onClick={() => toggleBook(b)}
                      >
                        <span className="flex flex-col items-start">
                          <span className="font-medium">{b.Name}</span>
                          <span className="text-xs opacity-70">{b.Author}</span>
                        </span>
                        <span
                          className={`badge ${
                            unavailable ? 'badge-error badge-outline' : 'badge-success badge-outline'
                          }`}
                        >
                          {unavailable ? 'Unavailable' : `${b.available} available`}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {filteredBooks.length === 0 && (
                  <li className="p-3 text-center text-sm opacity-60">No books found</li>
                )}
              </ul>
            </section>

            {/* ---------- Return date ---------- */}
            <section className="mb-6">
              <label className="mb-1 block font-semibold" htmlFor="returnDate">
                Return date
              </label>
              <input
                id="returnDate"
                type="date"
                className="input input-bordered w-full"
                value={returnDate}
                min={todayStr()}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </section>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting && <span className="loading loading-spinner loading-sm" />}
                Create Loan
              </button>
            </div>
          </div>

          <div className="modal-backdrop bg-black/40" onClick={closeModal} />
        </dialog>
      )}

      {toast && (
        <div className="toast toast-top toast-end z-[1000]">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}