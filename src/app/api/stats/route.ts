import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const totalLRs = await prisma.lR.count();
        const totalCustomers = await prisma.customer.count();

        // Calculate revenue for current month (MTD)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const mtdLRs = await prisma.lR.findMany({
            where: {
                createdAt: {
                    gte: startOfMonth,
                }
            },
            select: { totalAmount: true }
        });
        const mtdRevenue = mtdLRs.reduce((sum, lr) => sum + lr.totalAmount, 0);

        const activeShipments = await prisma.lR.count({
            where: {
                status: 'Created' // Assuming 'Created' means not yet 'Delivered'
            }
        });

        return NextResponse.json({
            totalLRs,
            totalCustomers,
            mtdRevenue,
            activeShipments
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
