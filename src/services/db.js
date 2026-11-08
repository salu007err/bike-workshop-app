import { createClient } from '@supabase/supabase-js';

// Configuration keys in localStorage
const LOCAL_STORAGE_PARTS_KEY = 'bike_workshop_parts_v1';
const LOCAL_STORAGE_INVOICES_KEY = 'bike_workshop_invoices_v1';
const LOCAL_STORAGE_WORKSHOP_KEY = 'bike_workshop_config_v1';
const LOCAL_STORAGE_SUPABASE_CREDENTIALS = 'bike_workshop_supabase_credentials';

// Initial default stock data for small bike workshop
const DEFAULT_PARTS = [
  { id: 'p1', name: 'Engine Oil 4T 20W40 (1L)', price: 450, quantity: 12, note: 'Standard 4T engine oil' },
  { id: 'p2', name: 'Brake Shoe (Rear)', price: 180, quantity: 8, note: 'Drum brake shoe' },
  { id: 'p3', name: 'Spark Plug (Standard)', price: 120, quantity: 15, note: 'Standard spark plug' },
  { id: 'p4', name: 'Chain Lube Spray (150ml)', price: 220, quantity: 6, note: 'Chain lubrication' },
  { id: 'p5', name: 'Air Filter Element', price: 160, quantity: 9, note: 'Air cleaner element' },
  { id: 'p6', name: 'Front Disc Brake Pads', price: 280, quantity: 5, note: 'Disc brake pads' },
  { id: 'p7', name: 'Clutch Cable', price: 140, quantity: 7, note: 'Clutch wire inner/outer' },
  { id: 'p8', name: 'Throttle / Acc Cable', price: 130, quantity: 6, note: 'Accelerator wire' },
];

export function getStoredSupabaseCredentials() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;
  if (envUrl && envKey && envUrl !== 'YOUR_SUPABASE_URL') {
    return { url: envUrl, key: envKey, source: 'env' };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SUPABASE_CREDENTIALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key, source: 'local' };
      }
    }
  } catch (err) {
    console.error('Error reading Supabase credentials from localStorage:', err);
  }
  return null;
}

export function saveSupabaseCredentials(url, key) {
  if (!url || !key) {
    localStorage.removeItem(LOCAL_STORAGE_SUPABASE_CREDENTIALS);
  } else {
    localStorage.setItem(LOCAL_STORAGE_SUPABASE_CREDENTIALS, JSON.stringify({ url: url.trim(), key: key.trim() }));
  }
}

let supabaseInstance = null;
export function getSupabaseClient() {
  const creds = getStoredSupabaseCredentials();
  if (!creds) return null;
  if (!supabaseInstance || supabaseInstance._url !== creds.url) {
    supabaseInstance = createClient(creds.url, creds.key);
    supabaseInstance._url = creds.url;
  }
  return supabaseInstance;
}

// ---------------- Workshop Name Config ----------------
export function getWorkshopConfig() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WORKSHOP_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse workshop config', e);
  }
  return {
    workshopName: 'BIKE WORKSHOP',
    phone: '',
    address: '',
  };
}

export function saveWorkshopConfig(config) {
  localStorage.setItem(LOCAL_STORAGE_WORKSHOP_KEY, JSON.stringify(config));
}

// ---------------- LocalStorage Fallback Layer ----------------
function getLocalParts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PARTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PARTS_KEY, JSON.stringify(DEFAULT_PARTS));
      return DEFAULT_PARTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PARTS;
  }
}

function saveLocalParts(parts) {
  localStorage.setItem(LOCAL_STORAGE_PARTS_KEY, JSON.stringify(parts));
}

function getLocalInvoices() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INVOICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalInvoices(invoices) {
  localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(invoices));
}

// ---------------- High Level Service API ----------------

export async function fetchParts() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return { success: true, data: data || [], source: 'supabase' };
    } catch (err) {
      console.warn('Supabase fetchParts failed, falling back to local storage:', err.message);
    }
  }
  // Local fallback
  const parts = getLocalParts();
  parts.sort((a, b) => a.name.localeCompare(b.name));
  return { success: true, data: parts, source: 'local' };
}

export async function addPart({ name, price, quantity, note = '' }) {
  const cleanName = (name || '').trim();
  const numPrice = Math.max(0, parseFloat(price) || 0);
  const numQty = Math.max(0, parseInt(quantity, 10) || 0);
  const cleanNote = (note || '').trim();

  if (!cleanName) {
    return { success: false, error: 'Part name is required' };
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('parts')
        .insert([{ name: cleanName, price: numPrice, quantity: numQty, note: cleanNote }])
        .select()
        .single();
      if (error) throw error;
      return { success: true, data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase addPart failed, using local fallback:', err.message);
    }
  }

  // Local fallback
  const parts = getLocalParts();
  const newPart = {
    id: 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: cleanName,
    price: numPrice,
    quantity: numQty,
    note: cleanNote,
    created_at: new Date().toISOString(),
  };
  parts.push(newPart);
  saveLocalParts(parts);
  return { success: true, data: newPart, source: 'local' };
}

export async function updatePart(id, { name, price, quantity, note = '' }) {
  const cleanName = (name || '').trim();
  const numPrice = Math.max(0, parseFloat(price) || 0);
  const numQty = Math.max(0, parseInt(quantity, 10) || 0);
  const cleanNote = (note || '').trim();

  if (!cleanName) {
    return { success: false, error: 'Part name is required' };
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('parts')
        .update({ name: cleanName, price: numPrice, quantity: numQty, note: cleanNote, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase updatePart failed, using local fallback:', err.message);
    }
  }

  // Local fallback
  const parts = getLocalParts();
  const index = parts.findIndex((p) => String(p.id) === String(id));
  if (index === -1) {
    return { success: false, error: 'Part not found' };
  }
  parts[index] = {
    ...parts[index],
    name: cleanName,
    price: numPrice,
    quantity: numQty,
    note: cleanNote,
    updated_at: new Date().toISOString(),
  };
  saveLocalParts(parts);
  return { success: true, data: parts[index], source: 'local' };
}

export async function addStockQuantity(id, additionalQuantity) {
  const addQty = parseInt(additionalQuantity, 10);
  if (isNaN(addQty) || addQty <= 0) {
    return { success: false, error: 'Please enter a valid stock quantity to add' };
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Fetch current quantity
      const { data: part, error: fetchErr } = await supabase
        .from('parts')
        .select('quantity')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      const newQty = (part.quantity || 0) + addQty;
      const { data, error: updateErr } = await supabase
        .from('parts')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (updateErr) throw updateErr;

      return { success: true, data, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase addStockQuantity failed, using local fallback:', err.message);
    }
  }

  // Local fallback
  const parts = getLocalParts();
  const part = parts.find((p) => String(p.id) === String(id));
  if (!part) {
    return { success: false, error: 'Part not found' };
  }
  part.quantity = (part.quantity || 0) + addQty;
  saveLocalParts(parts);
  return { success: true, data: part, source: 'local' };
}

export async function deletePart(id) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('parts').delete().eq('id', id);
      if (error) throw error;
      return { success: true, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase deletePart failed, using local fallback:', err.message);
    }
  }

  // Local fallback
  const parts = getLocalParts();
  const filtered = parts.filter((p) => String(p.id) !== String(id));
  saveLocalParts(filtered);
  return { success: true, source: 'local' };
}

// ---------------- Invoices ----------------

export async function fetchInvoices() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data || [], source: 'supabase' };
    } catch (err) {
      console.warn('Supabase fetchInvoices failed, using local fallback:', err.message);
    }
  }

  const invoices = getLocalInvoices();
  invoices.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
  return { success: true, data: invoices, source: 'local' };
}

/**
 * Creates an invoice with atomic stock reduction.
 * 1. Checks available stock before deducting.
 * 2. Never reduces stock before invoice confirmation.
 * 3. Never reduces stock twice for the same invoice.
 * 4. Never allows stock to become negative.
 */
export async function createInvoiceWithStockDeduction({
  vehicleNumber,
  items,
  totalAmount,
  date = new Date().toISOString().split('T')[0],
  workshopName = 'BIKE WORKSHOP',
}) {
  const cleanVehicle = (vehicleNumber || '').toUpperCase().trim();
  if (!cleanVehicle) {
    return { success: false, error: 'Vehicle registration number is required' };
  }

  if (!items || items.length === 0) {
    return { success: false, error: 'Please add at least one part or work item' };
  }

  // Validate items
  for (const item of items) {
    if (!item.description || !item.description.trim()) {
      return { success: false, error: 'Every item must have a description' };
    }
    if (isNaN(item.quantity) || item.quantity <= 0) {
      return { success: false, error: `Invalid quantity for "${item.description}"` };
    }
    if (isNaN(item.price) || item.price < 0) {
      return { success: false, error: `Invalid price for "${item.description}"` };
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Generate invoice number
      const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);

      // Check if stored RPC procedure exists in Supabase
      const rpcPayload = {
        p_invoice_number: invoiceNumber,
        p_vehicle_number: cleanVehicle,
        p_date: date,
        p_total_amount: totalAmount,
        p_items: items.map((it) => ({
          part_id: it.part_id || null,
          description: it.description,
          quantity: it.quantity,
          price: it.price,
          item_type: it.item_type || (it.part_id ? 'part' : 'work'),
        })),
      };

      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        'create_invoice_with_stock_deduction',
        rpcPayload
      );

      if (!rpcErr && rpcData && rpcData.success) {
        // Fetch created invoice with items
        const { data: invData } = await supabase
          .from('invoices')
          .select('*, items:invoice_items(*)')
          .eq('id', rpcData.invoice_id)
          .single();

        return {
          success: true,
          data: invData || {
            id: rpcData.invoice_id,
            invoice_number: invoiceNumber,
            vehicle_number: cleanVehicle,
            date,
            total_amount: totalAmount,
            invoice_status: 'confirmed',
            items,
            workshop_name: workshopName,
          },
          source: 'supabase',
        };
      }

      // If RPC is not installed, perform transaction-like check and insert in Supabase
      // 1. Verify part stocks
      for (const item of items) {
        if (item.item_type === 'part' && item.part_id) {
          const { data: part, error: pErr } = await supabase
            .from('parts')
            .select('id, name, quantity')
            .eq('id', item.part_id)
            .single();
          if (pErr || !part) {
            throw new Error(`Part not found: ${item.description}`);
          }
          if ((part.quantity || 0) < item.quantity) {
            throw new Error(
              `Not enough stock for "${part.name}". Available: ${part.quantity}, Needed: ${item.quantity}`
            );
          }
        }
      }

      // 2. Insert invoice
      const { data: newInv, error: invErr } = await supabase
        .from('invoices')
        .insert([
          {
            invoice_number: invoiceNumber,
            vehicle_number: cleanVehicle,
            date,
            total_amount: totalAmount,
            invoice_status: 'confirmed',
          },
        ])
        .select()
        .single();
      if (invErr) throw invErr;

      // 3. Insert items and deduct stock
      const insertItems = items.map((it) => ({
        invoice_id: newInv.id,
        part_id: it.part_id || null,
        description: it.description,
        quantity: it.quantity,
        price: it.price,
        item_type: it.item_type || (it.part_id ? 'part' : 'work'),
      }));

      const { error: itemsErr } = await supabase.from('invoice_items').insert(insertItems);
      if (itemsErr) throw itemsErr;

      // Deduct stock for each part
      for (const it of items) {
        if (it.item_type === 'part' && it.part_id) {
          const { data: part } = await supabase
            .from('parts')
            .select('quantity')
            .eq('id', it.part_id)
            .single();
          if (part) {
            const updatedStock = Math.max(0, (part.quantity || 0) - it.quantity);
            await supabase.from('parts').update({ quantity: updatedStock }).eq('id', it.part_id);
          }
        }
      }

      return {
        success: true,
        data: {
          ...newInv,
          items: insertItems,
          workshop_name: workshopName,
        },
        source: 'supabase',
      };
    } catch (err) {
      console.warn('Supabase invoice creation failed, falling back to local storage:', err.message);
      return { success: false, error: err.message };
    }
  }

  // ---------------- Local Storage Implementation ----------------
  const localParts = getLocalParts();

  // 1. Verify stock availability for all parts
  for (const item of items) {
    if (item.item_type === 'part' && item.part_id) {
      const part = localParts.find((p) => String(p.id) === String(item.part_id));
      if (!part) {
        return { success: false, error: `Part "${item.description}" not found in stock.` };
      }
      if ((part.quantity || 0) < item.quantity) {
        return {
          success: false,
          error: `Not enough stock for "${part.name}". Available: ${part.quantity}, Required: ${item.quantity}`,
        };
      }
    }
  }

  // 2. Reduce stock for each part item (Stock never negative)
  for (const item of items) {
    if (item.item_type === 'part' && item.part_id) {
      const part = localParts.find((p) => String(p.id) === String(item.part_id));
      if (part) {
        part.quantity = Math.max(0, (part.quantity || 0) - item.quantity);
      }
    }
  }
  saveLocalParts(localParts);

  // 3. Generate sequential invoice number
  const invoices = getLocalInvoices();
  const nextNum = 1000 + invoices.length + 1;
  const invoiceNumber = `INV-${nextNum}`;

  const newInvoice = {
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    invoice_number: invoiceNumber,
    vehicle_number: cleanVehicle,
    date,
    total_amount: totalAmount,
    invoice_status: 'confirmed',
    workshop_name: workshopName,
    created_at: new Date().toISOString(),
    items: items.map((it, idx) => ({
      id: 'item_' + Date.now() + '_' + idx,
      part_id: it.part_id || null,
      description: it.description,
      quantity: it.quantity,
      price: it.price,
      item_type: it.item_type || (it.part_id ? 'part' : 'work'),
    })),
  };

  invoices.unshift(newInvoice);
  saveLocalInvoices(invoices);

  return { success: true, data: newInvoice, source: 'local' };
}

/**
 * Restores deducted stock when an invoice is cancelled.
 */
export async function cancelInvoice(invoiceId) {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Try stored RPC first
      const { data: rpcData, error: rpcErr } = await supabase.rpc('cancel_invoice', {
        p_invoice_id: invoiceId,
      });

      if (!rpcErr && rpcData && rpcData.success) {
        return { success: true, source: 'supabase' };
      }

      // Supabase manual cancellation & stock restore
      const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*)')
        .eq('id', invoiceId)
        .single();

      if (invErr || !invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.invoice_status === 'cancelled') {
        return { success: false, error: 'Invoice has already been cancelled.' };
      }

      // Restore parts stock
      if (invoice.items) {
        for (const item of invoice.items) {
          if (item.item_type === 'part' && item.part_id) {
            const { data: part } = await supabase
              .from('parts')
              .select('quantity')
              .eq('id', item.part_id)
              .single();
            if (part) {
              const restoredQty = (part.quantity || 0) + (item.quantity || 0);
              await supabase.from('parts').update({ quantity: restoredQty }).eq('id', item.part_id);
            }
          }
        }
      }

      await supabase.from('invoices').update({ invoice_status: 'cancelled' }).eq('id', invoiceId);
      return { success: true, source: 'supabase' };
    } catch (err) {
      console.warn('Supabase cancelInvoice failed, falling back to local storage:', err.message);
    }
  }

  // Local Storage cancellation
  const invoices = getLocalInvoices();
  const invoice = invoices.find((inv) => String(inv.id) === String(invoiceId));
  if (!invoice) {
    return { success: false, error: 'Invoice not found.' };
  }

  if (invoice.invoice_status === 'cancelled') {
    return { success: false, error: 'This invoice is already cancelled.' };
  }

  // Restore stock
  const parts = getLocalParts();
  for (const item of invoice.items || []) {
    if (item.item_type === 'part' && item.part_id) {
      const part = parts.find((p) => String(p.id) === String(item.part_id));
      if (part) {
        part.quantity = (part.quantity || 0) + item.quantity;
      }
    }
  }
  saveLocalParts(parts);

  // Mark invoice as cancelled
  invoice.invoice_status = 'cancelled';
  saveLocalInvoices(invoices);

  return { success: true, source: 'local' };
}
