export function exportBarChartAsSvg(data, title, xAxisName, yAxisName, barThickness, colorsPalette) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 70;
    const legendHeight = 50;

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row.slice(1).map(Number));
    const maxVal = Math.max(...values.flat());
    const barSpacing = (width - 2 * padding) / labels.length;
    const activeColumns = data[0].slice(1).map((label, colIndex) => ({
        label,
        enabled: document.getElementById(`barEnabled${colIndex}`).checked,
        color: colorsPalette[colIndex % colorsPalette.length]
    })).filter(col => col.enabled);
    const activeColumnsCount = activeColumns.length;
    const defaultBarThickness = Math.max(barSpacing * 0.8 / activeColumnsCount, 1);

    if (!+barThickness || +barThickness > defaultBarThickness.toFixed()) {
        barThickness = defaultBarThickness;
    }

    const numGridLines = 5;
    for (let i = 0; i <= numGridLines; i++) {
        const y = height - padding - legendHeight - (i * (height - 2 * padding - legendHeight) / numGridLines);
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
        const activeValues = row.filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked);
        const totalActiveWidth = activeValues.length * barThickness;
        const groupOffset = (barSpacing - totalActiveWidth) / 2;

        row.forEach((value, colIndex) => {
            const barEnabled = document.getElementById(`barEnabled${colIndex}`).checked;
            if (!barEnabled) return;

            const barHeight = (value / maxVal) * (height - 2 * padding - legendHeight);
            const color = colorsPalette[colIndex % colorsPalette.length];
            const barX = padding + rowIndex * barSpacing + groupOffset + activeValues.indexOf(value) * barThickness;

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", barX);
            rect.setAttribute("y", height - padding - legendHeight - barHeight);
            rect.setAttribute("width", barThickness);
            rect.setAttribute("height", barHeight);
            rect.setAttribute("fill", color);
            svg.appendChild(rect);
        });
    });

    labels.forEach((label, index) => {
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", padding + index * barSpacing + barSpacing / 2);
        text.setAttribute("y", height - padding - legendHeight + 20);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        svg.appendChild(text);
    });

    const yAxisText = document.createElementNS(svgNS, "text");
    yAxisText.setAttribute("x", -height / 2);
    yAxisText.setAttribute("y", 20);
    yAxisText.setAttribute("transform", "rotate(-90)");
    yAxisText.setAttribute("text-anchor", "middle");
    yAxisText.textContent = yAxisName;
    svg.appendChild(yAxisText);

    const xAxisText = document.createElementNS(svgNS, "text");
    xAxisText.setAttribute("x", width / 2);
    xAxisText.setAttribute("y", height - padding - legendHeight + 40);
    xAxisText.setAttribute("text-anchor", "middle");
    xAxisText.textContent = xAxisName;
    svg.appendChild(xAxisText);

    const titleText = document.createElementNS(svgNS, "text");
    titleText.setAttribute("x", width / 2);
    titleText.setAttribute("y", padding - 20);
    titleText.setAttribute("text-anchor", "middle");
    titleText.textContent = title;
    svg.appendChild(titleText);

    const legendX = padding;
    const legendY = height - padding - legendHeight + (xAxisName ? 50 : 30);
    const legendBoxSize = 20;
    const legendSpacing = 10;
    const legendWidth = (width - 2 * padding) / activeColumnsCount;

    activeColumns.forEach((col, index) => {
        const legendItemX = legendX + index * legendWidth;

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", legendItemX);
        rect.setAttribute("y", legendY);
        rect.setAttribute("width", legendBoxSize);
        rect.setAttribute("height", legendBoxSize);
        rect.setAttribute("fill", col.color);
        svg.appendChild(rect);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", legendItemX + legendBoxSize + legendSpacing);
        text.setAttribute("y", legendY + legendBoxSize / 2);
        text.setAttribute("text-anchor", "start");
        text.setAttribute("alignment-baseline", "middle");

        let displayText = col.label;
        const textWidth = document.createElementNS(svgNS, "text");
        textWidth.textContent = displayText;
        if (textWidth.getComputedTextLength() > legendWidth - legendBoxSize - legendSpacing) {
            while (textWidth.getComputedTextLength() > legendWidth - legendBoxSize - legendSpacing && displayText.length > 0) {
                displayText = displayText.slice(0, -1);
                textWidth.textContent = displayText + '...';
            }
            displayText += '...';
        }

        text.textContent = displayText;
        svg.appendChild(text);
    });

    return new XMLSerializer().serializeToString(svg);
}