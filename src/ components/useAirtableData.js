

import { useState, useEffect } from 'react';

export function useAirTableData() {
    const [airtableData, setAirtableData] = useState([]);

    let Airtable = require('airtable');
    let base = new Airtable({ apiKey: process.env.REACT_APP_AIRTABLE_API_KEY }).base(process.env.REACT_APP_AIRTABLE_BASE_ID);
    useEffect(() => {
        let allRecords = [];
        base('services').select({
            view: 'Grid view'
        }).eachPage((records, fetchNextPage) => {
            records.forEach(record => {
                allRecords.push(record.fields);
            });
            fetchNextPage();

        }, (err) => {
            if (err) { console.error(err); return; }
            setAirtableData(allRecords.filter(record => record.Approved === true));
        });
    }, []);


    return [airtableData, setAirtableData];
}