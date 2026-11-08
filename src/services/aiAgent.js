/**
 * Free Bike Workshop AI Assistant
 * Provides 100% free assistance for app doubts and real-time live data analysis.
 * Dual Engine:
 * 1. Built-in Smart Workshop NLP Agent (Zero-key, runs 100% free in-browser with live data access)
 * 2. Optional Google Gemini Free Tier API (If user adds free Gemini key in settings)
 */

import { AI_CONFIG } from '../config/supabaseConfig.js';

const LOCAL_STORAGE_GEMINI_KEY = 'bike_workshop_gemini_key';

export function getStoredGeminiKey() {
  // 1. Check hardcoded configuration in src/config/supabaseConfig.js
  if (
    AI_CONFIG?.GEMINI_API_KEY &&
    AI_CONFIG.GEMINI_API_KEY.trim() !== '' &&
    !AI_CONFIG.GEMINI_API_KEY.includes('your-gemini')
  ) {
    return { key: AI_CONFIG.GEMINI_API_KEY.trim(), source: 'config' };
  }

  // 2. Check environment variables (.env or Cloudflare Pages)
  const envKey =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_GEMINI_API_KEY
      : undefined;
  if (
    envKey &&
    envKey.trim() !== '' &&
    envKey !== 'YOUR_GEMINI_KEY' &&
    !envKey.includes('your-gemini')
  ) {
    return { key: envKey.trim(), source: 'env' };
  }

  // 3. Check browser localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY);
    if (local && local.trim() !== '') {
      return { key: local.trim(), source: 'local' };
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export function saveStoredGeminiKey(key) {
  try {
    if (!key) {
      localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Analyzes live workshop data
 */
export function getWorkshopSummaryData(parts = [], invoices = []) {
  const totalParts = parts.length;
  const outOfStockParts = parts.filter((p) => (p.quantity || 0) <= 0);
  const lowStockParts = parts.filter((p) => (p.quantity || 0) > 0 && (p.quantity || 0) <= 3);
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
 * Processes queries using the Built-in Zero-Key Workshop AI
 */
export function processBuiltInAIQuery(userQuery, parts = [], invoices = [], lang = 'en') {
  const query = (userQuery || '').toLowerCase().trim();
  const isMl = lang === 'ml';
  const data = getWorkshopSummaryData(parts, invoices);

  // 1. WhatsApp Sharing / വാട്സാപ്പിൽ അയക്കുന്നത് എങ്ങനെ
  if (
    query.includes('whatsapp') ||
    query.includes('വാട്') ||
    query.includes('വാട്ട്') ||
    query.includes('share') ||
    query.includes('ഷെയർ')
  ) {
    return isMl
      ? `📲 വാട്സാപ്പിൽ ബിൽ അയക്കുന്ന വിധം (100% സൗജന്യം):\n\n1. ബിൽ തയ്യാറാക്കിയ ശേഷം "വാട്സാപ്പിൽ അയക്കുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.\n2. കസ്റ്റമറുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകാം, അല്ലെങ്കിൽ ഒഴിഞ്ഞിട്ട് "വാട്സാപ്പ് തുറക്കുക" ക്ലിക്ക് ചെയ്ത് കോൺടാക്റ്റ് തിരഞ്ഞെടുക്കാം.\n3. ബില്ലിന്റെ മുഴുവൻ വിവരങ്ങളും അടങ്ങിയ മെസ്സേജ് വാട്സാപ്പിൽ ഓട്ടോമാറ്റിക് ആയി വരും, സെൻഡ് ക്ലിക്ക് ചെയ്താൽ മതി.\n4. ഇതിനൊപ്പം ബില്ലിന്റെ PDF ഫയലും ഡൗൺലോഡ് ആകും. വേണമെങ്കിൽ അതും വാട്സാപ്പിൽ അറ്റാച്ച് ചെയ്ത് അയക്കാം.\n5. യാതൊരു പെയ്ഡ് WhatsApp API യും ഇതിന് ആവശ്യമില്ല (₹0 ചിലവ്)!`
      : `📲 How WhatsApp Sharing Works (100% Free):\n\n1. After creating a bill, click the green "WhatsApp Share" button.\n2. Enter the customer's 10-digit number (or leave blank to pick a contact in WhatsApp).\n3. It automatically opens WhatsApp with the full bill text pre-filled. Just tap Send!\n4. The invoice PDF is also automatically downloaded to your device so you can attach it.\n5. Zero third-party fees, no paid WhatsApp business API required (₹0 cost)!`;
  }

  // 2. Invoice cancellation & stock restore / ക്യാൻസൽ ചെയ്താൽ
  if (
    query.includes('cancel') ||
    query.includes('restore') ||
    query.includes('റദ്ദാ') ||
    query.includes('തിരികെ')
  ) {
    return isMl
      ? `🔄 ബിൽ റദ്ദാക്കലും സ്റ്റോക്ക് തിരികെ ലഭിക്കലും:\n\n• ഏതെങ്കിലും കാരണത്താൽ ഒരു ബിൽ ക്യാൻസൽ ചെയ്യണമെങ്കിൽ, ബിൽ തുറന്ന് താഴെയുള്ള "ബിൽ റദ്ദാക്കുക (സ്റ്റോക്ക് തിരികെ ചേർക്കുക)" ക്ലിക്ക് ചെയ്യുക.\n• ബില്ലിൽ ഉപയോഗിച്ച എല്ലാ സ്പെയർ പാർട്സുകളും കൃത്യമായി സ്റ്റോക്കിലേക്ക് തിരികെ ചേരുന്നതാണ്!\n• ഒരു കാരണവശാലും സ്റ്റോക്ക് തെറ്റുകയോ നഷ്ടപ്പെടുകയോ ഇല്ല.`
      : `🔄 Invoice Cancellation & Stock Restoration:\n\n• If you need to cancel an invoice, open the bill and click "Cancel Invoice (Restore Stock)".\n• All spare parts deducted for that bill are automatically restored back to inventory!\n• Duplicate cancellation is prevented, ensuring your stock quantities stay 100% accurate.`;
  }

  // 3. Stock Out of Stock Queries
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

  // 4. Low stock Queries
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

  // 5. Total stock value / ആകെ സ്റ്റോക്ക് തുക
  if (
    query.includes('total stock') ||
    query.includes('stock value') ||
    query.includes('valuation') ||
    query.includes('ആകെ സ്റ്റോക്ക്') ||
    query.includes('സ്റ്റോക്കിന്റെ വില')
  ) {
    return isMl
      ? `📊 നിലവിലെ സ്റ്റോക്ക് വിവരങ്ങൾ:\n\n• ആകെ പാർട്സുകൾ: ${data.totalParts} എണ്ണം\n• ആകെ ലഭ്യമായ യൂണിറ്റുകൾ: ${data.totalStockUnits}\n• ആകെ സ്റ്റോക്ക് മൂല്യം: ₹${data.totalStockValue.toFixed(0)}\n• തീർന്നുപോയവ: ${data.outOfStockParts.length} എണ്ണം`
      : `📊 Current Workshop Stock Summary:\n\n• Total Spare Parts: ${data.totalParts} items\n• Total Available Units: ${data.totalStockUnits} units\n• Total Stock Value: ₹${data.totalStockValue.toFixed(0)}\n• Out of Stock Items: ${data.outOfStockParts.length}`;
  }

  // 6. How to add spare parts / പാർട്ട് എങ്ങനെ ചേർക്കാം
  if (
    (query.includes('add') && query.includes('part')) ||
    (query.includes('add') && query.includes('stock')) ||
    query.includes('പുതിയ പാർട്ട്') ||
    (query.includes('പാർട്ട്') && query.includes('ചേർ')) ||
    (query.includes('സ്റ്റോക്ക്') && query.includes('ചേർ'))
  ) {
    return isMl
      ? `📦 സ്പെയർ പാർട്സ് ചേർക്കുന്ന വിധം:\n\n1. ഹോം സ്ക്രീനിൽ "സ്റ്റോക്ക് (STOCK)" ക്ലിക്ക് ചെയ്യുക.\n2. മുകളിലുള്ള "+ പുതിയ പാർട്ട് ചേർക്കുക" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.\n3. പാർട്ടിന്റെ പേര് (ഉദാ: എൻജിൻ ഓയിൽ), വില (₹), സ്റ്റോക്ക് അളവ് എന്നിവ നൽകി "സേവ് ചെയ്യുക" ക്ലിക്ക് ചെയ്യുക.\n4. കടയിലേക്ക് പുതിയ സ്റ്റോക്ക് വരുമ്പോൾ: ഓരോ പാർട്ടിന്റെയും നേരെയുള്ള "+ സ്റ്റോക്ക്" ബട്ടൺ ക്ലിക്ക് ചെയ്ത് വന്ന എണ്ണം നൽകിയാൽ സ്റ്റോക്ക് തനിയെ കൂടും!`
      : `📦 How to Manage Spare Parts Stock:\n\n1. Click "STOCK" on the home screen.\n2. Click "+ Add New Part" at the top right.\n3. Enter Part Name, Price in ₹, Available Quantity, and optional note, then click "Save Part".\n4. When a new shipment arrives: Simply click the "+ Stock" button next to any part, enter how many arrived, and it automatically increments stock!`;
  }

  // 7. How to create an invoice / ബിൽ എങ്ങനെ ഉണ്ടാക്കാം
  if (
    query.includes('invoice') ||
    query.includes('bill') ||
    query.includes('ബിൽ') ||
    query.includes('ഇൻവോയ്സ്')
  ) {
    return isMl
      ? `📝 പുതിയ ബിൽ ഉണ്ടാക്കുന്ന വിധം:\n\n1. ഹോം സ്ക്രീനിൽ "ബിൽ ഉണ്ടാക്കുക (CREATE INVOICE)" ക്ലിക്ക് ചെയ്യുക.\n2. വണ്ടി നമ്പർ നൽകുക (ഉദാ: KL 07 AB 1234). കസ്റ്റമറുടെ പേരോ ഫോണോ ആവശ്യമില്ല.\n3. "സ്പെയർ പാർട്ട് ചേർക്കുക" ടാബ് വഴി മാറ്റിയ പാർട്സുകൾ തിരഞ്ഞെടുത്ത് എണ്ണം നൽകുക.\n4. "ചെയ്ത പണി" ടാബ് വഴി പണികളും പണിക്കൂലിയും ചേർക്കുക (ഉദാ: ഓയിൽ മാറ്റൽ ₹100).\n5. ആകെ തുക ഓട്ടോമാറ്റിക് കണക്കുകൂട്ടപ്പെടും.\n6. "ബിൽ സ്ഥിരീകരിക്കുക" ക്ലിക്ക് ചെയ്യുമ്പോൾ ഉപയോഗിച്ച പാർട്സുകളുടെ സ്റ്റോക്ക് ഓട്ടോമാറ്റിക്കായി കുറയും!\n7. തുടർന്ന് PDF ഡൗൺലോഡ് ചെയ്യാം, പ്രിന്റ് ചെയ്യാം, അല്ലെങ്കിൽ വാട്സാപ്പിൽ അയക്കാം.`
      : `📝 How to Create an Invoice:\n\n1. Click "CREATE INVOICE" on the home screen.\n2. Enter the bike Vehicle Registration Number (e.g. KL 07 AB 1234). No customer name or phone is required.\n3. Under "Add Spare Part", choose parts from your stock and enter quantity used.\n4. Under "Add Work / Labor", enter any service done and the labor charge (e.g. Oil Change Work ₹100).\n5. The total amount is calculated automatically in real time.\n6. Click "Confirm & Create Invoice". Stock will be automatically reduced for parts used.\n7. You can now Download PDF, Print Invoice, or Share on WhatsApp!`;
  }

  // 8. Vehicle number search in bills
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
            `• ${inv.invoice_number} | വണ്ടി: ${inv.vehicle_number} | തീയതി: ${inv.date || inv.created_at?.slice(0, 10)} | തുക: ₹${inv.total_amount} (${inv.invoice_status === 'cancelled' ? 'റദ്ദാക്കി' : 'Confirmed'})`
        )
        .join('\n');
      return isMl
        ? `📋 ഈ വണ്ടിയുടെ (${vMatch[0].toUpperCase()}) ${matchedInvoices.length} ബില്ലുകൾ കണ്ടെത്തി:\n\n${invList}`
        : `📋 Found ${matchedInvoices.length} bill(s) for vehicle ${vMatch[0].toUpperCase()}:\n\n${invList}`;
    }
  }

  // 9. Specific part search
  const matchedPart = parts.find((p) => query.includes((p.name || '').toLowerCase()));
  if (matchedPart) {
    return isMl
      ? `🔍 പാർട്ട് വിവരം:\n• പേര്: ${matchedPart.name}\n• വില: ₹${matchedPart.price}\n• ലഭ്യമായ സ്റ്റോക്ക്: ${matchedPart.quantity} എണ്ണം\n• കുറിപ്പ്: ${matchedPart.note || 'ഇല്ല'}`
      : `🔍 Part Details:\n• Name: ${matchedPart.name}\n• Price: ₹${matchedPart.price}\n• Available Stock: ${matchedPart.quantity} units\n• Note: ${matchedPart.note || 'None'}`;
  }

  // 10. Language switch
  if (
    query.includes('language') ||
    query.includes('malayalam') ||
    query.includes('english') ||
    query.includes('ഭാഷ')
  ) {
    return isMl
      ? `🌐 ഭാഷ മാറ്റാൻ:\n\nമുകളിൽ കാണുന്ന നാവിഗേഷൻ ബാറിലെ "🌐 English" ബട്ടണിൽ ക്ലിക്ക് ചെയ്താൽ ആപ്പ് മുഴുവൻ ഇംഗ്ലീഷിലേക്ക് മാറും. അല്ലെങ്കിൽ ക്രമീകരണങ്ങൾ (Settings) വഴി മാറ്റാം.`
      : `🌐 To Change Language:\n\nClick the "🌐 മലയാളം" button in the top navigation bar anytime to switch the entire application to Malayalam, or vice-versa!`;
  }

  // 11. General Overview / Default response
  if (isMl) {
    return `👋 നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ബൈക്ക് വർക്ക്ഷോപ്പ് AI സഹായിയാണ്.\n\nഎനിക്ക് ഇവയിൽ സഹായിക്കാൻ കഴിയും:\n• ബിൽ എങ്ങനെ ഉണ്ടാക്കാം, പാർട്സ് എങ്ങനെ ചേർക്കാം എന്ന സംശയങ്ങൾ\n• "സ്റ്റോക്ക് തീർന്നവ ഏതൊക്കെ?", "ആകെ സ്റ്റോക്ക് എത്ര?" തുടങ്ങിയ വിവരങ്ങൾ\n• വാട്സാപ്പ് ഷെയറിംഗ്, PDF ഡൗൺലോഡ് സഹായങ്ങൾ\n• വണ്ടി നമ്പർ നൽകി പഴയ ബില്ലുകൾ തിരയൽ\n\nഎന്തെങ്കിലും സംശയമുണ്ടെങ്കിൽ ചോദിക്കൂ!`;
  } else {
    return `👋 Hello! I am your Bike Workshop AI Assistant.\n\nI can help you with:\n• Clearing any doubts on creating bills or adding spare parts\n• Checking live stock: "What is out of stock?", "Total stock value"\n• Searching past bills by bike vehicle number\n• Explaining PDF printing, WhatsApp sharing, and stock restoration\n\nHow can I help you today?`;
  }
}

/**
 * Main query handler:
 * Checks if a Gemini API key is available. If yes, uses Gemini Free Tier API with live workshop data context.
 * Otherwise, uses the Built-in Zero-Key Assistant.
 */
export async function queryAIAssistant({ userQuery, parts = [], invoices = [], lang = 'en' }) {
  const geminiInfo = getStoredGeminiKey();
  const geminiKey = typeof geminiInfo === 'string' ? geminiInfo : geminiInfo?.key;

  // If Gemini Key is present, call Google Gemini API with live data context
  if (geminiKey) {
    try {
      const summary = getWorkshopSummaryData(parts, invoices);
      const isMl = lang === 'ml';

      const promptContext = `
You are the AI Assistant for a small bike workshop management application.
The owner has little computer knowledge. Respond in very simple, polite, concise ${isMl ? 'Malayalam (മലയാളം)' : 'English'}.

CURRENT WORKSHOP LIVE DATA:
- Total Spare Parts in stock: ${summary.totalParts}
- Total Available Units: ${summary.totalStockUnits}
- Total Stock Valuation: Rs. ${summary.totalStockValue}
- Out of stock parts: ${JSON.stringify(summary.outOfStockParts.map((p) => p.name))}
- Low stock parts (< 3): ${JSON.stringify(summary.lowStockParts.map((p) => `${p.name} (${p.quantity})`))}
- Total invoices: ${summary.totalInvoices}
- Total billed amount: Rs. ${summary.totalBilledAmount}

All Spare Parts list:
${JSON.stringify(parts.map((p) => ({ name: p.name, price: p.price, stock: p.quantity })))}

Recent invoices:
${JSON.stringify(invoices.slice(0, 5).map((i) => ({ vehicle: i.vehicle_number, total: i.total_amount, date: i.date })))}

USER QUESTION: "${userQuery}"

Provide a clear, accurate, friendly answer based on the app features and live data. Keep it concise.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptContext }] }],
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return {
            text: text.trim(),
            engine: 'gemini',
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API query failed, falling back to built-in AI:', err);
    }
  }

  // Fallback / Default: Built-in Zero-Key Workshop AI
  const responseText = processBuiltInAIQuery(userQuery, parts, invoices, lang);
  return {
    text: responseText,
    engine: 'builtin',
  };
}
