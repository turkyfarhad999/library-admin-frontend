'use server'
import { revalidatePath } from "next/cache";

export const deleteBooks =async(id)=>{
    const res = await fetch(`${process.env.BACKEND_URL}/books/${id}`,
        {
            method:'DELETE',
        }
    )
    const data = await res.json()
    if(res.ok){
         revalidatePath('/copies')
  revalidatePath('/books')
  revalidatePath('/')
        return data
    }
    else{
        throw new Error(data.message)
    }
    
}
export const deleteCopies = async (id) => {
  const res = await fetch(`${process.env.BACKEND_URL}/category/${id}`, {
    method: 'DELETE',
  })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) return { error: data.error || 'Not deleted' }

  revalidatePath('/copies')
  revalidatePath('/books')
  revalidatePath('/')
  
  return data
}
