export default function drawPieChart(data, title, colors) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const padding = 50;
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const radius = (height / 2) - padding;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    const total = data.slice(1).reduce((acc, val) => acc + Number(val[1] || 0), 0);
    let startAngle = 0;

    data.slice(1).forEach((value, index) => {
        const sliceValue = Number(value[1]);
        const sliceAngle = (sliceValue / total) * 2 * Math.PI;
        const percentage = ((sliceValue / total) * 100).toFixed(2);

        // Draw the slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        // Calculate the position for the percentage text
        const textAngle = startAngle + sliceAngle / 2;
        const textX = (radius / 2) * Math.cos(textAngle);
        const textY = (radius / 2) * Math.sin(textAngle);

        // Draw the percentage text
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, textX, textY);

        startAngle += sliceAngle;
    });

    ctx.restore();

    // Draw legend
    const legendX = width / 2 + radius + padding / 2; // Move legend closer to the chart
    const legendY = padding;
    const legendBoxSize = 20;
    const legendSpacing = 10;

    data.slice(1).forEach((value, index) => {
        const legendItemY = legendY + index * (legendBoxSize + legendSpacing);

        // Draw legend color box
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(legendX, legendItemY, legendBoxSize, legendBoxSize);

        // Draw legend text
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(value[0], legendX + legendBoxSize + legendSpacing, legendItemY + legendBoxSize / 2);
    });
}