import { useRef, useState } from "react";
import { Upload, Loader2, Camera, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlateBadge } from "./PlateBadge";

interface Result {
  plate_number: string;
  confidence: number;
  vehicle_type: string;
  vehicle_color: string;
  image_url: string;
}

export function UploadCard({ onLogged }: { onLogged: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("plates").upload(path, file, {
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("plates").getPublicUrl(path);
      const imageUrl = pub.publicUrl;

      const { data, error } = await supabase.functions.invoke("recognize-plate", {
        body: { imageUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { error: insErr } = await supabase.from("vehicle_logs").insert({
        plate_number: data.plate_number,
        confidence: data.confidence,
        vehicle_type: data.vehicle_type,
        vehicle_color: data.vehicle_color,
        image_url: imageUrl,
      });
      if (insErr) throw insErr;

      setResult({ ...data, image_url: imageUrl });
      toast.success(`Plate detected: ${data.plate_number}`);
      onLogged();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Recognition failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Recognize a plate</h2>
      </div>

      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`relative grid place-items-center rounded-xl border-2 border-dashed border-border bg-[var(--gradient-subtle)] p-8 transition cursor-pointer hover:border-primary/50 ${
          busy ? "opacity-70 pointer-events-none" : ""
        }`}
        style={{ minHeight: 240 }}
      >
        {preview ? (
          <img src={preview} alt="upload preview" className="max-h-56 rounded-lg object-contain" />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Drop a vehicle photo here</p>
            <p className="text-sm text-muted-foreground">or click to browse — JPG, PNG up to 10MB</p>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing image…
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={() => inputRef.current?.click()} disabled={busy} className="flex-1">
          <Upload className="h-4 w-4" /> Upload image
        </Button>
        {result && (
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setPreview(null);
            }}
          >
            New scan
          </Button>
        )}
      </div>

      {result && (
        <div className="mt-5 rounded-xl border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> Recognition complete
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PlateBadge plate={result.plate_number} size="lg" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <Stat label="Confidence" value={`${Math.round(result.confidence * 100)}%`} />
              <Stat label="Type" value={result.vehicle_type} />
              <Stat label="Color" value={result.vehicle_color} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
