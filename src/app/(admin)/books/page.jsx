
import { getBook } from '@/lib/getdata/getBooks';
import { postNewBook } from '@/lib/postData/postData';
import React from 'react';
import AddBook from './AddBook';
import Booktable from './Booktable';

const page = async() => {
   const books=  await getBook()
   console.log(books)
   
    return (
        <div>
            <AddBook></AddBook>
            <Booktable books={books}></Booktable>
        </div>
    );
};

export default page;