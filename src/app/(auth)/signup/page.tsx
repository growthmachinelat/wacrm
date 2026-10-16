import { redirect } from "next/navigation";

// Public registration is disabled — accounts are provisioned exclusively
// by the publisher via /api/admin/users.
export default function SignupPage() {
  redirect("/login");
}
