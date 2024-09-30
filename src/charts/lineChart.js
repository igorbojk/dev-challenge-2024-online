let panOffset = 0;
let zoomLevel = 1;

export function drawLineChart(data, title, xAxisName, yAxisName) {
    panOffset = 0;
    zoomLevel = 1;

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.font = 'bold 12px Arial';
    ctx.textBaseline = 'middle';

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = yAxisName ? 70 : 50;
    const legendHeight = 60;

    ctx.clearRect(0, 0, width, height);

    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row.slice(1));
    const fieldNames = data[0].slice(1);

    const maxVal = Math.max(...values.flat());
    const minVal = Math.min(...values.flat());
    let xStep = (width - 2 * padding) / (labels.length - 1);
    const yScale = (height - 2 * padding - legendHeight) / (maxVal - minVal);

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#FFF' : '#000';

    const numGridLines = 5;
    let progress = 0;
    const totalSteps = 200;
    const step = 1 / totalSteps;


    let isPanning = false;
    let startX = 0;

    function drawGridLines() {
        for (let i = 0; i <= numGridLines; i++) {
            const y = height - padding - legendHeight - (i * (height - 2 * padding - legendHeight) / numGridLines);
            const value = minVal + i * (maxVal - minVal) / numGridLines;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.strokeStyle = '#e0e0e0';
            ctx.stroke();
            ctx.fillStyle = textColor;
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(2), padding - 10, y + 3);
        }
    }

    function drawVerticalLines() {
        labels.forEach((label, index) => {
            const x = padding + index * xStep * zoomLevel + panOffset;

            // Define the clipping region for the lines
            ctx.save();
            ctx.beginPath();
            ctx.rect(padding, padding, width - 2 * padding, height - 2 * padding - legendHeight);
            ctx.clip();

            // Draw the vertical line
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding - legendHeight);
            ctx.strokeStyle = '#e0e0e0';
            ctx.stroke();

            // Restore the previous clipping region
            ctx.restore();

            // Draw the text outside the clipping region if within bounds
            if (x >= padding && x <= width - padding) {
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                ctx.fillText(label, x, height - padding - legendHeight + 20);
            }
        });
    }

    function drawPoints() {
        const pointRadius = 3; // Радіус точки

        // Збільшуємо область кліпінгу на радіус точки
        ctx.save();
        ctx.beginPath();
        ctx.rect(padding - pointRadius, padding - pointRadius, width - 2 * padding + 2 * pointRadius, height - 2 * padding - legendHeight + 2 * pointRadius);
        ctx.clip();

        values[0].forEach((_, lineIndex) => {
            const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
            if (!enabled) return;

            const color = document.getElementById(`lineColor${lineIndex}`).value;

            for (let i = 0; i < labels.length; i++) {
                const x = padding + i * xStep * zoomLevel + panOffset;
                const y = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;
                ctx.beginPath();
                ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
            }
        });

        // Відновлюємо попередню область кліпінгу
        ctx.restore();
    }

    function drawLegend() {
        const legendX = padding;
        const legendY = height - padding + 10;
        const legendBoxSize = 20;
        const legendSpacing = 10;
        const legendItemWidth = (width - 2 * padding) / fieldNames.length;

        fieldNames.forEach((fieldName, lineIndex) => {
            const legendItemX = legendX + lineIndex * legendItemWidth;
            const color = document.getElementById(`lineColor${lineIndex}`).value;

            ctx.fillStyle = color;
            ctx.fillRect(legendItemX, legendY, legendBoxSize, legendBoxSize);

            ctx.fillStyle = textColor;
            ctx.textAlign = 'left';

            const maxTextWidth = legendItemWidth - legendBoxSize - legendSpacing;
            let displayText = fieldName;
            if (ctx.measureText(fieldName).width > maxTextWidth) {
                while (ctx.measureText(displayText + '...').width > maxTextWidth) {
                    displayText = displayText.slice(0, -1);
                }
                displayText += '...';
            }

            ctx.fillText(displayText, legendItemX + legendBoxSize + legendSpacing, legendY + legendBoxSize / 2);
        });
    }

    function drawLines() {
        // Define the clipping region
        ctx.save();
        ctx.beginPath();
        ctx.rect(padding, padding, width - 2 * padding, height - 2 * padding - legendHeight);
        ctx.clip();

        values[0].forEach((_, lineIndex) => {
            const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
            if (!enabled) return;

            const color = document.getElementById(`lineColor${lineIndex}`).value;
            const style = document.getElementById(`lineStyle${lineIndex}`).value;
            const lineThickness = document.getElementById(`lineThickness${lineIndex}`).value;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineThickness; // Не враховуємо zoomLevel
            if (style === 'dashed') {
                ctx.setLineDash([10, 5]);
            } else if (style === 'dashdot') {
                ctx.setLineDash([10, 5, 2, 5]);
            } else {
                ctx.setLineDash([]);
            }

            let prevX = padding + panOffset;
            let prevY = height - padding - legendHeight - (values[0][lineIndex] - minVal) * yScale;
            ctx.moveTo(prevX, prevY);

            for (let i = 1; i < labels.length; i++) {
                const x = padding + i * xStep * zoomLevel + panOffset;
                const y = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;
                const currentProgress = progress * (labels.length - 1);

                if (i <= currentProgress) {
                    if ((prevX >= padding && prevX <= width - padding) || (x >= padding && x <= width - padding)) {
                        ctx.lineTo(x, y);
                    } else {
                        ctx.moveTo(x, y);
                    }
                } else {
                    const partialX = prevX + (x - prevX) * (currentProgress - (i - 1));
                    const partialY = prevY + (y - prevY) * (currentProgress - (i - 1));
                    if ((prevX >= padding && prevX <= width - padding) || (partialX >= padding && partialX <= width - padding)) {
                        ctx.lineTo(partialX, partialY);
                    } else {
                        ctx.moveTo(partialX, partialY);
                    }
                    break;
                }
                prevX = x;
                prevY = y;
            }
            ctx.stroke();
        });

        // Restore the previous clipping region
        ctx.restore();
    }

    function drawLinesWithoutAnimation() {
        ctx.clearRect(0, 0, width, height);
        drawGridLines();
        drawVerticalLines();
        drawLines();
        drawPoints();
        drawLegend();
        drawAxesAndLabels();
    }

    function animate() {
        progress += step;
        if (progress > 1) progress = 1;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawGridLines();
        drawVerticalLines();
        drawLines();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            drawPoints();
            drawLegend();
            drawAxesAndLabels();
        }
    }

    function drawAxesAndLabels() {
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = padding + index * xStep * zoomLevel + panOffset;
            ctx.fillText(label, x, height - padding - legendHeight + 20);
        });
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yAxisName, -height / 2, 10);
        ctx.restore();
        ctx.fillText(xAxisName, width / 2, height - padding - legendHeight + 40);
        ctx.fillText(title, width / 2, padding - 10);
    }

    function showTooltip(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (let lineIndex = 0; lineIndex < values[0].length; lineIndex++) {
            for (let i = 0; i < labels.length; i++) {
                const pointX = padding + i * xStep * zoomLevel + panOffset;
                const pointY = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;

                if (Math.abs(x - pointX) < 5 && Math.abs(y - pointY) < 5) {
                    tooltip.style.left = `${event.clientX + 10}px`;
                    tooltip.style.top = `${event.clientY + 10}px`;
                    tooltip.style.display = 'block';
                    tooltip.textContent = `${fieldNames[lineIndex]}: ${values[i][lineIndex]}`;
                    return;
                }
            }
        }
        tooltip.style.display = 'none';
    }

    function startPan(event) {
        isPanning = true;
        startX = event.clientX;
    }

    function pan(event) {
        if (!isPanning) return;
        const dx = event.clientX - startX;
        startX = event.clientX;

        // Calculate the maximum and minimum pan offsets
        const maxPanOffset = 0;
        const minPanOffset = -(labels.length - 1) * xStep * zoomLevel + (width - 2 * padding);

        // Update panOffset with boundary checks
        panOffset = Math.min(Math.max(panOffset + dx, minPanOffset), maxPanOffset);

        drawLinesWithoutAnimation();
    }

    function endPan() {
        isPanning = false;
    }

    function zoom(event) {
        event.preventDefault();
        const zoomIntensity = labels.length / 10000;
        const wheel = event.deltaY < 0 ? 1 : -1;
        const newZoomLevel = zoomLevel + wheel * (zoomIntensity < 0.1 ? 0.1 : zoomIntensity);
        const minZoomLevel = Math.min(1, (width - 2 * padding) / ((labels.length - 1) * xStep));

        // Limit zoom level between minZoomLevel and 3
        zoomLevel = Math.min(Math.max(minZoomLevel, newZoomLevel), 1000);

        // Calculate the maximum and minimum pan offsets
        const maxPanOffset = 0;
        const minPanOffset = -(labels.length - 1) * xStep * zoomLevel + (width - 2 * padding);

        // Adjust panOffset to ensure no empty space is shown
        if (panOffset > maxPanOffset) {
            panOffset = maxPanOffset;
        } else if (panOffset < minPanOffset) {
            panOffset = minPanOffset;
        }

        drawLinesWithoutAnimation();
    }

    canvas.addEventListener('mousemove', showTooltip);
    canvas.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    canvas.addEventListener('mousedown', startPan);
    canvas.addEventListener('mousemove', pan);
    canvas.addEventListener('mouseup', endPan);
    canvas.addEventListener('mouseleave', endPan);
    canvas.addEventListener('wheel', zoom);

    animate();
}

export function exportLineChart(data, title, xAxisName, yAxisName) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = yAxisName ? 70 : 50;
    const legendHeight = 60;

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const labels = data.slice(1).map(row => row[0]);
    const values = data.slice(1).map(row => row.slice(1));
    const fieldNames = data[0].slice(1);

    const maxVal = Math.max(...values.flat());
    const minVal = Math.min(...values.flat());
    const xStep = (width - 2 * padding) / (labels.length - 1);
    const yScale = (height - 2 * padding - legendHeight) / (maxVal - minVal);

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#FFF' : '#000';

    const numGridLines = 5;

    function drawGridLines() {
        for (let i = 0; i <= numGridLines; i++) {
            const y = height - padding - legendHeight - (i * (height - 2 * padding - legendHeight) / numGridLines);
            const value = minVal + i * (maxVal - minVal) / numGridLines;

            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", padding);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width - padding);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#e0e0e0");
            svg.appendChild(line);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", padding);
            text.setAttribute("y", y + 3);
            text.setAttribute("fill", textColor);
            text.setAttribute("text-anchor", "end");
            text.textContent = value.toFixed(2);
            svg.appendChild(text);
        }
    }

    function drawVerticalLines() {
        labels.forEach((label, index) => {
            const x = padding + index * xStep * zoomLevel + panOffset;

            // Define the clipping region for the lines
            const clipPath = document.createElementNS(svgNS, "clipPath");
            clipPath.setAttribute("id", `clipPathVertical${index}`);
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", padding);
            rect.setAttribute("y", padding);
            rect.setAttribute("width", width - 2 * padding);
            rect.setAttribute("height", height - 2 * padding - legendHeight);
            clipPath.appendChild(rect);
            svg.appendChild(clipPath);

            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", padding);
            line.setAttribute("x2", x);
            line.setAttribute("y2", height - padding - legendHeight);
            line.setAttribute("stroke", "#e0e0e0");
            line.setAttribute("clip-path", `url(#clipPathVertical${index})`);
            svg.appendChild(line);

            if (x >= padding && x <= width - padding) {
                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", x);
                text.setAttribute("y", height - padding - legendHeight + 20);
                text.setAttribute("fill", textColor);
                text.setAttribute("text-anchor", "middle");
                text.textContent = label;
                svg.appendChild(text);
            }
        });
    }

    function drawLines() {
        values[0].forEach((_, lineIndex) => {
            const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
            if (!enabled) return;

            const color = document.getElementById(`lineColor${lineIndex}`).value;
            const style = document.getElementById(`lineStyle${lineIndex}`).value;
            const lineThickness = document.getElementById(`lineThickness${lineIndex}`).value;

            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("stroke", color);
            path.setAttribute("stroke-width", lineThickness);
            path.setAttribute("fill", "none");

            if (style === 'dashed') {
                path.setAttribute("stroke-dasharray", "10,5");
            } else if (style === 'dashdot') {
                path.setAttribute("stroke-dasharray", "10,5,2,5");
            }

            let d = `M${padding + panOffset},${height - padding - legendHeight - (values[0][lineIndex] - minVal) * yScale}`;
            for (let i = 1; i < labels.length; i++) {
                const x = padding + i * xStep * zoomLevel + panOffset;
                const y = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;
                d += ` L${x},${y}`;
            }
            path.setAttribute("d", d);

            // Add clipping path
            const clipPath = document.createElementNS(svgNS, "clipPath");
            clipPath.setAttribute("id", `clipPath${lineIndex}`);
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", padding);
            rect.setAttribute("y", padding);
            rect.setAttribute("width", width - 2 * padding);
            rect.setAttribute("height", height - 2 * padding - legendHeight);
            clipPath.appendChild(rect);
            svg.appendChild(clipPath);

            path.setAttribute("clip-path", `url(#clipPath${lineIndex})`);
            svg.appendChild(path);
        });
    }

    function drawPoints() {
        const pointRadius = 3;

        values[0].forEach((_, lineIndex) => {
            const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
            if (!enabled) return;

            const color = document.getElementById(`lineColor${lineIndex}`).value;

            for (let i = 0; i < labels.length; i++) {
                const x = padding + i * xStep * zoomLevel + panOffset;
                const y = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;

                // Add clipping path for points
                const clipPath = document.createElementNS(svgNS, "clipPath");
                clipPath.setAttribute("id", `clipPathPoint${lineIndex}${i}`);
                const rect = document.createElementNS(svgNS, "rect");
                rect.setAttribute("x", padding - pointRadius);
                rect.setAttribute("y", padding - pointRadius);
                rect.setAttribute("width", width - 2 * padding + 2 * pointRadius);
                rect.setAttribute("height", height - 2 * padding - legendHeight + 2 * pointRadius);
                clipPath.appendChild(rect);
                svg.appendChild(clipPath);

                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", pointRadius);
                circle.setAttribute("fill", color);
                circle.setAttribute("clip-path", `url(#clipPathPoint${lineIndex}${i})`);
                svg.appendChild(circle);
            }
        });
    }

    function drawLegend() {
        const legendX = padding;
        const legendY = height - padding + 10;
        const legendBoxSize = 20;
        const legendSpacing = 10;
        const legendItemWidth = (width - 2 * padding) / fieldNames.length;

        fieldNames.forEach((fieldName, lineIndex) => {
            const legendItemX = legendX + lineIndex * legendItemWidth;
            const color = document.getElementById(`lineColor${lineIndex}`).value;

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", legendItemX);
            rect.setAttribute("y", legendY);
            rect.setAttribute("width", legendBoxSize);
            rect.setAttribute("height", legendBoxSize);
            rect.setAttribute("fill", color);
            svg.appendChild(rect);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", legendItemX + legendBoxSize + legendSpacing);
            text.setAttribute("y", legendY + legendBoxSize / 2);
            text.setAttribute("fill", textColor);
            text.setAttribute("text-anchor", "start");
            text.setAttribute("dominant-baseline", "middle");

            let displayText = fieldName;
            if (displayText.length > 15) {
                displayText = displayText.slice(0, 15) + '...';
            }

            text.textContent = displayText;
            svg.appendChild(text);
        });
    }

    drawGridLines();
    drawVerticalLines();
    drawLines();
    drawPoints();
    drawLegend();

    return new XMLSerializer().serializeToString(svg);
}