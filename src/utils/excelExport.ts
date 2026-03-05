import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export function exportLRsToExcel(lrs: any[]) {
    const data = lrs.map(lr => ({
        'LR Number': lr.lrNumber,
        'Booking Date': format(new Date(lr.bookingDate), 'dd-MM-yyyy'),
        'Consignor': lr.consignor?.name,
        'Consignee': lr.consignee?.name,
        'From': lr.fromLocation,
        'To': lr.toLocation,
        'Goods': lr.goodsDescription,
        'Total Amount': lr.totalAmount,
        'Status': lr.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LR_History');

    XLSX.writeFile(workbook, `LR_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
}
