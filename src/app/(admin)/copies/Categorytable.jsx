'use client';

import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Search, Trash2 } from 'lucide-react';
import { editCopies } from '@/lib/editBooks/editBooks';
import { deleteCopies } from '@/lib/deleteBooks/deleteBooks';

// key = টেবিলের ফিল্ডের নাম, label = হেডারে যা দেখাবে
const columns = [
    { key: 'id', label: 'Copy ID', numeric: true },
    { key: 'bookName', label: 'Book Name' },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'Status', label: 'Status' },
];

// schema-র BookStatus enum
const STATUSES = ['ACTIVE', 'ONLOAN', 'LOST'];

const statusBadge = (status) =>
    status === 'ACTIVE' ? 'badge-success' : status === 'LOST' ? 'badge-error' : 'badge-warning';

const Catagorytable = ({ books = [] }) => {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sort, setSort] = useState({ key: null, dir: 'asc' });
    const [copyToEdit, setCopyToEdit] = useState(null); // এডিট মডালে যে কপি খোলা আছে
    const [copyToDelete, setCopyToDelete] = useState(null); // ডিলিট নিশ্চিত করার কপি

    // টোস্ট: { type: 'success' | 'error', message: '...' }
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    const showToast = (type, message) => {
        clearTimeout(timerRef.current);
        setToast({ type, message });
        timerRef.current = setTimeout(() => setToast(null), 3000);
    };

    // প্রতিটি বইয়ের কপিগুলোকে একটি সমতল তালিকায় এনে সার্চ + ফিল্টার + সর্ট
    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();

        const all = (Array.isArray(books) ? books.filter(Boolean) : []).flatMap((book) =>
            (Array.isArray(book.Copies) ? book.Copies : []).map((copy) => ({
                ...copy,
                bookName: book.Name,
                author: book.Author,
                category: book.Catagory,
            }))
        );

        const list = all.filter((copy) => {
            if (statusFilter !== 'ALL' && copy.Status !== statusFilter) return false;
            if (!q) return true;
            return [String(copy.id), copy.bookName, copy.author, copy.category].some((v) =>
                (v ?? '').toLowerCase().includes(q)
            );
        });

        if (sort.key) {
            const col = columns.find((c) => c.key === sort.key);
            list.sort((a, b) => {
                const result = col?.numeric
                    ? (Number(a[sort.key]) || 0) - (Number(b[sort.key]) || 0)
                    : String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, {
                          sensitivity: 'base',
                      });
                return sort.dir === 'asc' ? result : -result;
            });
        }

        return list;
    }, [books, query, statusFilter, sort]);

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
    // copyToEdit / copyToDelete শুরুতে null, তাই প্রপার্টি পড়তে ?. দিন (copyToEdit?.id)
    // সফল হলে: setCopyToEdit(null) / setCopyToDelete(null) আর showToast('success', '...')
    const handleEditSubmit = async(e) => {
        e.preventDefault();
        const data= Object.fromEntries(new FormData(e.target))
        
        const id=copyToEdit?.id
        console.log(data,id)
        
        await editCopies(data,id)
        setCopyToEdit(null)
        showToast('success','status changed')
    };

  const handleDelete = async () => {
    const id = copyToDelete?.id

    try {
        const result = await deleteCopies(id)
        if (result?.error) return showToast('error', result.error)

        setCopyToDelete(null)
        showToast('success', 'কপি ডিলিট হয়েছে')
    } catch {
        setCopyToDelete(null)
        showToast('error', 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন')
    }
}

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

            <div>
                <h1 className="text-2xl font-bold">Book Copies</h1>
                <p className="mt-1 text-sm opacity-60">Manage individual copies and their status.</p>
            </div>

            {/* সার্চ আর স্ট্যাটাস ফিল্টার */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                    <label className="input w-full sm:w-72">
                        <Search size={16} className="opacity-60" />
                        <input
                            type="search"
                            placeholder="Search book, author, category or ID"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </label>

                    <select
                        className="select w-full sm:w-40"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All status</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                <span className="text-sm opacity-60">{rows.length} copies found</span>
            </div>

            {/* টেবিল */}
            <div className="overflow-x-auto rounded-box border border-base-300">
                <table className="table table-zebra">
                    <thead>
                        <tr>
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
                                <td colSpan={6} className="py-8 text-center opacity-60">
                                    No copies found.
                                </td>
                            </tr>
                        )}

                        {rows.map((copy) => (
                            <tr key={copy.id}>
                                <td>#{copy.id}</td>
                                <td className="font-medium">{copy.bookName}</td>
                                <td>{copy.author}</td>
                                <td>
                                    <span className="badge badge-outline">{copy.category}</span>
                                </td>
                                <td>
                                    <span className={`badge ${statusBadge(copy.Status)}`}>{copy.Status}</span>
                                </td>
                                <td>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => setCopyToEdit(copy)}
                                        >
                                            <Pencil size={16} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost text-error"
                                            onClick={() => setCopyToDelete(copy)}
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

            {/* ---------- Edit মডাল (status বদলানো) ---------- */}
            {copyToEdit && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-bold">Edit Copy #{copyToEdit.id}</h3>
                        <p className="mb-4 mt-1 text-sm opacity-60">
                            {copyToEdit.bookName} · {copyToEdit.author}
                        </p>

                        {/* key দেওয়ায় অন্য কপি খুললে ফর্মের মান নতুন করে বসে */}
                        <form key={copyToEdit.id} onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="text-sm">Status</span>
                                <select name="Status" defaultValue={copyToEdit.Status} className="select w-full">
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setCopyToEdit(null)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => setCopyToEdit(null)} />
                </dialog>
            )}

            {/* ---------- Delete নিশ্চিতকরণ মডাল ---------- */}
            {copyToDelete && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="text-lg font-bold">কপিটি ডিলিট করবেন?</h3>
                        <p className="py-4">
                            <b>{copyToDelete.bookName}</b>-এর কপি <b>#{copyToDelete.id}</b> স্থায়ীভাবে মুছে যাবে।
                        </p>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => setCopyToDelete(null)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-error" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setCopyToDelete(null)} />
                </dialog>
            )}
        </div>
    );
};

export default Catagorytable;