import React, { useState } from "react";
import { FiDownload, FiTrash } from "react-icons/fi";
import jsPDF from "jspdf";
import QrCode from "qrcode";
import "jspdf-autotable";

const InvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "INV-001",
    invoiceDate: new Date().toISOString().substring(0, 10),
    clientName: "",
    clientAddress: "",
    items: [{ description: "", quantity: 1, rate: 0 }],
    discount: 0,
    tax: 0,
    amountPaid: 0,
    enableDiscount: false,
    enablePaidAmount: false,
    signature: "",
  });

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );
    const tax = (subtotal * (invoiceData.tax || 0)) / 100;
    const total = subtotal - (invoiceData.discount || 0) + tax;
    const amountRemaining = total - (invoiceData.amountPaid || 0);

    return { subtotal, tax, total, amountRemaining };
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] =
      field === "rate" || field === "quantity" ? parseFloat(value) || 0 : value;
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const deleteItem = (index) => {
    const updatedItems = [...invoiceData.items];
    updatedItems.splice(index, 1);
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const exportPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const { subtotal, tax, total, amountRemaining } = calculateTotals();
    
    // Header Section: Logo and Company Info
    const img = new Image();
    img.src = "icon.png"; // Path to your logo image
    doc.addImage(img, "PNG", 20, 10, 30, 30); // Logo on the left
    
    // Company Name and Contact Info
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(16);
    doc.text("MIHIR SOUND & LIGHT", 60, 20); // Company name
    
    doc.setFontSize(10);
    doc.text("667, Bajrang Nagar, Indore", 60, 28); // Address
    doc.text("Mobile No.: 7000051042", 60, 33); // Phone number
    
    // Invoice Title and Details (Right Side)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Invoice", 190, 20, { align: "right" });
    
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Invoice No.: ${invoiceData.invoiceNumber}`, 190, 28, { align: "right" });
    doc.text(`Date: ${invoiceData.invoiceDate}`, 190, 33, { align: "right" });
    
    // Bill To Section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To", 20, 50);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoiceData.clientName || "Client Name", 20, 55);
    doc.text(invoiceData.clientAddress || "Client Address", 20, 60);
    
    // Draw a horizontal line after Bill To section
    doc.line(20, 65, 190, 65);
    
    // Table using autoTable
    const tableColumns = ["Description", "Quantity", "Unit Price", "Amount"];
    const tableData = invoiceData.items.map((item) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      return [
        item.description || "-",
        item.quantity || 0,
        `Rs. ${(item.rate || 0).toFixed(2)}`,
        `Rs. ${amount.toFixed(2)}`,
      ];
    });
    
    doc.autoTable({
      startY: 75, // Start the table below the Bill To section
      head: [tableColumns],
      body: tableData,
      theme: "grid", // Grid style table
      headStyles: {
        fillColor: [50, 50, 50], // Dark Gray Header
        textColor: [255, 255, 255], // White text
        fontSize: 10,
        halign: "center",
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
        halign: "left",
        valign: "middle",
        lineColor: [169, 169, 169], // Light gray borders for rows
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // Light gray alternating rows for better readability
      },
      columnStyles: {
        3: { halign: "right" }, // Right-align the Amount column
      },
      margin: { top: 10 },
    });
    
    // Signature Section (left of the totals section)
    let startY = doc.lastAutoTable.finalY + 5;
    const signatureImg = new Image();
    signatureImg.src = "seal-sign-signature-removebg-preview.png"; // Path to your signature image
    doc.addImage(signatureImg, "PNG", 20, startY, 60, 28); // Add signature image
    
    // Totals Section (after the signature)
    doc.setFont("Helvetica", "bold");
    doc.text("Subtotal:", 150, startY + 10, { align: "right" });
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 185, startY + 10, { align: "right" });
    
    // Draw horizontal line under Subtotal
    doc.line(130, startY + 12, 190, startY + 12);
    
    doc.text("Total:", 150, startY + 22, { align: "right" });
    doc.text(`Rs. ${total.toFixed(2)}`, 185, startY + 22, { align: "right" });
    
    // Draw horizontal line under Total
    doc.line(130, startY + 24, 190, startY + 24);
    
    // Add the remaining balance and paid amount if applicable
    if (invoiceData.enablePaidAmount) {
      doc.text("Paid Amount:", 150, startY + 28, { align: "right" });
      doc.text(`Rs. ${invoiceData.amountPaid.toFixed(2)}`, 185, startY + 28, {
        align: "right",
      });
    
      // Draw horizontal line under Paid Amount
      doc.line(130, startY + 30, 190, startY + 30);
    }
    
    doc.text("Balance Due:", 150, startY + 34, { align: "right" });
    doc.text(`Rs. ${amountRemaining.toFixed(2)}`, 185, startY + 34, {
      align: "right",
    });
    
    // Draw horizontal line under Balance Due
    doc.line(130, startY + 36, 190, startY + 36);
    
    // QR Code and Payment Instructions Section
    startY += 40;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Payment Details", 20, startY);
    
    // Generate QR Code for UPI Payment Link
    const qrData = `upi://pay?pa=9926597431@yapl&pn=Mihir%20Sound%20%26%20Light&mc=123456&tid=INV-${invoiceData.invoiceNumber}&am=${amountRemaining.toFixed(2)}&cu=INR`;
    
    try {
      const qrCode = await QrCode.toDataURL(qrData); // Await the QR code Promise
    
      // Add the QR code image to the document (smaller size for a professional look)
      const qrImg = new Image();
      qrImg.src = qrCode;
      doc.addImage(qrImg, "PNG", 20, startY + 10, 30, 30); // Smaller QR code for a more balanced look
      
      // Add payment instructions and details
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Scan the QR code above to pay ₹${amountRemaining.toFixed(2)} via UPI`, 60, startY + 20);
      doc.text("UPI ID: 9926597431@yapl", 60, startY + 25);
      doc.text("Please make the payment by scanning the QR code.", 60, startY + 35);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
    
    // Terms and Conditions Section
    startY += 60;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Terms and Conditions:", 20, startY);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    const terms = [
      "Payment Terms: Payment is due within 30 days from the date of the invoice.",
      "Cancellation Policy: Cancellations within 7 days may incur up to 50% fee.",
      "Liability: Not responsible for damages caused by misuse or accidents.",
      "Equipment: Must be returned in delivered condition; damages are charged.",
      "Insurance: Clients must arrange adequate insurance for rented equipment.",
      "Confidentiality: Client information is kept confidential.",
    ];
    
    // Apply modern text formatting and clean alignment for Terms
    doc.setTextColor(0, 0, 0); // Standard text color (black)
    terms.forEach((term, idx) => {
      doc.text(`• ${term}`, 20, startY + 8 + idx * 6);
    });
  
    // Save the PDF
    doc.save(`Invoice-${invoiceData.invoiceNumber || "N/A"}.pdf`);
  };
  
  

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-xl rounded-lg">
      <header className="mb-8 flex items-center justify-between">
        <img src="icon.png" alt="Logo" className="w-16 h-16 rounded-md" />
        <h1 className="text-3xl font-bold text-gray-800">Invoice Generator</h1>
      </header>

      {/* Invoice Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Invoice Details</h2>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <input
            type="text"
            placeholder="Invoice Number"
            value={invoiceData.invoiceNumber}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })
            }
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={invoiceData.invoiceDate}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })
            }
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Client Name"
            value={invoiceData.clientName}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, clientName: e.target.value })
            }
            className="col-span-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Client Address"
            value={invoiceData.clientAddress}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, clientAddress: e.target.value })
            }
            className="col-span-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Items Section */}
      <div>
        <h2 className="text-lg font-semibold">Items</h2>
        {invoiceData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 mt-4">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              className="col-span-2 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Rate"
              value={item.rate}
              onChange={(e) => handleItemChange(index, "rate", e.target.value)}
              className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => deleteItem(index)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              <FiTrash />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="mt-4 text-blue-500 hover:text-blue-700 focus:outline-none"
        >
          + Add Item
        </button>
      </div>

      {/* Payment Details */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Payment Details</h2>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="flex items-center">
            <label className="text-sm">Enable Discount</label>
            <button
              onClick={() =>
                setInvoiceData({
                  ...invoiceData,
                  enableDiscount: !invoiceData.enableDiscount,
                })
              }
              className={`ml-4 w-12 h-6 rounded-full ${
                invoiceData.enableDiscount ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-all ${
                  invoiceData.enableDiscount ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
          <div className="flex items-center">
            <label className="text-sm">Enable Paid Amount</label>
            <button
              onClick={() =>
                setInvoiceData({
                  ...invoiceData,
                  enablePaidAmount: !invoiceData.enablePaidAmount,
                })
              }
              className={`ml-4 w-12 h-6 rounded-full ${
                invoiceData.enablePaidAmount ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-all ${
                  invoiceData.enablePaidAmount
                    ? "translate-x-6"
                    : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          <input
            type="number"
            placeholder="Discount"
            value={invoiceData.discount}
            disabled={!invoiceData.enableDiscount}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                discount: parseFloat(e.target.value),
              })
            }
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Paid Amount"
            value={invoiceData.amountPaid}
            disabled={!invoiceData.enablePaidAmount}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                amountPaid: parseFloat(e.target.value),
              })
            }
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={exportPDF}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <FiDownload className="inline mr-2" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
