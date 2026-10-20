import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/Components/Sidebar/Sidebar";
import { connection } from "next/server";

export const instant = false;
async function getSessionWithRetry(h) {
  try {
    return await auth.api.getSession({ headers: h });   // প্রথম চেষ্টা
  } catch {
    return await auth.api.getSession({ headers: h });   // ব্যর্থ হলে দ্বিতীয় চেষ্টা
  }
}
export default async function AdminLayout({ children }) {
  await connection()
 const session = await getSessionWithRetry(await headers())

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }
//  console.log(session)

  return <Sidebar>{children}</Sidebar>;
}