import React from 'react';
import UserTable from './UserTable';
import { getUsers } from '@/lib/getdata/getBooks';


const page = async () => {
    const users = await getUsers();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage library members and their borrowed books.
                </p>
            </div>

            <UserTable users={users} />
        </div>
    );
};

export default page;