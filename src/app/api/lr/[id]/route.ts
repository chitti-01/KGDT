import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const lr = await prisma.lR.findUnique({
            where: { id },
            include: {
                consignor: true,
                consignee: true
            }
        });

        if (!lr) {
            return NextResponse.json({ error: 'LR not found' }, { status: 404 });
        }

        return NextResponse.json(lr);
    } catch (error) {
        console.error('Error fetching LR:', error);
        return NextResponse.json({ error: 'Failed to fetch LR' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const {
            bookingDate, deliveryDate, billingType,
            consignorName, consigneeName, // Can be existing ID or new name
            consignorGst, consigneeGst,
            fromLocation, toLocation,
            goodsDescription, quantity, weight,
            freightAmount, otherCharges, gstRate
        } = body;

        // Logic: Get or create consignor
        let consignor = await prisma.customer.findUnique({ where: { name: consignorName } });
        if (!consignor) {
            consignor = await prisma.customer.create({ data: { name: consignorName, gstNumber: consignorGst || null } });
        }

        // Logic: Get or create consignee
        let consignee = await prisma.customer.findUnique({ where: { name: consigneeName } });
        if (!consignee) {
            consignee = await prisma.customer.create({ data: { name: consigneeName, gstNumber: consigneeGst || null } });
        }

        // Calculate amounts
        const fAmt = parseFloat(freightAmount) || 0;
        const oAmt = parseFloat(otherCharges) || 0;
        const gRate = parseFloat(gstRate) || 0;
        const taxableAmount = fAmt + oAmt;
        const totalGst = (taxableAmount * gRate) / 100;
        const cgst = totalGst / 2;
        const sgst = totalGst / 2;
        const totalAmount = taxableAmount + totalGst;

        const lr = await prisma.lR.update({
            where: { id },
            data: {
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

        return NextResponse.json(lr, { status: 200 });
    } catch (error) {
        console.error('Error updating LR:', error);
        return NextResponse.json({ error: 'Failed to update LR' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        // Ensure the LR exists before deleting
        const existingLr = await prisma.lR.findUnique({ where: { id } });
        if (!existingLr) {
            return NextResponse.json({ error: 'LR not found' }, { status: 404 });
        }

        await prisma.lR.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'LR deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting LR:', error);
        return NextResponse.json({ error: 'Failed to delete LR' }, { status: 500 });
    }
}
