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