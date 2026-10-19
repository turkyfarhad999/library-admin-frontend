'use client';

import React, { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Search, Trash2 } from 'lucide-react';
import { editBooks } from '@/lib/editBooks/editBooks';

// key = schema-র ফিল্ডের নাম, label = টেবিলে যা দেখাবে
const columns = [
    { key: 'Name', label: 'Name' },
    { key: 'Author', label: 'Author' },
    { key: 'Catagory', label: 'Category' },
    { key: 'availableCopies', label: 'Available', numeric: true },
];

const Booktable = ({ books = [] }) => {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState({ key: null, dir: 'asc' });
    const [editBook, setEditBook] = useState(null); // এডিট মডালে যে বই খোলা আছে
    const [deleteBook, setDeleteBook] = useState(null); // ডিলিট নিশ্চিত করার বই

    // টোস্ট: { type: 'success' | 'error', message: '...' }
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    const showToast = (type, message) => {
        clearTimeout(timerRef.current);
        setToast({ type, message });
        timerRef.current = setTimeout(() => setToast(null), 3000);
    };

    // সার্চ + সর্ট একসাথে
    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();

        // প্রতিটি বইয়ের Copies অ্যারে থেকে মোট আর available কপি গোনা
        const source = (Array.isArray(books) ? books.filter(Boolean) : []).map((b) => {
            const copies = Array.isArray(b.Copies) ? b.Copies : [];
            return {
                ...b,
                totalCopies: copies.length,
                availableCopies: copies.filter((c) => c.Status === 'ACTIVE').length,
            };
        });

        const list = q
            ? source.filter((b) =>
                  [b.Name, b.Author, b.Catagory].some((v) => v?.toLowerCase().includes(q))
              )
            : [...source];

        if (sort.key) {
            list.sort((a, b) => {
                const col = columns.find((c) => c.key === sort.key);
                const result = col?.numeric
                    ? (Number(a[sort.key]) || 0) - (Number(b[sort.key]) || 0)
                    : String(a[sort.key] ?? '').localeCompare(
                          String(b[sort.key] ?? ''),
                          undefined,
                          { sensitivity: 'base' }
                      );
                return sort.dir === 'asc' ? result : -result;
            });
        }

        return list;
    }, [books, query, sort]);

    // একই কলামে আবার চাপলে asc <-> desc
    const toggleSort = (key) => {
        setSort((prev) =>
            prev.key === key
                ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                : { key, dir: 'asc' }
        );
    };

    const SortIcon = ({ colKey }) => {
        if (sort.key !== colKey) return <ArrowUpDown size={14} className="opacity-40" />;
        return sort.dir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    // ---------- এই দুটি ফাংশন আপনি নিজে লিখবেন ----------
    const handleDelete = () => {
        // delete-এর কাজ আপনি এখানে লিখবেন
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        const id = editBook?.id; // ? দিতে হবে, নইলে React Compiler রেন্ডারের সময় ক্র্যাশ করে

        try {
            const result = await editBooks(data, id);
            if (result?.error) return showToast('error', result.error);

            setEditBook(null); // মডাল বন্ধ
            showToast('success', 'বইয়ের তথ্য বদলানো হয়েছে');
        } catch {
            showToast('error', 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* টোস্ট */}
            {toast && (
                <div className="toast toast-top toast-end" style={{ zIndex: 1000 }}>
                    <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}

            {/* সার্চ বক্স */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="input w-full sm:max-w-xs">
                    <Search size={16} className="opacity-60" />
                    <input
                        type="search"
                        placeholder="Search name, author or category"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
                <span className="text-sm opacity-60">{rows.length} টি বই</span>
            </div>

            {/* টেবিল */}
            <div className="overflow-x-auto rounded-box border border-base-300">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>#</th>
                            {columns.map((col) => (
                                <th key={col.key}>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 font-semibold"
                                        onClick={() => toggleSort(col.key)}
                                    >
                                        {col.label}
                                        <SortIcon colKey={col.key} />
                                    </button>
                                </th>
                            ))}
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 opacity-60">
                                    কোনো বই পাওয়া যায়নি
                                </td>
                            </tr>
                        )}

                        {rows.map((book, index) => (
                            <tr key={book.id}>
                                <td>{index + 1}</td>
                                <td className="font-medium">{book.Name}</td>
                                <td>{book.Author}</td>
                                <td>
                                    <span className="badge badge-outline">{book.Catagory}</span>
                                </td>
                                <td>
                                    <span
                                        className={`badge ${
                                            book.availableCopies > 0 ? 'badge-success' : 'badge-error'
                                        }`}
                                    >
                                        {book.availableCopies} / {book.totalCopies}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => setEditBook(book)}
                                        >
                                            <Pencil size={16} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost text-error"
                                            onClick={() => setDeleteBook(book)}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------- Edit মডাল ---------- */}
            {editBook && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-bold mb-4">Edit Book</h3>

                        {/* key দেওয়ায় অন্য বই খুললে ফর্মের মান নতুন করে বসে */}
                        <form
                            key={editBook.id}
                            onSubmit={handleEditSubmit}
                            className="flex flex-col gap-3"
                        >
                            <input
                                type="text"
                                name="Name"
                                defaultValue={editBook.Name}
                                placeholder="Book name"
                                className="input w-full"
                                required
                            />
                            <input
                                type="text"
                                name="Author"
                                defaultValue={editBook.Author}
                                placeholder="Author"
                                className="input w-full"
                                required
                            />
                            <input
                                type="text"
                                name="Catagory"
                                defaultValue={editBook.Catagory}
                                placeholder="Category"
                                className="input w-full"
                                required
                            />

                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setEditBook(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => setEditBook(null)} />
                </dialog>
            )}

            {/* ---------- Delete নিশ্চিতকরণ মডাল ---------- */}
            {deleteBook && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-bold">বইটি ডিলিট করবেন?</h3>
                        <p className="py-4">
                            <b>{deleteBook.Name}</b> ({deleteBook.Author}) স্থায়ীভাবে মুছে যাবে।
                        </p>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => setDeleteBook(null)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-error" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setDeleteBook(null)} />
                </dialog>
            )}
        </div>
    );
};

export default Booktable;