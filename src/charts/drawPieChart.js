export default function drawPieChart(data, title, colors) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const basePadding = 50;
    const titlePadding = title ? 30 : 0;
    const padding = basePadding + titlePadding;
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const isSmallScreen = window.innerWidth <= 768;
    const radius = isSmallScreen ? Math.min(width, height) / 2 : Math.min(width, height) / 3;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2 + titlePadding / 2);

    const total = data.slice(1).reduce((acc, val) => acc + Number(val[1] || 0), 0);
    const angles = data.slice(1).map(value => (Number(value[1]) / total) * 2 * Math.PI);

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const textColor = isDarkTheme ? '#FFF' : '#000';

    let progress = 0;
    const totalSteps = 200;
    const step = 1 / totalSteps;

    function drawLegend() {
        const legendX = width / 2 + radius + padding / 2;
        const legendY = padding;
        const legendBoxSize = 20;
        const legendSpacing = 10;

        data.slice(1).forEach((value, index) => {
            const legendItemY = legendY + index * (legendBoxSize + legendSpacing);

            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(legendX, legendItemY, legendBoxSize, legendBoxSize);

            ctx.fillStyle = textColor;
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(value[0], legendX + legendBoxSize + legendSpacing, legendItemY + legendBoxSize / 2);
        });
    }

    function drawTitle() {
        if (title) {
            ctx.fillStyle = textColor;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(title, 0, -height / 2 + basePadding / 2);
        }
    }

    function drawPieSlices() {
        let startAngle = 0;
        let endAngle = 0;
        angles.forEach((angle, index) => {
            endAngle += angle;
            if (endAngle > 2 * Math.PI * progress) {
                endAngle = 2 * Math.PI * progress;
            }
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            startAngle = endAngle;
        });
    }

    function drawPercentages() {
        let startAngle = 0;
        let endAngle = 0;
        angles.forEach((angle, index) => {
            endAngle += angle;
            const textAngle = startAngle + (endAngle - startAngle) / 2;
            const textX = (radius * 0.75) * Math.cos(textAngle);
            const textY = (radius * 0.75) * Math.sin(textAngle);
            const percentage = ((Number(data[index + 1][1]) / total) * 100).toFixed(2);

            ctx.fillStyle = textColor;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, textX, textY);

            startAngle = endAngle;
        });
    }

    function animate() {
        progress += step;
        if (progress > 1) progress = 1;

        ctx.clearRect(-width / 2, -height / 2 - titlePadding / 2, width / 2 + radius + padding / 2, height);

        drawPieSlices();
        drawTitle();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            drawPercentages();
            ctx.restore();
            drawLegend();
        }
    }

    function showTooltip(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = width / 2;
        const centerY = height / 2 + titlePadding / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
            let startAngle = 0;
            let endAngle = 0;
            for (let i = 0; i < angles.length; i++) {
                endAngle += angles[i];
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.closePath();
                if (ctx.isPointInPath(dx, dy)) {
                    const percentage = ((Number(data[i + 1][1]) / total) * 100).toFixed(2);
                    tooltip.style.left = `${event.clientX + 10}px`;
                    tooltip.style.top = `${event.clientY + 10}px`;
                    tooltip.style.display = 'block';
                    tooltip.textContent = `${data[i + 1][0]}: ${percentage}%`;
                    return;
                }
                startAngle = endAngle;
            }
        }
        tooltip.style.display = 'none';
    }

    canvas.addEventListener('mousemove', showTooltip);
    canvas.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });

    animate();
}