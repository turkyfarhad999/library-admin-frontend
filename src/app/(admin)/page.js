import {  getBook, getCopies, getLoans, getUsers } from "@/lib/getdata/getBooks";
import Image from "next/image";


export default async function Home() {
  const booksData= await getBook()
  
  const copies = await  getCopies()
  const loans= await getLoans()
  const users= await getUsers()

  return (
    <div >
    <div className="flex w-full flex-col lg:flex-row">
  <div className="card bg-base-300 rounded-box grid h-32 grow place-items-center">total book = {booksData.length}</div>
  <div className="divider lg:divider-horizontal"></div>
  <div className="card bg-base-300 rounded-box grid h-32 grow place-items-center">total Copies = {copies.length}</div>
  <div className="divider lg:divider-horizontal"></div>
  <div className="card bg-base-300 rounded-box grid h-32 grow place-items-center">total loans = {loans.length}</div>
  <div className="divider lg:divider-horizontal"></div>
  <div className="card bg-base-300 rounded-box grid h-32 grow place-items-center">total users = {users.length}</div>
</div>
    </div>
  );
}
