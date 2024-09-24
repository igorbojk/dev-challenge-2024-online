export default function drawLineChartSVG(data, title, xAxisName, yAxisName) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '700px');
    svg.setAttribute('viewBox', `0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 40;

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

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#e0e0e0');
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', padding - 10);
        text.setAttribute('y', y + 3);
        text.setAttribute('text-anchor', 'end');
        text.textContent = value.toFixed(2);
        svg.appendChild(text);
    }

    // Draw vertical grid lines and labels
    labels.forEach((label, index) => {
        const x = padding + index * xStep;

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', padding);
        line.setAttribute('x2', x);
        line.setAttribute('y2', height - padding);
        line.setAttribute('stroke', '#e0e0e0');
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - padding + 20);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = label;
        svg.appendChild(text);
    });

    // Draw lines for each set of values
    values[0].forEach((_, lineIndex) => {
        const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
        if (!enabled) return;

        const color = document.getElementById(`lineColor${lineIndex}`).value;
        const style = document.getElementById(`lineStyle${lineIndex}`).value;
        const lineThickness = document.getElementById(`lineThickness${lineIndex}`).value;

        const path = document.createElementNS(svgNS, 'path');
        const d = values.map((row, index) => {
            const x = padding + index * xStep;
            const y = height - padding - (row[lineIndex] - minVal) * yScale;
            return `${index === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ');

        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', lineThickness);
        path.setAttribute('fill', 'none');
        if (style === 'dashed') {
            path.setAttribute('stroke-dasharray', '10,5');
        } else if (style === 'dashdot') {
            path.setAttribute('stroke-dasharray', '10,5,2,5');
        }
        svg.appendChild(path);
    });

    // Draw Y-axis label
    const yAxisText = document.createElementNS(svgNS, 'text');
    yAxisText.setAttribute('x', -height / 2);
    yAxisText.setAttribute('y', 10);
    yAxisText.setAttribute('transform', 'rotate(-90)');
    yAxisText.setAttribute('text-anchor', 'middle');
    yAxisText.textContent = yAxisName;
    svg.appendChild(yAxisText);

    // Draw X-axis label
    const xAxisText = document.createElementNS(svgNS, 'text');
    xAxisText.setAttribute('x', width / 2);
    xAxisText.setAttribute('y', height - padding + 40);
    xAxisText.setAttribute('text-anchor', 'middle');
    xAxisText.textContent = xAxisName;
    svg.appendChild(xAxisText);

    // Draw chart title
    const titleText = document.createElementNS(svgNS, 'text');
    titleText.setAttribute('x', width / 2);
    titleText.setAttribute('y', padding - 10);
    titleText.setAttribute('text-anchor', 'middle');
    titleText.textContent = title;
    svg.appendChild(titleText);
    return new XMLSerializer().serializeToString(svg);
}