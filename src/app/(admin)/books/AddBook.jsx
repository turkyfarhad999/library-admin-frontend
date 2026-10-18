'use client'
import { postNewBook } from '@/lib/postData/postData';
import React from 'react';

const AddBook = () => {
     const handleBookSubmit=(e)=>{
        e.preventDefault();
        const formData= new FormData(e.target)
        const data=Object.fromEntries(formData)
        console.log(data)
        postNewBook(data)

    }
    return (
      <div className="p-4">
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
                            {/* পরে submit ফাংশন এখানে বসবে */}
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

                    <div className="flex flex-col gap-3">
                        {/* সার্চ বক্স */}
                        <input
                            type="search"
                            placeholder="Search by name, author or category"
                            className="input w-full"
                        />

                        {/* বইয়ের তালিকা, পরে এখানে map করে বই বসাবেন */}
                        <ul className="menu bg-base-200 rounded-box w-full max-h-64 overflow-y-auto flex-nowrap">
                            <li>
                                <button type="button">
                                    <span className="flex flex-col items-start">
                                        <span className="font-medium">Book name</span>
                                        <span className="text-xs opacity-60">Author · Category</span>
                                    </span>
                                </button>
                            </li>
                        </ul>

                        <input
                            type="number"
                            name="count"
                            min={1}
                            defaultValue={1}
                            placeholder="Number of copies"
                            className="input w-full"
                        />

                        <div className="modal-action">
                            <label htmlFor="existing-book-modal" className="btn">
                                Cancel
                            </label>
                            {/* পরে submit ফাংশন এখানে বসবে */}
                            <button type="button" className="btn btn-primary">
                                Add Copies
                            </button>
                        </div>
                    </div>
                </div>
                <label className="modal-backdrop" htmlFor="existing-book-modal">
                    Close
                </label>
            </div>
        </div>
    );
};

export default AddBook;