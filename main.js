import './style.css';
import { drawLineChart, exportLineChart } from "./src/charts/lineChart.js";
import drawBarChart from "./src/charts/drawBarChart.js";
import drawBarChart3d from "./src/charts/drawBarChart3d.js";
import drawPieChart from "./src/charts/drawPieChart.js";
import parseCSV from "./src/parseData/parseCSV.js";
import parseXLSX from "./src/parseData/parseXLSX.js";
import parseJSON from "./src/parseData/parseJSON.js";

import { exportBarChartAsSvg } from "./src/export/exportBarChartAsSvg.js";
import { exportBar3dChartAsSvg } from "./src/export/exportBar3dChartAsSvg.js";
import { exportPieChartAsSvg } from "./src/export/exportPieChartAsSvg.js";

let data = [];
const colorsPalette = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F'];
let viewState = 'upload'; // 'upload', 'preview', 'chart';
let lineVisible = false;

// Elements
const elements = {
    chartTypeSelect: document.getElementById('chartType'),
    lineSettings: document.getElementById('lineSettings'),
    barSettings: document.getElementById('barSettings'),
    drawChartButton: document.getElementById('drawChartButton'),
    proceedButton: document.getElementById('proceedButton'),
    exportPNGButton: document.getElementById('exportPNG'),
    exportSVGButton: document.getElementById('exportSVG'),
    exportPDFButton: document.getElementById('exportPDF'),
    printChartButton: document.getElementById('printChart'),
    themeIcon: document.getElementById('themeIcon'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    previewSection: document.getElementById('previewSection'),
    uploadSection: document.getElementById('uploadSection'),
    resetButton: document.getElementById('resetButton'),
    settingsButton: document.getElementById('settingsButton'),
    actionsBlock: document.querySelector('.actions'),
    previewTable: document.getElementById('dataPreview'),
    chartSection: document.getElementById('chartSection'),
    closeBtn: document.getElementById('closeBtn'),
    xAxisNameElement: document.getElementById('xAxisNameElement'),
    yAxisNameElement: document.getElementById('yAxisNameElement'),
    asideElement: document.querySelector('aside'),
    onboardingModal: document.getElementById('onboardingModal'),
    showOnboardingModalBtn: document.getElementById('showOnboardingModalBtn'),
    closeOnboardingBtn: document.getElementById('closeOnboardingBtn'),
    accessibilityButton: document.getElementById('accessibilityButton'),
    accessibilityMenu: document.getElementById('accessibilityMenu'),
    toggleGrayscaleButton: document.getElementById('toggleGrayscaleButton'),
    toggleLineButton: document.getElementById('toggleLineButton'),
    horizontalLine: document.getElementById('horizontalLine'),
    toggleCursorSizeButton: document.getElementById('toggleCursorSizeButton'),
};

const modalSeenKey = 'modalSeen';

const getRandomColorFromPalette = () => {
    const randomIndex = Math.floor(Math.random() * colorsPalette.length);
    return colorsPalette[randomIndex];
};

// Debounce function
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

// Event handler for input changes
const handleInputChange = debounce((event) => {
    if (event.target.type === 'checkbox') {
        document.getElementById('barThickness').value = 0;
    }

    drawChart();
}, 1000);

const handleChartTypeChange = () => {
    const chartType = elements.chartTypeSelect.value;

    elements.lineSettings.style.display = chartType === 'line' ? 'block' : 'none';
    elements.barSettings.style.display = ['bar', 'bar-3d'].includes(chartType) ? 'block' : 'none';
    elements.xAxisNameElement.style.display = chartType === 'pie' ? 'none' : 'flex';
    elements.yAxisNameElement.style.display = chartType === 'pie' ? 'none' : 'flex';

    if (viewState === 'chart') {
        drawChart();
    }
};

const drawChart = () => {
    const chartType = elements.chartTypeSelect.value;

    const oldCanvas = document.getElementById('canvas');
    if (oldCanvas) {
        const parent = oldCanvas.parentNode;
        parent.removeChild(oldCanvas);

        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'canvas';
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
        parent.appendChild(newCanvas);
    }

    if (chartType === 'pie') {
        elements.settingsButton.classList.add('hidden');
    } else {
        elements.settingsButton.classList.remove('hidden');
    }
    const chartTitle = document.getElementById('chartTitle').value;
    const xAxisName = document.getElementById('xAxisName').value;
    const yAxisName = document.getElementById('yAxisName').value;

    if (chartType === 'line') {
        drawLineChart(data, chartTitle, xAxisName, yAxisName);
    } else if (chartType === 'bar') {
        const barThickness = document.getElementById('barThickness').value;
        drawBarChart(data, chartTitle, xAxisName, yAxisName, barThickness, colorsPalette);
    } else if (chartType === 'bar-3d') {
        const barThickness = document.getElementById('barThickness').value;
        drawBarChart3d(data, chartTitle, xAxisName, yAxisName, barThickness, colorsPalette);
    } else if (chartType === 'pie') {
        drawPieChart(data, chartTitle, colorsPalette);
    }
};

const proceedData = () => {
    const fileInput = elements.fileInput;
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
    if (data.some(row => !row.length || row.some(cell => !cell))) {
        alert('Invalid data. Please, insert another data.');
        return;
    }
    if (!data.length) {
        alert('Empty data. Please, insert another data.');
        return;
    }
    previewData(data);
};

const previewData = (data) => {
    changeView('preview');
    elements.previewTable.innerHTML = '';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    elements.previewTable.appendChild(thead);

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
    elements.previewTable.appendChild(tbody);

    setupLineSettings(data[0].slice(1));
    setupBarSettings(data[0].slice(1));
};

const setupLineSettings = (headers) => {
    const lineSettingsContainer = elements.lineSettings;
    lineSettingsContainer.innerHTML = '';
    headers.forEach((header, index) => {
        const lineSettingDiv = document.createElement('div');
        lineSettingDiv.classList.add('chart-setting-element');
        lineSettingDiv.innerHTML = `
            <div class="settings">
                <label for="lineEnabled${index}">${header}:</label>
                <input type="checkbox" id="lineEnabled${index}" checked title="Tottle line">
            </div>
            <div class="settings">
                <label for="lineThickness${index}">Thickness:</label>
                <input type="number" id="lineThickness${index}" value="2" min="1" title="Set line thickness">
            </div>
            <div class="settings">
                <label for="lineColor${index}">Color:</label>
                <input type="color" id="lineColor${index}" value="${getRandomColorFromPalette()}" title="Set line color">
            </div>
            <div class="settings">
                <label for="lineStyle${index}">Line Style:</label>
                <select id="lineStyle${index}" title="Set line style">
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dashdot">Dash-Dot</option>
                </select>
            </div>
        `;
        lineSettingsContainer.appendChild(lineSettingDiv);
    });
};

const setupBarSettings = (headers) => {
    const barSettingsContainer = elements.barSettings;
    barSettingsContainer.innerHTML = '';
    const barSettingDiv = document.createElement('div');
    barSettingDiv.classList.add('chart-setting-element');
    barSettingDiv.innerHTML = `
        <div class="settings">
            <label for="barThickness">Bar Thickness:</label>
            <input type="number" id="barThickness" value="0" min="1" title="Set bar thickness">
        </div>
    `;
    barSettingsContainer.appendChild(barSettingDiv);

    headers.forEach((header, index) => {
        const barInnerSettingDiv = document.createElement('div');
        barInnerSettingDiv.classList.add('settings');
        barInnerSettingDiv.innerHTML = `
            <label for="barEnabled${index}">Enable ${header}:</label>
            <input type="checkbox" id="barEnabled${index}" checked title="Toggle enable for bar">
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
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Chart PDF</title>
        </head>
        <body>
            <img src="${dataUrl}" />
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
    };

    printWindow.onafterprint = () => {
        printWindow.close();
    };

};

const printGraph = () => {
    const canvas = document.getElementById('canvas');
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const backgroundColor = isDarkTheme ? '#000' : '#FFF';

    // Create a temporary canvas to draw the background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Draw the background
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Get the data URL of the combined image
    const dataUrl = tempCanvas.toDataURL('image/png');

    const windowContent = `
        <!DOCTYPE html>
        <html>
        <head><title>Print chart</title></head>
        <body style="margin: 0; background: ${backgroundColor}">
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
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    if (viewState === 'chart') {
        drawChart();
    }
};

const handleDragOver = (event) => {
    event.preventDefault();
    elements.dropZone.classList.add('dragover');
};

const handleDragLeave = () => {
    elements.dropZone.classList.remove('dragover');
};

const handleDrop = (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const validExtensions = ['csv', 'xlsx', 'json'];
        const file = files[0];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (validExtensions.includes(fileExtension)) {
            elements.fileInput.files = files;
            const event = new Event('change');
            elements.fileInput.dispatchEvent(event);
        } else {
            alert('Invalid file type. Please upload a .csv, .xlsx, or .json file.');
        }
    }
};

const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        if (viewState === 'chart') {
            event.preventDefault();
            printGraph();
        }
    }
};

const canvasToSVG = () => {
    const chartType = elements.chartTypeSelect.value;
    const chartTitle = document.getElementById('chartTitle').value;
    const xAxisName = document.getElementById('xAxisName').value;
    const yAxisName = document.getElementById('yAxisName').value;

    if (chartType === 'line') {
        return exportLineChart(data, chartTitle, xAxisName, yAxisName);
    } else if (chartType === 'bar') {
        const barThickness = document.getElementById('barThickness').value;
        return exportBarChartAsSvg(data, chartTitle, xAxisName, yAxisName, barThickness, colorsPalette);
    } else if (chartType === 'bar-3d') {
        const barThickness = document.getElementById('barThickness').value;
        return exportBar3dChartAsSvg(data, chartTitle, xAxisName, yAxisName, barThickness, colorsPalette);
    } else if (chartType === 'pie') {
        return exportPieChartAsSvg(data, chartTitle, colorsPalette);
    }
};

const changeView = (view) => {
    viewState = view;
    switch (view) {
        case 'upload':
            elements.asideElement.classList.remove('active');
            elements.previewTable.innerHTML = '';
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            document.getElementById('barThickness').value = 0;
            window.chartData = null;
            window.chart = null;
            elements.fileInput.value = '';
            document.getElementById('manualDataInput').value = '';
            elements.uploadSection.classList.remove('hidden');
            elements.previewSection.classList.add('hidden');
            elements.actionsBlock.classList.add('hidden');
            elements.chartSection.classList.add('hidden');
            elements.settingsButton.classList.add('hidden');
            break;
        case 'preview':
            elements.settingsButton.classList.add('hidden');
            elements.uploadSection.classList.add('hidden');
            elements.previewSection.classList.remove('hidden');
            elements.actionsBlock.classList.remove('hidden');
            elements.drawChartButton.classList.remove('hidden');
            break;
        case 'chart':
        default:
            elements.drawChartButton.classList.add('hidden');
            elements.previewSection.classList.add('hidden');
            elements.chartSection.classList.remove('hidden');
            elements.settingsButton.classList.remove('hidden');
            break;
    }
};

// Function to show the modal
const showModal = () => {
    elements.onboardingModal.classList.remove('hidden');
};

// Function to hide the modal
const hideModal = () => {
    elements.onboardingModal.classList.add('hidden');
};


// Handlers

elements.closeOnboardingBtn.addEventListener('click', hideModal);

// Event listener for the show modal button
elements.showOnboardingModalBtn.addEventListener('click', showModal);
elements.chartTypeSelect.addEventListener('change', handleChartTypeChange);
elements.drawChartButton.addEventListener('click', () => {
    changeView('chart');
    drawChart();
});
elements.proceedButton.addEventListener('click', proceedData);
elements.exportPNGButton.addEventListener('click', exportPNG);
elements.exportSVGButton.addEventListener('click', exportSVG);
elements.exportPDFButton.addEventListener('click', exportPDF);
elements.printChartButton.addEventListener('click', printGraph);
elements.themeIcon.addEventListener('click', toggleTheme);
elements.dropZone.addEventListener('dragover', handleDragOver);
elements.dropZone.addEventListener('dragleave', handleDragLeave);
elements.dropZone.addEventListener('drop', handleDrop);
document.addEventListener('keydown', handleKeyDown);

elements.resetButton.addEventListener('click', () => {
    changeView('upload');
});

elements.settingsButton.addEventListener('click', () => {
    elements.asideElement.classList.toggle('active');
});

elements.closeBtn.addEventListener('click', () => {
    elements.asideElement.classList.remove('active');
});

document.addEventListener('click', (event) => {
    if (!elements.asideElement.contains(event.target) && !elements.settingsButton.contains(event.target)) {
        elements.asideElement.classList.remove('active');
    }
});

// Add event listeners to the input fields
document.getElementById('chartTitle').addEventListener('input', handleInputChange);
document.getElementById('xAxisName').addEventListener('input', handleInputChange);
document.getElementById('yAxisName').addEventListener('input', handleInputChange);

// Function to add event listeners to dynamically added inputs
const addDynamicEventListenersForLineChart = () => {
    elements.lineSettings.querySelectorAll('input, select, textarea').forEach(input => {
        input.removeEventListener('input', handleInputChange);
        input.addEventListener('input', handleInputChange);
    });
};
const addDynamicEventListenersForBarChart = () => {
    elements.barSettings.querySelectorAll('input, select').forEach(input => {
        input.removeEventListener('input', handleInputChange);
        input.addEventListener('input', handleInputChange);
    });
};

// Observe changes in the lineSettings element
const lineChartObserver = new MutationObserver(addDynamicEventListenersForLineChart);
const barChartObserver = new MutationObserver(addDynamicEventListenersForBarChart);
lineChartObserver.observe(elements.lineSettings, { childList: true, subtree: true });
barChartObserver.observe(elements.barSettings, { childList: true, subtree: true });

elements.accessibilityButton.addEventListener('click', () => {
    elements.accessibilityMenu.classList.toggle('hidden');
});

elements.toggleLineButton.addEventListener('click', () => {
    lineVisible = !lineVisible;
    elements.horizontalLine.style.display = lineVisible ? 'block' : 'none';
});

elements.toggleGrayscaleButton.addEventListener('click', () => {
    document.body.classList.toggle('grayscale');
});

elements.toggleCursorSizeButton.addEventListener('click', () => {
    document.body.classList.toggle('large-cursor');
});

document.addEventListener('mousemove', (event) => {
    if (lineVisible) {
        elements.horizontalLine.style.top = `${event.clientY}px`;
    }
});

document.addEventListener('click', (event) => {
    if (!elements.accessibilityMenu.contains(event.target) && !elements.accessibilityButton.contains(event.target)) {
        elements.accessibilityMenu.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {

    if (!localStorage.getItem(modalSeenKey)) {
        showModal();
        localStorage.setItem(modalSeenKey, 'true');
    }
});