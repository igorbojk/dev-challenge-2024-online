import darkenColor from "../utils/darkenColor.js";

export function exportBar3dChartAsSvg(data, title, xAxisName, yAxisName, barThickness, colorsPalette) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = createSvgElement(svgNS);
    const { width, height, padding, legendHeight, depth } = getChartDimensions();
    const { labels, values, maxVal, barSpacing, activeColumns, defaultBarThickness } = processData(data, colorsPalette, width, padding);

    barThickness = validateBarThickness(barThickness, defaultBarThickness);

    drawGridLines(svg, svgNS, width, height, padding, legendHeight, maxVal);
    drawBars(svg, svgNS, values, activeColumns, barThickness, barSpacing, padding, height, legendHeight, maxVal, depth, colorsPalette);
    drawLabels(svg, svgNS, labels, width, height, padding, legendHeight, barSpacing);
    drawAxisTitles(svg, svgNS, xAxisName, yAxisName, title, width, height, padding, legendHeight);
    drawLegend(svg, svgNS, activeColumns, width, height, padding, legendHeight);

    return new XMLSerializer().serializeToString(svg);
}

function createSvgElement(svgNS) {
    const svg = document.createElementNS(svgNS, "svg");
    return svg;
}

function getChartDimensions() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 70;
    const legendHeight = 50;
    const depth = 20; // Depth for 3D effect
    return { width, height, padding, legendHeight, depth };
}

function processData(data, colorsPalette, width, padding) {
    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row.slice(1).map(Number));
    const maxVal = Math.max(...values.flat());
    const barSpacing = (width - 2 * padding) / labels.length;
    const activeColumns = data[0].slice(1).map((label, colIndex) => ({
        label,
        enabled: document.getElementById(`barEnabled${colIndex}`).checked,
        color: colorsPalette[colIndex % colorsPalette.length]
    })).filter(col => col.enabled);
    const defaultBarThickness = Math.max(barSpacing * 0.8 / activeColumns.length, 1);
    return { labels, values, maxVal, barSpacing, activeColumns, defaultBarThickness };
}

function validateBarThickness(barThickness, defaultBarThickness) {
    if (!+barThickness || +barThickness > defaultBarThickness.toFixed()) {
        return defaultBarThickness;
    }
    return barThickness;
}

function drawGridLines(svg, svgNS, width, height, padding, legendHeight, maxVal) {
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
}

function drawBars(svg, svgNS, values, activeColumns, barThickness, barSpacing, padding, height, legendHeight, maxVal, depth, colorsPalette) {
    values.forEach((row, rowIndex) => {
        const activeValues = row.filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked);
        const totalActiveWidth = activeValues.length * +barThickness;
        const groupOffset = (barSpacing - totalActiveWidth) / 2;

        activeValues.forEach((value, activeIndex) => {
            const colIndex = row.findIndex(val => val === value);
            const barHeight = (value / maxVal) * (height - 2 * padding - legendHeight);
            const color = colorsPalette[colIndex % colorsPalette.length];
            const barX = padding + rowIndex * barSpacing + groupOffset + activeIndex * +barThickness;

            drawBar(svg, svgNS, barX, height, padding, legendHeight, barHeight, barThickness, color, depth);
        });
    });
}

function drawBar(svg, svgNS, barX, height, padding, legendHeight, barHeight, barThickness, color, depth) {
    // Draw main bar
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", barX);
    rect.setAttribute("y", height - padding - legendHeight - barHeight);
    rect.setAttribute("width", barThickness);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", color);
    svg.appendChild(rect);

    // Draw 3D top wall
    const topWall = document.createElementNS(svgNS, "polygon");
    topWall.setAttribute("points", `
        ${barX},${height - padding - legendHeight - barHeight}
        ${barX + depth},${height - padding - legendHeight - barHeight - depth}
        ${barX + +barThickness + depth},${height - padding - legendHeight - barHeight - depth}
        ${barX + +barThickness},${height - padding - legendHeight - barHeight}
    `);
    topWall.setAttribute("fill", darkenColor(color, 20));
    svg.appendChild(topWall);

    // Draw 3D side wall
    const sideWall = document.createElementNS(svgNS, "polygon");
    sideWall.setAttribute("points", `
        ${barX + +barThickness},${height - padding - legendHeight - barHeight}
        ${depth + barX + +barThickness },${height - padding - legendHeight - barHeight - depth}
        ${depth + barX + +barThickness },${height - padding - legendHeight - depth}
        ${barX + +barThickness},${height - padding - legendHeight}
    `);
    sideWall.setAttribute("fill", darkenColor(color, 50));
    svg.appendChild(sideWall);
}

function drawLabels(svg, svgNS, labels, width, height, padding, legendHeight, barSpacing) {
    labels.forEach((label, index) => {
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", padding + index * barSpacing + barSpacing / 2);
        text.setAttribute("y", height - padding - legendHeight + 20);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        svg.appendChild(text);
    });
}

function drawAxisTitles(svg, svgNS, xAxisName, yAxisName, title, width, height, padding, legendHeight) {
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
    titleText.setAttribute("y", 20);
    titleText.setAttribute("text-anchor", "middle");
    titleText.textContent = title;
    svg.appendChild(titleText);
}

function drawLegend(svg, svgNS, activeColumns, width, height, padding, legendHeight) {
    const legendX = padding;
    const legendY = height - padding - legendHeight + 50;
    const legendBoxSize = 20;
    const legendSpacing = 10;
    const legendWidth = (width - 2 * padding) / activeColumns.length;

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
        if (displayText.length > 15) {
            displayText = displayText.slice(0, 15) + '...';
        }

        text.textContent = displayText;
        svg.appendChild(text);
    });
}