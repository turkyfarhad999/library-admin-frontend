import LoginForm from "@/Components/Loginform";


export const metadata = {
  title: 'Admin sign in',
};

export default function LoginPage() {
  
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <LoginForm />
    </main>
  );
}