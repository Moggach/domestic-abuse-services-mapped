import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export function useCsvData() {
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    Papa.parse('https://docs.google.com/spreadsheets/d/1Ks74q3_DsWZ_7OIqc3pJ-JzrVBfOKqhb2vB_gosoCSM/export?format=csv&gid=1299242923', {
      download: true,
      header: true,
      complete: (result) => {
        const approvedData = result.data.filter(item => item.Approved === 'Approved');
        setCsvData(approvedData);
        setFilteredData(approvedData);
      }
    });
  }, []);

  return [csvData, filteredData, setFilteredData];
}