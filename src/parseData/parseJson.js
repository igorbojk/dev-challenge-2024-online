export default function parseJson(data) {
    let jsonArray = []

    try {
        jsonArray = JSON.parse(data);
    } catch (e) {
        alert("Invalid JSON data");
        return
    }

    if (jsonArray.length === 0) return [];

    const headers = Object.keys(jsonArray[0]);
    const values = jsonArray.map(obj => headers.map(header => obj[header]));

    return [headers, ...values];
}