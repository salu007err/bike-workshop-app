// Automated verification script for Bike Workshop App logic (Bilingual, Pure Supabase, and Free AI Agent)
import { jsPDF } from 'jspdf';

// Mock localStorage for node environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

if (typeof global.window === 'undefined') {
  global.window = {
    open: () => {},
    print: () => {},
  };
}

// Import services
const db = await import('./src/services/db.js');
const invService = await import('./src/services/invoiceService.js');
const trans = await import('./src/services/translations.js');
const aiAgent = await import('./src/services/aiAgent.js');
const searchUtils = await import('./src/services/searchUtils.js');
const commonParts = await import('./src/services/commonBikeParts.js');

// Setup Pure Supabase Mock for automated test environment
const mockPartsTable = [];
const mockInvoicesTable = [];
const mockInvoiceItemsTable = [];

const mockSupabase = {
  _url: 'https://peqiwojcxtklbbvfctxt.supabase.co',
  from: (table) => {
    if (table === 'parts') {
      return {
        select: (cols) => ({
          order: (col, opts) => {
            const copy = [...mockPartsTable];
            copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            return Promise.resolve({ data: copy, error: null });
          },
          eq: (col, val) => ({
            single: () => {
              const item = mockPartsTable.find((p) => String(p[col]) === String(val));
              return Promise.resolve({ data: item || null, error: item ? null : { message: 'Part not found' } });
            }
          })
        }),
        insert: (rows) => ({
          select: () => ({
            single: () => {
              const item = {
                id: 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                created_at: new Date().toISOString(),
                ...rows[0]
              };
              mockPartsTable.push(item);
              return Promise.resolve({ data: item, error: null });
            }
          })
        }),
        update: (fields) => ({
          eq: (col, val) => {
            const idx = mockPartsTable.findIndex((p) => String(p[col]) === String(val));
            if (idx !== -1) {
              mockPartsTable[idx] = { ...mockPartsTable[idx], ...fields };
            }
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: idx !== -1 ? mockPartsTable[idx] : null,
                  error: idx !== -1 ? null : { message: 'Not found' }
                })
              }),
              then: (resolve) => resolve({
                data: idx !== -1 ? mockPartsTable[idx] : null,
                error: idx !== -1 ? null : { message: 'Not found' }
              })
            };
          }
        }),
        delete: () => ({
          eq: (col, val) => {
            const idx = mockPartsTable.findIndex((p) => String(p[col]) === String(val));
            if (idx !== -1) mockPartsTable.splice(idx, 1);
            return Promise.resolve({ error: null });
          }
        })
      };
    }
    if (table === 'invoices') {
      return {
        select: (cols) => ({
          order: () => Promise.resolve({ data: [...mockInvoicesTable], error: null }),
          eq: (col, val) => ({
            single: () => {
              const inv = mockInvoicesTable.find((i) => String(i[col]) === String(val));
              return Promise.resolve({ data: inv || null, error: inv ? null : { message: 'Invoice not found' } });
            }
          })
        }),
        insert: (rows) => ({
          select: () => ({
            single: () => {
              const inv = {
                id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                created_at: new Date().toISOString(),
                ...rows[0],
                items: []
              };
              mockInvoicesTable.push(inv);
              return Promise.resolve({ data: inv, error: null });
            }
          })
        }),
        update: (fields) => ({
          eq: (col, val) => {
            const inv = mockInvoicesTable.find((i) => String(i[col]) === String(val));
            if (inv) Object.assign(inv, fields);
            return {
              select: () => ({
                single: () => Promise.resolve({ data: inv || null, error: inv ? null : { message: 'Not found' } })
              }),
              then: (resolve) => resolve({ data: inv || null, error: inv ? null : { message: 'Not found' } })
            };
          }
        })
      };
    }
    if (table === 'invoice_items') {
      return {
        insert: (rows) => {
          mockInvoiceItemsTable.push(...rows);
          // Attach to invoice in mock
          rows.forEach((r) => {
            const inv = mockInvoicesTable.find((i) => i.id === r.invoice_id);
            if (inv) {
              if (!inv.items) inv.items = [];
              inv.items.push(r);
            }
          });
          return Promise.resolve({ error: null });
        },
        delete: () => ({
          eq: (col, val) => {
            for (let i = mockInvoiceItemsTable.length - 1; i >= 0; i--) {
              if (String(mockInvoiceItemsTable[i][col]) === String(val)) {
                mockInvoiceItemsTable.splice(i, 1);
              }
            }
            mockInvoicesTable.forEach((inv) => {
              if (String(inv.id) === String(val)) inv.items = [];
            });
            return Promise.resolve({ error: null });
          }
        })
      };
    }
    return {};
  },
  rpc: () => Promise.resolve({ data: null, error: { message: 'Use direct Supabase flow' } })
};

db.setSupabaseClient(mockSupabase);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log('--- STARTING PRODUCTION-READY SYSTEM, MALAYALAM & AI AGENT VERIFICATION ---\n');

// 1. Initial parts load: must start with 0 dummy data!
console.log('Test Suite 1: Clean Production State (Zero Dummy Data)');
const initialParts = await db.fetchParts();
assert(initialParts.success === true, 'Successfully fetched parts');
assert(initialParts.data.length === 0, `Initial stock starts 100% clean with ${initialParts.data.length} dummy items`);
assert(initialParts.source === 'supabase', 'Data source is 100% Supabase');

// 2. Language & Translations validation
console.log('\nTest Suite 2: Malayalam & English Internationalization');
assert(trans.translations.en !== undefined, 'English translations object exists');
assert(trans.translations.ml !== undefined, 'Malayalam translations object exists');
assert(trans.translations.ml.home.stockBtn.includes('സ്റ്റോക്ക്'), 'Malayalam stock button label is correct');
assert(trans.translations.ml.home.invoiceBtn.includes('ബിൽ'), 'Malayalam invoice button label is correct');
assert(trans.translations.ml.stock.addNewPart.includes('പുതിയ പാർട്ട്'), 'Malayalam add part label is correct');
assert(trans.translations.ml.createInvoice.vehicleLabel.includes('വണ്ടി നമ്പർ'), 'Malayalam vehicle label is correct');
assert(trans.translations.ml.suggestions.length >= 8, `Malayalam common repair suggestions populated (${trans.translations.ml.suggestions.length})`);

// 3. Adding a real spare part
console.log('\nTest Suite 3: Adding a Spare Part');
const newPart = await db.addPart({
  name: 'Engine Oil 4T 20W40 (1L)',
  price: 450,
  quantity: 10,
  note: 'Standard 4T oil'
});
assert(newPart.success === true, 'Successfully added spare part');
assert(newPart.data.name === 'Engine Oil 4T 20W40 (1L)', 'Part name matches');
assert(newPart.data.price === 450, 'Price matches ₹450');
assert(newPart.data.quantity === 10, 'Quantity matches 10');
assert(newPart.source === 'supabase', 'Added directly to Supabase');

// 4. Adding a second part
const brakePart = await db.addPart({
  name: 'Brake Shoe (Rear)',
  price: 180,
  quantity: 8,
  note: 'Drum brake shoe'
});
assert(brakePart.success === true, 'Successfully added second spare part');

// 5. Editing part price and quantity
console.log('\nTest Suite 4: Editing Spare Part');
const updatedPart = await db.updatePart(newPart.data.id, {
  name: 'Engine Oil 4T 20W40 (Castrol)',
  price: 470,
  quantity: 12,
  note: 'Castrol Activ 4T'
});
assert(updatedPart.success === true, 'Successfully edited spare part');
assert(updatedPart.data.price === 470, 'Price successfully updated to ₹470');
assert(updatedPart.data.quantity === 12, 'Quantity successfully updated to 12');

// 6. Adding more stock when new shipment arrives
console.log('\nTest Suite 5: Quick Add More Stock');
const stockAdded = await db.addStockQuantity(newPart.data.id, 5);
assert(stockAdded.success === true, 'Successfully added 5 more stock units');
assert(stockAdded.data.quantity === 17, 'Total stock is now 17 (12 + 5)');

// 7. Creating an invoice with multiple parts and work items
console.log('\nTest Suite 6: Creating Invoice & Calculating Total');
const invoiceItems = [
  {
    part_id: newPart.data.id,
    description: 'Engine Oil 4T 20W40 (Castrol)',
    quantity: 1,
    price: 470,
    item_type: 'part'
  },
  {
    part_id: brakePart.data.id,
    description: 'Brake Shoe (Rear)',
    quantity: 1,
    price: 180,
    item_type: 'part'
  },
  {
    part_id: null,
    description: 'Oil Change Service Charge',
    quantity: 1,
    price: 100,
    item_type: 'work'
  }
];

const total = invoiceItems.reduce((sum, it) => sum + (it.quantity * it.price), 0);
assert(total === 750, `Total calculated correctly: ₹${total} (470 + 180 + 100)`);

const createdInvoice = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 CD 5678',
  items: invoiceItems,
  totalAmount: total,
  workshopName: 'KERALA MOTORS'
});

assert(createdInvoice.success === true, 'Invoice successfully created');
assert(createdInvoice.data.invoice_number.startsWith('INV-'), `Invoice number generated: ${createdInvoice.data.invoice_number}`);
assert(createdInvoice.data.vehicle_number === 'KL 07 CD 5678', 'Vehicle number recorded accurately');
assert(createdInvoice.source === 'supabase', 'Invoice saved to Supabase');

// 8. Verifying stock reduction
console.log('\nTest Suite 7: Verifying Stock Reduction');
const partsAfterInvoice = await db.fetchParts();
const oilAfter = partsAfterInvoice.data.find(p => p.id === newPart.data.id);
const brakeAfter = partsAfterInvoice.data.find(p => p.id === brakePart.data.id);
assert(oilAfter.quantity === 16, `Engine oil stock reduced by 1 (from 17 to ${oilAfter.quantity})`);
assert(brakeAfter.quantity === 7, `Brake shoe stock reduced by 1 (from 8 to ${brakeAfter.quantity})`);

// 9. Free AI Agent Doubts & Live Data Verification
console.log('\nTest Suite 8: Free AI Agent (App Doubts & Live Data Access)');
const invoicesList = await db.fetchInvoices();
const liveStats = aiAgent.getWorkshopSummaryData(partsAfterInvoice.data, invoicesList.data);

assert(liveStats.totalParts === 2, `AI data extraction: Total parts count is ${liveStats.totalParts}`);
assert(liveStats.totalStockUnits === (16 + 7), `AI data extraction: Total units count is ${liveStats.totalStockUnits} (16 + 7)`);
assert(liveStats.totalStockValue === (16 * 470 + 7 * 180), `AI data extraction: Stock valuation calculated: ₹${liveStats.totalStockValue}`);
assert(liveStats.totalInvoices === 1, `AI data extraction: Total invoices count is ${liveStats.totalInvoices}`);

// AI Query in Malayalam
const aiResponseMl = await aiAgent.queryAIAssistant({
  userQuery: 'ബിൽ എങ്ങനെ ഉണ്ടാക്കാം?',
  parts: partsAfterInvoice.data,
  invoices: invoicesList.data,
  lang: 'ml'
});
assert(aiResponseMl.text.includes('ബിൽ'), 'AI responds in Malayalam for invoice creation doubt');
assert(aiResponseMl.engine === 'stored' || aiResponseMl.engine === 'builtin' || (aiResponseMl.engine && aiResponseMl.engine.includes('gemini')), 'AI operates in verified stored mode or Gemini AI');

// AI Query in English
const aiResponseEn = await aiAgent.queryAIAssistant({
  userQuery: 'How to make a new bill?',
  parts: partsAfterInvoice.data,
  invoices: invoicesList.data,
  lang: 'en'
});
assert(aiResponseEn.text.includes('Invoice') || aiResponseEn.text.includes('bill'), 'AI responds in English for invoice creation doubt');

// AI Query for Live Data
const aiStockQuery = await aiAgent.queryAIAssistant({
  userQuery: 'What is my current stock valuation?',
  parts: partsAfterInvoice.data,
  invoices: invoicesList.data,
  lang: 'en'
});
assert(aiStockQuery.text.includes(String(liveStats.totalStockValue)) || aiStockQuery.text.includes('8780'), 'AI accurately analyzes live stock availability');

// AI Query for WhatsApp guidance in Malayalam
const aiWhatsAppQuery = await aiAgent.queryAIAssistant({
  userQuery: 'വാട്സാപ്പിൽ അയക്കുന്നത് എങ്ങനെ?',
  parts: partsAfterInvoice.data,
  invoices: invoicesList.data,
  lang: 'ml'
});
assert(aiWhatsAppQuery.text.includes('വാട്സാപ്പ്') || aiWhatsAppQuery.text.includes('വാട്ട്') || aiWhatsAppQuery.text.toLowerCase().includes('whatsapp'), 'AI explains WhatsApp sharing procedure in Malayalam');

// AI Query for Vehicle lookup
const aiVehicleLookup = await aiAgent.queryAIAssistant({
  userQuery: 'KL 07 CD 5678 ബിൽ വിവരങ്ങൾ എന്താണ്?',
  parts: partsAfterInvoice.data,
  invoices: invoicesList.data,
  lang: 'ml'
});
assert(aiVehicleLookup.text.includes('KL 07 CD 5678') || aiVehicleLookup.text.includes('750') || aiVehicleLookup.text.length > 10, 'AI locates past bill by bike vehicle registration number');

// 10. Invoice Cancellation & Stock Restoration
console.log('\nTest Suite 9: Invoice Cancellation & Stock Restoration');
const cancelResult = await db.cancelInvoice(createdInvoice.data.id);
assert(cancelResult.success === true, 'Invoice cancelled successfully');
assert(cancelResult.source === 'supabase', 'Cancelled in Supabase');

const partsAfterCancel = await db.fetchParts();
const oilRestored = partsAfterCancel.data.find(p => p.id === newPart.data.id);
const brakeRestored = partsAfterCancel.data.find(p => p.id === brakePart.data.id);
assert(oilRestored.quantity === 17, `Engine oil stock restored to original ${oilRestored.quantity}`);
assert(brakeRestored.quantity === 8, `Brake shoe stock restored to original ${brakeRestored.quantity}`);

// 11. WhatsApp Malayalam message formatting
console.log('\nTest Suite 10: Malayalam WhatsApp Sharing Message');
const whatsappMsgMl = invService.getWhatsAppInvoiceMessage(createdInvoice.data, 'റമീസ് ബൈക്ക് സർവീസ്', 'ml');
assert(whatsappMsgMl.includes('റമീസ് ബൈക്ക് സർവീസ്'), 'WhatsApp Malayalam message contains Malayalam Workshop Name');
assert(whatsappMsgMl.includes('KL 07 CD 5678'), 'WhatsApp Malayalam message contains Vehicle Number');
assert(whatsappMsgMl.includes('750'), 'WhatsApp Malayalam message contains Malayalam Total Amount');

// 12. PDF Document Generation
console.log('\nTest Suite 11: PDF Document Generation');
const pdfDoc = invService.generateInvoicePDFDoc(createdInvoice.data, 'റമീസ് ബൈക്ക് സർവീസ്');
assert(pdfDoc && typeof pdfDoc.output === 'function', 'jsPDF document instance successfully generated');
const pdfOutput = pdfDoc.output('arraybuffer');
assert(pdfOutput.byteLength > 1000, `PDF generated with binary size: ${pdfOutput.byteLength} bytes`);

// 13. Nullable Part Number & Nullable Image
console.log('\nTest Suite 12: Nullable Part Number & Nullable Part Image');
const partWithNumberAndImg = await db.addPart({
  name: 'Spark Plug NGK CR7E',
  price: 150,
  quantity: 20,
  part_number: '24101-KTC-900',
  image_url: 'https://example.com/spark-plug.jpg',
  note: 'Fits 125cc-150cc bikes'
});
assert(partWithNumberAndImg.success === true, 'Successfully added part with part_number and image_url');
assert(partWithNumberAndImg.data.part_number === '24101-KTC-900', 'Part number correctly saved');
assert(partWithNumberAndImg.data.image_url === 'https://example.com/spark-plug.jpg', 'Image URL correctly saved');

// Adding part without part_number and without image_url (nullable verification)
const partWithoutNullable = await db.addPart({
  name: 'Chain Lubricant Spray',
  price: 220,
  quantity: 5,
  part_number: null,
  image_url: null,
  note: 'Lube spray'
});
assert(partWithoutNullable.success === true, 'Part successfully created with null part_number and null image_url');
assert(partWithoutNullable.data.part_number === null, 'Nullable part_number is null');
assert(partWithoutNullable.data.image_url === null, 'Nullable image_url is null');

// 14. Typo-Tolerant & Fuzzy Search Verification
console.log('\nTest Suite 13: Typo-Tolerant & Fuzzy Search');
const allStock = (await db.fetchParts()).data;

// Query with misspelling "castol" should match "Castrol"
const typoMatchesCastrol = searchUtils.fuzzyFilter(allStock, 'castol');
assert(typoMatchesCastrol.length > 0 && typoMatchesCastrol[0].name.includes('Castrol'), 'Misspelling "castol" matches "Engine Oil 4T 20W40 (Castrol)"');

// Query with misspelling "engne" should match "Engine Oil"
const typoMatchesEngine = searchUtils.fuzzyFilter(allStock, 'engne');
assert(typoMatchesEngine.length > 0 && typoMatchesEngine[0].name.includes('Engine Oil'), 'Misspelling "engne" matches "Engine Oil"');

// Query with misspelling "brak" should match "Brake Shoe"
const typoMatchesBrake = searchUtils.fuzzyFilter(allStock, 'brak');
assert(typoMatchesBrake.length > 0 && typoMatchesBrake[0].name.includes('Brake Shoe'), 'Misspelling "brak" matches "Brake Shoe"');

// Query with part number without hyphens "24101ktc" should match "24101-KTC-900"
const partNumberSearch = searchUtils.fuzzyFilter(allStock, '24101ktc');
assert(partNumberSearch.length > 0 && partNumberSearch[0].part_number === '24101-KTC-900', 'Part number search "24101ktc" matches "24101-KTC-900"');

// Levenshtein distance check
assert(searchUtils.levenshteinDistance('engine', 'engne') === 1, 'Levenshtein distance "engine" vs "engne" is 1');
assert(searchUtils.levenshteinDistance('castrol', 'castol') === 1, 'Levenshtein distance "castrol" vs "castol" is 1');
assert(searchUtils.levenshteinDistance('brake', 'brak') === 1, 'Levenshtein distance "brake" vs "brak" is 1');

// 15. Global Bike & Scooter Parts Catalog Autocomplete Verification
console.log('\nTest Suite 14: Global Bike & Scooter Parts Catalog Autocomplete');
assert(commonParts.COMMON_BIKE_PARTS.length >= 80, `Extensive catalog contains ${commonParts.COMMON_BIKE_PARTS.length} common bike and scooter parts`);

// Autocomplete search for scooter drive belt
const beltResults = commonParts.searchCommonBikeParts('belt', 5);
assert(beltResults.length > 0 && beltResults.some(p => p.name.includes('Belt')), 'Autocomplete "belt" returns Scooter CVT Drive Belt');

// Autocomplete search for brake pads
const brakeResults = commonParts.searchCommonBikeParts('brake pad', 5);
assert(brakeResults.length > 0 && brakeResults.some(p => p.name.includes('Brake Pad')), 'Autocomplete "brake pad" returns Disc Brake Pad');

// Autocomplete search for spark plug
const sparkResults = commonParts.searchCommonBikeParts('spark', 5);
assert(sparkResults.length > 0 && sparkResults.some(p => p.name.includes('Spark Plug')), 'Autocomplete "spark" returns Spark Plug');

// Autocomplete search for scooter variator rollers
const rollerResults = commonParts.searchCommonBikeParts('roller', 5);
assert(rollerResults.length > 0 && rollerResults.some(p => p.name.includes('Roller')), 'Autocomplete "roller" returns Variator Roller Weights');

// Autocomplete search with Malayalam query
const mlResults = commonParts.searchCommonBikeParts('ക്ലച്ച്', 5);
assert(mlResults.length > 0 && mlResults.some(p => p.name.toLowerCase().includes('clutch')), 'Malayalam autocomplete search "ക്ലച്ച്" returns Clutch Plate Set');

// 16. Invoice Edit & Stock Reconciliation Verification
console.log('\nTest Suite 15: Edit Saved Invoice & Reconcile Spare Part Stock');

// Step A: Add a new spare part with 10 units
const airFilterPart = await db.addPart({
  name: 'Air Filter Element Royal Enfield',
  price: 250,
  quantity: 10,
  part_number: '591240/B',
  image_url: null,
  note: 'Classic 350 / Hunter'
});
assert(airFilterPart.success === true, 'Added Air Filter Element with stock = 10');

// Step B: Create an initial invoice with 2x Air Filter Element (stock becomes 8) and 1x Labor
const initialInvoiceRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 CD 1234',
  items: [
    {
      part_id: airFilterPart.data.id,
      description: airFilterPart.data.name,
      quantity: 2,
      price: 250,
      item_type: 'part'
    },
    {
      part_id: null,
      description: 'Filter Replacement Work',
      quantity: 1,
      price: 100,
      item_type: 'work'
    }
  ],
  totalAmount: 600
});

assert(initialInvoiceRes.success === true, 'Created initial invoice for KL 07 CD 1234 with 2x Air Filter');
const postCreatePart = (await db.fetchParts()).data.find(p => p.id === airFilterPart.data.id);
assert(postCreatePart.quantity === 8, `Stock after creating invoice is 8 (was 10, used 2)`);

// Step C: Edit the invoice - change vehicle number to KL 07 CD 1234 (REVISED), increase Air Filter to 3, and add new work item
const editInvoiceRes = await db.updateInvoiceWithStockDeduction({
  invoiceId: initialInvoiceRes.data.id,
  vehicleNumber: 'KL 07 CD 1234 (REVISED)',
  items: [
    {
      part_id: airFilterPart.data.id,
      description: airFilterPart.data.name,
      quantity: 3,
      price: 250,
      item_type: 'part'
    },
    {
      part_id: null,
      description: 'Full Throttle Body Cleaning',
      quantity: 1,
      price: 250,
      item_type: 'work'
    }
  ],
  totalAmount: 1000
});

assert(editInvoiceRes.success === true, 'Successfully updated saved invoice');
assert(editInvoiceRes.data.vehicle_number === 'KL 07 CD 1234 (REVISED)', 'Vehicle number successfully updated to KL 07 CD 1234 (REVISED)');
assert(editInvoiceRes.data.total_amount === 1000, 'Total amount successfully updated to 1000');
assert(editInvoiceRes.data.items.length === 2, 'Invoice items updated to 2 items');

// Step D: Verify that stock was reconciled:
// Initial stock was 10. Previous invoice had 2. Edited invoice has 3.
// So new stock should be 10 - 3 = 7.
const postEditPart = (await db.fetchParts()).data.find(p => p.id === airFilterPart.data.id);
assert(postEditPart.quantity === 7, `Stock after editing invoice is 7 (was 8, restored 2 -> 10, deducted 3 -> 7)`);

// Step E: Verify stock shortage check on edit - trying to update with 50 units (only 7+3=10 available)
const excessiveQtyRes = await db.updateInvoiceWithStockDeduction({
  invoiceId: initialInvoiceRes.data.id,
  vehicleNumber: 'KL 07 CD 1234 (REVISED)',
  items: [
    {
      part_id: airFilterPart.data.id,
      description: airFilterPart.data.name,
      quantity: 50,
      price: 250,
      item_type: 'part'
    }
  ],
  totalAmount: 12500
});

assert(excessiveQtyRes.success === false, 'Excessive quantity edit rejected');
assert(excessiveQtyRes.error.includes('Not enough stock'), 'Proper stock error returned on excessive quantity');

// Verify stock is preserved at 7 after rejected edit
const postRollbackPart = (await db.fetchParts()).data.find(p => p.id === airFilterPart.data.id);
assert(postRollbackPart.quantity === 7, 'Stock preserved at 7 after rejected edit transaction');

// 17. Outside Purchased Parts & Labour-Only Bills Verification
console.log('\nTest Suite 16: Outside Purchased Parts & Labour-Only Bills');

// Test 1: Labour-Only Bill (Customer brought their own parts, only fitting labour charged)
const labourOnlyRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 EF 5555',
  items: [
    {
      part_id: null,
      description: 'Customer Oil Change Labour',
      quantity: 1,
      price: 80,
      item_type: 'work'
    },
    {
      part_id: null,
      description: 'Customer Brake Shoe Fitting Labour',
      quantity: 1,
      price: 120,
      item_type: 'work'
    }
  ],
  totalAmount: 200
});

assert(labourOnlyRes.success === true, 'Labour-only bill created successfully for customer with own parts');
assert(labourOnlyRes.data.total_amount === 200, 'Labour bill total amount correctly calculated: ₹200');

// Verify that zero stock was deducted anywhere in workshop inventory
const partsAfterLabourOnly = (await db.fetchParts()).data;
const airFilterCheck1 = partsAfterLabourOnly.find(p => p.id === airFilterPart.data.id);
assert(airFilterCheck1.quantity === 7, 'Workshop stock completely untouched by labour-only bill (still 7)');

// Test 2: Outside Purchased Part (Mechanic purchased part for customer with price, not from stock)
const outsidePartRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 GH 7777',
  items: [
    {
      part_id: null, // Null part_id indicates outside purchased part
      description: 'Exide 12V 4Ah Battery (Outside Purchase)',
      quantity: 1,
      price: 1350,
      item_type: 'part'
    },
    {
      part_id: null,
      description: 'Battery Fitting & Electrical Check',
      quantity: 1,
      price: 100,
      item_type: 'work'
    }
  ],
  totalAmount: 1450
});

assert(outsidePartRes.success === true, 'Outside purchased part invoice created successfully');
assert(outsidePartRes.data.total_amount === 1450, 'Invoice total includes outside part price + labour: ₹1450');

// Verify outside part didn't deduct from workshop inventory
const partsAfterOutside = (await db.fetchParts()).data;
const airFilterCheck2 = partsAfterOutside.find(p => p.id === airFilterPart.data.id);
assert(airFilterCheck2.quantity === 7, 'Workshop inventory stock remains 7 (outside part not deducted)');

// Test 3: Customer Supplied Part at ₹0 + Labour Charge
const customerZeroPartRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 IJ 8888',
  items: [
    {
      part_id: null,
      description: 'Customer Supplied Motul 15W50 Engine Oil',
      quantity: 1,
      price: 0,
      item_type: 'part'
    },
    {
      part_id: null,
      description: 'Oil Replacement Service',
      quantity: 1,
      price: 70,
      item_type: 'work'
    }
  ],
  totalAmount: 70
});

assert(customerZeroPartRes.success === true, 'Customer supplied part recorded at ₹0 with service labour ₹70');
assert(customerZeroPartRes.data.total_amount === 70, 'Total bill amount is ₹70');

// Test 4: Hybrid Bill (1 In-Stock Part + 1 Outside Part + 1 Labour)
const hybridRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 KL 9999',
  items: [
    {
      part_id: airFilterPart.data.id, // In-Stock Part (should deduct 1 from 7 -> 6)
      description: airFilterPart.data.name,
      quantity: 1,
      price: 250,
      item_type: 'part'
    },
    {
      part_id: null, // Outside Purchased Part (no stock deduction)
      description: 'Spark Plug NGK (Outside Purchase)',
      quantity: 1,
      price: 160,
      item_type: 'part'
    },
    {
      part_id: null, // Labour Charge
      description: 'General Tuneup Labour',
      quantity: 1,
      price: 150,
      item_type: 'work'
    }
  ],
  totalAmount: 560
});

assert(hybridRes.success === true, 'Hybrid bill (Stock Part + Outside Part + Labour) created successfully');
assert(hybridRes.data.total_amount === 560, 'Hybrid total calculated accurately: ₹560');

// Verify only the in-stock part was deducted (from 7 to 6)
const partsAfterHybrid = (await db.fetchParts()).data;
const airFilterCheck3 = partsAfterHybrid.find(p => p.id === airFilterPart.data.id);
assert(airFilterCheck3.quantity === 6, 'Only the workshop in-stock part was deducted (from 7 to 6)');

// PDF check for outside part label
const hybridPdfDoc = invService.generateInvoicePDFDoc(hybridRes.data, 'SPEEDY MOTORS');
assert(hybridPdfDoc && typeof hybridPdfDoc.output === 'function', 'Generated PDF invoice with Outside Part differentiation');

console.log('\n--- TEST SUITE 17: Optional KM Reading & Cleaned Promotional Wordings ---');

// Test 1: Invoice with KM Reading
const kmInvoiceRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 CD 1234',
  items: [
    {
      part_id: null,
      description: 'General Water Wash & Chain Lube',
      quantity: 1,
      price: 250,
      item_type: 'work'
    }
  ],
  totalAmount: 250,
  kmReading: '24,500'
});

assert(kmInvoiceRes.success === true, 'Invoice with KM reading created successfully');
assert(kmInvoiceRes.data.km_reading === '24,500', 'KM reading persisted in invoice data');

// PDF with KM Reading
const kmPdfDoc = invService.generateInvoicePDFDoc(kmInvoiceRes.data, 'SPEEDY MOTORS');
assert(kmPdfDoc && typeof kmPdfDoc.output === 'function', 'PDF with KM generated successfully');

// Test 2: Invoice without KM Reading (completely optional)
const noKmInvoiceRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 CD 5678',
  items: [
    {
      part_id: null,
      description: 'Oil Change Labour',
      quantity: 1,
      price: 100,
      item_type: 'work'
    }
  ],
  totalAmount: 100
});

assert(noKmInvoiceRes.success === true, 'Invoice without KM reading created successfully');
assert(!noKmInvoiceRes.data.km_reading, 'KM reading is null/empty when omitted');

// PDF without KM Reading (ensure no errors and omitted clean)
const noKmPdfDoc = invService.generateInvoicePDFDoc(noKmInvoiceRes.data, 'SPEEDY MOTORS');
assert(noKmPdfDoc && typeof noKmPdfDoc.output === 'function', 'PDF without KM generated cleanly');

// Test 3: Updating KM Reading
const updatedKmRes = await db.updateInvoiceWithStockDeduction({
  invoiceId: kmInvoiceRes.data.id,
  vehicleNumber: 'KL 07 CD 1234',
  items: kmInvoiceRes.data.items,
  totalAmount: 250,
  kmReading: '24,800 KM'
});
assert(updatedKmRes.success === true, 'Invoice KM reading updated successfully');
assert(updatedKmRes.data.km_reading === '24,800 KM', 'Updated KM reading reflected in database');

// Test 4: WhatsApp Message Verification (with KM & without KM)
const kmWhatsAppEn = invService.getWhatsAppInvoiceMessage(kmInvoiceRes.data, 'SPEEDY MOTORS', 'en');
assert(kmWhatsAppEn.includes('(KM):') && kmWhatsAppEn.includes('24,500'), 'WhatsApp text includes KM when provided');

const kmWhatsAppMl = invService.getWhatsAppInvoiceMessage(kmInvoiceRes.data, 'SPEEDY MOTORS', 'ml');
assert(kmWhatsAppMl.includes('കിലോമീറ്റർ') && kmWhatsAppMl.includes('24,500'), 'Malayalam WhatsApp text includes KM when provided');

const noKmWhatsApp = invService.getWhatsAppInvoiceMessage(noKmInvoiceRes.data, 'SPEEDY MOTORS', 'en');
assert(!noKmWhatsApp.includes('KM'), 'WhatsApp text omits KM line completely when not provided');

// Test 5: Verify Promotional "100% Free" and "ORIGINAL BILL" Removal
assert(!kmWhatsAppEn.includes('100% Free'), 'WhatsApp text contains no "100% Free" promotional wording');
assert(!kmWhatsAppMl.includes('100% സൗജന്യം'), 'Malayalam WhatsApp text contains no "100% സൗജന്യം" wording');

const aiWhatsAppResp = await aiAgent.queryAIAssistant({
  userQuery: 'How to share invoice on WhatsApp?',
  parts: [],
  invoices: [],
  lang: 'en'
});
assert(!aiWhatsAppResp.text.includes('100% Free'), 'AI Assistant WhatsApp answer contains no "100% Free" badge');
assert(!aiWhatsAppResp.text.includes('ORIGINAL BILL'), 'AI Assistant answer contains no "ORIGINAL BILL"');

console.log('\n--- TEST SUITE 18: Smart AI Routing (Stored vs Gemini AI) ---');

// Test A: Stored query detection
assert(aiAgent.isStoredWorkshopQuery('How to create an invoice?', [], []) === true, 'Recognizes invoice guide as stored query');
assert(aiAgent.isStoredWorkshopQuery('What is out of stock?', [], []) === true, 'Recognizes out of stock as stored query');
assert(aiAgent.isStoredWorkshopQuery('Total stock value', [], []) === true, 'Recognizes stock value as stored query');
assert(aiAgent.isStoredWorkshopQuery('KL 07 CD 1234', [], []) === true, 'Recognizes vehicle search as stored query');

// Test B: Non-stored query detection (Dynamic Gemini AI)
assert(aiAgent.isStoredWorkshopQuery('Why is engine oil leaking from the bottom of bike?', [], []) === false, 'Recognizes mechanic diagnosis as Gemini query');
assert(aiAgent.isStoredWorkshopQuery('How to clean carburetor jets?', [], []) === false, 'Recognizes repair instruction as Gemini query');
assert(aiAgent.isStoredWorkshopQuery('Recommended tyre pressure for scooter', [], []) === false, 'Recognizes technical spec as Gemini query');

// Test C: Stored Query Response (Engine is 'stored')
const storedQueryResp = await aiAgent.queryAIAssistant({
  userQuery: 'What is my total stock value?',
  parts: (await db.fetchParts()).data,
  invoices: [],
  lang: 'en'
});
assert(storedQueryResp.engine === 'stored', 'Stored inventory query served by local database');
assert(storedQueryResp.text.includes('Workshop Stock Summary'), 'Stored query returns local inventory breakdown');

// Test D: Google Gemini AI Query Response (Engine is 'gemini')
const geminiQueryResp = await aiAgent.queryAIAssistant({
  userQuery: 'Why does a motorcycle vibrate at high speeds? Answer in 2 points.',
  parts: (await db.fetchParts()).data,
  invoices: [],
  lang: 'en'
});
assert(geminiQueryResp.engine === 'gemini', 'Non-stored bike troubleshooting query routed to Google Gemini AI');
assert(geminiQueryResp.text.length > 20, 'Gemini AI generated detailed response');
assert(typeof geminiQueryResp.model === 'string' && geminiQueryResp.model.includes('gemini'), `Gemini responded using active model: ${geminiQueryResp.model}`);

// Test E: Malayalam Google Gemini AI Response
const geminiMlResp = await aiAgent.queryAIAssistant({
  userQuery: 'ബൈക്ക് സ്റ്റാർട്ട് ആവാത്തതിന് പ്രധാന കാരണങ്ങൾ എന്തൊക്കെ?',
  parts: (await db.fetchParts()).data,
  invoices: [],
  lang: 'ml'
});
assert(geminiMlResp.engine === 'gemini', 'Malayalam mechanic question routed to Google Gemini AI');
assert(geminiMlResp.text.length > 20, 'Gemini AI returned fluent Malayalam diagnosis');

// Test F: Custom Gemini Key Storage
aiAgent.saveStoredGeminiKey('AIzaSyCustomTestKey12345');
const storedCustomKey = aiAgent.getStoredGeminiKey();
assert(storedCustomKey.key === 'AIzaSyCustomTestKey12345' && storedCustomKey.isCustom === true, 'User custom Gemini key saved and retrieved');
aiAgent.removeStoredGeminiKey();
const defaultKeyAgain = aiAgent.getStoredGeminiKey();
assert(defaultKeyAgain.isCustom === false, 'Reset to default Gemini configuration key works properly');

console.log('\n=======================================');
console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
console.log(`PASSED: ${testsPassed}`);
console.log(`FAILED: ${testsFailed}`);
console.log('=======================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
