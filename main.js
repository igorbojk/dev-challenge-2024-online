import './style.css'
import drawLineChart from "./src/drawChart/drawLineChart.js";
import drawBarChart from "./src/drawChart/drawBarChart.js";
import drawPieChart from "./src/drawChart/drawPieChart.js";
import parseCSV from "./src/parseData/parseCSV.js";
import parseXLSX from "./src/parseData/parseXLSX.js";
import parseJSON from "./src/parseData/parseJSON.js";

let data = [];

const colorsPalette = [
    '#4E79A7',
    '#F28E2B',
    '#E15759',
    '#76B7B2',
    '#59A14F'
];

let selectedColor = colorsPalette[0]; // Default color

document.addEventListener('DOMContentLoaded', function() {
    const colorPaletteDiv = document.getElementById('colorPalette');
    colorsPalette.forEach(color => {
        const colorButton = document.createElement('button');
        colorButton.style.backgroundColor = color;
        colorButton.classList.add('color-button');
        colorButton.addEventListener('click', function() {
            selectedColor = color;
            document.querySelectorAll('.color-button').forEach(btn => btn.classList.remove('selected'));
            colorButton.classList.add('selected');
        });
        colorPaletteDiv.appendChild(colorButton);
    });
    document.querySelector('.color-button').classList.add('selected'); // Select the first color by default
});

document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const manualDataInput = document.getElementById('manualDataInput').value;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileType = file.name.split('.').pop();
            if (fileType === 'csv') {
                data = parseCSV(e.target.result);
            } else if (fileType === 'xlsx') {
                data = parseXLSX(e.target.result);
            } else if (fileType === 'json') {
                data = parseJSON(e.target.result);
            }
            previewData(data);
        };
        reader.readAsBinaryString(file);
    } else if (manualDataInput) {
        data = parseCSV(manualDataInput);
        previewData(data);
    } else {
        alert('Please upload a file or enter data manually.');
    }
});



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

    if (chartType === 'line') {
        drawLineChart(data, chartTitle, xAxisName, yAxisName, selectedColor);
    } else if (chartType === 'bar') {
        drawBarChart(data, chartTitle, xAxisName, yAxisName, selectedColor);
    } else if (chartType === 'pie') {
        drawPieChart(data, chartTitle, colorsPalette);
    }
});






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
