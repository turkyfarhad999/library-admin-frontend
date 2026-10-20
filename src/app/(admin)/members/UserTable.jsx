'use client';

import React, { useState } from 'react';
import { Search, BookOpen, Users } from 'lucide-react';

const UserTable = ({ users }) => {
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter((user) =>
        `${user.name ?? ''} ${user.email ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );
     
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                            <Users size={22} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Users
                            </p>
                            <h2 className="text-2xl font-bold">
                                {users.length}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                            <Search size={22} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Matching Users
                            </p>
                            <h2 className="text-2xl font-bold">
                                {filteredUsers.length}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-5 py-4">User</th>
                            <th className="px-5 py-4">Email</th>
                            <th className="px-5 py-4">Books on Loan</th>
                            <th className="px-5 py-4">Joined</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr
                                key={user.id}
                                className="transition hover:bg-gray-50"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {user.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                ID: {user.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-gray-600">
                                    {user.email}
                                </td>

                                <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                                        <BookOpen size={15} />
                                         {user.loan.length}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString(
                                              'en-GB'
                                          )
                                        : 'N/A'}
                                </td>
                            </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-5 py-10 text-center text-gray-500"
                                >
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
            </p>
        </div>
    );
};

export default UserTable;