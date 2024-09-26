export default function drawPieChart(data, title, colors) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const padding = 50;
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const radius = (height / 2) - padding;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    const total = data.slice(1).reduce((acc, val) => acc + Number(val[1] || 0), 0);
    let startAngle = 0;

    data.slice(1).forEach((value, index) => {
        const sliceAngle = (Number(value[1]) / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        startAngle += sliceAngle;
    });

    ctx.restore();
}