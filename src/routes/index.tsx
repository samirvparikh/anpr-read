import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScanLine, Activity, Database, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UploadCard } from "@/components/UploadCard";
import { LogsTable } from "@/components/LogsTable";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PlateVision — ANPR Dashboard" },
      {
        name: "description",
        content:
          "Automatic Number Plate Recognition system. Upload vehicle images and instantly extract license plate, type, and color.",
      },
    ],
  }),
});

function Index() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, today: 0, avg: 0 });

  async function loadStats() {
    const { data } = await supabase.from("vehicle_logs").select("confidence,created_at");
    if (!data) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = data.filter((d) => new Date(d.created_at) >= today).length;
    const avg =
      data.length > 0
        ? data.reduce((s, d) => s + (Number(d.confidence) || 0), 0) / data.length
        : 0;
    setStats({ total: data.length, today: todayCount, avg });
  }

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--gradient-primary)] shadow-[var(--shadow-elegant)]">
              <ScanLine className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PlateVision</h1>
              <p className="text-xs text-muted-foreground">ANPR Operations Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-success md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              System online
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Vehicle Recognition Dashboard</h2>
          <p className="mt-1 text-muted-foreground">
            Upload a vehicle image — AI extracts the plate, vehicle type, and color in seconds.
          </p>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Database} label="Total recognitions" value={stats.total.toString()} />
          <StatCard icon={Activity} label="Today" value={stats.today.toString()} />
          <StatCard
            icon={Zap}
            label="Avg confidence"
            value={`${Math.round(stats.avg * 100)}%`}
          />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <UploadCard onLogged={() => setRefreshKey((k) => k + 1)} />
          <InfoCard />
        </section>

        <section>
          <LogsTable refreshKey={refreshKey} />
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          PlateVision · Powered by netsture.com
        </footer>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function InfoCard() {
  const steps = [
    { n: 1, t: "Upload", d: "Drop or select a vehicle image (JPG/PNG)." },
    { n: 2, t: "Detect", d: "AI vision locates and reads the license plate." },
    { n: 3, t: "Enrich", d: "Vehicle type & color are inferred from the image." },
    { n: 4, t: "Log", d: "Result is stored and appears in the recognition log." },
  ];
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 text-lg font-semibold">How it works</h2>
      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--gradient-primary)] text-xs font-bold text-primary-foreground">
              {s.n}
            </span>
            <div>
              <div className="font-medium">{s.t}</div>
              <div className="text-sm text-muted-foreground">{s.d}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
