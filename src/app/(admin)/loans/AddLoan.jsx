'use client';

import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';

const MAX_BOOKS_PER_LOAN = 5;

export default function AddLoan({ members = [], books = [] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('existing'); // 'existing' | 'new'
  const [selectedMember] = useState(null); // TODO: setSelectedMember
  const [toast] = useState(null); // TODO: setToast + 3 second timer
  // TODO: states (memberSearch, bookSearch, newName, newEmail, selectedBookIds, returnDate, submitting)

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
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
                onClick={() => setOpen(false)}
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

              {/* Tab 1: Existing member */}
              {tab === 'existing' && (
                <div>
                  <label className="input input-bordered mb-2 flex w-full items-center gap-2">
                    <Search size={16} />
                    <input type="text" className="grow" placeholder="Search by name or email" />
                  </label>

                  <ul className="menu max-h-48 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 p-1">
                    {members.map((m) => (
                      <li key={m.id}>
                        {/* TODO: onClick select, active class if selected */}
                        <button type="button" className="flex flex-col items-start gap-0">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-xs opacity-70">{m.email}</span>
                        </button>
                      </li>
                    ))}
                    {members.length === 0 && (
                      <li className="p-3 text-center text-sm opacity-60">No members found</li>
                    )}
                  </ul>

                  {selectedMember && (
                    <div className="mt-2 flex items-center justify-between rounded-box bg-base-200 px-3 py-2 text-sm">
                      <span>
                        Selected: <b>{selectedMember?.name}</b> ({selectedMember?.email})
                      </span>
                      {/* TODO: onClick clear selection */}
                      <button type="button" className="btn btn-ghost btn-xs">
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: New member */}
              {tab === 'new' && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* TODO: value + onChange for both */}
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Full name"
                  />
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="Email"
                  />
                </div>
              )}
            </section>

            {/* ---------- Books section ---------- */}
            <section className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">Books</h4>
                {/* TODO: real selected count */}
                <span className="text-sm opacity-70">0 / {MAX_BOOKS_PER_LOAN} selected</span>
              </div>

              <label className="input input-bordered mb-2 flex w-full items-center gap-2">
                <Search size={16} />
                <input type="text" className="grow" placeholder="Search by book name or author" />
              </label>

              <ul className="menu max-h-56 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 p-1">
                {books.map((b) => (
                  <li key={b.id} className={b.available === 0 ? 'disabled' : ''}>
                    {/* TODO: onClick toggle, active class if selected, disable at limit */}
                    <button
                      type="button"
                      disabled={b.available === 0}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="flex flex-col items-start">
                        <span className="font-medium">{b.Name}</span>
                        <span className="text-xs opacity-70">{b.Author}</span>
                      </span>
                      <span
                        className={`badge ${b.available === 0 ? 'badge-ghost' : 'badge-success badge-outline'}`}
                      >
                        {b.available} available
                      </span>
                    </button>
                  </li>
                ))}
                {books.length === 0 && (
                  <li className="p-3 text-center text-sm opacity-60">No books found</li>
                )}
              </ul>
            </section>

            {/* ---------- Return date ---------- */}
            <section className="mb-6">
              <label className="mb-1 block font-semibold" htmlFor="returnDate">
                Return date
              </label>
              {/* TODO: value, min (today), onChange */}
              <input id="returnDate" type="date" className="input input-bordered w-full" />
            </section>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              {/* TODO: onClick submit (tab === 'existing' ? userId : newUser), disabled + spinner */}
              <button type="button" className="btn btn-primary">
                Create Loan
              </button>
            </div>
          </div>

          <div className="modal-backdrop bg-black/40" onClick={() => setOpen(false)} />
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