import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Sign in to BSP Feedback
          </h1>
          <p className="text-sm text-slate-500">
            Create projects, forms, and QR codes to capture customer feedback.
          </p>
        </div>
        <SignInForm />
        <p className="text-center text-xs text-slate-400">
          By continuing you agree to our{" "}
          <a href="#" className="font-medium text-blue-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-blue-600">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
