import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export function generateLRPdf(lr: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Outer Border
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageWidth - (margin * 2), 260);

    // Header Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('KRISHNA GODAVARI', pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text('DAILY TRANSPORT MANAGEMENT', pageWidth / 2, 35, { align: 'center' });

    // Header Line
    doc.line(margin, 42, pageWidth - margin, 42);

    // LR Details Section
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`LR No: ${lr.lrNumber}`, margin + 5, 52);
    doc.text(`Date: ${format(new Date(lr.bookingDate), 'dd-MMM-yyyy')}`, pageWidth - margin - 5, 52, { align: 'right' });

    doc.setFont("helvetica", "normal");
    doc.text(`Billing Type: ${lr.billingType}`, margin + 5, 60);
    if (lr.deliveryDate) {
        doc.text(`Est. Delivery: ${format(new Date(lr.deliveryDate), 'dd-MMM-yyyy')}`, pageWidth - margin - 5, 60, { align: 'right' });
    }

    doc.line(margin, 65, pageWidth - margin, 65);

    // Consignor / Consignee Split
    const midPoint = pageWidth / 2;
    doc.line(midPoint, 65, midPoint, 115); // Vertical divider
    doc.line(margin, 115, pageWidth - margin, 115); // Bottom divider

    // CONSIGNOR
    doc.setFont("helvetica", "bold");
    doc.text('CONSIGNOR (FROM)', margin + 5, 75);
    doc.setFont("helvetica", "normal");
    doc.text(lr.consignor?.name || '-', margin + 5, 85);
    doc.text(`VAT/GST: ${lr.consignor?.gstNumber || 'N/A'}`, margin + 5, 95);
    doc.text(`Location: ${lr.fromLocation}`, margin + 5, 105);

    // CONSIGNEE
    doc.setFont("helvetica", "bold");
    doc.text('CONSIGNEE (TO)', midPoint + 5, 75);
    doc.setFont("helvetica", "normal");
    doc.text(lr.consignee?.name || '-', midPoint + 5, 85);
    doc.text(`VAT/GST: ${lr.consignee?.gstNumber || 'N/A'}`, midPoint + 5, 95);
    doc.text(`Location: ${lr.toLocation}`, midPoint + 5, 105);

    // Goods Table Header
    doc.line(margin, 125, pageWidth - margin, 125);
    doc.setFont("helvetica", "bold");
    doc.text('DESCRIPTION OF GOODS', margin + 5, 133);
    doc.text('QTY', pageWidth - 80, 133);
    doc.text('WEIGHT (KG)', pageWidth - margin - 5, 133, { align: 'right' });
    doc.line(margin, 138, pageWidth - margin, 138);

    // Goods Data
    doc.setFont("helvetica", "normal");
    doc.text(lr.goodsDescription, margin + 5, 148);
    doc.text(`${lr.quantity || '-'}`, pageWidth - 80, 148);
    doc.text(`${lr.weight || '-'}`, pageWidth - margin - 5, 148, { align: 'right' });

    // Bottom Section Vertical line for totals
    doc.line(margin, 180, pageWidth - margin, 180);
    doc.line(pageWidth - 90, 180, pageWidth - 90, 260);

    // Footer / Signatures
    doc.setFont("helvetica", "bold");
    doc.text('Terms & Conditions:', margin + 5, 190);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text('1. Goods are transported at owner\'s risk.', margin + 5, 198);
    doc.text('2. All disputes subject to local jurisdiction.', margin + 5, 206);

    doc.setFontSize(10);
    doc.text('Consignor Signature', margin + 10, 250);
    doc.text('Receiver Signature', margin + 55, 250);

    // Financial Totals
    const rightCol = pageWidth - 85;
    const rightEdge = pageWidth - margin - 5;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text('Freight:', rightCol, 190);
    doc.text(lr.freightAmount?.toFixed(2) || '0.00', rightEdge, 190, { align: 'right' });

    doc.text('Other Charges:', rightCol, 200);
    doc.text(lr.otherCharges?.toFixed(2) || '0.00', rightEdge, 200, { align: 'right' });

    const totalGst = ((lr.cgst || 0) + (lr.sgst || 0) + (lr.igst || 0));
    doc.text(`GST (${lr.gstRate || 0}%):`, rightCol, 210);
    doc.text(totalGst.toFixed(2), rightEdge, 210, { align: 'right' });

    doc.line(pageWidth - 90, 220, pageWidth - margin, 220);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('TOTAL:', rightCol, 230);
    doc.text(`Rs ${lr.totalAmount?.toFixed(2) || '0.00'}`, rightEdge, 230, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text('For Krishna Godavari Transport', rightCol, 250);

    doc.save(`LR_${lr.lrNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
