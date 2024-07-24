import Airtable from 'airtable';
import { NextResponse } from 'next/server';

function transformServiceData(serviceData) {
    return {
        type: "Feature",
        properties: {
            name: serviceData["Service name"] || "",
            address: serviceData["Service address"] || "",
            postcode: serviceData["Service postcode"] || "",
            email: serviceData["Service email address"] || "",
            website: serviceData["Service website"] || "",
            phone: serviceData["Service phone number"] || "",
            donate: serviceData["Service donation link"] || "", 
            serviceType: serviceData["Service type"] || [],
            serviceSpecialism: serviceData["Specialist services for"] || [], 
            approved: serviceData["Approved"]
        },
        geometry: {
            type: "Point",
            coordinates: [
                parseFloat(serviceData["Lng"] || 0),
                parseFloat(serviceData["Lat"] || 0)
            ]
        }
    };
}

export async function GET() {
    let base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);
    let allRecords = [];

    const fetchAllRecords = async () => {
        return new Promise((resolve, reject) => {
            base('services').select().eachPage((records, fetchNextPage) => {
                allRecords = allRecords.concat(records);
                fetchNextPage();
            }, (error) => {
                if (error) {
                    console.error('Error fetching records:', error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    };

    try {
        await fetchAllRecords();
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }

    const approvedRecords = allRecords.filter(record => record.fields["Approved"] === true);

    const data = approvedRecords.map(record => transformServiceData(record.fields));

    return NextResponse.json(data);
}
