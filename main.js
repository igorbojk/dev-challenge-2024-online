import './style.css'


let data = [];

document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const manualDataInput = document.getElementById('manualDataInput').value;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            data = parseCSV(e.target.result);
            previewData(data);
        };
        reader.readAsText(file);
    } else if (manualDataInput) {
        data = parseCSV(manualDataInput);
        previewData(data);
    } else {
        alert('Please upload a file or enter data manually.');
    }
});

function parseCSV(data) {
    const rows = data.split('\n').map(row => row.split(','));
    return rows;
}

function previewData(data) {
    const previewTable = document.getElementById('dataPreview');
    previewTable.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        previewTable.appendChild(tr);
    });
}

document.getElementById('drawChartButton').addEventListener('click', function() {
    const chartType = document.getElementById('chartType').value;
    const chartTitle = document.getElementById('chartTitle').value;
    const xAxisName = document.getElementById('xAxisName').value;
    const yAxisName = document.getElementById('yAxisName').value;
    const color = document.getElementById('colorPicker').value;

    if (chartType === 'line') {
        drawLineChart(data, chartTitle, xAxisName, yAxisName, color);
    } else if (chartType === 'bar') {
        drawBarChart(data, chartTitle, xAxisName, yAxisName, color);
    } else if (chartType === 'pie') {
        drawPieChart(data, chartTitle, color);
    }
});

function drawLineChart(data, title, xAxisName, yAxisName, color) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const labels = data[1].slice(1);
    const values = data.slice(1).map(row => Number(row[1]));

    const maxVal = values.reduce((max, val) => val > max ? val : max, values[0]);
    const minVal = values.reduce((min, val) => val < min ? val : min, values[0]);

    const stepX = width / (values.length - 1);
    const stepY = height / (maxVal - minVal);

    ctx.beginPath();
    ctx.moveTo(0, height - (values[0] - minVal) * stepY);
    values.forEach((value, index) => {
        ctx.lineTo(index * stepX, height - (value - minVal) * stepY);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw axes and labels
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        ctx.fillText(label, index * stepX, height - 5);
    });
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisName, -height / 2, 20);
    ctx.restore();
    ctx.fillText(xAxisName, width / 2, height - 20);
    ctx.fillText(title, width / 2, 20);
}

function drawBarChart(data, title, xAxisName, yAxisName, color) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const labels = data[0].slice(1);
    const values = data.slice(1).map(row => Number(row[1]));
    const maxVal = Math.max(...values);
    const barWidth = width / values.length;

    ctx.fillStyle = color;
    values.forEach((value, index) => {
        const barHeight = (value / maxVal) * height;
        ctx.fillRect(index * barWidth, height - barHeight, barWidth - 5, barHeight);
    });

    // Draw axes and labels
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
        ctx.fillText(label, index * barWidth + barWidth / 2, height - 5);
    });
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yAxisName, -height / 2, 20);
    ctx.restore();
    ctx.fillText(xAxisName, width / 2, height - 20);
    ctx.fillText(title, width / 2, 20);
}

function drawPieChart(data, title, color) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = Math.min(width, height) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    const total = data.slice(1).reduce((acc, val) => acc + Number(val[1] || 0), 0);
    let startAngle = 0;

    data.slice(1).forEach((value) => {
        const sliceAngle = (Number(value[1]) / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        startAngle += sliceAngle;
    });

    ctx.restore();
}

document.getElementById('exportPNG').addEventListener('click', function() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

document.getElementById('exportSVG').addEventListener('click', function() {
    const canvas = document.getElementById('canvas');
    const svg = canvasToSVG(canvas);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'chart.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
});

document.getElementById('exportPDF').addEventListener('click', function() {
    const canvas = document.getElementById('canvas');
    const dataUrl = canvas.toDataURL('image/png');

    // Створюємо Blob з правильним MIME-типом
    const pdfContent = `
        <html>
        <head>
            <title>Chart PDF</title>
        </head>
        <body>
            <img src="${dataUrl}" />
        </body>
        </html>
    `;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });

    // Створюємо посилання для завантаження
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chart.pdf';

    // Додаємо посилання до документа і клікаємо на нього
    document.body.appendChild(link);
    link.click();

    // Видаляємо посилання після завантаження
    document.body.removeChild(link);
});
//
//
// document.getElementById('exportPDF').addEventListener('click', function() {
//     const dataUrl = canvas.toDataURL('image/png');
//     let windowContent = '<!DOCTYPE html>';
//     windowContent += '<html>';
//     windowContent += '<head><title>Print chart</title></head>';
//     windowContent += '<body>';
//     windowContent += '<img src="' + dataUrl + '">';
//     windowContent += '</body>';
//     windowContent += '</html>';
//     const printWin = window.open('', '', 'width=800,height=600');
//     printWin.document.open();
//     printWin.document.write(windowContent);
//     printWin.document.close();
//     printWin.focus();
//     setTimeout(() => {
//         printWin.print();
//         printWin.close();
//     }, 500);
// });

document.getElementById('printChart').addEventListener('click', function() {
    const dataUrl = canvas.toDataURL('image/png');
    let windowContent = '<!DOCTYPE html>';
    windowContent += '<html>';
    windowContent += '<head><title>Print chart</title></head>';
    windowContent += '<body>';
    windowContent += '<img src="' + dataUrl + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    const printWin = window.open('', '', 'width=800,height=600');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
        printWin.print();
        printWin.close();
    }, 500);
});

function canvasToSVG(canvas) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', canvas.width);
    svg.setAttribute('height', canvas.height);
    const img = document.createElementNS(svgNS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', canvas.toDataURL('image/png'));
    img.setAttribute('width', canvas.width);
    img.setAttribute('height', canvas.height);
    svg.appendChild(img);
    return new XMLSerializer().serializeToString(svg);
}
