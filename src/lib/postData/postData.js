'use server'

import { revalidatePath } from "next/cache"

export const postNewBook =async(formdata)=>{
const res= await fetch(`${process.env.BACKEND_URL}/books`,{
    method: 'POST',
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(formdata)
})
const data= await res.json()
if(res.ok){
    revalidatePath('/books')
}
return data
}
export const postCopies = async ({ bookId, count }) => {
  const res = await fetch(
    `${process.env.BACKEND_URL}/books/${Number(bookId)}/copies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: Number(count) }),
    }
  );
  const data = await res.json();
  if(res.ok){
    revalidatePath('/books')
}
  return data;
};
export const createLoan = async (payload) => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/loans`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data?.error || 'Failed to create loan' }
    }
    revalidatePath('/loans')
    revalidatePath('/books')
    revalidatePath('/category')
    return { success: true, loans: data }
  } catch (error) {
    return { error: 'Could not reach the server' }
  }
}