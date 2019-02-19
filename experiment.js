// global variables:

var ctx = {
    w: 1400,
    h: 600,

    trials: [],
    participant: "",
    startBlock: 0,
    startTrial: 0,
    cpt: 0,

    participantIndex: "ParticipantID",
    blockIndex: "Block1",
    trialIndex: "Trial",
    vvIndex: "VV",
    objectsCountIndex: "OC",
    startTime: 0,
    visualSearchTime: 0,
    errorCount: 0,

    state: "",
    loggedTrials:[],
};

var sdv = { // scene display variables
    numShapes: 7,
    margin: 8,
    defaultSize: 30,
    defaultStrokeColor: "grey",
    defaultFillColor: "grey",
    translate: "translate(50, 50)",
};

var randomId = 0; // for the unique shape of each trial



// functions called for each trial:

var showInstructions = function() {
    d3.select("#shapes").remove();

    d3.select("#instructions")
        .append("div")
        .attr("id", "textInstructions")
        .append("p")
        .attr("id", "title")
        .html("<b>Hello! This is an experiment to test how sensitive human eyes are to different visual clues.</b>")
        .append("p")
        .attr("id", "step1")
        .html("1. When you are ready, press the <b>Enter</b> key to go to the next trial. <i>The Timer starts.</i>")
        .append("p")
        .attr("id", "step2")
        .html("2. When you spot the unique shape different from all other shapes, press the <b>Spacebar</b> as fast as possible. <i>The Timer stops.</i>")
        .append("p")
        .attr("id", "step3")
        .html("3. Squares will appear to cover all the shapes in the trial, click on the square in the same position as the unique shape.")
        .attr("transform", sdv.translate);

    ctx.state = "INSTRUCTIONS_DISPLAYED";
}

var displayCovers = function(OC) {
    for(var i = 0; i < sdv.numShapes; i++){
        for(var j = 0; j < sdv.numShapes; j++){

            if(j*sdv.numShapes+i === randomId){
                d3.select("#shapes")
                    .append("rect")
                    .attr("x", i*sdv.defaultSize*2+sdv.margin*i-sdv.defaultSize)
                    .attr("y", j*sdv.defaultSize*2+sdv.margin*j-sdv.defaultSize)
                    .attr("height", 2*sdv.defaultSize)
                    .attr("width", 2*sdv.defaultSize)
                    .attr("stroke", sdv.defaultStrokeColor)
                    .attr("stroke-width", 3)
                    .attr("fill", sdv.defaultFillColor)
                    .attr("transform", sdv.translate)
                    .on("click", function(event){
                        nextTrial(true);
                    });
            }else{
                d3.select("#shapes")
                    .append("rect")
                    .attr("x", i*sdv.defaultSize*2+sdv.margin*i-sdv.defaultSize)
                    .attr("y", j*sdv.defaultSize*2+sdv.margin*j-sdv.defaultSize)
                    .attr("height", 2*sdv.defaultSize)
                    .attr("width", 2*sdv.defaultSize)
                    .attr("stroke", sdv.defaultStrokeColor)
                    .attr("stroke-width", 3)
                    .attr("fill", sdv.defaultFillColor)
                    .attr("transform", sdv.translate)
                    .on("click", function(event){
                        nextTrial(false);
                    });
            }

        }
    }
}

/**
 * Shuffles array in place.
 * @param {Array} An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function generateShapesAttributes(targetShapeStroke, targetShapeFill, restShapeStroke, restShapeFill) {
    var i;
    for (i = 0; i < 2; i++){
        shapes.push({stroke: targetShapeStroke, fill: restShapeFill});
    }
    for (i = 0; i < 2; i++){
        shapes.push({stroke: restShapeStroke, fill: targetShapeFill});
    }
    for (i = 0; i < 2; i++){
        shapes.push({stroke: restShapeStroke, fill: restShapeFill});
    }
    for (i = 0; i < sdv.numShapes * sdv.numShapes - 7; i++){
        var sc = Math.random() > 0.5 ? targetShapeStroke : restShapeStroke;
        var fc = (sc == targetShapeStroke) ? restShapeFill : (Math.random() > 0.5 ? targetShapeFill : restShapeFill);
        shapes.push({ stroke: sc, fill: fc });
    }
    shapes = shuffle(shapes);
    shapes.splice(randomId, 0, { stroke: targetShapeStroke, fill: targetShapeFill }); // 1 target shape
}

var displayShapes = function(OC, VV) { //shapes are circles here

    d3.select("#textInstructions").remove();

    d3.select("#shapes").remove();

    d3.select("#mainScene")
        .append("g")
        .attr("id", "shapes");

    var shape = "circle";

    switch(OC) {
        case "Small":
            sdv.numShapes = 3;
            break;
        case "Medium":
            sdv.numShapes = 5;
            break;
        case "Large":
            sdv.numShapes = 7;
            break;
    }
    console.log("number of shapes: "+sdv.numShapes);
    randomId = Math.floor((sdv.numShapes*sdv.numShapes-1)*Math.random());
    console.log("randomId: "+randomId);

    // Randomly decide target stroke color & target fill color
    sdv.targetStrokeColor = Math.random() > 0.5 ? "grey" : "white";
    sdv.otherStrokeColor = (sdv.targetStrokeColor === "grey") ? "white" : "grey";
    sdv.targetFillColor = Math.random() > 0.5 ? "pink" : "yellow";
    sdv.otherFillColor = (sdv.targetFillColor === "pink") ? "yellow" : "pink";
    console.log("targetStrokeColor: "+sdv.targetStrokeColor);
    console.log("otherStrokeColor: "+sdv.otherStrokeColor);
    console.log("targetFillColor: "+sdv.targetFillColor);
    console.log("otherFillColor: "+sdv.otherFillColor);

    shapes = [];
    console.log("VV: "+VV);
    if (VV === "Stroke"){ // 1 target shape: target stroke + same fill
        for (i = 0; i < sdv.numShapes * sdv.numShapes - 1; i++){
            shapes.push({ stroke: sdv.otherStrokeColor, fill: sdv.targetFillColor });
        }
        shapes.splice(randomId, 0, { stroke: sdv.targetStrokeColor, fill: sdv.targetFillColor }); // 1 target shape
    }

    if (VV === "Fill"){ // 1 target shape: same stroke + target fill
        for (i = 0; i < sdv.numShapes * sdv.numShapes - 1; i++){
            shapes.push({ stroke: sdv.targetStrokeColor, fill: sdv.otherFillColor });
        }
        shapes.splice(randomId, 0, { stroke: sdv.targetStrokeColor, fill: sdv.targetFillColor }); // 1 target shape
    }

    if (VV === "StrokeFill"){ // 1 target shape: target stroke + target fill
        generateShapesAttributes(sdv.targetStrokeColor, sdv.targetFillColor, sdv.otherStrokeColor, sdv.otherFillColor);
    }

    for(var i = 0; i < sdv.numShapes; i++){
        for(var j = 0; j < sdv.numShapes; j++){
            d3.select("#shapes")
                .append(shape)
                .attr("cx", i*sdv.defaultSize*2+sdv.margin*i)
                .attr("cy", j*sdv.defaultSize*2+sdv.margin*j)
                .attr("r", sdv.defaultSize)
                .attr("stroke", shapes[j*sdv.numShapes+i].stroke)
                .attr("stroke-width", 3)
                .attr("fill", shapes[j*sdv.numShapes+i].fill)
                .attr("transform", sdv.translate);
        }
    }
    ctx.state = "SHAPES_DISPLAYED";
    ctx.startTime = Date.now();
}



// log module:

var logTrial = function() {
    var logLine = {
        DesignName: ctx.trials[ctx.cpt]["DesignName"],
        ParticipantID: ctx.trials[ctx.cpt]["ParticipantID"],
        TrialID: ctx.trials[ctx.cpt]["TrialID"],
        Block1: ctx.trials[ctx.cpt]["Block1"],
        Trial: ctx.trials[ctx.cpt]["Trial"],
        VV: ctx.trials[ctx.cpt]["VV"],
        OC: ctx.trials[ctx.cpt]["OC"],
        VisualSearchTime: ctx.visualSearchTime,
        ErrorCount: ctx.errorCount,
    };
    ctx.loggedTrials.push(logLine);
    console.log(logLine);
}




// framework for experiment and trial:

var keyListener = function(event) {
    event.preventDefault();

    if (event.code == "Enter" && ctx.state === "INSTRUCTIONS_DISPLAYED") {
        event.preventDefault();

        d3.select("#textInstructions").remove();
        //nextTrial(true);//give control in displayCovers mouse click
        displayShapes(ctx.trials[ctx.cpt]["OC"], ctx.trials[ctx.cpt]["VV"]);
    }

    if (event.code == "Space" && ctx.state === "SHAPES_DISPLAYED") {
        displayCovers(ctx.trials[ctx.cpt]["OC"]);
        var stopTime=Date.now();
        ctx.visualSearchTime=stopTime-ctx.startTime;
        logTrial();
    }
}


var nextTrial = function(correct) {
    // TODO
    if (correct === "init") {
        ctx.cpt++;
        ctx.errorCount = 0;
    }
    if (correct === true) {
        //logTrial();
        ctx.cpt++;
        ctx.errorCount = 0;
        console.log("CORRECT CLICK");
        //console.log(ctx.visualSearchTime, ctx.startTime, ctx.errorCount);
    }
    if(correct === false){
        ctx.errorCount++;
        console.log("WRONG CLICK");
    }

    if (!(ctx.trials[ctx.cpt]["ParticipantID"] === ctx.participant)) {
        console.log("END!")
    } else {
        console.log("nextTrial");
        console.log(ctx.trials[ctx.cpt]["VV"] + "OC:" + ctx.trials[ctx.cpt]["OC"]);
        showInstructions();
    }
    //displayShapes(ctx.trials[ctx.cpt]["OC"], ctx.trials[ctx.cpt]["VV"]);//give control to itself
};

var downloadLog=function (e) {
    function _getDownloadUrl (text) {
        const BOM = '\uFEFF';
        if (window.Blob && window.URL && window.URL.createObjectURL) {
            const csvData = new Blob([BOM + text], { type: 'text/csv' });
            return URL.createObjectURL(csvData);
        } else {
            return 'data:attachment/csv;charset=utf-8,' + BOM + encodeURIComponent(text);
        }
    }
    e.preventDefault();
    console.log(d3.csvFormat(ctx.loggedTrials));
    text=d3.csvFormat(ctx.loggedTrials);
    const link = document.createElement('a');
    link.download = 'logs_' + Date.now() + ".csv";
    link.href = _getDownloadUrl (text);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

var startExperiment = function(event) {
    event.preventDefault();
    for (var i = 0; i < ctx.trials.length; i++) {
        if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
            if (parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
                if (parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
                    ctx.cpt = i - 1;
                }
            }
        }
    }
    console.log("start experiment at " + ctx.cpt);
    nextTrial("init");
}

var createScene = function() {
    var svgEl = d3.select("#scene").append("svg");
    svgEl.attr("id", "mainScene");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h)
        .classed('centered', true);

    loadData(svgEl);
};

/////////////////////////////////////////////////////

var setTrial = function(trialID) {
    ctx.startTrial = parseInt(trialID);
}

var setBlock = function(blockID) {
    ctx.startBlock = parseInt(blockID);

    var trial = "";
    var options = [];

    for (var i = 0; i < ctx.trials.length; i++) {
        if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
            if (parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
                if (!(ctx.trials[i][ctx.trialIndex] === trial)) {
                    trial = ctx.trials[i][ctx.trialIndex];
                    options.push(trial);
                }
            }
        }
    }

    var select = d3.select("#trialSel");

    select.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function(d) { return d; });

    setTrial(options[0]);

}

var setParticipant = function(participantID) {
    ctx.participant = participantID;

    var block = "";
    var options = [];

    for (var i = 0; i < ctx.trials.length; i++) {
        if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
            if (!(ctx.trials[i][ctx.blockIndex] === block)) {
                block = ctx.trials[i][ctx.blockIndex];
                options.push(block);
            }
        }
    }

    var select = d3.select("#blockSel")
    select.selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .text(function(d) { return d; });

    setBlock(options[0]);

};

var loadData = function(svgEl) {

    d3.csv("experiment.csv").then(function(data) {
        ctx.trials = data;

        var participant = "";
        var options = [];

        for (var i = 0; i < ctx.trials.length; i++) {
            if (!(ctx.trials[i][ctx.participantIndex] === participant)) {
                participant = ctx.trials[i][ctx.participantIndex];
                options.push(participant);
            }
        }

        var select = d3.select("#participantSel")
        select.selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .text(function(d) { return d; });

        setParticipant(options[0]);

    }).catch(function(error) { console.log(error) });
};

function onchangeParticipant() {
    selectValue = d3.select('#participantSel').property('value');
    setParticipant(selectValue);
};

function onchangeBlock() {
    selectValue = d3.select('#blockSel').property('value');
    setBlock(selectValue);
};

function onchangeTrial() {
    selectValue = d3.select("#trialSel").property('value');
    setTrial(selectValue);
};