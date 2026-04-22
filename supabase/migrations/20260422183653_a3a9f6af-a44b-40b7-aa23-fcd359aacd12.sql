
-- Routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  origin_id TEXT NOT NULL,
  origin_name TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  transport_types TEXT[] NOT NULL DEFAULT '{}',
  notification_type TEXT NOT NULL DEFAULT 'both',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_routes_user_id ON public.routes(user_id);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routes"
  ON public.routes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
  ON public.routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON public.routes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON public.routes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Saved connections (a route can have many connections, e.g. morning + evening)
CREATE TABLE public.saved_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  weekdays TEXT[] NOT NULL DEFAULT '{}',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_connections_route_id ON public.saved_connections(route_id);
CREATE INDEX idx_saved_connections_user_id ON public.saved_connections(user_id);

ALTER TABLE public.saved_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
  ON public.saved_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
  ON public.saved_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON public.saved_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
  ON public.saved_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved legs (each connection has 1+ legs / Teilstrecken)
CREATE TABLE public.saved_legs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.saved_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  leg_index INT NOT NULL,
  origin_id TEXT NOT NULL,
  origin_name TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  planned_departure TEXT NOT NULL,
  planned_arrival TEXT NOT NULL,
  line_name TEXT NOT NULL,
  product_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_legs_connection_id ON public.saved_legs(connection_id);
CREATE INDEX idx_saved_legs_user_id ON public.saved_legs(user_id);

ALTER TABLE public.saved_legs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own legs"
  ON public.saved_legs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legs"
  ON public.saved_legs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legs"
  ON public.saved_legs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legs"
  ON public.saved_legs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
