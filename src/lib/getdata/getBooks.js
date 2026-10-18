'use cache'
export const getBook =async()=>{
    
    const res = await fetch(`${process.env.BACKEND_URL}/books`)
    const data=await res.json()
    return data
}
export const getCopies =async()=>{
    
    const res = await fetch(`${process.env.BACKEND_URL}/category`)
    const data=await res.json()
    return data
}
export const getLoans =async()=>{
    
    const res = await fetch(`${process.env.BACKEND_URL}/loans`)
    const data=await res.json()
    return data
}
export const getUsers =async()=>{
    
    const res = await fetch(`${process.env.BACKEND_URL}/user`)
    const data=await res.json()
    return data
}