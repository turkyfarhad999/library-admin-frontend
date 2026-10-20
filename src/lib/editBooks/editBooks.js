'use server'

import { revalidatePath } from "next/cache";

export const editBooks=async(formdata,id)=>{
    const res = await fetch(`${process.env.BACKEND_URL}/books/${id}`,
        {
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(formdata)
        }
    )
    const data=await res.json();
    if(res.ok)revalidatePath('/books')
    return data;
}
export const editCopies=async(formdata,id)=>{
     const res = await fetch(`${process.env.BACKEND_URL}/category/${id}`,
        {
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(formdata)
        }
    )
    const data=await res.json();
    if(res.ok)revalidatePath('/copies')
    return data;
}
export const returnLoan = async ({ loanId, returnDate, payNow }) => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/loans/${Number(loanId)}/return`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnDate, payNow }),
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data?.error || 'Failed to return book' }
    }
    revalidatePath('/loans')
    revalidatePath('/books')
    revalidatePath('/category')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { error: 'Could not reach the server' }
  }
}

export const payLoanFine = async (loanId) => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/loans/${Number(loanId)}/pay-fine`, {
      method: 'PATCH',
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: data?.error || 'Failed to mark fine as paid' }
    }
    revalidatePath('/loans')
    return { success: true }
  } catch (error) {
    return { error: 'Could not reach the server' }
  }
}