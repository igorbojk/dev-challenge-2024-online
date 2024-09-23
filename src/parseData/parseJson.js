export default function parseJson(data) {
    const jsonArray = JSON.parse(data);
    if (jsonArray.length === 0) return [];

    const headers = Object.keys(jsonArray[0]);
    const values = jsonArray.map(obj => headers.map(header => obj[header]));

    return [headers, ...values];
}