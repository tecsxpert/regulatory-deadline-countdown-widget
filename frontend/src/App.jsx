import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";
const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL ?? "http://localhost:5000";
const tokenStorageKey = "tool87_access_token";

function App() {
  const [health, setHealth] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoadingHealth(true);
      setLoadingDeadlines(true);
      setErrorMessage("");

      try {
        const [backendHealth, aiHealth] = await Promise.allSettled([
          axios.get(`${apiBaseUrl}/actuator/health`),
          axios.get(`${aiServiceUrl}/health`),
        ]);

        if (!isMounted) {
          return;
        }

        setHealth({
          backend: backendHealth.status === "fulfilled" ? "UP" : "DOWN",
          aiService: aiHealth.status === "fulfilled" ? "UP" : "DOWN",
        });
      } catch (error) {
        if (isMounted) {
          setErrorMessage("Unable to load service health right now.");
        }
      } finally {
        if (isMounted) {
          setLoadingHealth(false);
        }
      }

      const accessToken = window.localStorage.getItem(tokenStorageKey);
      if (!accessToken) {
        if (isMounted) {
          setAuthRequired(true);
          setDeadlines([]);
          setLoadingDeadlines(false);
        }
        return;
      }

      try {
        const response = await axios.get(`${apiBaseUrl}/api/v1/deadlines/all`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: 0,
            size: 8,
            sortBy: "deadlineDate",
          },
        });

        if (!isMounted) {
          return;
        }

        setDeadlines(response.data?.content ?? []);
        setAuthRequired(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const status = error.response?.status;
        if (status === 401 || status === 403) {
          setAuthRequired(true);
          setDeadlines([]);
        } else {
          setErrorMessage("Deadline data could not be loaded. Please retry once the backend is available.");
        }
      } finally {
        if (isMounted) {
          setLoadingDeadlines(false);
        }
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const urgentCount = deadlines.filter((deadline) => deadline.priority === "HIGH").length;
    const upcomingCount = deadlines.filter((deadline) => deadline.status === "UPCOMING").length;
    return {
      total: deadlines.length,
      urgent: urgentCount,
      upcoming: upcomingCount,
    };
  }, [deadlines]);

  return (
    <main className="min-h-screen bg-[#F5F8FC] text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8 grid gap-6 rounded-[32px] bg-[#1B4F8A] p-8 text-white shadow-xl shadow-slate-300/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-medium tracking-wide text-white">
              Tool 87 Dashboard
            </span>
            <span className="rounded-full border border-white/25 px-4 py-2 text-sm text-white/90">
              Day 12 brand refresh
            </span>
          </div>
          <div className="grid gap-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Regulatory Deadline Countdown Widget
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">
              A cleaner, branded dashboard for tracking compliance records with stronger spacing, touch targets,
              and seeded data support.
            </p>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {loadingHealth ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Active records" value={summary.total} accent="bg-[#E8F0FA]" />
              <StatCard label="Upcoming deadlines" value={summary.upcoming} accent="bg-[#F2F7FD]" />
              <StatCard label="Urgent priority items" value={summary.urgent} accent="bg-[#FFF1E8]" />
            </>
          )}
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <ServiceStatusCard
            title="Spring Boot backend"
            status={health?.backend}
            loading={loadingHealth}
            description={`Health endpoint: ${apiBaseUrl}/actuator/health`}
          />
          <ServiceStatusCard
            title="AI reminder service"
            status={health?.aiService}
            loading={loadingHealth}
            description={`Health endpoint: ${aiServiceUrl}/health`}
          />
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/70">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Seeded deadline preview</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                First eight records from the upgraded 30-record backend seeder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[48px] rounded-full bg-[#1B4F8A] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#143d6a]"
            >
              Refresh view
            </button>
          </div>

          {errorMessage ? <ErrorState message={errorMessage} /> : null}

          {loadingDeadlines ? (
            <div className="grid gap-4">
              <DeadlineSkeleton />
              <DeadlineSkeleton />
              <DeadlineSkeleton />
            </div>
          ) : authRequired ? (
            <EmptyState
              title="Secure data needs login"
              message="Use a seeded login: admin@tool87.com, manager@tool87.com, or user@tool87.com with password Password@123. Save the JWT as tool87_access_token to unlock the protected list."
            />
          ) : deadlines.length === 0 ? (
            <EmptyState
              title="No active deadlines yet"
              message="The backend is reachable, but the deadline list is empty. Restart the backend once to trigger the 30-record seeder."
            />
          ) : (
            <div className="grid gap-4">
              {deadlines.map((deadline) => (
                <article
                  key={deadline.id}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 transition hover:border-[#1B4F8A]/30 hover:bg-white"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div className="grid gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{deadline.title}</h3>
                      <p className="text-sm text-slate-500">
                        {deadline.regulatoryBody} | {deadline.jurisdiction}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <Badge tone="primary">{deadline.status}</Badge>
                      <Badge tone={deadline.priority === "HIGH" ? "rose" : "amber"}>
                        {deadline.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="mb-4 text-sm leading-6 text-slate-600">{deadline.description}</p>
                  <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
                    <Detail label="Deadline" value={deadline.deadlineDate} />
                    <Detail label="Reminder" value={deadline.reminderDate ?? "Not set"} />
                    <Detail label="Owner" value={deadline.ownerName} />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <article className={`rounded-[24px] ${accent} p-6 shadow-sm`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function ServiceStatusCard({ title, status, description, loading }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {loading ? (
        <div className="mt-4 h-12 animate-pulse rounded-2xl bg-slate-200" />
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <span
            className={`inline-flex h-3 w-3 rounded-full ${
              status === "UP" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span className="text-lg font-semibold text-slate-900">{status ?? "UNKNOWN"}</span>
        </div>
      )}
      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="mb-6 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
      {message}
    </div>
  );
}

function Badge({ children, tone }) {
  const classes = {
    primary: "bg-[#D9E9FA] text-[#1B4F8A]",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={`inline-flex min-h-[44px] items-center rounded-full px-4 py-3 ${classes[tone] ?? classes.primary}`}>
      {children}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function StatSkeleton() {
  return <div className="h-32 animate-pulse rounded-[24px] bg-slate-200" />;
}

function DeadlineSkeleton() {
  return (
    <div className="rounded-[24px] border border-slate-200 p-6">
      <div className="mb-4 h-5 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mb-4 h-4 w-full animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-12 animate-pulse rounded bg-slate-200" />
        <div className="h-12 animate-pulse rounded bg-slate-200" />
        <div className="h-12 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default App;
