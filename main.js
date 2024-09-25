import './style.css';
import drawLineChart from "./src/drawChart/drawLineChart.js";
import drawBarChart from "./src/drawChart/drawBarChart.js";
import drawPieChart from "./src/drawChart/drawPieChart.js";
import parseCSV from "./src/parseData/parseCSV.js";
import parseXLSX from "./src/parseData/parseXLSX.js";
import parseJSON from "./src/parseData/parseJSON.js";

import exportLineChartAsSvg from "./src/export/exportLineChartAsSvg.js";
import { exportBarChartAsSvg } from "./src/export/exportBarChartAsSvg.js";
import { exportPieChartAsSvg } from "./src/export/exportPieChartAsSvg.js";

let data = [];

const colorsPalette = [
    '#4E79A7',
    '#F28E2B',
    '#E15759',
    '#76B7B2',
    '#59A14F'
];

document.addEventListener('DOMContentLoaded', () => {
    const chartTypeSelect = document.getElementById('chartType');
    const lineSettings = document.getElementById('lineSettings');
    const barSettings = document.getElementById('barSettings');
    const drawChartButton = document.getElementById('drawChartButton');
    const uploadButton = document.getElementById('uploadButton');
    const exportPNGButton = document.getElementById('exportPNG');
    const exportSVGButton = document.getElementById('exportSVG');
    const exportPDFButton = document.getElementById('exportPDF');
    const printChartButton = document.getElementById('printChart');
    const themeIcon = document.getElementById('themeIcon');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    chartTypeSelect.addEventListener('change', handleChartTypeChange);
    drawChartButton.addEventListener('click', drawChart);
    uploadButton.addEventListener('click', uploadData);
    exportPNGButton.addEventListener('click', exportPNG);
    exportSVGButton.addEventListener('click', exportSVG);
    exportPDFButton.addEventListener('click', exportPDF);
    printChartButton.addEventListener('click', printGraph);
    themeIcon.addEventListener('click', toggleTheme);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    document.addEventListener('keydown', handleKeyDown);
});

const handleChartTypeChange = () => {
    const chartType = document.getElementById('chartType').value;
    const lineSettings = document.getElementById('lineSettings');
    const barSettings = document.getElementById('barSettings');

    lineSettings.style.display = chartType === 'line' ? 'block' : 'none';
    barSettings.style.display = chartType === 'bar' ? 'block' : 'none';
};

const drawChart = () => {
    const chartType = document.getElementById('chartType').value;
    const chartTitle = document.getElementById('chartTitle').value;
    const xAxisName = document.getElementById('xAxisName').value;
    const yAxisName = document.getElementById('yAxisName').value;
    const barThickness = document.getElementById('barThickness').value;

    if (chartType === 'line') {
        drawLineChart(data, chartTitle, xAxisName, yAxisName);
    } else if (chartType === 'bar') {
        drawBarChart(data, chartTitle, xAxisName, yAxisName, barThickness, colorsPalette);
    } else if (chartType === 'pie') {
        drawPieChart(data, chartTitle, colorsPalette);
    }
};

const uploadData = () => {
    const fileInput = document.getElementById('fileInput');
    const manualDataInput = document.getElementById('manualDataInput').value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barThickness = document.getElementById('barThickness');
    if (barThickness) {
        barThickness.value = 0;
    }

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
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
};

const previewData = (data) => {
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

    const lineSettingsContainer = document.getElementById('lineSettings');
    lineSettingsContainer.innerHTML = '';
    const headers = data[0].slice(1);
    headers.forEach((header, index) => {
        const lineSettingDiv = document.createElement('div');
        lineSettingDiv.innerHTML = `
            <label for="lineEnabled${index}">Enable ${header}:</label>
            <input type="checkbox" id="lineEnabled${index}" checked>
            <label for="lineThickness${index}">Line Thickness:</label>
            <input type="number" id="lineThickness${index}" value="2" min="1">
            <label for="lineColor${index}">Color for ${header}:</label>
            <input type="color" id="lineColor${index}" value="#000000">
            <label for="lineStyle${index}">Line Style for ${header}:</label>
            <select id="lineStyle${index}">
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dashdot">Dash-Dot</option>
            </select>
        `;
        lineSettingsContainer.appendChild(lineSettingDiv);
    });

    const barSettingsContainer = document.getElementById('barSettings');
    barSettingsContainer.innerHTML = '';
    const barSettingDiv = document.createElement('div');
    barSettingDiv.innerHTML = `
        <label for="barThickness">Bar Thickness:</label>
        <input type="number" id="barThickness" value="0" min="1">
    `;
    barSettingsContainer.appendChild(barSettingDiv);

    headers.forEach((header, index) => {
        const barSettingDiv = document.createElement('div');
        barSettingDiv.innerHTML = `
            <label for="barEnabled${index}">Enable ${header}:</label>
            <input type="checkbox" id="barEnabled${index}" checked>
        `;
        barSettingsContainer.appendChild(barSettingDiv);
    });
};

const exportPNG = () => {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
};

const exportSVG = () => {
    const canvas = document.getElementById('canvas');
    const svg = canvasToSVG(canvas);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'chart.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
};

const exportPDF = () => {
    const canvas = document.getElementById('canvas');
    const dataUrl = canvas.toDataURL('image/png');
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
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chart.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const printGraph = () => {
    const canvas = document.getElementById('canvas');
    const dataUrl = canvas.toDataURL('image/png');
    const windowContent = `
        <!DOCTYPE html>
        <html>
        <head><title>Print chart</title></head>
        <body style="margin: 0;">
            <img src="${dataUrl}" style="width: 100%; height: auto;">
        </body>
        </html>
    `;
    const printWin = window.open('', '', `width=${canvas.width},height=${canvas.height}`);
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
        printWin.print();
        printWin.close();
    }, 500);
};

const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('light-theme');
    body.classList.toggle('dark-theme');
};

const handleDragOver = (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
};

const handleDragLeave = () => {
    dropZone.classList.remove('dragover');
};

const handleDrop = (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const validExtensions = ['csv', 'xlsx', 'json'];
        const file = files[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (validExtensions.includes(fileExtension)) {
            fileInput.files = files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        } else {
            alert('Invalid file type. Please upload a .csv, .xlsx, or .json file.');
        }
    }
};

const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        printGraph();
    }
};

const canvasToSVG = () => {
    const chartType = document.getElementById('chartType').value;
    const chartTitle = document.getElementById('chartTitle').value;
    const xAxisName = document.getElementById('xAxisName').value;
    const yAxisName = document.getElementById('yAxisName').value;

    if (chartType === 'line') {
        return exportLineChartAsSvg(data, chartTitle, xAxisName, yAxisName);
    } else if (chartType === 'bar') {
        const barThickness = document.getElementById('barThickness').value;
        return exportBarChartAsSvg(data, chartTitle, xAxisName, yAxisName, barThickness, colorsPalette);
    } else if (chartType === 'pie') {
        return exportPieChartAsSvg(data, chartTitle, colorsPalette);
    }
};