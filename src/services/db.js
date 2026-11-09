import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabaseConfig.js';

// Actively clear all legacy local storage data keys on load
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('bike_workshop_parts_prod');
    localStorage.removeItem('bike_workshop_invoices_prod');
    localStorage.removeItem('bike_workshop_parts');
    localStorage.removeItem('bike_workshop_invoices');
    localStorage.removeItem('bike_workshop_supabase_credentials');
  }
} catch (e) {
  // ignore
}

/**
 * Resolves Supabase credentials purely from the dedicated config file or .env variables.
 */
export function getStoredSupabaseCredentials() {
  if (
    SUPABASE_CONFIG?.SUPABASE_URL &&
    SUPABASE_CONFIG?.SUPABASE_ANON_KEY &&
    SUPABASE_CONFIG.SUPABASE_URL.trim() !== '' &&
    SUPABASE_CONFIG.SUPABASE_ANON_KEY.trim() !== '' &&
    !SUPABASE_CONFIG.SUPABASE_URL.includes('your-project')
  ) {
    return {
      url: SUPABASE_CONFIG.SUPABASE_URL.trim(),
      key: SUPABASE_CONFIG.SUPABASE_ANON_KEY.trim(),
      source: 'hardcoded_file',
    };
  }

  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;
  if (
    envUrl &&
    envKey &&
    envUrl.trim() !== '' &&
    envUrl !== 'YOUR_SUPABASE_URL' &&
    !envUrl.includes('your-project-id')
  ) {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }

  return null;
}

let supabaseInstance = null;

export function setSupabaseClient(client) {
  supabaseInstance = client;
}

export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  const creds = getStoredSupabaseCredentials();
  if (!creds) return null;
  supabaseInstance = createClient(creds.url, creds.key);
  supabaseInstance._url = creds.url;
  return supabaseInstance;
}

// ---------------- Workshop Name Configuration (Supabase + Quick Cache) ----------------
const WORKSHOP_NAME_CACHE_KEY = 'bike_workshop_name_cache';

export function getWorkshopConfig() {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(WORKSHOP_NAME_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }
  } catch (e) {
    // ignore
  }
  return {
    workshopName: 'BIKE WORKSHOP',
    phone: '',
    address: '',
  };
}

export async function fetchWorkshopConfigFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return getWorkshopConfig();

  try {
    const { data, error } = await supabase
      .from('workshop_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      const config = {
        workshopName: data.workshop_name || 'BIKE WORKSHOP',
        phone: data.phone || '',
        address: data.address || '',
      };
      saveWorkshopConfig(config);
      return config;
    }
  } catch (e) {
    // ignore
  }
  return getWorkshopConfig();
}

export function saveWorkshopConfig(config) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WORKSHOP_NAME_CACHE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    // ignore
  }

  // Also sync to Supabase asynchronously if table exists
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase
      .from('workshop_settings')
      .upsert({
        id: 'default',
        workshop_name: config.workshopName || 'BIKE WORKSHOP',
        phone: config.phone || '',
        address: config.address || '',
        updated_at: new Date().toISOString(),
      })
      .then(() => {})
      .catch(() => {});
  }
}

export function clearAllLocalData() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('bike_workshop_parts_prod');
      localStorage.removeItem('bike_workshop_invoices_prod');
      localStorage.removeItem('bike_workshop_parts');
      localStorage.removeItem('bike_workshop_invoices');
      localStorage.removeItem(WORKSHOP_NAME_CACHE_KEY);
    }
  } catch (e) {
    // ignore
  }
}

// ---------------- Pure Supabase CRUD API ----------------

export async function fetchParts() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }

  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      const isMissing = error.code === 'PGRST205' || (error.message || '').includes('schema cache');
      return {
        success: false,
        error: error.message,
        isTableMissing: isMissing,
        source: 'supabase',
      };
    }

    return { success: true, data: data || [], source: 'supabase' };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}

export async function addPart({ name, price, quantity, note = '', part_number = null, image_url = null }) {
  const cleanName = (name || '').trim();
  const numPrice = Math.max(0, parseFloat(price) || 0);
  const numQty = Math.max(0, parseInt(quantity, 10) || 0);
  const cleanNote = (note || '').trim();
  const cleanPartNumber = (part_number || '').trim() || null;
  const cleanImageUrl = (image_url || '').trim() || null;

  if (!cleanName) {
    return { success: false, error: 'Part name is required' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  // Base insert payload
  const payload = {
    name: cleanName,
    price: numPrice,
    quantity: numQty,
    note: cleanNote,
  };
  if (cleanPartNumber) payload.part_number = cleanPartNumber;
  if (cleanImageUrl) payload.image_url = cleanImageUrl;

  try {
    const { data, error } = await supabase
      .from('parts')
      .insert([payload])
      .select()
      .single();

    if (error) {
      // If column is missing in remote Supabase schema cache (PGRST204), auto-fallback to basic fields
      if (
        error.code === 'PGRST204' ||
        (error.message || '').includes('column') ||
        (error.message || '').includes('schema cache')
      ) {
        console.warn('Supabase parts schema missing columns. Retrying with basic fields.');
        const fallbackPayload = {
          name: cleanName,
          price: numPrice,
          quantity: numQty,
          note: cleanNote,
        };
        const { data: fbData, error: fbErr } = await supabase
          .from('parts')
          .insert([fallbackPayload])
          .select()
          .single();

        if (fbErr) throw fbErr;
        return {
          success: true,
          data: {
            ...fbData,
            part_number: fbData?.part_number || null,
            image_url: fbData?.image_url || null,
          },
          isSchemaUpgradeNeeded: true,
          source: 'supabase',
        };
      }
      throw error;
    }
    return {
      success: true,
      data: {
        ...data,
        part_number: data?.part_number || null,
        image_url: data?.image_url || null,
      },
      source: 'supabase',
    };
  } catch (err) {
    const isMissing = err.code === 'PGRST205' || (err.message || '').includes('schema cache');
    return { success: false, error: err.message, isTableMissing: isMissing, source: 'supabase' };
  }
}

export async function updatePart(id, { name, price, quantity, note = '', part_number = null, image_url = null }) {
  const cleanName = (name || '').trim();
  const numPrice = Math.max(0, parseFloat(price) || 0);
  const numQty = Math.max(0, parseInt(quantity, 10) || 0);
  const cleanNote = (note || '').trim();
  const cleanPartNumber = (part_number || '').trim() || null;
  const cleanImageUrl = (image_url || '').trim() || null;

  if (!cleanName) {
    return { success: false, error: 'Part name is required' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  const payload = {
    name: cleanName,
    price: numPrice,
    quantity: numQty,
    note: cleanNote,
    updated_at: new Date().toISOString(),
  };
  if (cleanPartNumber) payload.part_number = cleanPartNumber;
  if (cleanImageUrl) payload.image_url = cleanImageUrl;

  try {
    const { data, error } = await supabase
      .from('parts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Auto-fallback if columns missing in remote Supabase schema cache
      if (
        error.code === 'PGRST204' ||
        (error.message || '').includes('column') ||
        (error.message || '').includes('schema cache')
      ) {
        console.warn('Supabase parts schema missing columns on update. Retrying with basic fields.');
        const fallbackPayload = {
          name: cleanName,
          price: numPrice,
          quantity: numQty,
          note: cleanNote,
          updated_at: new Date().toISOString(),
        };
        const { data: fbData, error: fbErr } = await supabase
          .from('parts')
          .update(fallbackPayload)
          .eq('id', id)
          .select()
          .single();

        if (fbErr) throw fbErr;
        return {
          success: true,
          data: {
            ...fbData,
            part_number: fbData?.part_number || null,
            image_url: fbData?.image_url || null,
          },
          isSchemaUpgradeNeeded: true,
          source: 'supabase',
        };
      }
      throw error;
    }
    return {
      success: true,
      data: {
        ...data,
        part_number: data?.part_number || null,
        image_url: data?.image_url || null,
      },
      source: 'supabase',
    };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}

export async function addStockQuantity(id, additionalQuantity) {
  const addQty = parseInt(additionalQuantity, 10);
  if (isNaN(addQty) || addQty <= 0) {
    return { success: false, error: 'Please enter a valid stock quantity to add' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    // 1. Fetch current quantity from Supabase
    const { data: part, error: fetchErr } = await supabase
      .from('parts')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const newQty = (part.quantity || 0) + addQty;

    // 2. Update stock quantity in Supabase
    const { data, error: updateErr } = await supabase
      .from('parts')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return { success: true, data, source: 'supabase' };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}

export async function deletePart(id) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    const { error } = await supabase.from('parts').delete().eq('id', id);
    if (error) throw error;
    return { success: true, source: 'supabase' };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}

// ---------------- Invoices (Pure Supabase) ----------------

export async function fetchInvoices() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      const isMissing = error.code === 'PGRST205' || (error.message || '').includes('schema cache');
      return {
        success: false,
        error: error.message,
        isTableMissing: isMissing,
        source: 'supabase',
      };
    }

    return { success: true, data: data || [], source: 'supabase' };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}

/**
 * Creates an invoice in Supabase with atomic stock reduction.
 */
export async function createInvoiceWithStockDeduction({
  vehicleNumber,
  kmReading = null,
  items,
  totalAmount,
  date = new Date().toISOString().split('T')[0],
  workshopName = 'BIKE WORKSHOP',
}) {
  const cleanVehicle = (vehicleNumber || '').toUpperCase().trim();
  const cleanKm = (kmReading || '').trim() || null;
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
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);

    // Try RPC procedure if available
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

    // Direct multi-step Supabase insert
    // 1. Verify part stocks in Supabase
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

    // 2. Insert invoice into Supabase
    const invoicePayload = {
      invoice_number: invoiceNumber,
      vehicle_number: cleanVehicle,
      date,
      total_amount: totalAmount,
      invoice_status: 'confirmed',
    };
    if (cleanKm) {
      invoicePayload.km_reading = cleanKm;
    }

    let newInv = null;
    let invInsertRes = await supabase.from('invoices').insert([invoicePayload]).select().single();

    if (invInsertRes.error) {
      // Fallback if km_reading column is not yet in Supabase schema cache
      if (invoicePayload.km_reading && (invInsertRes.error.code === 'PGRST204' || (invInsertRes.error.message || '').includes('km_reading'))) {
        delete invoicePayload.km_reading;
        invInsertRes = await supabase.from('invoices').insert([invoicePayload]).select().single();
      }
    }
    if (invInsertRes.error) throw invInsertRes.error;
    newInv = invInsertRes.data;
    if (cleanKm && !newInv.km_reading) {
      newInv.km_reading = cleanKm;
    }

    // 3. Insert invoice items into Supabase
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

    // 4. Deduct stock in Supabase
    for (const it of items) {
      if (it.item_type === 'part' && it.part_id) {
        const { data: part } = await supabase
          .from('parts')
          .select('quantity')
          .eq('id', it.part_id)
          .single();

        if (part) {
          const updatedStock = Math.max(0, (part.quantity || 0) - it.quantity);
          await supabase.from('parts').update({ quantity: updatedStock, updated_at: new Date().toISOString() }).eq('id', it.part_id);
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
    return { success: false, error: err.message, source: 'supabase' };
  }
}

/**
 * Updates an existing invoice in Supabase and reconciles stock deductions.
 */
export async function updateInvoiceWithStockDeduction({
  invoiceId,
  vehicleNumber,
  kmReading = null,
  items,
  totalAmount,
  workshopName = 'BIKE WORKSHOP',
}) {
  const cleanVehicle = (vehicleNumber || '').toUpperCase().trim();
  const cleanKm = kmReading !== undefined && kmReading !== null ? (kmReading || '').trim() || null : undefined;
  if (!cleanVehicle) {
    return { success: false, error: 'Vehicle registration number is required' };
  }
  if (!items || items.length === 0) {
    return { success: false, error: 'Please add at least one part or work item' };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    // 1. Fetch current invoice with original items
    const { data: oldInvoice, error: fetchErr } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', invoiceId)
      .single();

    if (fetchErr || !oldInvoice) {
      throw new Error('Invoice not found in Supabase');
    }

    if (oldInvoice.invoice_status === 'cancelled') {
      throw new Error('Cannot edit a cancelled invoice');
    }

    // 2. Temporarily restore stock for previous part items
    if (oldInvoice.items && oldInvoice.items.length > 0) {
      for (const oldIt of oldInvoice.items) {
        if (oldIt.item_type === 'part' && oldIt.part_id) {
          const { data: part } = await supabase
            .from('parts')
            .select('quantity')
            .eq('id', oldIt.part_id)
            .single();

          if (part) {
            const restoredQty = (part.quantity || 0) + (oldIt.quantity || 0);
            await supabase
              .from('parts')
              .update({ quantity: restoredQty, updated_at: new Date().toISOString() })
              .eq('id', oldIt.part_id);
          }
        }
      }
    }

    // 3. Verify stock availability for new part items
    for (const newItem of items) {
      if (newItem.item_type === 'part' && newItem.part_id) {
        const { data: part, error: pErr } = await supabase
          .from('parts')
          .select('id, name, quantity')
          .eq('id', newItem.part_id)
          .single();

        if (pErr || !part) {
          throw new Error(`Part not found: ${newItem.description}`);
        }
        if ((part.quantity || 0) < newItem.quantity) {
          // Re-deduct old items if stock check fails
          if (oldInvoice.items) {
            for (const oldIt of oldInvoice.items) {
              if (oldIt.item_type === 'part' && oldIt.part_id) {
                const { data: p } = await supabase.from('parts').select('quantity').eq('id', oldIt.part_id).single();
                if (p) {
                  await supabase.from('parts').update({ quantity: Math.max(0, (p.quantity || 0) - oldIt.quantity) }).eq('id', oldIt.part_id);
                }
              }
            }
          }
          throw new Error(
            `Not enough stock for "${part.name}". Available: ${part.quantity}, Needed: ${newItem.quantity}`
          );
        }
      }
    }

    // 4. Deduct new stock for all new parts
    for (const newItem of items) {
      if (newItem.item_type === 'part' && newItem.part_id) {
        const { data: part } = await supabase
          .from('parts')
          .select('quantity')
          .eq('id', newItem.part_id)
          .single();

        if (part) {
          const newStock = Math.max(0, (part.quantity || 0) - newItem.quantity);
          await supabase
            .from('parts')
            .update({ quantity: newStock, updated_at: new Date().toISOString() })
            .eq('id', newItem.part_id);
        }
      }
    }

    // 5. Update invoice vehicle number, km reading, and total
    const updatePayload = {
      vehicle_number: cleanVehicle,
      total_amount: totalAmount,
    };
    if (cleanKm !== undefined) {
      updatePayload.km_reading = cleanKm;
    }

    let updatedInv = null;
    let updateInvRes = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', invoiceId)
      .select()
      .single();

    if (updateInvRes.error) {
      if (updatePayload.km_reading !== undefined && (updateInvRes.error.code === 'PGRST204' || (updateInvRes.error.message || '').includes('km_reading'))) {
        delete updatePayload.km_reading;
        updateInvRes = await supabase
          .from('invoices')
          .update(updatePayload)
          .eq('id', invoiceId)
          .select()
          .single();
      }
    }
    if (updateInvRes.error) throw updateInvRes.error;
    updatedInv = updateInvRes.data;
    if (cleanKm && !updatedInv.km_reading) {
      updatedInv.km_reading = cleanKm;
    }

    // 6. Delete old invoice items and insert new ones
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);

    const newInsertItems = items.map((it) => ({
      invoice_id: invoiceId,
      part_id: it.part_id || null,
      description: it.description,
      quantity: it.quantity,
      price: it.price,
      item_type: it.item_type || (it.part_id ? 'part' : 'work'),
    }));

    const { error: insertItemsErr } = await supabase.from('invoice_items').insert(newInsertItems);
    if (insertItemsErr) throw insertItemsErr;

    return {
      success: true,
      data: {
        ...updatedInv,
        items: newInsertItems,
        workshop_name: workshopName,
      },
      source: 'supabase',
    };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}

/**
 * Cancels invoice and restores deducted stock directly in Supabase.
 */
export async function cancelInvoice(invoiceId) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    // 1. Try atomic RPC function
    const { data: rpcData, error: rpcErr } = await supabase.rpc('cancel_invoice', {
      p_invoice_id: invoiceId,
    });

    if (!rpcErr && rpcData && rpcData.success) {
      return { success: true, source: 'supabase' };
    }

    // 2. Direct Supabase query and restoration
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', invoiceId)
      .single();

    if (invErr || !invoice) {
      throw new Error('Invoice not found in Supabase');
    }

    if (invoice.invoice_status === 'cancelled') {
      return { success: false, error: 'Invoice has already been cancelled.' };
    }

    // Restore stock for part items in Supabase
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
            await supabase
              .from('parts')
              .update({ quantity: restoredQty, updated_at: new Date().toISOString() })
              .eq('id', item.part_id);
          }
        }
      }
    }

    // Update invoice status to cancelled in Supabase
    await supabase.from('invoices').update({ invoice_status: 'cancelled' }).eq('id', invoiceId);
    return { success: true, source: 'supabase' };
  } catch (err) {
    return { success: false, error: err.message, source: 'supabase' };
  }
}
