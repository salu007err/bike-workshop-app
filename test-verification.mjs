// Automated verification script for Bike Workshop App logic
import { jsPDF } from 'jspdf';

// Mock localStorage for node environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

// Mock window for invoiceService if needed
if (typeof global.window === 'undefined') {
  global.window = {
    open: () => {},
    print: () => {},
  };
}

// Import services
const db = await import('./src/services/db.js');
const invService = await import('./src/services/invoiceService.js');

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

console.log('--- STARTING COMPREHENSIVE SYSTEM VERIFICATION ---\n');

// 1. Initial parts load
console.log('Test Suite 1: Parts & Initial Stock');
const initialParts = await db.fetchParts();
assert(initialParts.success === true, 'Successfully fetched parts');
assert(initialParts.data.length >= 8, `Default stock loaded with ${initialParts.data.length} parts`);

// 2. Adding a spare part
console.log('\nTest Suite 2: Adding a Spare Part');
const newPart = await db.addPart({
  name: 'Halogen Headlight Bulb 12V 35W',
  price: 95,
  quantity: 20,
  note: 'High beam / low beam bulb'
});
assert(newPart.success === true, 'Successfully added spare part');
assert(newPart.data.name === 'Halogen Headlight Bulb 12V 35W', 'Part name matches');
assert(newPart.data.price === 95, 'Price matches ₹95');
assert(newPart.data.quantity === 20, 'Quantity matches 20');

// 3. Editing part price and quantity
console.log('\nTest Suite 3: Editing Spare Part');
const updatedPart = await db.updatePart(newPart.data.id, {
  name: 'Halogen Headlight Bulb 12V 35W (Philips)',
  price: 110,
  quantity: 25,
  note: 'Genuine Philips brand'
});
assert(updatedPart.success === true, 'Successfully edited spare part');
assert(updatedPart.data.price === 110, 'Price successfully updated to ₹110');
assert(updatedPart.data.quantity === 25, 'Quantity successfully updated to 25');

// 4. Adding more stock when new stock arrives
console.log('\nTest Suite 4: Quick Add More Stock');
const stockAdded = await db.addStockQuantity(newPart.data.id, 10);
assert(stockAdded.success === true, 'Successfully added 10 more stock units');
assert(stockAdded.data.quantity === 35, 'Total stock is now 35 (25 + 10)');

// 5. Creating an invoice with multiple parts and work items
console.log('\nTest Suite 5: Creating Invoice & Calculating Total');
const engineOil = (await db.fetchParts()).data.find(p => p.name.includes('Engine Oil'));
const brakeShoe = (await db.fetchParts()).data.find(p => p.name.includes('Brake Shoe'));

const initialOilQty = engineOil.quantity;
const initialBrakeQty = brakeShoe.quantity;

const invoiceItems = [
  {
    part_id: engineOil.id,
    description: engineOil.name,
    quantity: 1,
    price: engineOil.price, // 450
    item_type: 'part'
  },
  {
    part_id: brakeShoe.id,
    description: brakeShoe.name,
    quantity: 1,
    price: brakeShoe.price, // 180
    item_type: 'part'
  },
  {
    part_id: null,
    description: 'Oil Change Work',
    quantity: 1,
    price: 100,
    item_type: 'work'
  }
];

const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
assert(totalAmount === 730, `Total calculated correctly: ₹730 (450 + 180 + 100)`);

const createInvRes = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 07 AB 1234',
  items: invoiceItems,
  totalAmount,
  workshopName: 'TEST BIKE WORKSHOP'
});

assert(createInvRes.success === true, 'Invoice successfully created');
assert(createInvRes.data.invoice_number.startsWith('INV-'), `Invoice number generated: ${createInvRes.data.invoice_number}`);
assert(createInvRes.data.vehicle_number === 'KL 07 AB 1234', 'Vehicle number recorded accurately');

// 6. Verifying stock reduction
console.log('\nTest Suite 6: Verifying Stock Reduction');
const partsAfterInvoice = (await db.fetchParts()).data;
const oilAfter = partsAfterInvoice.find(p => p.id === engineOil.id);
const brakeAfter = partsAfterInvoice.find(p => p.id === brakeShoe.id);

assert(oilAfter.quantity === initialOilQty - 1, `Engine oil stock reduced by 1 (from ${initialOilQty} to ${oilAfter.quantity})`);
assert(brakeAfter.quantity === initialBrakeQty - 1, `Brake shoe stock reduced by 1 (from ${initialBrakeQty} to ${brakeAfter.quantity})`);

// 7. Preventing stock from becoming negative
console.log('\nTest Suite 7: Prevent Negative Stock');
const excessiveInvoice = await db.createInvoiceWithStockDeduction({
  vehicleNumber: 'KL 01 XY 9999',
  items: [
    {
      part_id: engineOil.id,
      description: engineOil.name,
      quantity: 9999, // Exceeds available
      price: engineOil.price,
      item_type: 'part'
    }
  ],
  totalAmount: 9999 * engineOil.price
});
assert(excessiveInvoice.success === false, 'Blocked invoice creation when stock requested exceeds available');
assert(excessiveInvoice.error.includes('Not enough stock'), `Error message clearly explains insufficient stock: "${excessiveInvoice.error}"`);

// 8. Cancelling an invoice and restoring deducted stock
console.log('\nTest Suite 8: Invoice Cancellation & Stock Restoration');
const cancelRes = await db.cancelInvoice(createInvRes.data.id);
assert(cancelRes.success === true, 'Invoice cancelled successfully');

const partsAfterCancel = (await db.fetchParts()).data;
const oilRestored = partsAfterCancel.find(p => p.id === engineOil.id);
const brakeRestored = partsAfterCancel.find(p => p.id === brakeShoe.id);

assert(oilRestored.quantity === initialOilQty, `Engine oil stock restored to original ${initialOilQty}`);
assert(brakeRestored.quantity === initialBrakeQty, `Brake shoe stock restored to original ${initialBrakeQty}`);

// 9. Preventing duplicate cancellation / duplicate stock restoration
const duplicateCancel = await db.cancelInvoice(createInvRes.data.id);
assert(duplicateCancel.success === false, 'Blocked duplicate cancellation of already cancelled invoice');

// 10. WhatsApp sharing message format
console.log('\nTest Suite 9: WhatsApp Sharing Message Generation');
const waMsg = invService.getWhatsAppInvoiceMessage(createInvRes.data, 'SPEEDY BIKE WORKSHOP');
assert(waMsg.includes('SPEEDY BIKE WORKSHOP'), 'WhatsApp message contains Workshop Name');
assert(waMsg.includes('KL 07 AB 1234'), 'WhatsApp message contains Vehicle Number');
assert(waMsg.includes('TOTAL AMOUNT: Rs.730'), 'WhatsApp message contains Total Amount: Rs.730');
assert(waMsg.includes('Engine Oil'), 'WhatsApp message lists items changed');

// 11. jsPDF Invoice Document Generation
console.log('\nTest Suite 10: PDF Document Generation');
const pdfDoc = invService.generateInvoicePDFDoc(createInvRes.data, 'SPEEDY BIKE WORKSHOP');
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
