export default function drawLineChart(data, title, xAxisName, yAxisName) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

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
    const xStep = (width - 2 * padding) / (labels.length - 1);
    const yScale = (height - 2 * padding - legendHeight) / (maxVal - minVal);

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#FFF' : '#000';

    const numGridLines = 5;
    let progress = 0;
    const totalSteps = 200;
    const step = 1 / totalSteps;

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
            const x = padding + index * xStep;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding - legendHeight);
            ctx.strokeStyle = '#e0e0e0';
            ctx.stroke();
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.fillText(label, x, height - padding - legendHeight + 20);
        });
    }

    function drawPoints() {
        values[0].forEach((_, lineIndex) => {
            const enabled = document.getElementById(`lineEnabled${lineIndex}`).checked;
            if (!enabled) return;

            const color = document.getElementById(`lineColor${lineIndex}`).value;

            for (let i = 0; i < labels.length; i++) {
                const x = padding + i * xStep;
                const y = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
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

            ctx.fillStyle = color;
            ctx.fillRect(legendItemX, legendY, legendBoxSize, legendBoxSize);

            ctx.fillStyle = textColor;
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

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

            let prevX = padding;
            let prevY = height - padding - legendHeight - (values[0][lineIndex] - minVal) * yScale;
            ctx.moveTo(prevX, prevY);

            for (let i = 1; i < labels.length; i++) {
                const x = padding + i * xStep;
                const y = height - padding - legendHeight - (values[i][lineIndex] - minVal) * yScale;
                const currentProgress = progress * (labels.length - 1);
                if (i <= currentProgress) {
                    ctx.lineTo(x, y);
                } else {
                    const partialX = prevX + (x - prevX) * (currentProgress - (i - 1));
                    const partialY = prevY + (y - prevY) * (currentProgress - (i - 1));
                    ctx.lineTo(partialX, partialY);
                    break;
                }
                prevX = x;
                prevY = y;
            }
            ctx.stroke();
        });
    }

    function animate() {
        progress += step;
        if (progress > 1) progress = 1;

        ctx.clearRect(padding, padding, width - 2 * padding, height - 2 * padding - legendHeight);

        drawGridLines();
        drawVerticalLines();
        drawLines();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            drawPoints();
            drawLegend();
        }
    }

    function drawAxesAndLabels() {
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = padding + index * xStep;
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
                const pointX = padding + i * xStep;
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

    canvas.addEventListener('mousemove', showTooltip);
    canvas.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    drawAxesAndLabels();
    animate();
}