'use client'
import { postCopies, postNewBook } from '@/lib/postData/postData';
import React, { useMemo, useRef, useState } from 'react';

const AddBook = ({books=[]}) => {
    console.log("from addbook",books)

    // দ্বিতীয় মডালের জন্য: সার্চের লেখা আর বেছে নেওয়া বই
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState(null);

    // টোস্ট: { type: 'success' | 'error', message: '...' }
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    const showToast = (type, message) => {
        clearTimeout(timerRef.current);
        setToast({ type, message });
        timerRef.current = setTimeout(() => setToast(null), 3000);
    };

    // checkbox-মডাল বন্ধ করা
    const closeModal = (id) => {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    };

    // সার্চ অনুযায়ী বইয়ের তালিকা (নাম, লেখক বা ক্যাটাগরি দিয়ে)
    const filtered = useMemo(() => {
        const source = Array.isArray(books) ? books.filter(Boolean) : [];
        const q = query.trim().toLowerCase();
        if (!q) return source;
        return source.filter((b) =>
            [b.Name, b.Author, b.Catagory].some((v) => v?.toLowerCase().includes(q))
        );
    }, [books, query]);

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(form));

        try {
            const result = await postNewBook(data);
            if (result?.error) return showToast('error', result.error);

            showToast('success', 'বই সফলভাবে যোগ হয়েছে');
            form.reset();
            closeModal('new-book-modal');
        } catch {
            showToast('error', 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন');
        }
    };

    const handleCopiesSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target)); // { bookId, count }

        try {
            const result = await postCopies(data); // অবজেক্ট পাঠাতে হবে
            if (result?.error) return showToast('error', result.error);

            showToast('success', `${result.added}টি কপি যোগ হয়েছে`);
            setSelected(null);
            setQuery('');
            closeModal('existing-book-modal');
        } catch {
            showToast('error', 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন');
        }
    };

    return (
      <div className="p-4">
            {/* টোস্ট */}
            {toast && (
                <div className="toast toast-top toast-end" style={{ zIndex: 1000 }}>
                    <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">Books</h1>

            {/* দুটি অপশন */}
            <div className="flex flex-wrap gap-3">
                <label htmlFor="new-book-modal" className="btn btn-primary">
                    Add New Book
                </label>
                <label htmlFor="existing-book-modal" className="btn btn-outline">
                    Add Existing Book
                </label>
            </div>

            {/* ---------- Modal ১: নতুন বই ---------- */}
            <input type="checkbox" id="new-book-modal" className="modal-toggle" />
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <h3 className="text-lg font-bold mb-4">Add New Book</h3>

                    <form onSubmit={handleBookSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            name="Name"
                            placeholder="Book name"
                            className="input w-full"
                        />
                        <input
                            type="text"
                            name="Author"
                            placeholder="Author"
                            className="input w-full"
                        />
                        <input
                            type="text"
                            name="Catagory"
                            placeholder="Category"
                            className="input w-full"
                        />
                        <input
                            type="number"
                            name="copies"
                            min={1}
                            defaultValue={1}
                            placeholder="Number of copies"
                            className="input w-full"
                        />

                        <div className="modal-action">
                            <label htmlFor="new-book-modal" className="btn">
                                Cancel
                            </label>
                            <button type="submit" className="btn btn-primary">
                                Add Book
                            </button>
                        </div>
                    </form>
                </div>
                <label className="modal-backdrop" htmlFor="new-book-modal">
                    Close
                </label>
            </div>

            {/* ---------- Modal ২: আগের বই ---------- */}
            <input type="checkbox" id="existing-book-modal" className="modal-toggle" />
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <h3 className="text-lg font-bold mb-4">Add Existing Book</h3>

                    <form onSubmit={handleCopiesSubmit} className="flex flex-col gap-3">
                        {/* সার্চ বক্স */}
                        <input
                            type="search"
                            placeholder="Search by name, author or category"
                            className="input w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        {/* বইয়ের তালিকা */}
                        <ul className="menu bg-base-200 rounded-box w-full max-h-64 overflow-y-auto flex-nowrap">
                            {filtered.length === 0 && (
                                <li className="p-3 text-sm opacity-60">কোনো বই পাওয়া যায়নি</li>
                            )}

                            {filtered.map((b) => (
                                <li key={b.id}>
                                    <button
                                        type="button"
                                        className={selected?.id === b.id ? 'menu-active' : ''}
                                        onClick={() => setSelected(b)}
                                    >
                                        <span className="flex flex-col items-start">
                                            <span className="font-medium">{b.Name}</span>
                                            <span className="text-xs opacity-60">
                                                {b.Author} · {b.Catagory}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* কোন বই বেছেছেন */}
                        {selected ? (
                            <p className="text-sm">
                                বেছে নেওয়া বই: <b>{selected.Name}</b>
                            </p>
                        ) : (
                            <p className="text-sm opacity-60">একটি বই বেছে নিন</p>
                        )}

                        {/* ফর্মের ডাটায় বইয়ের id যাওয়ার জন্য */}
                        <input type="hidden" name="bookId" value={selected?.id ?? ''} />

                        <input
                            type="number"
                            name="count"
                            min={1}
                            defaultValue={1}
                            placeholder="Number of copies"
                            className="input w-full"
                            disabled={!selected}
                        />

                        <div className="modal-action">
                            <label htmlFor="existing-book-modal" className="btn">
                                Cancel
                            </label>
                            <button type="submit" className="btn btn-primary" disabled={!selected}>
                                Add Copies
                            </button>
                        </div>
                    </form>
                </div>
                <label className="modal-backdrop" htmlFor="existing-book-modal">
                    Close
                </label>
            </div>
        </div>
    );
};

export default AddBook;