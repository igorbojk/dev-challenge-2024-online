window.activeSegment = 99;
window.depth = 20;
window.maxBarHeight = 0;
window.redrawGraph = function () { //keep the global space clean
    ///// STEP 0 - setup

    // source data table and canvas tag
    var data_table = document.getElementById('mydata');
    var canvas = document.getElementById('canvas');
    var td_index = 1; // which TD contains the data

    ///// STEP 1 - Get the, get the, get the data!

    // get the data[] from the table
    var tds, data = [],
        color, colors = [],
        value = 0,
        total = 0;
    var trs = data_table.getElementsByTagName('tr'); // all TRs
    var tableHeaderHeight = parseInt(getComputedStyle(trs[0])['height'].replace('px'), 10);
    canvas.style.height = (parseInt(getComputedStyle(data_table)['height'].replace('px'), 10) - tableHeaderHeight) + 'px';
    canvas.style.marginTop = (tableHeaderHeight + 2) + 'px';
    for (var i = 0; i < trs.length; i++) {
        tds = trs[i].getElementsByTagName('td'); // all TDs

        if (tds.length === 0) continue; //  no TDs here, move on

        // get the value, update total
        value = parseFloat(tds[td_index].innerHTML);
        data[data.length] = value;
        window.maxBarHeight = Math.max(window.maxBarHeight,value);
        total += value;

        // random color
        color = getColor(i);
        trs[i].style.backgroundColor = color; // color this TR
    }


    ///// STEP 2 - Draw pie on canvas


    // exit if canvas is not supported
    if (typeof canvas.getContext === 'undefined') {
        return;
    }

    // get canvas context, determine radius and center
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var canvas_size = [canvas.width, canvas.height];
    var radius = (Math.min(canvas_size[0], canvas_size[1]) / 2) * .95;
    var center = [canvas_size[0] / 2, canvas_size[1] / 2];

    var sofar = 0; // keep track of progress
    // loop the data[]

    var elemWidth = (((canvas.width-1)-window.depth) / (trs.length-1) );
    var spacing = 0;
    var yScale = 1;

    if(((window.maxBarHeight/total)*canvas.height) >= canvas.height) {
        while( ( (((window.maxBarHeight/total)*canvas.height) >= canvas.height) * yScale ) >= canvas.height) {
            yScale -= 0.025;
        }
    } else {
        yScale = Math.max( ( ( ( ( ( canvas.height * (window.maxBarHeight / total) ) - window.depth) -11) / 100 ) +1 ), 1);
    }
    //alert(canvas.height / (window.maxHeight*canvas.height));
    for (var i = 0; i < trs.length; i++) { // for (var piece in data) {

        var thisvalue = data[i] / total;

        var xMin = ((i)*elemWidth);

        //ctx.lineStyle = 'black';
        for(n=window.depth;n>0;n--) {
            ctx.fillStyle = getDarkColor(i+1) // trs[piece].style.backgroundColor // color
            ctx.fillRect(xMin+n,(canvas.height-6)-n,(elemWidth-spacing),-((thisvalue*canvas.height)*yScale) );
        }
        ctx.fillStyle = getColor(i + 1) // trs[piece].style.backgroundColor // color
        ctx.fillRect(xMin,(canvas.height-6),(elemWidth-spacing),-((thisvalue*canvas.height)*yScale) );
        if(window.depth == 0) {
            ctx.lineWidth = '1'
            ctx.strokeRect(xMin,(canvas.height-6),(elemWidth-spacing),-(thisvalue*canvas.height) );
        }

        sofar += thisvalue; // increment progress tracker
    }


    ///// DONE!

    function getColor(i) {
        var pallete = Array(
            '#1abc9c', '#2ecc71', '#3498db', '#9b59b6',
            '#f1c40f', '#e67e22', '#e74c3c', '#16a085'
        );
        return pallete[i];
    }

    function getDarkColor(i) {
        var pallete = Array(
            '#1abc9c', 'rgb(39, 172, 95)', 'rgb(44, 128, 184)', 'rgb(130, 78, 151)',
            'rgb(224, 183, 16)', 'rgb(201, 110, 29)', 'rgb(197, 66, 52)', 'rgb(20, 141, 117)'
        );
        return pallete[i];
    }

    data_table.style.transform = 'scale(0.1);';

};
redrawGraph();