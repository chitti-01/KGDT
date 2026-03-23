import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, addDays } from 'date-fns';

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
    doc.text(`LR No: ${String(lr.lrNumber).padStart(4, '0')}`, margin + 5, 52);
    doc.text(`Date: ${format(new Date(lr.bookingDate), 'dd-MMM-yyyy')}`, pageWidth - margin - 5, 52, { align: 'right' });

    doc.setFont("helvetica", "normal");
    const invNo = lr.invoiceNumber ? ` | Inv No: ${lr.invoiceNumber}` : '';
    doc.text(`Billing Type: ${lr.billingType}${invNo}`, margin + 5, 60);
    const delivery = lr.deliveryDate ? new Date(lr.deliveryDate) : addDays(new Date(lr.bookingDate), 1);
    doc.text(`Est. Delivery: ${format(delivery, 'dd-MMM-yyyy')}`, pageWidth - margin - 5, 60, { align: 'right' });

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
    doc.text(`Location: Vijayawada`, margin + 5, 105);

    // CONSIGNEE
    doc.setFont("helvetica", "bold");
    doc.text('CONSIGNEE (TO)', midPoint + 5, 75);
    doc.setFont("helvetica", "normal");
    doc.text(lr.consignee?.name || '-', midPoint + 5, 85);
    doc.text(`VAT/GST: ${lr.consignee?.gstNumber || 'N/A'}`, midPoint + 5, 95);
    doc.text(`Location: Eluru`, midPoint + 5, 105);

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
    doc.text('Freight:', rightCol, 210);
    doc.text(lr.freightAmount?.toFixed(2) || '0.00', rightEdge, 210, { align: 'right' });

    doc.line(pageWidth - 90, 220, pageWidth - margin, 220);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('TOTAL:', rightCol, 230);
    doc.text(`Rs ${lr.totalAmount?.toFixed(2) || '0.00'}`, rightEdge, 230, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text('For Krishna Godavari Transport', rightCol, 250);

    doc.save(`LR_${String(lr.lrNumber).padStart(4, '0')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

export function generateMultipleLRPdf(lrs: any[], startDate?: string, endDate?: string) {
    let filteredLrs = lrs;
    if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of the day
        filteredLrs = lrs.filter(lr => {
            const lrDate = new Date(lr.bookingDate).getTime();
            return lrDate >= start && lrDate <= end;
        });
    }

    const doc = new jsPDF('landscape'); // Landscape to fit all columns
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('KRISHNA GODAVARI DAILY TRANSPORT', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('LOGISTIC RECEIPT SUMMARY REPORT', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const periodText = (startDate && endDate)
        ? `Period: ${format(new Date(startDate), 'dd/MM/yyyy')} to ${format(new Date(endDate), 'dd/MM/yyyy')}`
        : 'Period: All Records up to Date';
    doc.text(periodText, pageWidth / 2, 35, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy, p')}`, pageWidth / 2, 42, { align: 'center' });

    // Table Data
    const tableData = filteredLrs.map(lr => [
        lr.lrNumber ? String(lr.lrNumber).padStart(4, '0') : '-',
        format(new Date(lr.bookingDate), 'dd/MM/yyyy'),
        lr.consignor?.name || '-',
        lr.consignor?.gstNumber || '-',
        lr.consignee?.name || '-',
        lr.consignee?.gstNumber || '-',
        lr.quantity || '-',
        lr.weight ? Number(lr.weight).toFixed(2) : '-',
        lr.invoiceNumber || '-',
        lr.totalAmount ? `Rs ${Number(lr.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'
    ]);

    // Totals
    const totalWeight = filteredLrs.reduce((sum, lr) => sum + (Number(lr.weight) || 0), 0);
    const totalFreight = filteredLrs.reduce((sum, lr) => sum + (Number(lr.totalAmount) || 0), 0);

    tableData.push([
        '', '', '', '', '', 'TOTALS', '-',
        totalWeight.toFixed(2),
        '-',
        `Rs ${totalFreight.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
        startY: 50,
        head: [['LR No', 'Date', 'Consignor', 'Consignor GST', 'Consignee', 'Consignee GST', 'Art', 'Weight', 'Inv No', 'Freight']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2, halign: 'left' },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: [200, 200, 200] },
        bodyStyles: { lineWidth: 0.1, lineColor: [200, 200, 200] },
        columnStyles: {
            7: { halign: 'right' }, // Weight
            9: { halign: 'right' }, // Freight
        },
        willDrawCell: function (data) {
            // Style the totals row
            if (data.row.index === tableData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 240, 240];
                if (data.column.index === 5) {
                    data.cell.styles.halign = 'right';
                }
            }
        },
    });

    // Footer Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 20 || 70;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text('PREPARED BY', 30, finalY + 10);
    doc.text('AUTHORISED SIGNATURE', pageWidth - 30, finalY + 10, { align: 'right' });

    doc.line(20, finalY + 5, 80, finalY + 5);
    doc.line(pageWidth - 80, finalY + 5, pageWidth - 20, finalY + 5);

    doc.save(`LR_Summary_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

export function generate3LRsPerPagePdf(lrs: any[], startDate?: string, endDate?: string) {
    let filteredLrs = lrs;
    if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of the day
        filteredLrs = lrs.filter(lr => {
            const lrDate = new Date(lr.bookingDate).getTime();
            return lrDate >= start && lrDate <= end;
        });
    }

    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const blockHeight = 93;
    const gap = 3;

    if (filteredLrs.length === 0) {
        doc.setFontSize(12);
        doc.text("No records found for the selected period.", pageWidth / 2, 148, { align: 'center' });
        doc.save(`Multiple_LRs_${format(new Date(), 'yyyyMMdd')}.pdf`);
        return;
    }

    filteredLrs.forEach((lr, index) => {
        if (index > 0 && index % 3 === 0) {
            doc.addPage();
        }

        const positionInPage = index % 3;
        const startY = margin + (positionInPage * (blockHeight + gap));

        // Draw Outer Border
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.rect(margin, startY, pageWidth - (margin * 2), blockHeight);

        // --- Block Content ---
        let currentY = startY + 6;

        // Top Header
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text('GSTIN: 37ADoPV1246Q1ZM', margin + 3, currentY);

        doc.setFontSize(14);
        doc.text('KRISHNA GODAVARI DAILY TRANSPORT', pageWidth / 2, currentY, { align: 'center' });

        doc.setFontSize(8);
        doc.text('ELR:232221\nVIJ:9441788199', pageWidth - margin - 3, currentY - 2, { align: 'right' });

        currentY += 4;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text('ELR: 7a-8-51, kotha road | VIJ: shop no2/2, Gollapudi market', pageWidth / 2, currentY, { align: 'center' });

        currentY += 3;
        doc.line(margin, currentY, pageWidth - margin, currentY); // Line 1

        currentY += 6;
        // LR NO
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const invStr = lr.invoiceNumber ? ` | INV: ${lr.invoiceNumber}` : '';
        doc.text(`LR NO: ${lr.lrNumber ? String(lr.lrNumber).padStart(4, '0') : '-'}${invStr}`, margin + 3, currentY);

        // PAID / TO PAY
        const billingTypeObj: Record<string, string> = {
            'Paid': 'PAID',
            'To Pay': 'TO PAY',
            'T.B.B': 'T.B.B'
        };
        const billingStr = billingTypeObj[lr.billingType] || 'TO PAY';
        const textWidth = doc.getTextWidth(billingStr);
        doc.setFillColor(0, 0, 0);
        doc.rect(pageWidth / 2 - (textWidth / 2) - 4, currentY - 4, textWidth + 8, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(billingStr, pageWidth / 2, currentY - 0.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`DATE: ${format(new Date(lr.bookingDate), 'dd-MMM-yyyy')}`, pageWidth / 2 + 15, currentY);

        doc.text(`FROM: ${lr.fromLocation || 'VIJAYAWADA'}`, pageWidth - 45, currentY);
        doc.text(`TO: ${lr.toLocation || 'ELURU'}`, pageWidth - margin - 3, currentY, { align: 'right' });

        currentY += 2;
        doc.line(margin, currentY, pageWidth - margin, currentY); // Line 2

        // Consignor & Consignee
        currentY += 5;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text('CONSIGNOR:', margin + 3, currentY);
        doc.text('CONSIGNEE:', pageWidth / 2 + 3, currentY);

        currentY += 4;
        doc.setFontSize(9);
        doc.text(lr.consignor?.name || '-', margin + 3, currentY);
        doc.text(lr.consignee?.name || '-', pageWidth / 2 + 3, currentY);

        currentY += 4;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`GST: ${lr.consignor?.gstNumber || 'N/A'}`, margin + 3, currentY);
        doc.text(`GST: ${lr.consignee?.gstNumber || 'N/A'}`, pageWidth / 2 + 3, currentY);

        currentY += 3;
        doc.line(margin, currentY, pageWidth - margin, currentY); // Line 3

        // Goods Table Header
        currentY += 4;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text('ART', margin + 7.5, currentY, { align: 'center' });
        doc.text('DESCRIPTION', margin + 20, currentY);
        doc.text('WT(KG)', pageWidth - 37.5, currentY, { align: 'center' });
        doc.text('FREIGHT', pageWidth - margin - 3, currentY, { align: 'right' });

        currentY += 2;
        doc.line(margin, currentY, pageWidth - margin, currentY); // Line 4

        // Goods Data Vertical Lines
        const tableTopY = currentY;
        const tableBottomY = startY + blockHeight - 12;
        doc.line(margin + 15, tableTopY, margin + 15, tableBottomY);
        doc.line(pageWidth - 50, tableTopY, pageWidth - 50, tableBottomY);
        doc.line(pageWidth - 25, tableTopY, pageWidth - 25, tableBottomY);

        currentY += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(String(lr.quantity || '-'), margin + 7.5, currentY, { align: 'center' });

        doc.setFontSize(8);
        const descText = lr.goodsDescription ? String(lr.goodsDescription) : '-';
        doc.text(descText, margin + 17, currentY);

        doc.setFont("helvetica", "bold");
        doc.text(String(lr.weight || '-'), pageWidth - 37.5, currentY, { align: 'center' });

        let freightVal = lr.freightAmount;
        if (freightVal === undefined || freightVal === null) freightVal = lr.totalAmount || 0;
        const freightStr = freightVal ? `Rs ${Math.round(freightVal)}` : '-';
        doc.text(freightStr, pageWidth - margin - 3, currentY, { align: 'right' });

        // Bottom section
        currentY = tableBottomY;
        doc.line(margin, currentY, pageWidth - margin, currentY); // Line 5

        currentY += 5;
        const deliveryStr = lr.deliveryDate ? format(new Date(lr.deliveryDate), 'dd-MMM-yyyy') : format(addDays(new Date(lr.bookingDate), 1), 'dd-MMM-yyyy');
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`Delv: ${deliveryStr}`, margin + 3, currentY);

        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text('For KRISHNA GODAVARI DAILY TRANSPORT', pageWidth - margin - 3, currentY, { align: 'right' });

        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.text('Authorised Signatory', pageWidth - margin - 3, currentY, { align: 'right' });
    });

    doc.save(`Multiple_LRs_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

