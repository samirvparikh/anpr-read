
-- Vehicle logs table
CREATE TABLE public.vehicle_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_number TEXT NOT NULL,
  confidence NUMERIC,
  vehicle_type TEXT,
  vehicle_color TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_logs_created_at ON public.vehicle_logs (created_at DESC);
CREATE INDEX idx_vehicle_logs_plate ON public.vehicle_logs (plate_number);

ALTER TABLE public.vehicle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view logs"
  ON public.vehicle_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert logs"
  ON public.vehicle_logs FOR INSERT
  WITH CHECK (true);

-- Storage bucket for plate images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plates', 'plates', true);

CREATE POLICY "Public read plates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plates');

CREATE POLICY "Anyone can upload plates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'plates');
