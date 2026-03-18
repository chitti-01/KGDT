import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get('q');

        // Build filter
        const whereClause: any = {};
        if (q) {
            // Try to parse q as a number for lrNumber search
            const numQuery = parseInt(q, 10);
            if (!isNaN(numQuery)) {
                whereClause.lrNumber = numQuery;
            } else {
                whereClause.OR = [
                    { consignor: { name: { contains: q } } },
                    { consignee: { name: { contains: q } } },
                    { fromLocation: { contains: q } },
                    { toLocation: { contains: q } }
                ];
            }
        }

        const lrs = await prisma.lR.findMany({
            where: whereClause,
            include: {
                consignor: true,
                consignee: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return NextResponse.json(lrs);
    } catch (error) {
        console.error('Error fetching LRs:', error);
        return NextResponse.json({ error: 'Failed to fetch LRs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            bookingDate, deliveryDate, billingType,
            consignorName, consigneeName, // Can be existing ID or new name
            consignorGst, consigneeGst,
            fromLocation, toLocation,
            goodsDescription, quantity, weight,
            freightAmount, otherCharges, gstRate
        } = body;

        // Logic: Auto-generate LR number
        const lastLr = await prisma.lR.findFirst({
            orderBy: { lrNumber: 'desc' }
        });
        const nextLrNumber = lastLr ? lastLr.lrNumber + 1 : 1; // Start at 1

        // Logic: Get or create consignor
        let consignor = await prisma.customer.findUnique({ where: { name: consignorName } });
        if (!consignor) {
            consignor = await prisma.customer.create({ data: { name: consignorName, gstNumber: consignorGst || null } });
        } else if (consignorGst && consignor.gstNumber !== consignorGst) {
            consignor = await prisma.customer.update({ where: { id: consignor.id }, data: { gstNumber: consignorGst } });
        }

        // Logic: Get or create consignee
        let consignee = await prisma.customer.findUnique({ where: { name: consigneeName } });
        if (!consignee) {
            consignee = await prisma.customer.create({ data: { name: consigneeName, gstNumber: consigneeGst || null } });
        } else if (consigneeGst && consignee.gstNumber !== consigneeGst) {
            consignee = await prisma.customer.update({ where: { id: consignee.id }, data: { gstNumber: consigneeGst } });
        }

        // Capture route and goods to build history
        try {
            await prisma.route.upsert({
                where: { from_to: { from: fromLocation, to: toLocation } },
                update: {},
                create: { from: fromLocation, to: toLocation }
            });
        } catch (e) { console.error('Error saving route info:', e); }

        try {
            await prisma.goodType.upsert({
                where: { name: goodsDescription },
                update: {},
                create: { name: goodsDescription }
            });
        } catch (e) { console.error('Error saving goods info:', e); }

        // Calculate amounts
        const fAmt = parseFloat(freightAmount) || 0;
        const oAmt = parseFloat(otherCharges) || 0;
        const gRate = parseFloat(gstRate) || 0;
        const taxableAmount = fAmt + oAmt;
        const totalGst = (taxableAmount * gRate) / 100;
        const cgst = totalGst / 2;
        const sgst = totalGst / 2;
        const totalAmount = taxableAmount + totalGst;

        const lr = await prisma.lR.create({
            data: {
                lrNumber: nextLrNumber,
                bookingDate: new Date(bookingDate),
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                billingType,
                consignorId: consignor.id,
                consigneeId: consignee.id,
                fromLocation,
                toLocation,
                goodsDescription,
                quantity: quantity ? parseInt(quantity, 10) : null,
                weight: weight ? parseFloat(weight) : null,
                freightAmount: fAmt,
                otherCharges: oAmt,
                gstRate: gRate,
                cgst: cgst,
                sgst: sgst,
                totalAmount: totalAmount
            },
            include: {
                consignor: true,
                consignee: true
            }
        });

        return NextResponse.json(lr, { status: 201 });
    } catch (error) {
        console.error('Error creating LR:', error);
        return NextResponse.json({ error: 'Failed to create LR' }, { status: 500 });
    }
}
