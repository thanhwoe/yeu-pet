import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Login (stub)</h1>
      <p className="text-sm text-base-content/70">
        Port from <code>apps/mobile/app/(auth)/login.tsx</code> and{" "}
        <code>services/auth.ts</code>.
      </p>
      <Link to="/" className="btn btn-ghost">
        Back
      </Link>
    </main>
  );
}
