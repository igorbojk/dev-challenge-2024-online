export function exportPieChartAsSvg(data, title, colors) {
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const basePadding = 50;
    const titlePadding = title ? 30 : 0;
    const padding = basePadding + titlePadding;
    const radius = (height / 2) - padding;

    const total = data.slice(1).reduce((acc, val) => acc + Number(val[1] || 0), 0);
    let startAngle = 0;

    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Draw title
    if (title) {
        svgContent += `<text x="${width / 2}" y="${basePadding / 2}" text-anchor="middle" font-size="24">${title}</text>`;
    }

    svgContent += `<g transform="translate(${width / 2}, ${height / 2 + titlePadding / 2})">`;

    data.slice(1).forEach((value, index) => {
        const sliceValue = Number(value[1]);
        const sliceAngle = (sliceValue / total) * 2 * Math.PI;
        const x1 = radius * Math.cos(startAngle);
        const y1 = radius * Math.sin(startAngle);
        const x2 = radius * Math.cos(startAngle + sliceAngle);
        const y2 = radius * Math.sin(startAngle + sliceAngle);
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

        const pathData = [
            `M 0 0`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
        ].join(' ');

        svgContent += `<path d="${pathData}" fill="${colors[index % colors.length]}" />`;

        // Calculate the position for the percentage text
        const textAngle = startAngle + sliceAngle / 2;
        const textX = (radius * 0.75) * Math.cos(textAngle); // Move text outward
        const textY = (radius * 0.75) * Math.sin(textAngle); // Move text outward

        // Draw the percentage text
        const percentage = ((sliceValue / total) * 100).toFixed(2);
        svgContent += `<text x="${textX}" y="${textY}" text-anchor="middle" font-size="16">${percentage}%</text>`;

        startAngle += sliceAngle;
    });

    svgContent += `</g>`;

    // Draw legend
    const legendX = width / 2 + radius + padding / 2; // Move legend closer to the chart
    const legendY = padding;
    const legendBoxSize = 20;
    const legendSpacing = 10;

    data.slice(1).forEach((value, index) => {
        const legendItemY = legendY + index * (legendBoxSize + legendSpacing);

        // Draw legend color box
        svgContent += `<rect x="${legendX}" y="${legendItemY}" width="${legendBoxSize}" height="${legendBoxSize}" fill="${colors[index % colors.length]}" />`;

        // Draw legend text
        svgContent += `<text x="${legendX + legendBoxSize + legendSpacing}" y="${legendItemY + legendBoxSize / 2}" text-anchor="start" alignment-baseline="middle" font-size="16">${value[0]}</text>`;
    });

    svgContent += `</svg>`;

    return svgContent;
}