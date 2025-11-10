
-- Create a table for shadchan payment details
CREATE TABLE public.shadchan_payment_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  zelle_email TEXT,
  zelle_phone TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('email', 'phone')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.shadchan_payment_details ENABLE ROW LEVEL SECURITY;

-- Create policies for shadchan payment details
CREATE POLICY "Shadchanim can view their own payment details" 
  ON public.shadchan_payment_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Shadchanim can create their own payment details" 
  ON public.shadchan_payment_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Shadchanim can update their own payment details" 
  ON public.shadchan_payment_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view payment details for payments" 
  ON public.shadchan_payment_details 
  FOR SELECT 
  USING (true);
