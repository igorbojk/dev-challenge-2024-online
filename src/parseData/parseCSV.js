export default function parseCSV(data) {
    const rows = data.split('\n').map(row => row.split(','));
    return rows;
}