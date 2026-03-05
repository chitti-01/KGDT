import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        let customers;
        if (query) {
            customers = await prisma.customer.findMany({
                where: {
                    name: {
                        contains: query,
                    }
                },
                take: 10,
            });
        } else {
            customers = await prisma.customer.findMany({
                take: 50,
                orderBy: { updatedAt: 'desc' }
            });
        }

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, gstNumber, address, phone } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                gstNumber,
                address,
                phone,
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
