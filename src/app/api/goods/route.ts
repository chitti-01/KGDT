import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        let goods;
        if (query) {
            goods = await prisma.goodType.findMany({
                where: {
                    name: {
                        contains: query,
                    }
                },
                take: 10,
            });
        } else {
            goods = await prisma.goodType.findMany({
                take: 50,
            });
        }

        return NextResponse.json(goods);
    } catch (error) {
        console.error('Error fetching goods:', error);
        return NextResponse.json({ error: 'Failed to fetch goods' }, { status: 500 });
    }
}
