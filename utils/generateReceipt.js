// utils/generateReceipt.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateReceipt = (student, payment, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(18).text('Payment Receipt', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Student Name: ${student.name}`);
    doc.text(`GR Number: ${student.grNumber}`);
    doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`);
    doc.text(`Amount Paid: ₹${payment.amount}`);
    if (payment.remark) doc.text(`Remark: ${payment.remark}`);

    doc.moveDown();
    doc.text(`Total Fees: ₹${student.totalFees}`);
    doc.text(`Paid Till Now: ₹${student.paidFees}`);
    doc.text(`Pending: ₹${student.pendingFees}`);

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = generateReceipt;
