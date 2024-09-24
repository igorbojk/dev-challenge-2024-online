export function exportBarChartAsSvg(data, title, xAxisName, yAxisName, barThickness, colorsPalette) {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 60;

    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row.slice(1).map(Number));
    const maxVal = Math.max(...values.flat());
    const barSpacing = (width - 2 * padding) / labels.length;
    const activeColumnsCount = values[0].filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked).length;
    const defaultBarThickness = Math.max(barSpacing * 0.8 / activeColumnsCount, 1);

    if (!+barThickness || +barThickness > defaultBarThickness.toFixed()) {
        barThickness = defaultBarThickness;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // Draw horizontal grid lines and values
    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
        const y = height - padding - (i * (height - 2 * padding) / numGridLines);
        const value = i * (maxVal / numGridLines);

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", padding);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#e0e0e0");
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", padding - 10);
        text.setAttribute("y", y + 3);
        text.setAttribute("text-anchor", "end");
        text.textContent = value.toFixed(2);
        svg.appendChild(text);
    }

    values.forEach((row, rowIndex) => {
        const activeColumns = row.filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked);
        const totalActiveWidth = activeColumns.length * barThickness;
        const groupOffset = (barSpacing - totalActiveWidth) / 2;

        row.forEach((value, colIndex) => {
            const barEnabled = document.getElementById(`barEnabled${colIndex}`).checked;
            if (!barEnabled) return;

            const barHeight = (value / maxVal) * (height - 2 * padding);
            const barX = padding + rowIndex * barSpacing + groupOffset + activeColumns.indexOf(value) * barThickness;

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", barX);
            rect.setAttribute("y", height - padding - barHeight);
            rect.setAttribute("width", barThickness);
            rect.setAttribute("height", barHeight);
            rect.setAttribute("fill", colorsPalette[colIndex % colorsPalette.length]);
            svg.appendChild(rect);
        });
    });

    labels.forEach((label, index) => {
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", padding + index * barSpacing + barSpacing / 2);
        text.setAttribute("y", height - padding + 20);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        svg.appendChild(text);
    });

    const yAxisText = document.createElementNS(svgNS, "text");
    yAxisText.setAttribute("x", -height / 2);
    yAxisText.setAttribute("y", padding - 10);
    yAxisText.setAttribute("transform", "rotate(-90)");
    yAxisText.setAttribute("text-anchor", "middle");
    yAxisText.textContent = yAxisName;
    svg.appendChild(yAxisText);

    const xAxisText = document.createElementNS(svgNS, "text");
    xAxisText.setAttribute("x", width / 2);
    xAxisText.setAttribute("y", height - padding + 40);
    xAxisText.setAttribute("text-anchor", "middle");
    xAxisText.textContent = xAxisName;
    svg.appendChild(xAxisText);

    const titleText = document.createElementNS(svgNS, "text");
    titleText.setAttribute("x", width / 2);
    titleText.setAttribute("y", padding - 20);
    titleText.setAttribute("text-anchor", "middle");
    titleText.textContent = title;
    svg.appendChild(titleText);

    return new XMLSerializer().serializeToString(svg);
}