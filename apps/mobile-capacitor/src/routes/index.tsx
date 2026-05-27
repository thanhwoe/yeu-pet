import { createFileRoute, Link } from "@tanstack/react-router";
import { env } from "@/shared/env";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-base-content">YeuPet</h1>
        <p className="text-sm text-base-content/70">
          Capacitor rebuild skeleton — variant:{" "}
          <span className="badge badge-primary badge-outline">
            {env.appVariant}
          </span>
        </p>
      </header>

      <div className="alert alert-info">
        <span>
          See <code className="font-mono">MIGRATION_PLAN.md</code> for feature
          parity checklist and implementation order.
        </span>
      </div>

      <section className="card bg-base-100 shadow">
        <div className="card-body gap-2">
          <h2 className="card-title text-lg">Planned routes</h2>
          <ul className="list-inside list-disc text-sm">
            <li>Auth, onboarding, home, reminders, services, settings</li>
            <li>Budget, medical records, photos</li>
            <li>Sitter booking (replaces store), subscription</li>
          </ul>
          <p className="text-xs text-base-content/60">
            Deferred: store, clinics, spas, training, doctor AI, VNPay — see
            CHECKLIST.md
          </p>
          <p className="text-xs text-base-content/60">
            API: {env.apiUrl}
          </p>
        </div>
      </section>

      <Link to="/login" className="btn btn-primary">
        Go to login (stub)
      </Link>
    </main>
  );
}
