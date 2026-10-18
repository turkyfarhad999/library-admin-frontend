'use server'
export const postNewBook =async(formdata)=>{
const res= await fetch(`${process.env.BACKEND_URL}/books`,{
    method: 'POST',
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(formdata)
})
const data= await res.json()
return data
}