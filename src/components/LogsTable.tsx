import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Car } from "lucide-react";
import { PlateBadge } from "./PlateBadge";

interface Log {
  id: string;
  plate_number: string;
  confidence: number | null;
  vehicle_type: string | null;
  vehicle_color: string | null;
  image_url: string | null;
  created_at: string;
}

export function LogsTable({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("vehicle_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs(data || []);
      setLoading(false);
    })();
  }, [refreshKey]);

  const filtered = logs.filter((l) =>
    q ? l.plate_number.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="rounded-2xl border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b p-5">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recognition log</h2>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {logs.length}
          </span>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plate…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Plate</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Confidence</th>
              <th className="p-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No recognitions yet — upload your first vehicle image above.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-t hover:bg-secondary/30 transition">
                  <td className="p-3">
                    {l.image_url ? (
                      <img
                        src={l.image_url}
                        alt={l.plate_number}
                        className="h-12 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded bg-muted" />
                    )}
                  </td>
                  <td className="p-3">
                    <PlateBadge plate={l.plate_number} size="sm" />
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{l.vehicle_type || "—"}</div>
                    <div className="text-xs text-muted-foreground">{l.vehicle_color || ""}</div>
                  </td>
                  <td className="p-3">
                    <ConfidenceBar value={l.confidence ?? 0} />
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-xs font-medium text-muted-foreground">{pct}%</span>
    </div>
  );
}
