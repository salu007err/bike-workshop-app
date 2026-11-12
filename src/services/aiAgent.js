/**
 * Bike Workshop AI Assistant
 * Provides intelligent assistance for app doubts, live workshop data, and Google Gemini AI mechanic advice.
 * 
 * Intelligent Dual-Routing Architecture:
 * 1. Stored Workshop Queries:
 *    If user asks for already stored workshop data (live stock counts, out of stock list,
 *    specific vehicle bill searches, in-app how-to tutorials), responds instantly with verified local data.
 * 2. Google Gemini AI:
 *    If user asks general mechanical questions, bike troubleshooting, repair diagnosis, parts advice,
 *    or anything not in stored records, uses Google Gemini API with live workshop context!
 */

import { AI_CONFIG } from '../config/supabaseConfig.js';

// Working model candidates in order of priority (tested with Google Generative Language v1beta API)
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

/**
 * Resolves Gemini API key securely from environment variables or application configuration.
 * Client-side UI key inputs are completely avoided.
 */
export function getStoredGeminiKey() {
  // 1. Check environment variable
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_GEMINI_API_KEY &&
    import.meta.env.VITE_GEMINI_API_KEY.trim() !== ''
  ) {
    return {
      key: import.meta.env.VITE_GEMINI_API_KEY.trim(),
      source: 'env',
    };
  }

  // 2. Check configuration file
  if (
    AI_CONFIG?.GEMINI_API_KEY &&
    AI_CONFIG.GEMINI_API_KEY.trim() !== '' &&
    !AI_CONFIG.GEMINI_API_KEY.includes('your-gemini')
  ) {
    return {
      key: AI_CONFIG.GEMINI_API_KEY.trim(),
      source: 'config',
    };
  }

  return null;
}

/**
 * Analyzes live workshop data for quick summaries and AI context
 */
export function getWorkshopSummaryData(parts = [], invoices = []) {
  const totalParts = parts.length;
  const outOfStockParts = parts.filter((p) => (parseInt(p.quantity, 10) || 0) <= 0);
  const lowStockParts = parts.filter((p) => {
    const q = parseInt(p.quantity, 10) || 0;
    return q > 0 && q <= 3;
  });
  const totalStockUnits = parts.reduce((sum, p) => sum + (parseInt(p.quantity, 10) || 0), 0);
  const totalStockValue = parts.reduce(
    (sum, p) => sum + (parseInt(p.quantity, 10) || 0) * (parseFloat(p.price) || 0),
    0
  );

  const totalInvoices = invoices.length;
  const activeInvoices = invoices.filter((inv) => inv.invoice_status !== 'cancelled');
  const totalBilledAmount = activeInvoices.reduce(
    (sum, inv) => sum + (parseFloat(inv.total_amount) || 0),
    0
  );

  return {
    totalParts,
    outOfStockParts,
    lowStockParts,
    totalStockUnits,
    totalStockValue,
    totalInvoices,
    activeInvoices,
    totalBilledAmount,
  };
}

/**
 * Checks if the user's input is asking for ALREADY STORED local data or app how-to guides.
 * If true, we respond immediately with verified stored data.
 * If false, we route to Google Gemini AI for smart mechanic reasoning!
 */
export function isStoredWorkshopQuery(userQuery, parts = [], invoices = []) {
  const q = (userQuery || '').toLowerCase().trim();
  if (!q) return true;

  // 1. Vehicle number pattern check (e.g. searching for a specific bike invoice)
  const vehicleRegex = /[a-zA-Z]{2}\s*[-]?\s*\d{1,2}\s*[a-zA-Z]{0,3}\s*\d{1,4}/i;
  if (vehicleRegex.test(q) || (q.includes('kl') && /\d/.test(q))) {
    return true;
  }

  // 2. Out of stock queries
  if (
    q.includes('out of stock') ||
    q.includes('no stock') ||
    q.includes('തീർ') ||
    q.includes('സ്റ്റോക്കില്ല') ||
    q.includes('ഇല്ലാത്ത പാർട്')
  ) {
    return true;
  }

  // 3. Low stock queries
  if (
    q.includes('low stock') ||
    q.includes('കുറവ') ||
    q.includes('കുറഞ്ഞ') ||
    q.includes('തീരാനായ') ||
    q.includes('shortage')
  ) {
    return true;
  }

  // 4. Stock valuation / Total units in workshop
  if (
    q.includes('total stock') ||
    q.includes('stock value') ||
    q.includes('valuation') ||
    q.includes('ആകെ സ്റ്റോക്ക്') ||
    q.includes('സ്റ്റോക്കിന്റെ വില') ||
    q.includes('എത്ര പാർട്സ് ഉണ്ട്')
  ) {
    return true;
  }

  // 5. In-app how-to guides: Creating invoice
  if (
    (q.includes('how') && (q.includes('invoice') || q.includes('bill'))) ||
    q.includes('create invoice') ||
    q.includes('make bill') ||
    q.includes('ബിൽ എങ്ങനെ') ||
    q.includes('ബിൽ ഉണ്ടാക്കാൻ') ||
    q.includes('ഇൻവോയ്സ് എങ്ങനെ')
  ) {
    return true;
  }

  // 6. In-app how-to guides: WhatsApp share
  if (
    q.includes('whatsapp') ||
    q.includes('വാട്സാപ്പ്') ||
    q.includes('വാട്ട്സാപ്പ്') ||
    (q.includes('share') && (q.includes('bill') || q.includes('invoice')))
  ) {
    return true;
  }

  // 7. In-app how-to guides: Cancel invoice & restore stock
  if (
    q.includes('cancel invoice') ||
    q.includes('cancel bill') ||
    q.includes('restore stock') ||
    q.includes('ബിൽ റദ്ദാ') ||
    q.includes('ക്യാൻസൽ ചെയ്താൽ') ||
    q.includes('സ്റ്റോക്ക് തിരികെ')
  ) {
    return true;
  }

  // 8. In-app how-to guides: Adding spare parts
  if (
    (q.includes('how') && (q.includes('add part') || q.includes('add stock'))) ||
    q.includes('പാർട്ട് എങ്ങനെ ചേർക്കാം') ||
    q.includes('സ്റ്റോക്ക് എങ്ങനെ കൂട്ടാം')
  ) {
    return true;
  }

  // 9. In-app how-to guides: Language switch
  if (
    (q.includes('how') && q.includes('language')) ||
    q.includes('change language') ||
    q.includes('ഭാഷ മാറ്റാൻ') ||
    q.includes('മലയാളം മാറ്റാൻ')
  ) {
    return true;
  }

  // 10. Direct stock/price inquiry for a specific part currently in the database
  // E.g. "Do we have engine oil in stock?", "Price of brake shoe?"
  const asksAvailability =
    q.includes('stock') ||
    q.includes('price') ||
    q.includes('available') ||
    q.includes('വില') ||
    q.includes('ഉണ്ടോ') ||
    q.includes('സ്റ്റോക്കുണ്ടോ');

  if (asksAvailability) {
    const hasPartMatch = parts.some((p) => {
      const pName = (p.name || '').toLowerCase();
      return pName.length > 2 && q.includes(pName);
    });
    if (hasPartMatch) {
      return true;
    }
  }

  // Not a stored query -> Needs Google Gemini AI!
  return false;
}

/**
 * Answers questions that match ALREADY STORED local workshop data & tutorials.
 */
export function processStoredWorkshopQuery(userQuery, parts = [], invoices = [], lang = 'en') {
  const query = (userQuery || '').toLowerCase().trim();
  const isMl = lang === 'ml';
  const data = getWorkshopSummaryData(parts, invoices);

  // 1. WhatsApp Sharing
  if (
    query.includes('whatsapp') ||
    query.includes('വാട്') ||
    query.includes('വാട്ട്') ||
    query.includes('ഷെയർ')
  ) {
    return isMl
      ? `📲 വാട്സാപ്പിൽ ബിൽ അയക്കുന്ന വിധം:\n\n1. ബിൽ തയ്യാറാക്കിയ ശേഷം "വാട്സാപ്പിൽ അയക്കുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.\n2. കസ്റ്റമറുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകാം, അല്ലെങ്കിൽ ഒഴിഞ്ഞിട്ട് "വാട്സാപ്പ് തുറക്കുക" ക്ലിക്ക് ചെയ്ത് കോൺടാക്റ്റ് തിരഞ്ഞെടുക്കാം.\n3. ബില്ലിന്റെ മുഴുവൻ വിവരങ്ങളും അടങ്ങിയ മെസ്സേജ് വാട്സാപ്പിൽ ഓട്ടോമാറ്റിക് ആയി വരും, സെൻഡ് ക്ലിക്ക് ചെയ്താൽ മതി.\n4. ഇതിനൊപ്പം ബില്ലിന്റെ PDF ഫയലും ഡൗൺലോഡ് ആകും. വേണമെങ്കിൽ അതും വാട്സാപ്പിൽ അറ്റാച്ച് ചെയ്ത് അയക്കാം.`
      : `📲 How WhatsApp Sharing Works:\n\n1. After creating a bill, click the green "WhatsApp Share" button.\n2. Enter the customer's 10-digit number (or leave blank to pick a contact in WhatsApp).\n3. It automatically opens WhatsApp with the full bill text pre-filled. Just tap Send!\n4. The invoice PDF is also automatically downloaded to your device so you can attach it.\n5. Direct WhatsApp messaging with instant PDF sharing!`;
  }

  // 2. Invoice Cancellation & Stock Restoration
  if (
    query.includes('cancel') ||
    query.includes('restore') ||
    query.includes('റദ്ദാ') ||
    query.includes('തിരികെ')
  ) {
    return isMl
      ? `🔄 ബിൽ റദ്ദാക്കലും സ്റ്റോക്ക് തിരികെ ലഭിക്കലും:\n\n• ഏതെങ്കിലും കാരണത്താൽ ഒരു ബിൽ ക്യാൻസൽ ചെയ്യണമെങ്കിൽ, ബിൽ തുറന്ന് താഴെയുള്ള "ബിൽ റദ്ദാക്കുക (സ്റ്റോക്ക് തിരികെ ചേർക്കുക)" ക്ലിക്ക് ചെയ്യുക.\n• ബില്ലിൽ ഉപയോഗിച്ച എല്ലാ സ്പെയർ പാർട്സുകളും കൃത്യമായി സ്റ്റോക്കിലേക്ക് തിരികെ ചേരുന്നതാണ്!\n• ഒരു കാരണവശാലും സ്റ്റോക്ക് തെറ്റുകയോ നഷ്ടപ്പെടുകയോ ഇല്ല.`
      : `🔄 Invoice Cancellation & Stock Restoration:\n\n• If you need to cancel an invoice, open the bill and click "Cancel Invoice (Restore Stock)".\n• All spare parts deducted for that bill are automatically restored back to inventory!\n• Duplicate cancellation is prevented, ensuring your stock quantities stay completely accurate.`;
  }

  // 3. Out of stock queries
  if (
    query.includes('out of stock') ||
    query.includes('തീർ') ||
    query.includes('സ്റ്റോക്കില്ല') ||
    query.includes('ഇല്ലാത്ത') ||
    query.includes('no stock')
  ) {
    if (data.outOfStockParts.length === 0) {
      return isMl
        ? '✅ നിലവിൽ സ്റ്റോക്ക് തീർന്നുപോയ പാർട്സുകൾ ഒന്നുമില്ല! എല്ലാ പാർട്സുകളും ആവശ്യത്തിന് സ്റ്റോക്കുണ്ട്.'
        : '✅ Great news! No parts are currently out of stock. All items have available quantity.';
    }
    const list = data.outOfStockParts.map((p) => `• ${p.name} (₹${p.price})`).join('\n');
    return isMl
      ? `⚠️ താഴെ പറയുന്ന ${data.outOfStockParts.length} പാർട്സുകളുടെ സ്റ്റോക്ക് പൂർണ്ണമായി തീർന്നുപോയിരിക്കുന്നു:\n\n${list}\n\nദയവായി സ്റ്റോക്ക് സെക്ഷനിൽ പോയി "+ സ്റ്റോക്ക്" ക്ലിക്ക് ചെയ്ത് പുതിയ സ്റ്റോക്ക് ചേർക്കുക.`
      : `⚠️ The following ${data.outOfStockParts.length} item(s) are completely out of stock:\n\n${list}\n\nPlease click "+ Stock" in the Stock section to add new units.`;
  }

  // 4. Low stock queries
  if (
    query.includes('low stock') ||
    query.includes('കുറവ') ||
    query.includes('കുറഞ്ഞ') ||
    query.includes('തീരാനായ') ||
    query.includes('shortage')
  ) {
    if (data.lowStockParts.length === 0) {
      return isMl
        ? '✅ സ്റ്റോക്ക് കുറഞ്ഞ പാർട്സുകൾ ഒന്നുമില്ല. എല്ലാം ആവശ്യത്തിന് സ്റ്റോക്കുണ്ട്.'
        : '✅ No items are running low on stock (all items have more than 3 units).';
    }
    const list = data.lowStockParts
      .map((p) => `• ${p.name}: ${p.quantity} എണ്ണം ബാക്കി (₹${p.price})`)
      .join('\n');
    return isMl
      ? `🔔 താഴെ പറയുന്ന പാർട്സുകളുടെ സ്റ്റോക്ക് 3 എണ്ണത്തിൽ താഴെയാണ് (Low Stock):\n\n${list}`
      : `🔔 The following parts are running low (3 or fewer units left):\n\n${list}`;
  }

  // 5. Total stock value / Summary
  if (
    query.includes('total stock') ||
    query.includes('stock value') ||
    query.includes('valuation') ||
    query.includes('ആകെ സ്റ്റോക്ക്') ||
    query.includes('സ്റ്റോക്കിന്റെ വില')
  ) {
    return isMl
      ? `📊 നിലവിലെ സ്റ്റോക്ക് വിവരങ്ങൾ:\n\n• ആകെ പാർട്സുകൾ: ${data.totalParts} ഇനം\n• ആകെ ലഭ്യമായ യൂണിറ്റുകൾ: ${data.totalStockUnits}\n• ആകെ സ്റ്റോക്ക് മൂല്യം: ₹${data.totalStockValue.toFixed(0)}\n• തീർന്നുപോയവ: ${data.outOfStockParts.length} എണ്ണം`
      : `📊 Current Workshop Stock Summary:\n\n• Total Spare Parts: ${data.totalParts} items\n• Total Available Units: ${data.totalStockUnits} units\n• Total Stock Value: ₹${data.totalStockValue.toFixed(0)}\n• Out of Stock Items: ${data.outOfStockParts.length}`;
  }

  // 6. Adding spare parts
  if (
    (query.includes('add') && query.includes('part')) ||
    (query.includes('add') && query.includes('stock')) ||
    query.includes('പുതിയ പാർട്ട്') ||
    (query.includes('പാർട്ട്') && query.includes('ചേർ')) ||
    (query.includes('സ്റ്റോക്ക്') && query.includes('ചേർ'))
  ) {
    return isMl
      ? `📦 സ്പെയർ പാർട്സ് ചേർക്കുന്ന വിധം:\n\n1. ഹോം സ്ക്രീനിൽ "സ്റ്റോക്ക് (STOCK)" ക്ലിക്ക് ചെയ്യുക.\n2. മുകളിലുള്ള "+ പുതിയ പാർട്ട് ചേർക്കുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.\n3. പാർട്ടിന്റെ പേര്, വില (₹), സ്റ്റോക്ക് അളവ് എന്നിവ നൽകി "സേവ് ചെയ്യുക" ക്ലിക്ക് ചെയ്യുക.\n4. പുതിയ സ്റ്റോക്ക് വരുമ്പോൾ: ഓരോ പാർട്ടിന്റെയും നേരെയുള്ള "+ സ്റ്റോക്ക്" ബട്ടൺ ക്ലിക്ക് ചെയ്താൽ സ്റ്റോക്ക് തനിയെ കൂടും!`
      : `📦 How to Manage Spare Parts Stock:\n\n1. Click "STOCK" on the home screen.\n2. Click "+ Add New Part" at the top right.\n3. Enter Part Name, Price in ₹, Available Quantity, and optional note, then click "Save Part".\n4. When a new shipment arrives: Click "+ Stock" next to any part, enter units, and it increments stock!`;
  }

  // 7. How to create invoice
  if (
    query.includes('invoice') ||
    query.includes('bill') ||
    query.includes('ബിൽ') ||
    query.includes('ഇൻവോയ്സ്')
  ) {
    return isMl
      ? `📝 പുതിയ ബിൽ ഉണ്ടാക്കുന്ന വിധം:\n\n1. "ബിൽ ഉണ്ടാക്കുക (CREATE INVOICE)" ക്ലിക്ക് ചെയ്യുക.\n2. വണ്ടി നമ്പർ നൽകുക (ഉദാ: KL 07 AB 1234). വേണമെങ്കിൽ കിലോമീറ്റർ (KM) റീഡിംഗും നൽകാം.\n3. "സ്പെയർ പാർട്ട് ചേർക്കുക" ടാബ് വഴി കടയിലെ പാർട്സുകൾ തിരഞ്ഞെടുക്കുക.\n4. "ചെയ്ത പണി" ടാബ് വഴി പണികളും പണിക്കൂലിയും ചേർക്കുക.\n5. "ബിൽ സ്ഥിരീകരിക്കുക" ക്ലിക്ക് ചെയ്യുമ്പോൾ സ്റ്റോക്ക് ഓട്ടോമാറ്റിക്കായി കുറയും!\n6. തുടർന്ന് PDF ഡൗൺലോഡ് ചെയ്യാം അല്ലെങ്കിൽ വാട്സാപ്പിൽ അയക്കാം.`
      : `📝 How to Create an Invoice:\n\n1. Click "CREATE INVOICE" on the home screen.\n2. Enter the bike Vehicle Number (e.g. KL 07 AB 1234) and optional Kilometre (KM) reading.\n3. Under "Add Spare Part", choose parts from your stock.\n4. Under "Add Work / Labor", enter any service done and the charge.\n5. Click "Confirm & Create Invoice". Stock reduces automatically for parts used.\n6. You can now Download PDF, Print Invoice, or Share on WhatsApp!`;
  }

  // 8. Vehicle number search
  const vehicleRegex = /[a-zA-Z]{2}\s*[-]?\s*\d{1,2}\s*[a-zA-Z]{0,3}\s*\d{1,4}/i;
  const vMatch = query.match(vehicleRegex);
  if (vMatch) {
    const rawSearch = vMatch[0].replace(/[\s-]/g, '').toLowerCase();
    const matchedInvoices = invoices.filter((inv) =>
      (inv.vehicle_number || '').replace(/[\s-]/g, '').toLowerCase().includes(rawSearch)
    );

    if (matchedInvoices.length > 0) {
      const invList = matchedInvoices
        .map(
          (inv) =>
            `• ${inv.invoice_number} | വണ്ടി: ${inv.vehicle_number}${inv.km_reading ? ` (${inv.km_reading})` : ''} | തീയതി: ${inv.date || inv.created_at?.slice(0, 10)} | തുക: ₹${inv.total_amount} (${inv.invoice_status === 'cancelled' ? 'റദ്ദാക്കി' : 'Confirmed'})`
        )
        .join('\n');
      return isMl
        ? `📋 ഈ വണ്ടിയുടെ (${vMatch[0].toUpperCase()}) ${matchedInvoices.length} ബില്ലുകൾ കണ്ടെത്തി:\n\n${invList}`
        : `📋 Found ${matchedInvoices.length} bill(s) for vehicle ${vMatch[0].toUpperCase()}:\n\n${invList}`;
    }
  }

  // 9. Specific part search in inventory
  const matchedPart = parts.find((p) => query.includes((p.name || '').toLowerCase()));
  if (matchedPart) {
    return isMl
      ? `🔍 പാർട്ട് വിവരം:\n• പേര്: ${matchedPart.name}\n• വില: ₹${matchedPart.price}\n• ലഭ്യമായ സ്റ്റോക്ക്: ${matchedPart.quantity} എണ്ണം\n• പാർട്ട് നമ്പർ: ${matchedPart.part_number || 'നൽകിയിട്ടില്ല'}`
      : `🔍 Part Details:\n• Name: ${matchedPart.name}\n• Price: ₹${matchedPart.price}\n• Available Stock: ${matchedPart.quantity} units\n• Part No: ${matchedPart.part_number || 'N/A'}`;
  }

  // 10. Language switch
  if (
    query.includes('language') ||
    query.includes('malayalam') ||
    query.includes('english') ||
    query.includes('ഭാഷ')
  ) {
    return isMl
      ? `🌐 ഭാഷ മാറ്റാൻ: മുകളിൽ കാണുന്ന നാവിഗേഷൻ ബാറിലെ "🌐 English" ബട്ടണിൽ ക്ലിക്ക് ചെയ്താൽ ആപ്പ് മുഴുവൻ ഇംഗ്ലീഷിലേക്ക് മാറും. അല്ലെങ്കിൽ ക്രമീകരണങ്ങൾ (Settings) വഴി മാറ്റാം.`
      : `🌐 To Change Language: Click the "🌐 മലയാളം" button in the top navigation bar anytime to switch the application to Malayalam, or vice-versa!`;
  }

  // General fallback for stored guide
  return isMl
    ? `👋 നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ബൈക്ക് വർക്ക്ഷോപ്പ് AI സഹായിയാണ്.\n\nഎനിക്ക് ഇവയിൽ സഹായിക്കാൻ കഴിയും:\n• ബിൽ തയ്യാറാക്കൽ, സ്പെയർ പാർട്സ് വിവരങ്ങൾ\n• സ്റ്റോക്ക് അളവും തീർന്നുപോയവയുടെ ലിസ്റ്റും\n• വണ്ടി നമ്പർ നൽകി പഴയ ബില്ലുകൾ തിരയൽ\n• ബൈക്ക് റിപ്പയറിംഗ് സംശയങ്ങൾ (Gemini AI വഴി)`
    : `👋 Hello! I am your Bike Workshop AI Assistant.\n\nI can help you with:\n• Workshop stock queries & valuation\n• Searching past bills by vehicle number\n• In-app billing & WhatsApp sharing\n• Motorcycle mechanical troubleshooting & mechanic advice powered by Google Gemini AI!`;
}

// Built-in fallback alias for backward compatibility with existing tests
export const processBuiltInAIQuery = processStoredWorkshopQuery;

/**
 * Calls Google Gemini AI with fallback models and rich workshop context.
 */
export async function callGeminiAPI({
  userQuery,
  parts = [],
  invoices = [],
  lang = 'en',
  geminiKey,
}) {
  const isMl = lang === 'ml';
  const summary = getWorkshopSummaryData(parts, invoices);

  // Craft rich, helpful context for the mechanic AI
  const promptContext = `
You are an expert AI Bike Workshop Assistant and Master Two-Wheeler Mechanic consultant.
You assist motorcycle and scooter workshop mechanics and shop owners.
Communicate in ${isMl ? 'Malayalam (മലയാളം)' : 'clear, concise, friendly English'}.
Use clear bullet points and practical mechanic steps. Keep answers actionable, professional, and easy to read on mobile.

CURRENT WORKSHOP INVENTORY CONTEXT:
- Total Spare Parts in Catalog: ${summary.totalParts}
- Total Stock Units: ${summary.totalStockUnits}
- Total Stock Valuation: Rs. ${summary.totalStockValue}
- Out of Stock Parts: ${JSON.stringify(summary.outOfStockParts.map((p) => p.name))}
- Low Stock Parts (<=3 units): ${JSON.stringify(summary.lowStockParts.map((p) => `${p.name} (${p.quantity})`))}
- Recent Invoices Count: ${summary.totalInvoices}

SAMPLE WORKSHOP PARTS AVAILABLE:
${JSON.stringify(parts.slice(0, 15).map((p) => ({ name: p.name, price: p.price, stock: p.quantity })))}

USER QUESTION:
"${userQuery}"

Provide a direct, practical, and highly helpful answer. If it's a bike mechanical or troubleshooting question, explain likely causes and how to fix or test it.
`;

  // Try candidate models in order of speed and stability
  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptContext }] }],
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return {
            success: true,
            text: text.trim(),
            model,
          };
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`Gemini model ${model} returned HTTP ${response.status}:`, errJson?.error?.message || response.statusText);
        // If error is invalid API key, no need to keep trying other models
        if (response.status === 400 && (errJson?.error?.message || '').toLowerCase().includes('api_key_invalid')) {
          return {
            success: false,
            error: 'invalid_key',
            message: errJson?.error?.message,
          };
        }
        if (response.status === 503 || response.status === 429) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    } catch (fetchErr) {
      console.warn(`Gemini fetch error on model ${model}:`, fetchErr.message);
    }
  }

  return { success: false, error: 'all_models_failed' };
}

/**
 * Main query handler:
 * 1. Checks user input: If asking for already stored workshop data or app tutorials,
 *    returns instant verified workshop data (engine: 'stored').
 * 2. If NOT asking for stored items: Uses Google Gemini AI to provide dynamic mechanic advice!
 */
export async function queryAIAssistant({ userQuery, parts = [], invoices = [], lang = 'en' }) {
  const isMl = lang === 'ml';
  const cleanQuery = (userQuery || '').trim();

  // Step 1: Check if the user is asking for ALREADY STORED local data or app guides
  const isStored = isStoredWorkshopQuery(cleanQuery, parts, invoices);

  if (isStored) {
    const storedResponse = processStoredWorkshopQuery(cleanQuery, parts, invoices, lang);
    return {
      text: storedResponse,
      engine: 'stored',
    };
  }

  // Step 2: User input is NOT for stored data -> Call Google Gemini AI!
  const geminiInfo = getStoredGeminiKey();
  const geminiKey = typeof geminiInfo === 'string' ? geminiInfo : geminiInfo?.key;

  if (geminiKey) {
    const geminiResult = await callGeminiAPI({
      userQuery: cleanQuery,
      parts,
      invoices,
      lang,
      geminiKey,
    });

    if (geminiResult.success && geminiResult.text) {
      return {
        text: geminiResult.text,
        engine: 'gemini',
        model: geminiResult.model,
      };
    }

    if (geminiResult.error === 'invalid_key') {
      return {
        text: isMl
          ? `⚠️ Google Gemini കണക്ഷൻ ലഭ്യമല്ല. വർക്ക്ഷോപ്പ് സ്റ്റോക്ക് അല്ലെങ്കിൽ ബിൽ വിവരങ്ങൾ പരിശോധിക്കാം.`
          : `⚠️ Google Gemini service is currently unavailable. You can check workshop stock or invoices anytime.`,
        engine: 'error',
      };
    }
  }

  // Step 3: Fallback if Gemini key is missing or failed
  return {
    text: isMl
      ? `👋 നമസ്കാരം! വർക്ക്ഷോപ്പ് സ്റ്റോക്ക് വിവരങ്ങൾ, പുതിയ ബിൽ തയ്യാറാക്കൽ, വണ്ടി നമ്പർ തിരയൽ തുടങ്ങിയ കാര്യങ്ങൾ എപ്പോൾ വേണമെങ്കിലും ചോദിക്കാം!`
      : `👋 Hello! You can ask about workshop stock, bill creation, and vehicle searches anytime!`,
    engine: 'builtin',
  };
}
