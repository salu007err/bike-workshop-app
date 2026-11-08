-- =======================================================
-- Simple Bike Workshop Stock & Invoice App - Supabase Schema
-- =======================================================

-- 1. Parts Table
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    vehicle_number TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    invoice_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (invoice_status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    item_type TEXT NOT NULL CHECK (item_type IN ('part', 'work')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_invoices_vehicle ON invoices(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Enable Row Level Security (RLS)
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Allow public read/write using Supabase Anon Key (Free Tier Single Workshop)
CREATE POLICY "Allow anon all on parts" ON parts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on invoices" ON invoices FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on invoice_items" ON invoice_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- Function to safely create invoice and deduct stock atomically
CREATE OR REPLACE FUNCTION create_invoice_with_stock_deduction(
    p_invoice_number TEXT,
    p_vehicle_number TEXT,
    p_date DATE,
    p_total_amount NUMERIC,
    p_items JSONB
) RETURNS JSONB AS $$
DECLARE
    v_invoice_id UUID;
    v_item RECORD;
    v_current_stock INT;
BEGIN
    -- Verify all part stocks first
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        part_id UUID,
        description TEXT,
        quantity INT,
        price NUMERIC,
        item_type TEXT
    )
    LOOP
        IF v_item.item_type = 'part' AND v_item.part_id IS NOT NULL THEN
            SELECT quantity INTO v_current_stock FROM parts WHERE id = v_item.part_id FOR UPDATE;
            IF v_current_stock IS NULL THEN
                RAISE EXCEPTION 'Part not found: %', v_item.description;
            END IF;
            IF v_current_stock < v_item.quantity THEN
                RAISE EXCEPTION 'Not enough stock for % (Available: %, Requested: %)', v_item.description, v_current_stock, v_item.quantity;
            END IF;
        END IF;
    END LOOP;

    -- Create invoice
    INSERT INTO invoices (invoice_number, vehicle_number, date, total_amount, invoice_status)
    VALUES (p_invoice_number, p_vehicle_number, p_date, p_total_amount, 'confirmed')
    RETURNING id INTO v_invoice_id;

    -- Insert items and deduct stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        part_id UUID,
        description TEXT,
        quantity INT,
        price NUMERIC,
        item_type TEXT
    )
    LOOP
        INSERT INTO invoice_items (invoice_id, part_id, description, quantity, price, item_type)
        VALUES (v_invoice_id, v_item.part_id, v_item.description, v_item.quantity, v_item.price, v_item.item_type);

        IF v_item.item_type = 'part' AND v_item.part_id IS NOT NULL THEN
            UPDATE parts
            SET quantity = quantity - v_item.quantity,
                updated_at = NOW()
            WHERE id = v_item.part_id;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'invoice_id', v_invoice_id);
END;
$$ LANGUAGE plpgsql;

-- Function to cancel invoice and restore deducted stock atomically
CREATE OR REPLACE FUNCTION cancel_invoice(p_invoice_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_status TEXT;
    v_item RECORD;
BEGIN
    SELECT invoice_status INTO v_status FROM invoices WHERE id = p_invoice_id FOR UPDATE;
    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;
    IF v_status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invoice is already cancelled');
    END IF;

    -- Restore stock for part items
    FOR v_item IN SELECT part_id, quantity FROM invoice_items WHERE invoice_id = p_invoice_id AND item_type = 'part' AND part_id IS NOT NULL
    LOOP
        UPDATE parts
        SET quantity = quantity + v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.part_id;
    END LOOP;

    -- Mark invoice as cancelled
    UPDATE invoices
    SET invoice_status = 'cancelled'
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Sample initial bike workshop parts
INSERT INTO parts (name, price, quantity, note) VALUES
('Engine Oil 4T 20W40 (1L)', 450.00, 15, 'Standard bike engine oil'),
('Brake Shoe (Rear)', 180.00, 8, 'Fits 100cc-150cc motorcycles'),
('Spark Plug (Standard)', 120.00, 12, 'NGK / Champion compatible'),
('Chain Lube Spray (150ml)', 220.00, 6, 'Drive chain lubricant'),
('Air Filter Element', 160.00, 7, 'Foam air filter'),
('Front Disc Brake Pads', 280.00, 5, 'Ceramic disc brake pads'),
('Clutch Cable', 140.00, 4, 'Standard clutch wire'),
('Accelerator Cable', 130.00, 4, 'Throttle cable')
ON CONFLICT DO NOTHING;
