import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/Components/Sidebar/Sidebar";
import { connection } from "next/server";

export const instant = false;

export default async function AdminLayout({ children }) {
  await connection()
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }
//  console.log(session)

  return <Sidebar>{children}</Sidebar>;
}