import { AdminLoginForm } from "@/components/AdminLoginForm";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-5xl items-center px-4 py-10 sm:px-6">
      <section className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Admin Access</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">Log in before opening the dashboard</h1>
          <p className="mt-3 text-slate-600">
            QueueLess protects admin controls behind a login page so only authorized staff can create facilities,
            reorder tokens, and manage queue flow.
          </p>
          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-600">What this protects</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Facility creation, service-time overrides, no-show handling, live queue controls, and analytics.
            </p>
          </div>
        </div>

        <AdminLoginForm
          initialError={params.error ?? null}
          redirectTo={params.redirectTo && params.redirectTo.startsWith("/") ? params.redirectTo : "/admin"}
        />
      </section>
    </main>
  );
}
