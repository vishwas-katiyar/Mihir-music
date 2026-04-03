const lineItems = document.getElementById('line-items');
const addRowBtn = document.getElementById('add-row');
const printBtn = document.getElementById('print-invoice');
const downloadPdfBtn = document.getElementById('download-pdf');
const invoiceDateInput = document.getElementById('invoice-date');
const eventStartDateInput = document.getElementById('event-start-date');
const eventEndDateInput = document.getElementById('event-end-date');
const invoiceNumberInput = document.getElementById('invoice-number');
const customerNameInput = document.getElementById('customer-name');
const customerAddressInput = document.getElementById('customer-address');
const discountValueInput = document.getElementById('discount-value');
const advancePaidInput = document.getElementById('advance-paid');

const subtotalEl = document.getElementById('subtotal');
const discountRowEl = document.getElementById('discount-row');
const discountAmountEl = document.getElementById('discount-amount');
const grandTotalEl = document.getElementById('grand-total');
const remainingTotalEl = document.getElementById('remaining-total');

const UPI_ID = '7000051042@ybl';
const UPI_PAYEE_NAME = 'Mihir Sound and Light';
const BRAND_WEBSITE = 'mihir-music.vercel.app';
const BRAND_EMAIL = 'hello@mihirsoundandlight.com';
const BRAND_PHONE = '+91 70000 51042';
const BRAND_CITY = 'Indore, Madhya Pradesh';
const STATIC_TERMS = [
  'Payment Terms: Payment is due within 30 days from the date of the invoice.',
  'Cancellation Policy: Cancellations within 7 days may incur up to 50% fee.',
  'Liability: Not responsible for damages caused by misuse or accidents.',
  'Equipment: Must be returned in delivered condition; damages are charged.',
  'Insurance: Clients must arrange adequate insurance for rented equipment.',
  'Confidentiality: Client information is kept confidential.',
];

const formatINR = (value) => `INR ${Number(value).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const formatCurrencyNumber = (value) => Number(value).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let cachedLogoDataUrl = null;
const qrCache = {
  payload: '',
  dataUrl: null,
  loadingPromise: null,
};

const safeInputValue = (el) => (el ? el.value : '');

function asIsoDateString(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
}

function optionalIsoDateString(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function bindNativeDatePicker(inputEl) {
  if (!inputEl) return;

  const openPicker = () => {
    if (typeof inputEl.showPicker === 'function') {
      try {
        inputEl.showPicker();
      } catch (error) {
        // Some browsers restrict showPicker; native behavior still works.
      }
    }
  };

  inputEl.addEventListener('click', openPicker);
  inputEl.addEventListener('focus', openPicker);
}

async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  try {
    const response = await fetch('../assets/logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    cachedLogoDataUrl = typeof dataUrl === 'string' ? dataUrl : null;
    return cachedLogoDataUrl;
  } catch (error) {
    return null;
  }
}

function clampNumber(value) {
  const normalized = typeof value === 'string' ? value.replace(/,/g, '') : value;
  const num = Number(normalized);
  if (Number.isNaN(num) || !Number.isFinite(num)) return 0;
  return num < 0 ? 0 : num;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computePaymentTotals(grandTotal, advancePaid) {
  const remainingAmount = round2(Math.max(grandTotal - advancePaid, 0));
  return { remainingAmount };
}

async function ensureQrCodeReady(timeoutMs = 1500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.QRCode && typeof window.QRCode.toDataURL === 'function') {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  return Boolean(window.QRCode && typeof window.QRCode.toDataURL === 'function');
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getQrDataUrl(upiPayload) {
  if (window.QRCode && typeof window.QRCode.toDataURL === 'function') {
    try {
      return await window.QRCode.toDataURL(upiPayload, {
        width: 196,
        margin: 1,
        color: {
          dark: '#113163',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      // Fallback to remote QR service.
    }
  }

  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=5&data=${encodeURIComponent(upiPayload)}`;
    const response = await fetch(qrUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);
    return typeof dataUrl === 'string' ? dataUrl : null;
  } catch (error) {
    return null;
  }
}

function buildUpiPayload(remainingAmount, invoiceNo) {
  const reference = invoiceNo || 'Invoice Payment';
  return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${encodeURIComponent(remainingAmount.toFixed(2))}&cu=INR&tn=${encodeURIComponent(reference)}`;
}

async function warmQrCache(remainingAmount, invoiceNo) {
  if (remainingAmount <= 0) {
    qrCache.payload = '';
    qrCache.dataUrl = null;
    qrCache.loadingPromise = null;
    return null;
  }

  const payload = buildUpiPayload(remainingAmount, `Invoice ${invoiceNo || 'Payment'}`);

  if (qrCache.payload === payload && qrCache.dataUrl) {
    return qrCache.dataUrl;
  }

  if (qrCache.payload === payload && qrCache.loadingPromise) {
    return qrCache.loadingPromise;
  }

  qrCache.payload = payload;
  qrCache.dataUrl = null;

  const task = (async () => {
    await ensureQrCodeReady();
    const dataUrl = await getQrDataUrl(payload);
    if (qrCache.payload === payload) {
      qrCache.dataUrl = dataUrl;
    }
    return dataUrl;
  })();

  qrCache.loadingPromise = task.finally(() => {
    if (qrCache.payload === payload) {
      qrCache.loadingPromise = null;
    }
  });

  return qrCache.loadingPromise;
}

function createRow(defaults = {}) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td data-label="Item"><input type="text" class="item-name" placeholder="Service / Item" value="${defaults.item || ''}"></td>
    <td data-label="Description"><input type="text" class="item-desc" placeholder="Short description" value="${defaults.description || ''}"></td>
    <td data-label="Quantity"><input type="number" class="item-qty" min="0" step="0.01" value="${defaults.quantity || 1}"></td>
    <td data-label="Rate (INR)"><input type="number" class="item-rate" min="0" step="0.01" value="${defaults.rate || 0}"></td>
    <td data-label="Amount" class="amount">INR 0.00</td>
    <td data-label="Action" class="no-print"><button class="btn-remove" type="button" aria-label="Remove row">Remove</button></td>
  `;

  row.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', calculateTotals);
  });

  const removeBtn = row.querySelector('.btn-remove');
  removeBtn.addEventListener('click', () => {
    if (lineItems.children.length <= 1) {
      row.querySelectorAll('input').forEach((input) => {
        if (input.type === 'number') {
          input.value = input.classList.contains('item-qty') ? '1' : '0';
        } else {
          input.value = '';
        }
      });
      calculateTotals();
      return;
    }
    row.remove();
    calculateTotals();
  });

  return row;
}

function calculateTotals() {
  if (!lineItems || !subtotalEl || !grandTotalEl || !remainingTotalEl) return;

  let subtotal = 0;

  Array.from(lineItems.querySelectorAll('tr')).forEach((row) => {
    const qty = clampNumber(row.querySelector('.item-qty').value);
    const rate = clampNumber(row.querySelector('.item-rate').value);
    const amount = round2(qty * rate);
    row.querySelector('.amount').textContent = formatINR(amount);
    subtotal += amount;
  });

  subtotal = round2(subtotal);
  const discountValue = clampNumber(safeInputValue(discountValueInput));
  const discountAmount = round2(Math.min(discountValue, subtotal));
  const grandTotal = round2(Math.max(subtotal - discountAmount, 0));
  const advancePaid = clampNumber(safeInputValue(advancePaidInput));
  const { remainingAmount } = computePaymentTotals(grandTotal, advancePaid);

  subtotalEl.textContent = formatINR(subtotal);
  if (discountAmountEl) discountAmountEl.textContent = `- ${formatINR(discountAmount)}`;
  if (discountRowEl) discountRowEl.hidden = discountAmount <= 0;
  grandTotalEl.textContent = formatINR(grandTotal);
  remainingTotalEl.textContent = formatINR(remainingAmount);

  // Pre-generate QR in background to make PDF export instant and reliable.
  void warmQrCache(remainingAmount, safeInputValue(invoiceNumberInput).trim());
}

function computeTotalsRaw() {
  let subtotal = 0;

  const rows = Array.from(lineItems.querySelectorAll('tr')).map((row) => {
    const item = row.querySelector('.item-name').value.trim();
    const description = row.querySelector('.item-desc').value.trim();
    const quantity = clampNumber(row.querySelector('.item-qty').value);
    const rate = clampNumber(row.querySelector('.item-rate').value);
    const amount = round2(quantity * rate);
    subtotal += amount;

    return { item, description, quantity, rate, amount };
  });

  subtotal = round2(subtotal);
  const discountValue = clampNumber(safeInputValue(discountValueInput));
  const discountAmount = round2(Math.min(discountValue, subtotal));
  const grandTotal = round2(Math.max(subtotal - discountAmount, 0));
  const advancePaid = clampNumber(safeInputValue(advancePaidInput));
  const { remainingAmount } = computePaymentTotals(grandTotal, advancePaid);

  const eventDateRange = {
    start: optionalIsoDateString(safeInputValue(eventStartDateInput)),
    end: optionalIsoDateString(safeInputValue(eventEndDateInput)),
  };

  return {
    rows,
    subtotal,
    discountAmount,
    grandTotal,
    advancePaid,
    remainingAmount,
    eventDateRange,
  };
}

async function downloadPdfInvoice() {
  if (!invoiceDateInput || !invoiceNumberInput || !customerNameInput || !customerAddressInput) {
    window.alert('Invoice form is incomplete on this page. Please refresh and try again.');
    return;
  }

  const jsPdfRuntime = window.jspdf;
  if (!jsPdfRuntime || !jsPdfRuntime.jsPDF) {
    window.alert('PDF library is still loading. Please try again in a moment.');
    return;
  }

  const { jsPDF } = jsPdfRuntime;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const {
    rows,
    subtotal,
    discountAmount,
    grandTotal,
    advancePaid,
    remainingAmount,
    eventDateRange,
  } = computeTotalsRaw();

  const invoiceNo = safeInputValue(invoiceNumberInput).trim() || 'INV-UNSET';
  const invoiceDate = asIsoDateString(safeInputValue(invoiceDateInput));
  const eventStartDate = eventDateRange.start;
  const eventEndDate = eventDateRange.end;
  const customerName = safeInputValue(customerNameInput).trim() || 'Client Name';
  const customerAddress = safeInputValue(customerAddressInput).trim() || 'Address not provided';
  const logoDataUrl = await getLogoDataUrl();

  doc.setFillColor(9, 20, 43);
  doc.rect(0, 0, pageWidth, 118, 'F');
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 112, pageWidth, 6, 'F');

  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 26, 58, 58, 8, 8, 'F');
    doc.addImage(logoDataUrl, 'PNG', 45, 31, 48, 48);
  }

  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MIHIR SOUND & LIGHT', logoDataUrl ? 110 : 40, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('TAX INVOICE', logoDataUrl ? 110 : 40, 72);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(214, 224, 245);
  doc.text(BRAND_CITY, logoDataUrl ? 110 : 40, 92);
  doc.text(BRAND_PHONE, logoDataUrl ? 230 : 160, 92);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 210, 24, 170, 72, 8, 8, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Invoice Details', pageWidth - 196, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoiceNo}`, pageWidth - 196, 60);
  doc.text(`Date: ${invoiceDate}`, pageWidth - 196, 76);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(40, 136, 255, 74, 6, 6, 'F');
  doc.roundedRect(pageWidth - 295, 136, 255, 74, 6, 6, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To', 52, 154);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(customerName, 52, 170);
  const customerAddressLines = doc.splitTextToSize(customerAddress, 230);
  doc.text(customerAddressLines, 52, 186);

  doc.setFont('helvetica', 'bold');
  doc.text('From', pageWidth - 283, 154);
  doc.setFont('helvetica', 'normal');
  doc.text('Mihir Sound & Light', pageWidth - 283, 170);
  doc.text(BRAND_CITY, pageWidth - 283, 186);
  doc.text(BRAND_PHONE, pageWidth - 283, 202);

  let tableStartY = 228;
  if (eventStartDate || eventEndDate) {
    const eventDateLabel = eventStartDate && eventEndDate
      ? `${eventStartDate} to ${eventEndDate}`
      : eventStartDate || eventEndDate;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, 218, pageWidth - 80, 28, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('Event Schedule', 52, 236);
    doc.setFont('helvetica', 'normal');
    doc.text(eventDateLabel, pageWidth - 52, 236, { align: 'right' });
    tableStartY = 256;
  }

  const tableRows = rows
    .filter((row) => row.item || row.description || row.quantity || row.rate)
    .map((row, index) => [
      String(index + 1),
      row.item || '-',
      row.description || '-',
      String(row.quantity),
      formatCurrencyNumber(row.rate),
      formatCurrencyNumber(row.amount),
    ]);

  if (!tableRows.length) {
    tableRows.push(['1', '-', '-', '0', '0.00', '0.00']);
  }

  doc.autoTable({
    startY: tableStartY,
    head: [['#', 'Item', 'Description', 'Qty', 'Rate (INR)', 'Amount (INR)']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [17, 49, 99],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 9.5,
      cellPadding: 8,
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      textColor: [30, 41, 59],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 88 },
      2: { cellWidth: 182 },
      3: { cellWidth: 48, halign: 'right' },
      4: { cellWidth: 82, halign: 'right' },
      5: { cellWidth: 87, halign: 'right' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'head') {
        hookData.cell.styles.lineWidth = 0;
      }
      if (hookData.section === 'body') {
        hookData.cell.styles.valign = 'middle';
      }
    },
    margin: { left: 40, right: 40 },
  });

  let summaryY = doc.lastAutoTable.finalY + 20;
  if (summaryY > pageHeight - 340) {
    doc.addPage();
    summaryY = 60;
  }

  const leftCardX = 40;
  const leftCardW = 248;
  const rightCardX = 307;
  const rightCardW = 248;
  const cardH = 186;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(leftCardX, summaryY, leftCardW, cardH, 8, 8, 'F');
  doc.roundedRect(rightCardX, summaryY, rightCardW, cardH, 8, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 49, 99);
  doc.text('UPI Payment', leftCardX + 12, summaryY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`UPI ID: ${UPI_ID}`, leftCardX + 12, summaryY + 36);
  doc.text(`Reference: ${invoiceNo}`, leftCardX + 12, summaryY + 50);

  const hasPending = remainingAmount > 0;
  if (hasPending) {
    const upiPayload = buildUpiPayload(remainingAmount, `Invoice ${invoiceNo}`);
    let qrDataUrl = null;

    if (qrCache.payload === upiPayload && qrCache.dataUrl) {
      qrDataUrl = qrCache.dataUrl;
    } else {
      qrDataUrl = await warmQrCache(remainingAmount, invoiceNo);
    }

    if (qrDataUrl) {
      doc.setDrawColor(217, 226, 241);
      doc.roundedRect(leftCardX + 12, summaryY + 58, 102, 102, 8, 8);
      doc.addImage(qrDataUrl, 'PNG', leftCardX + 17, summaryY + 63, 92, 92);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pay: INR ${formatCurrencyNumber(remainingAmount)}`, leftCardX + 122, summaryY + 88);
      doc.text('Scan QR to pay', leftCardX + 122, summaryY + 104);
      doc.text('Share screenshot', leftCardX + 122, summaryY + 120);
      doc.text('after transfer.', leftCardX + 122, summaryY + 136);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Unable to generate QR right now.', leftCardX + 12, summaryY + 76);
      doc.text(`Pay using UPI ID: ${UPI_ID}`, leftCardX + 12, summaryY + 90);
      doc.text(`Pending: INR ${formatCurrencyNumber(remainingAmount)}`, leftCardX + 12, summaryY + 104);
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(11, 122, 78);
    doc.text('No pending amount.', leftCardX + 12, summaryY + 76);
    doc.text('Payment completed.', leftCardX + 12, summaryY + 90);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('Subtotal:', rightCardX + 14, summaryY + 24);
  doc.text(`INR ${formatCurrencyNumber(subtotal)}`, rightCardX + rightCardW - 10, summaryY + 24, { align: 'right' });

  let summaryOffsetY = 42;
  if (discountAmount > 0) {
    doc.text('Discount:', rightCardX + 14, summaryY + summaryOffsetY);
    doc.text(`- INR ${formatCurrencyNumber(discountAmount)}`, rightCardX + rightCardW - 10, summaryY + summaryOffsetY, { align: 'right' });
    summaryOffsetY += 18;
  }

  doc.text('Advance Paid:', rightCardX + 14, summaryY + summaryOffsetY);
  doc.text(`INR ${formatCurrencyNumber(advancePaid)}`, rightCardX + rightCardW - 10, summaryY + summaryOffsetY, { align: 'right' });
  summaryOffsetY += 16;

  doc.setDrawColor(176, 191, 221);
  doc.line(rightCardX + 14, summaryY + summaryOffsetY, rightCardX + rightCardW - 10, summaryY + summaryOffsetY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('Grand Total:', rightCardX + 14, summaryY + summaryOffsetY + 22);
  doc.setTextColor(11, 122, 78);
  doc.text(`INR ${formatCurrencyNumber(grandTotal)}`, rightCardX + rightCardW - 10, summaryY + summaryOffsetY + 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Remaining Due:', rightCardX + 14, summaryY + summaryOffsetY + 42);
  doc.setTextColor(189, 45, 51);
  doc.text(`INR ${formatCurrencyNumber(remainingAmount)}`, rightCardX + rightCardW - 10, summaryY + summaryOffsetY + 42, { align: 'right' });

  let termsY = summaryY + cardH + 16;
  if (termsY > pageHeight - 170) {
    doc.addPage();
    termsY = 60;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(40, termsY, 515, 104, 8, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Terms & Conditions', 52, termsY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const termsLines = doc.splitTextToSize(STATIC_TERMS.map((line) => `- ${line}`).join('\n'), 488);
  doc.text(termsLines, 52, termsY + 38);

  doc.setDrawColor(226, 232, 240);
  doc.line(40, pageHeight - 36, pageWidth - 40, pageHeight - 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated by ${BRAND_WEBSITE} | ${BRAND_EMAIL}`, 40, pageHeight - 22);
  doc.text('Thank you for choosing Mihir Sound & Light', pageWidth - 40, pageHeight - 22, { align: 'right' });

  doc.save(`${invoiceNo}.pdf`);
}

function seedDefaults() {
  if (invoiceDateInput && !invoiceDateInput.value) {
    const today = new Date();
    const iso = today.toISOString().split('T')[0];
    invoiceDateInput.value = iso;
  }

  if (invoiceNumberInput && !invoiceNumberInput.value) {
    const stamp = Date.now().toString().slice(-6);
    invoiceNumberInput.value = `INV-${new Date().getFullYear()}-${stamp}`;
  }

  const starterRows = [
    { item: 'Sound Setup', description: 'PA system, microphones, stage monitors', quantity: 1, rate: 25000 },
    { item: 'Lighting', description: 'Moving heads, wash lights, DMX programming', quantity: 1, rate: 18000 },
  ];

  if (!lineItems) return;
  starterRows.forEach((rowData) => lineItems.appendChild(createRow(rowData)));
  calculateTotals();
}

if (addRowBtn && lineItems) {
  addRowBtn.addEventListener('click', () => {
    lineItems.appendChild(createRow());
    calculateTotals();
  });
}

if (printBtn) {
  printBtn.addEventListener('click', () => {
    window.print();
  });
}

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener('click', async () => {
    const originalLabel = downloadPdfBtn.textContent;
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = 'Generating PDF...';

    try {
      await downloadPdfInvoice();
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.textContent = originalLabel;
    }
  });
}

if (advancePaidInput) advancePaidInput.addEventListener('input', calculateTotals);
if (discountValueInput) discountValueInput.addEventListener('input', calculateTotals);
if (eventStartDateInput) eventStartDateInput.addEventListener('input', calculateTotals);
if (eventEndDateInput) eventEndDateInput.addEventListener('input', calculateTotals);
if (invoiceNumberInput) invoiceNumberInput.addEventListener('input', calculateTotals);

seedDefaults();

bindNativeDatePicker(invoiceDateInput);
bindNativeDatePicker(eventStartDateInput);
bindNativeDatePicker(eventEndDateInput);
