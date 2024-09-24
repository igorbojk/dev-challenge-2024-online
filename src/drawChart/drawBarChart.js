export default function drawBarChart(data, title, xAxisName, yAxisName, barThickness, colorsPalette) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 50;

    ctx.clearRect(0, 0, width, height);

    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row.slice(1).map(Number));
    const maxVal = Math.max(...values.flat());
    const barSpacing = (width - 2 * padding) / labels.length;
    const activeColumnsCount = values[0].filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked).length;
    const defaultBarThickness = Math.max(barSpacing * 0.8 / activeColumnsCount, 1); // Default bar thickness based on spacing, minimum 1

    if (!+barThickness || +barThickness > defaultBarThickness.toFixed()) {
        document.getElementById('barThickness').value = defaultBarThickness.toFixed();
        barThickness = defaultBarThickness;
    }
    // Use the provided barThickness or the default calculated one

    // Draw horizontal grid lines and values
    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
        const y = height - padding - (i * (height - 2 * padding) / numGridLines);
        const value = i * (maxVal / numGridLines);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(2), padding - 10, y + 3);
    }

    values.forEach((row, rowIndex) => {
        const activeColumns = row.filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked);
        const totalActiveWidth = activeColumns.length * barThickness;
        const groupOffset = (barSpacing - totalActiveWidth) / 2;

        row.forEach((value, colIndex) => {
            const barEnabled = document.getElementById(`barEnabled${colIndex}`).checked;
            if (!barEnabled) return;

            const barHeight = (value / maxVal) * (height - 2 * padding);
            ctx.fillStyle = colorsPalette[colIndex % colorsPalette.length];
            const barX = padding + rowIndex * barSpacing + groupOffset + activeColumns.indexOf(value) * barThickness;
            ctx.fillRect(barX, height - padding - barHeight, barThickness, barHeight);
        });
    });

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        ctx.fillText(label, padding + index * barSpacing + barSpacing / 2, height - padding + 20);
    });
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisName, -height / 2, padding - 10);
    ctx.restore();
    ctx.fillText(xAxisName, width / 2, height - padding + 40);
    ctx.fillText(title, width / 2, padding - 20);
}