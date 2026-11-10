import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Formats a date into a clean DD/MM/YYYY string.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Generates jsPDF document instance for an invoice.
 */
export function generateInvoicePDFDoc(invoice, workshopName = 'BIKE WORKSHOP') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Workshop Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text((workshopName || 'BIKE WORKSHOP').toUpperCase(), 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TWO-WHEELER SERVICE & SPARE PARTS INVOICE', 14, 24);

  // Invoice badge
  doc.setFillColor(59, 130, 246); // blue-500
  doc.roundedRect(pageWidth - 45, 8, 31, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 41, 17);

  // Invoice Details Box
  const hasExtraRow = !!invoice.vehicle_model;
  const boxHeight = hasExtraRow ? 34 : 28;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 38, pageWidth - 28, boxHeight, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE REGISTRATION NUMBER', 20, 46);
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text((invoice.vehicle_number || 'N/A').toUpperCase(), 20, 55);

  if (invoice.vehicle_model) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`MODEL: ${invoice.vehicle_model.toUpperCase()}`, 20, 64);
  }

  // Optional KM Reading in details box
  if (invoice.km_reading) {
    const cleanKm = invoice.km_reading.toUpperCase().includes('KM')
      ? invoice.km_reading.toUpperCase()
      : `${invoice.km_reading} KM`;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('KILOMETRE (KM):', 105, 46);
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(cleanKm, 105, 55);
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('INVOICE NO:', pageWidth - 80, 46);
  doc.text('DATE:', pageWidth - 80, 55);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text(invoice.invoice_number || 'N/A', pageWidth - 50, 46);
  doc.text(formatDate(invoice.date || invoice.created_at), pageWidth - 50, 55);

  // Items Table
  const tableRows = (invoice.items || []).map((item, index) => {
    const itemType = item.item_type === 'part'
      ? (item.part_id ? 'Part (Stock)' : 'Part (Outside)')
      : 'Labor / Work';
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity, 10) || 1;
    const amount = (price * qty).toFixed(2);

    return [
      index + 1,
      item.description,
      itemType,
      qty,
      `Rs. ${price.toFixed(2)}`,
      `Rs. ${amount}`,
    ];
  });

  autoTable(doc, {
    startY: hasExtraRow ? 77 : 72,
    head: [['#', 'Description', 'Type', 'Qty', 'Rate', 'Amount']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [30, 41, 59],
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate position after table
  const finalY = doc.lastAutoTable.finalY + 8;

  // Total summary card
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - 85, finalY, 71, 24, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL AMOUNT:', pageWidth - 80, finalY + 9);

  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const totalStr = `Rs. ${(parseFloat(invoice.total_amount) || 0).toFixed(2)}`;
  doc.text(totalStr, pageWidth - 80, finalY + 18);

  // Status badge if cancelled
  if (invoice.invoice_status === 'cancelled') {
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CANCELLED', 24, finalY + 15);
  }

  // Footer notes
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for trusting our workshop with your bike!', 14, 280);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated invoice.', pageWidth - 68, 280);

  return doc;
}

/**
 * Triggers direct PDF download on browser.
 */
export function downloadInvoicePDF(invoice, workshopName) {
  const doc = generateInvoicePDFDoc(invoice, workshopName);
  const fileName = `Invoice_${invoice.invoice_number || 'bill'}_${(invoice.vehicle_number || 'bike').replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Creates clean WhatsApp text summary for click-to-chat with language support.
 */
export function getWhatsAppInvoiceMessage(invoice, workshopName = 'BIKE WORKSHOP', lang = 'en') {
  const isMl = lang === 'ml';
  const dateStr = formatDate(invoice.date || invoice.created_at);
  const vehicle = (invoice.vehicle_number || '').toUpperCase();
  const shop = (workshopName || 'BIKE WORKSHOP').toUpperCase();

  let msg = `*${shop}*\n`;
  msg += isMl ? `*വാഹന സർവീസ് ബിൽ (VEHICLE BILL)*\n` : `*VEHICLE BILL / INVOICE*\n`;
  msg += `--------------------------------\n`;
  msg += isMl ? `*ബിൽ നമ്പർ:* ${invoice.invoice_number || 'N/A'}\n` : `*Invoice No:* ${invoice.invoice_number || 'N/A'}\n`;
  msg += isMl ? `*തീയതി:* ${dateStr}\n` : `*Date:* ${dateStr}\n`;
  msg += isMl ? `*വണ്ടി നമ്പർ:* ${vehicle}\n` : `*Vehicle No:* ${vehicle}\n`;
  if (invoice.vehicle_model) {
    msg += isMl ? `*വാഹനം (Model):* ${invoice.vehicle_model}\n` : `*Vehicle Model:* ${invoice.vehicle_model}\n`;
  }
  if (invoice.km_reading) {
    const cleanKm = invoice.km_reading.toUpperCase().includes('KM')
      ? invoice.km_reading.toUpperCase()
      : `${invoice.km_reading} KM`;
    msg += isMl ? `*കിലോമീറ്റർ (KM):* ${cleanKm}\n` : `*Kilometre (KM):* ${cleanKm}\n`;
  }
  msg += `--------------------------------\n`;
  msg += isMl ? `*മാറ്റിയ പാർട്സുകളും ചെയ്ത പണികളും:*\n` : `*ITEMS & WORK DONE:*\n`;

  (invoice.items || []).forEach((item, idx) => {
    const qty = item.quantity > 1 ? ` (Qty: ${item.quantity})` : '';
    const lineTotal = ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)).toFixed(0);
    msg += `${idx + 1}. ${item.description}${qty} - Rs.${lineTotal}\n`;
  });

  msg += `--------------------------------\n`;
  msg += isMl
    ? `*ആകെ തുക: Rs.${(parseFloat(invoice.total_amount) || 0).toFixed(0)}*\n`
    : `*TOTAL AMOUNT: Rs.${(parseFloat(invoice.total_amount) || 0).toFixed(0)}*\n`;
  msg += `--------------------------------\n`;
  msg += isMl
    ? `ഞങ്ങളുടെ വർക്ക്ഷോപ്പ് തിരഞ്ഞെടുത്തതിന് നന്ദി! സുരക്ഷിതമായി യാത്ര ചെയ്യുക.`
    : `Thank you for your visit! Ride safe.`;

  return msg;
}

/**
 * Handles WhatsApp sharing:
 * 1. Checks if Web Share API with PDF file is supported.
 * 2. If supported, prompts user to share the PDF directly.
 * 3. Also provides WhatsApp Click-to-Chat URL to immediately open WhatsApp with pre-filled message.
 */
export async function shareInvoiceOnWhatsApp(
  invoice,
  workshopName = 'BIKE WORKSHOP',
  targetPhone = '',
  lang = 'en'
) {
  const doc = generateInvoicePDFDoc(invoice, workshopName);
  const fileName = `Invoice_${invoice.invoice_number || 'bill'}_${(invoice.vehicle_number || 'bike').replace(/\s+/g, '_')}.pdf`;
  const pdfBlob = doc.output('blob');
  const messageText = getWhatsAppInvoiceMessage(invoice, workshopName, lang);

  // Check Web Share API with File
  const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
  const canShareFile =
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [file] });

  if (canShareFile) {
    try {
      await navigator.share({
        files: [file],
        title: `Invoice ${invoice.invoice_number} - ${invoice.vehicle_number}`,
        text: messageText,
      });
      return { sharedViaFile: true };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Navigator share error:', err);
      }
    }
  }

  // Fallback: WhatsApp Click-to-Chat
  // Automatically trigger PDF download so the owner can attach it if they wish
  doc.save(fileName);

  // Format clean phone number if provided (e.g. 10 digit Indian number)
  let cleanPhone = (targetPhone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India country code 91
  }

  const encodedText = encodeURIComponent(messageText);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  // Open WhatsApp in a new tab/window
  window.open(waUrl, '_blank');

  return { sharedViaLink: true, pdfDownloaded: true };
}
