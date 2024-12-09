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
    enableDiscount: true,
    enablePaidAmount: true,
    signature: "",
  });

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );

    const discount = invoiceData.enableDiscount ? invoiceData.discount || 0 : 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);

    const tax = (discountedSubtotal * (invoiceData.tax || 0)) / 100;
    const total = discountedSubtotal + tax;

    const amountRemaining = Math.max(0, total - (invoiceData.amountPaid || 0));

    return { subtotal, discount, tax, total, amountRemaining };
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
  const { subtotal, tax, total, amountRemaining, discount } = calculateTotals();
  const exportPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");

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
    doc.text(`Invoice No.: ${invoiceData.invoiceNumber}`, 190, 28, {
      align: "right",
    });
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
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 185, startY + 10, {
      align: "right",
    });

    // Draw horizontal line under Subtotal
    doc.line(120, startY + 12, 190, startY + 12);

    // Show Discount if it exists
    if (discount && discount > 0) {
      doc.text("Discount:", 150, startY + 22, { align: "right" });
      doc.text(`Rs. ${discount.toFixed(2)}`, 185, startY + 22, {
        align: "right",
      });

      // Draw horizontal line under Discount
      doc.line(120, startY + 24, 190, startY + 24);
    }

    doc.text("Total:", 150, startY + 28, { align: "right" });
    doc.text(`Rs. ${total.toFixed(2)}`, 185, startY + 28, { align: "right" });

    // Draw horizontal line under Total
    doc.line(120, startY + 30, 190, startY + 30);

    // Add the remaining balance and paid amount if applicable
    if (invoiceData.enablePaidAmount) {
      doc.text("Paid Amount:", 150, startY + 34, { align: "right" });
      doc.text(`Rs. ${invoiceData.amountPaid.toFixed(2)}`, 185, startY + 34, {
        align: "right",
      });

      // Draw horizontal line under Paid Amount
      doc.line(120, startY + 36, 190, startY + 36);
    }

    doc.text("Balance Due:", 150, startY + 40, { align: "right" });
    doc.text(`Rs. ${amountRemaining.toFixed(2)}`, 185, startY + 40, {
      align: "right",
    });

    // Draw horizontal line under Balance Due
    doc.line(120, startY + 42, 190, startY + 42);

    // QR Code and Payment Instructions Section
    startY += 50;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Payment Details", 20, startY);

    // Generate QR Code for UPI Payment Link
    const qrData = `upi://pay?pa=7000051042@ybl&pn=Mr%20Mihir%20Chouhan&mc=123456&tid=INV-${
      invoiceData.invoiceNumber
    }&am=${amountRemaining.toFixed(2)}&cu=INR`;

    try {
      const qrCode = await QrCode.toDataURL(qrData); // Await the QR code Promise

      // Add the QR code image to the document (smaller size for a professional look)
      const qrImg = new Image();
      qrImg.src = qrCode;
      doc.addImage(qrImg, "PNG", 20, startY + 10, 30, 30); // Smaller QR code for a more balanced look

      // Add payment instructions and details
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `Scan the QR code above to pay ₹${amountRemaining.toFixed(2)} via UPI`,
        60,
        startY + 20
      );
      doc.text("UPI ID: 7000051042@ybl", 60, startY + 25);
      doc.text(
        "Please make the payment by scanning the QR code.",
        60,
        startY + 35
      );
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

  const validateInvoiceData = () => {
    if (!invoiceData.clientName || !invoiceData.clientAddress) {
      alert("Please fill in client details.");
      return false;
    }
    if (
      invoiceData.items.some(
        (item) => !item.description || item.quantity <= 0 || item.rate <= 0
      )
    ) {
      alert("Please fill valid item details.");
      return false;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto  bg-white shadow-lg rounded-lg">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-semibold text-gray-800">
          Invoice Generator
        </h1>
      </header>

      {/* Invoice Details */}
      <section className="mb-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Invoice Details
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    invoiceDate: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="mb-8 p-6 bg-gray-50 rounded-md shadow-sm">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Client Name
          </label>
          <input
            type="text"
            placeholder="Client Name"
            value={invoiceData.clientName}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, clientName: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium my-2">
            Client Address
          </label>
          <textarea
            placeholder="Client Address"
            value={invoiceData.clientAddress}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, clientAddress: e.target.value })
            }
            className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">Items</h2>
        {invoiceData.items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 md:grid-cols-3 gap-6 items-center border-b pb-4 mb-6"
          >
            <div className="col-span-3">
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="Enter item description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Quantity
              </label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Rate
              </label>
              <input
                type="number"
                placeholder="Enter rate"
                value={item.rate}
                onChange={(e) =>
                  handleItemChange(index, "rate", e.target.value)
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-full h-full flex justify-self-end align-middle">
              <button
                onClick={() => deleteItem(index)}
                className="px-4 py-4 m-auto items-center bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                <FiTrash />
              </button>
            </div>
          </div>
        ))}
        <div className="text-center">
          <button
            onClick={addItem}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            + Add Item
          </button>
        </div>
      </section>

      {/* Payment Details */}
      <section className="mb-8 p-6 bg-gray-50 rounded-md shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Payment Details
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tax (%)
            </label>
            <input
              type="number"
              value={invoiceData.tax}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  tax: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {invoiceData.enableDiscount && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Discount
              </label>
              <input
                type="number"
                value={invoiceData.discount}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    discount: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          {invoiceData.enablePaidAmount && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Amount Paid
              </label>
              <input
                type="number"
                value={invoiceData.amountPaid}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    amountPaid: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 p-4 mb-8">
        <h2 className="text-2xl font-semibold text-gray-700">Calculation</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Subtotal:</span>
            <span className="text-gray-600">{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Discount:</span>
            <span className="text-gray-600">{invoiceData.discount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Tax (%):</span>
            <span className="text-gray-600">{invoiceData.tax}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Amount Paid:</span>
            <span className="text-gray-600">{invoiceData.amountPaid}</span>
          </div>
          <div className="flex justify-between font-bold text-xl">
            <span className="text-gray-600">Remaining Amount:</span>
            <span className="text-gray-800">{amountRemaining}</span>
          </div>
        </div>
      </section>
      {/* Export Button */}
      <div className="text-center pb-6">
        <button
          onClick={() => {
            if (validateInvoiceData()) exportPDF();
          }}
          className="px-6 py-3 flex gap-4 bg-green-600 items-center  justify-center mx-auto  text-white rounded-md hover:bg-green-700 transition duration-200"
        >
          <FiDownload />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
