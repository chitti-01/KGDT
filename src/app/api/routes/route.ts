import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        let routes;
        if (query) {
            routes = await prisma.route.findMany({
                where: {
                    OR: [
                        { from: { contains: query } },
                        { to: { contains: query } }
                    ]
                },
                take: 10,
            });
        } else {
            routes = await prisma.route.findMany({
                take: 50,
            });
        }

        return NextResponse.json(routes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
    }
}
