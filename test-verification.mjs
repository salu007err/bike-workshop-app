// Automated verification script for Bike Workshop App logic (Bilingual & Clean Production)
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

console.log('--- STARTING PRODUCTION-READY SYSTEM & MALAYALAM VERIFICATION ---\n');

// 1. Initial parts load: must start with 0 dummy data!
console.log('Test Suite 1: Clean Production State (Zero Dummy Data)');
const initialParts = await db.fetchParts();
assert(initialParts.success === true, 'Successfully fetched parts');
assert(initialParts.data.length === 0, `Initial stock starts 100% clean with ${initialParts.data.length} dummy items`);

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
    description: updatedPart.data.name,
    quantity: 1,
    price: 470,
    item_type: 'part'
  },
  {
    part_id: brakePart.data.id,
    description: brakePart.data.name,
    quantity: 1,
    price: 180,
    item_type: 'part'
  },
  {
    part_id: null,
    description: 'ഓയിൽ മാറ്റൽ പണി (Oil Change)',
    quantity: 1,
    price: 100,
    item_type: 'work'
  }
];

const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
assert(totalAmount === 750, `Total calculated correctly: ₹750 (470 + 180 + 100)`);

const createInvRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 AB 1234',
  items: invoiceItems,
  totalAmount,
  workshopName: 'റമേഷ് ബൈക്ക് വർക്ക്സ്'
});

assert(createInvRes.success === true, 'Invoice successfully created');
assert(createInvRes.data.invoice_number.startsWith('INV-'), `Invoice number generated: ${createInvRes.data.invoice_number}`);
assert(createInvRes.data.vehicle_number === 'KL 07 AB 1234', 'Vehicle number recorded accurately');

// 8. Verifying stock reduction
console.log('\nTest Suite 7: Verifying Stock Reduction');
const partsAfterInvoice = (await db.fetchParts()).data;
const oilAfter = partsAfterInvoice.find(p => p.id === newPart.data.id);
const brakeAfter = partsAfterInvoice.find(p => p.id === brakePart.data.id);

assert(oilAfter.quantity === 16, `Engine oil stock reduced by 1 (from 17 to 16)`);
assert(brakeAfter.quantity === 7, `Brake shoe stock reduced by 1 (from 8 to 7)`);

// 9. Preventing stock from becoming negative
console.log('\nTest Suite 8: Prevent Negative Stock');
const excessiveInvoice = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 01 XY 9999',
  items: [
    {
      part_id: newPart.data.id,
      description: updatedPart.data.name,
      quantity: 9999, // Exceeds available
      price: 470,
      item_type: 'part'
    }
  ],
  totalAmount: 9999 * 470
});
assert(excessiveInvoice.success === false, 'Blocked invoice creation when stock requested exceeds available');

// 10. Cancelling an invoice and restoring deducted stock
console.log('\nTest Suite 9: Invoice Cancellation & Stock Restoration');
const cancelRes = await db.cancelInvoice(createInvRes.data.id);
assert(cancelRes.success === true, 'Invoice cancelled successfully');

const partsAfterCancel = (await db.fetchParts()).data;
const oilRestored = partsAfterCancel.find(p => p.id === newPart.data.id);
const brakeRestored = partsAfterCancel.find(p => p.id === brakePart.data.id);

assert(oilRestored.quantity === 17, `Engine oil stock restored to original 17`);
assert(brakeRestored.quantity === 8, `Brake shoe stock restored to original 8`);

// 11. WhatsApp sharing message format in Malayalam
console.log('\nTest Suite 10: Malayalam WhatsApp Sharing Message');
const waMsgMl = invService.getWhatsAppInvoiceMessage(createInvRes.data, 'റമേഷ് ബൈക്ക് പോയിന്റ്', 'ml');
assert(waMsgMl.includes('റമേഷ് ബൈക്ക് പോയിന്റ്'), 'WhatsApp Malayalam message contains Malayalam Workshop Name');
assert(waMsgMl.includes('KL 07 AB 1234'), 'WhatsApp Malayalam message contains Vehicle Number');
assert(waMsgMl.includes('ആകെ തുക: Rs.750'), 'WhatsApp Malayalam message contains Malayalam Total Amount');
assert(waMsgMl.includes('മാറ്റിയ പാർട്സുകളും ചെയ്ത പണികളും:'), 'WhatsApp Malayalam message contains Malayalam items header');

// 12. jsPDF Invoice Document Generation
console.log('\nTest Suite 11: PDF Document Generation');
const pdfDoc = invService.generateInvoicePDFDoc(createInvRes.data, 'RAMESH BIKE POINT');
assert(pdfDoc !== null && typeof pdfDoc.output === 'function', 'jsPDF document instance successfully generated');
const pdfBlob = pdfDoc.output('blob');
assert(pdfBlob && pdfBlob.size > 0, `PDF generated with binary size: ${pdfBlob.size} bytes`);

console.log('\n=======================================');
console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
console.log(`PASSED: ${testsPassed}`);
console.log(`FAILED: ${testsFailed}`);
console.log('=======================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
