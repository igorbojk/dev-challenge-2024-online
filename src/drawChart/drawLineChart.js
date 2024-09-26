export default function drawLineChart(data, title, xAxisName, yAxisName) {
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
    const values = data.slice(1).map(row => row.slice(1));

    const maxVal = Math.max(...values.flat());
    const minVal = Math.min(...values.flat());
    const xStep = (width - 2 * padding) / (labels.length - 1);
    const yScale = (height - 2 * padding) / (maxVal - minVal);

    // Draw horizontal grid lines and values
    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
        const y = height - padding - (i * (height - 2 * padding) / numGridLines);
        const value = minVal + i * (maxVal - minVal) / numGridLines;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'right';
        ctx.fillText(value.toFixed(2), padding - 10, y + 3);
    }

    // Draw vertical grid lines and labels
    labels.forEach((label, index) => {
        const x = padding + index * xStep;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, height - padding + 20);
    });


    // Draw lines for each set of values
    values[0].forEach((_, lineIndex) => {
        const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
        if (!enabled) return;

        const color = document.getElementById(`lineColor${lineIndex}`).value;
        const style = document.getElementById(`lineStyle${lineIndex}`).value;
        const lineThickness = document.getElementById(`lineThickness${lineIndex}`).value;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineThickness;
        if (style === 'dashed') {
            ctx.setLineDash([10, 5]);
        } else if (style === 'dashdot') {
            ctx.setLineDash([10, 5, 2, 5]);
        } else {
            ctx.setLineDash([]);
        }
        values.forEach((row, index) => {
            const x = padding + index * xStep;
            const y = height - padding - (row[lineIndex] - minVal) * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    });

    // Draw axes and labels
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        const x = padding + index * xStep;
        ctx.fillText(label, x, height - padding + 20);
    });
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisName, -height / 2, padding - 10); // Adjusted position for Y-Axis name
    ctx.restore();
    ctx.fillText(xAxisName, width / 2, height - padding + 40);
    ctx.fillText(title, width / 2, padding - 10);
}