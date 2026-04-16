-- ============================================================
-- ParkPilot WhatsApp Agent tables
-- ============================================================

-- Venue configuration (multi-tenant root)
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number_id text UNIQUE NOT NULL,
  timezone text NOT NULL DEFAULT 'Africa/Accra',
  supported_languages text[] NOT NULL DEFAULT ARRAY['en'],
  brand_voice text NOT NULL DEFAULT 'Friendly, warm, and helpful. Use "we" instead of the venue name. Keep responses concise.',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- FAQs not covered by existing experiences/menu tables
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Temporary closures
CREATE TABLE closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  closure_date date NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- WhatsApp conversation threads
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_venue_phone ON conversations(venue_id, customer_phone);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Every message in and out
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body text NOT NULL,
  intent text CHECK (intent IN ('faq', 'booking', 'complaint', 'order_status', 'availability', 'other')),
  language text,
  confidence numeric(3,2),
  category text,
  sent_by text NOT NULL CHECK (sent_by IN ('customer', 'ai', 'staff')),
  wa_message_id text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at);

-- Human review queue
CREATE TABLE escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved')),
  assigned_to uuid REFERENCES auth.users(id),
  draft_reply text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_escalations_venue_status ON escalations(venue_id, status);

-- Staff WhatsApp permissions
CREATE TABLE staff_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(venue_id, user_id)
);

-- RLS policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_whatsapp ENABLE ROW LEVEL SECURITY;

-- Venues: authenticated users can read their assigned venues
CREATE POLICY "Staff can read own venues" ON venues
  FOR SELECT USING (
    id IN (SELECT venue_id FROM staff_whatsapp WHERE user_id = auth.uid())
  );

-- FAQs: staff read/write own venue
CREATE POLICY "Staff can manage own venue FAQs" ON faqs
  FOR ALL USING (
    venue_id IN (SELECT venue_id FROM staff_whatsapp WHERE user_id = auth.uid())
  );

-- Closures: same pattern
CREATE POLICY "Staff can manage own venue closures" ON closures
  FOR ALL USING (
    venue_id IN (SELECT venue_id FROM staff_whatsapp WHERE user_id = auth.uid())
  );

-- Conversations: staff read own venue
CREATE POLICY "Staff can read own venue conversations" ON conversations
  FOR SELECT USING (
    venue_id IN (SELECT venue_id FROM staff_whatsapp WHERE user_id = auth.uid())
  );

-- Messages: staff read via conversation -> venue
CREATE POLICY "Staff can read own venue messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN staff_whatsapp sw ON sw.venue_id = c.venue_id
      WHERE sw.user_id = auth.uid()
    )
  );

-- Escalations: staff read/update own venue
CREATE POLICY "Staff can manage own venue escalations" ON escalations
  FOR ALL USING (
    venue_id IN (SELECT venue_id FROM staff_whatsapp WHERE user_id = auth.uid())
  );

-- Staff: users can read own record
CREATE POLICY "Users can read own staff record" ON staff_whatsapp
  FOR SELECT USING (user_id = auth.uid());

-- Seed Hidden Paradise as venue #1
INSERT INTO venues (name, phone_number_id, supported_languages, brand_voice)
VALUES (
  'Hidden Paradise Nature Park',
  'REPLACE_WITH_REAL_PHONE_NUMBER_ID',
  ARRAY['en', 'tw', 'ee', 'ga', 'fr', 'pid'],
  'Friendly, warm, and welcoming. Use "we" instead of "Hidden Paradise". Keep responses concise and enthusiastic about the park. We are a nature park in the Eastern Region of Ghana, about 1 hour from Accra.'
);
