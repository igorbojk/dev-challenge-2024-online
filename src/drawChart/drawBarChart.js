export default function drawBarChart(data, title, xAxisName, yAxisName, barThickness, colorsPalette) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = yAxisName ? 70 : 80;
    const legendHeight = 50; // Height reserved for the legend
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#FFF' : '#000';

    ctx.clearRect(0, 0, width, height);

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
        document.getElementById('barThickness').value = defaultBarThickness.toFixed();
        barThickness = defaultBarThickness;
    }

    const numGridLines = 5;
    const totalSteps = 70; // Increased number of steps for smoother animation
    const step = 1 / totalSteps;
    let progress = 0;

    // Draw static elements (grid lines, labels, axes, and legend)
    const drawStaticElements = () => {

        // Draw axes and labels
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            ctx.fillText(label, padding + index * barSpacing + barSpacing / 2, height - padding - legendHeight + 20);
        });
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yAxisName, -height / 2, 10); // Adjusted position of Y-Axis name
        ctx.restore();
        ctx.fillText(xAxisName, width / 2, height - padding - legendHeight + 40);
        ctx.fillText(title, width / 2, padding - 20);

        // Draw legend
        const legendX = padding;
        const legendY = height - padding - legendHeight + (xAxisName ? 50 : 30); // Increase this value to move the legend lower if X-Axis name is present
        const legendBoxSize = 20;
        const legendSpacing = 10;
        const legendWidth = (width - 2 * padding) / activeColumnsCount; // Divide width equally

        activeColumns.forEach((col, index) => {
            const legendItemX = legendX + index * legendWidth; // Adjust spacing as needed

            // Draw legend color box
            ctx.fillStyle = col.color;
            ctx.fillRect(legendItemX, legendY, legendBoxSize, legendBoxSize);

            // Draw legend text
            ctx.fillStyle = textColor;
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            // Measure text and add ellipsis if necessary
            let displayText = col.label;
            const textWidth = ctx.measureText(displayText).width;
            if (textWidth > legendWidth - legendBoxSize - legendSpacing) {
                while (ctx.measureText(displayText + '...').width > legendWidth - legendBoxSize - legendSpacing && displayText.length > 0) {
                    displayText = displayText.slice(0, -1);
                }
                displayText += '...';
            }

            ctx.fillText(displayText, legendItemX + legendBoxSize + legendSpacing, legendY + legendBoxSize / 2);
        });
    };

    // Draw animated bars
    const animate = () => {
        progress += step;
        if (progress > 1) progress = 1;

        ctx.clearRect(padding, padding, width - 2 * padding, height - 2 * padding - legendHeight);

        // Draw grid lines
        for (let i = 0; i <= numGridLines; i++) {
            const y = height - padding - legendHeight - (i * (height - 2 * padding - legendHeight) / numGridLines);
            const value = i * (maxVal / numGridLines);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.strokeStyle = '#e0e0e0';
            ctx.stroke();
            ctx.fillStyle = textColor;
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(2), padding - 10, y + 3);
        }

        // Draw bars for each set of values
        values.forEach((row, rowIndex) => {
            const activeValues = row.filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked);
            const totalActiveWidth = activeValues.length * barThickness;
            const groupOffset = (barSpacing - totalActiveWidth) / 2;

            row.forEach((value, colIndex) => {
                const barEnabled = document.getElementById(`barEnabled${colIndex}`).checked;
                if (!barEnabled) return;

                const barHeight = (value / maxVal) * (height - 2 * padding - legendHeight) * progress;
                const color = colorsPalette[colIndex % colorsPalette.length];
                const barX = padding + rowIndex * barSpacing + groupOffset + activeValues.indexOf(value) * barThickness;
                ctx.fillStyle = color;
                ctx.fillRect(barX, height - padding - legendHeight - barHeight, barThickness, barHeight);
            });
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };


    // Tooltip logic
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '3px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let found = false;
        values.forEach((row, rowIndex) => {
            const activeValues = row.filter((_, colIndex) => document.getElementById(`barEnabled${colIndex}`).checked);
            const totalActiveWidth = activeValues.length * barThickness;
            const groupOffset = (barSpacing - totalActiveWidth) / 2;

            activeValues.forEach((value, activeIndex) => {
                const barHeight = (value / maxVal) * (height - 2 * padding - legendHeight);
                const barX = padding + rowIndex * barSpacing + groupOffset + activeIndex * barThickness;
                const barY = height - padding - legendHeight - barHeight;

                if (mouseX >= barX && mouseX <= barX + barThickness && mouseY >= barY && mouseY <= barY + barHeight) {
                    tooltip.style.left = `${event.clientX + 10}px`;
                    tooltip.style.top = `${event.clientY + 10}px`;
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `${activeColumns[activeIndex].label}:  ${value}`;
                    found = true;
                }
            });
        });

        if (!found) {
            tooltip.style.display = 'none';
        }
    });

    drawStaticElements();
    animate();
}