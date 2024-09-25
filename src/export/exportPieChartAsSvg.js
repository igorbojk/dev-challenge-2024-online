export function exportPieChartAsSvg(data, title, colors) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const radius = height / 2;

    const total = data.slice(1).reduce((acc, val) => acc + Number(val[1] || 0), 0);
    let startAngle = 0;

    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<g transform="translate(${width / 2}, ${height / 2})">`;

    data.slice(1).forEach((value, index) => {
        const sliceAngle = (Number(value[1]) / total) * 2 * Math.PI;
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
        startAngle += sliceAngle;
    });

    svgContent += `</g>`;
    svgContent += `<text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-size="20">${title}</text>`;
    svgContent += `</svg>`;

    return svgContent;
}