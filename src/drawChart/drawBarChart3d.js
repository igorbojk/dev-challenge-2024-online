export default function drawBarChart3D(data, barThickness, colors) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const depth = 20; // Depth for 3D effect

    ctx.clearRect(0, 0, width, height);

    const values = data.slice(1).map(row => row.slice(1).map(Number));
    const maxVal = Math.max(...values.flat());
    const total = values.flat().reduce((acc, val) => acc + val, 0);
    const scale = (height - 100) / maxVal;

    const barSpacing = (width - depth) / (values.length - 1);
    const yScale = Math.min(1, (height / (maxVal * scale)));

    values.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            const barHeight = (value / total) * height * yScale;
            const color = colors[colIndex % colors.length];
            const barX = rowIndex * barSpacing + colIndex * barThickness;

            for (let n = depth; n > 0; n--) {
                ctx.fillStyle = getDarkColor(colIndex);
                ctx.fillRect(barX + n, height - n, barThickness, -barHeight);
            }

            ctx.fillStyle = color;
            ctx.fillRect(barX, height, barThickness, -barHeight);

            if (depth === 0) {
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, height, barThickness, -barHeight);
            }
        });
    });

    function getColor(i) {
        const palette = [
            '#1abc9c', '#2ecc71', '#3498db', '#9b59b6',
            '#f1c40f', '#e67e22', '#e74c3c', '#16a085'
        ];
        return palette[i % palette.length];
    }

    function getDarkColor(i) {
        const palette = [
            '#1abc9c', 'rgb(39, 172, 95)', 'rgb(44, 128, 184)', 'rgb(130, 78, 151)',
            'rgb(224, 183, 16)', 'rgb(201, 110, 29)', 'rgb(197, 66, 52)', 'rgb(20, 141, 117)'
        ];
        return palette[i % palette.length];
    }
}