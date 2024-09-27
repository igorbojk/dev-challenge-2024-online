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

let viewState = 'upload'; // 'upload', 'preview', 'chart';

// Elements
const chartTypeSelect = document.getElementById('chartType');
const lineSettings = document.getElementById('lineSettings');
const barSettings = document.getElementById('barSettings');
const drawChartButton = document.getElementById('drawChartButton');
const proceedButton = document.getElementById('proceedButton');
const exportPNGButton = document.getElementById('exportPNG');
const exportSVGButton = document.getElementById('exportSVG');
const exportPDFButton = document.getElementById('exportPDF');
const printChartButton = document.getElementById('printChart');
const themeIcon = document.getElementById('themeIcon');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const uploadSection = document.getElementById('uploadSection');
const resetButton = document.getElementById('resetButton');
const settingsButton = document.getElementById('settingsButton');
const actionsBlock = document.querySelector('.actions');
const previewTable = document.getElementById('dataPreview');
const chartSection = document.getElementById('chartSection');
const closeBtn = document.getElementById('closeBtn');
const xAxisNameElement = document.getElementById('xAxisNameElement');
const yAxisNameElement = document.getElementById('yAxisNameElement');
const asideElement = document.querySelector('aside');


const handleChartTypeChange = () => {
    const chartType = document.getElementById('chartType').value;

    lineSettings.style.display = chartType === 'line' ? 'block' : 'none';
    barSettings.style.display = chartType === 'bar' ? 'block' : 'none';

    xAxisNameElement.style.display = chartType === 'pie' ? 'none' : 'flex';
    yAxisNameElement.style.display = chartType === 'pie' ? 'none' : 'flex';
};

const drawChart = () => {
    changeView('chart');

    const chartType = document.getElementById('chartType').value;
    const chartTitle = document.getElementById('chartTitle').value;
    const xAxisName = document.getElementById('xAxisName').value;
    const yAxisName = document.getElementById('yAxisName').value;

    if (chartType === 'line') {
        drawLineChart(data, chartTitle, xAxisName, yAxisName);
    } else if (chartType === 'bar') {
        const barThickness = document.getElementById('barThickness');

        if (barThickness) {
            barThickness.value = 0;
        }
        drawBarChart(data, chartTitle, xAxisName, yAxisName, barThickness.value, colorsPalette);
    } else if (chartType === 'pie') {
        drawPieChart(data, chartTitle, colorsPalette);
    }
};

const proceedData = () => {
    const fileInput = document.getElementById('fileInput');
    const manualDataInput = document.getElementById('manualDataInput').value;


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
            validateData(data);
        };
        reader.readAsBinaryString(file);
    } else if (manualDataInput) {
        data = parseCSV(manualDataInput);
        validateData(data);
    } else {
        alert('Please upload a file or enter data manually.');
    }
};

const validateData = (data) => {
    const isValid = data.slice(1).every(row => row.every((cell, index) => index === 0 || !isNaN(cell)));
    if (!isValid) {
        alert('Data is not valid. All values except the first element must be numeric.');
        return;
    }
    previewData(data);
};

const previewData = (data) => {
    changeView('preview');
    previewTable.innerHTML = '';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    previewTable.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    previewTable.appendChild(tbody);

    const lineSettingsContainer = document.getElementById('lineSettings');
    lineSettingsContainer.innerHTML = '';
    const headers = data[0].slice(1);
    headers.forEach((header, index) => {
        const lineSettingDiv = document.createElement('div');
        lineSettingDiv.classList.add('chart-setting-element');
        lineSettingDiv.innerHTML = `
            <div class="settings">
                <label for="lineEnabled${index}">${header}:</label>
                <input type="checkbox" id="lineEnabled${index}" checked>
            </div>
            <div class="settings">
                <label for="lineThickness${index}">Thickness:</label>
                <input type="number" id="lineThickness${index}" value="2" min="1">
            </div>
            <div class="settings">
                <label for="lineColor${index}">Color:</label>
                <input type="color" id="lineColor${index}" value="#000000">
            </div>
            <div class="settings">
                <label for="lineStyle${index}">Line Style:</label>
                <select id="lineStyle${index}">
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dashdot">Dash-Dot</option>
                </select>
            </div>
        `;
        lineSettingsContainer.appendChild(lineSettingDiv);
    });

    const barSettingsContainer = document.getElementById('barSettings');
    barSettingsContainer.innerHTML = '';
    const barSettingDiv = document.createElement('div');
    barSettingDiv.classList.add('chart-setting-element');
    barSettingDiv.innerHTML = `
        <div class="settings">
            <label for="barThickness">Bar Thickness:</label>
            <input type="number" id="barThickness" value="0" min="1">
        </div>
    `;
    barSettingsContainer.appendChild(barSettingDiv);

    headers.forEach((header, index) => {
        const barInnerSettingDiv = document.createElement('div');
        barInnerSettingDiv.classList.add('settings');
        barInnerSettingDiv.innerHTML = `
            <label for="barEnabled${index}">Enable ${header}:</label>
            <input type="checkbox" id="barEnabled${index}" checked>
        `;
        barSettingDiv.appendChild(barInnerSettingDiv);
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
        const barThickness = document.getElementById('barThickness');

        return exportBarChartAsSvg(data, chartTitle, xAxisName, yAxisName, barThickness.value, colorsPalette);
    } else if (chartType === 'pie') {
        return exportPieChartAsSvg(data, chartTitle, colorsPalette);
    }
};


function changeView(view) {
    viewState = view;
    switch (view) {
        case 'upload':
            asideElement.classList.remove('active');

            // Clear the data in the table
            const dataPreview = document.getElementById('dataPreview');
            dataPreview.innerHTML = '';

            // Clear the graph
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barThickness = document.getElementById('barThickness');

            if (barThickness) {
                barThickness.value = 0;
            }

            // Reset any data variables (assuming you have some global variables for data)
            window.chartData = null;
            window.chart = null;

            // Clear file input and manual data
            const fileInput = document.getElementById('fileInput');
            const manualDataInput = document.getElementById('manualDataInput');
            fileInput.value = '';
            manualDataInput.value = '';

            // Hide sections that should be hidden after reset
            uploadSection.classList.remove('hidden');
            previewSection.classList.add('hidden');
            actionsBlock.classList.add('hidden');
            chartSection.classList.add('hidden');
            break;
        case 'preview':

            uploadSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
            actionsBlock.classList.remove('hidden');
            break;
        case 'chart':
        default:
            previewSection.classList.add('hidden');
            chartSection.classList.remove('hidden');
            break;
    }

}

// Handlers
chartTypeSelect.addEventListener('change', handleChartTypeChange);
drawChartButton.addEventListener('click', drawChart);
proceedButton.addEventListener('click', proceedData);
exportPNGButton.addEventListener('click', exportPNG);
exportSVGButton.addEventListener('click', exportSVG);
exportPDFButton.addEventListener('click', exportPDF);
printChartButton.addEventListener('click', printGraph);
themeIcon.addEventListener('click', toggleTheme);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
document.addEventListener('keydown', handleKeyDown);

resetButton.addEventListener('click', () => {
    changeView('upload');
});

settingsButton.addEventListener('click', () => {
    asideElement.classList.toggle('active');
});


closeBtn.addEventListener('click', () => {
    asideElement.classList.remove('active');
})

document.addEventListener('click', (event) => {
    if (!asideElement.contains(event.target) && !settingsButton.contains(event.target)) {
        asideElement.classList.remove('active');
    }
});