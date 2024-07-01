
// set strict mode
"use strict";


function drawTriangle(doc, tri, color = "#FF33FF", lineColor = "#000000", width = 4, front = true) {
    console.log("drawTriangle", tri);
    let pts = tri.getPoints();
    doc
        .polygon(...pts)
        .lineWidth(width);
    if (color) {
        doc.fillAndStroke(color, lineColor);
    }
    else {
        doc.stroke(lineColor);
    }

    if (!showLabels)
        return;
    let lab = tri.label;
    if (!lab)
        return;
    let mpt = tri.getMidPoint();
    //console.log("mpt", mpt);
    let [x, y] = mpt;
    //console.log("x,y", x, y);
    if (!(typeof (x) == "number" && typeof (y) == "number")) {
        console.log("*** Invalid x,y", x, y);
        return;
    }
    if (x < 0 || x > 800 || y < 0 || y > 800)
        return;
    doc.fillColor("black");
    let w2 = doc.widthOfString(lab) / 2.0;
    let h2 = doc.heightOfString(lab) / 2;
    if (front) {
        doc.text(lab, x - w2, y - h2);
    }
    else { // back of sheet
        doc.save();
        doc.fillColor("blue");
        doc.moveTo(x, y);
        doc.scale(-1, 1, { origin: [x, y] });
        doc.text(lab, x - w2, y - h2);
        doc.restore();
    }
}

function drawDot(doc, pt, color = "#993300") {
    //doc.save()
    doc.circle(pt[0], pt[1], 2)
        .fill(color);
}

function drawDotPoints(doc) {
    for (let pt of dotPoints) {
        drawDot(doc, pt);
        let x = pt[0];
        let y = pt[1];
        if (x < 100 || x > 500 || y < 100 || y > 400)
            continue;
        let label = pt.label;
        //label = 'bb';
        if (label)
            doc.text(label, pt[0], pt[1])
    }
}

function pdfdraw(groups = null) {
    console.log("pdfdraw", groups);
    if (!groups) {
        alert("depicate empty groups to pdfdraw");
        groups = new Group([triangles]);
    }
    console.log('Starting...');
    console.log("size", size);
    doc = new PDFDocument({ size });
    let stream = doc.pipe(blobStream());
    stream.on("finish", () => handleFinish(stream));
    //
    // draw front side
    //
    doc.text('front ' + size, 50, 10);
    // draw a triangle
    let front = true;
    for (let group of groups) {
        let triangles = group.getTriangles();
        for (let tri of triangles) {
            let color = tri.frontColor;
            if (tri.dz < 0)
                color = tri.backColor;
            drawTriangle(doc, tri, color, "black", 1, front);
            drawTriangle(doc, tri, null, "#AAAAFF", 5, front);
            drawTriangle(doc, tri, null, "black", 1, front);
        }
    }

    if (showLattice) {
        drawDotPoints(doc);
    }

    //
    // draw back side
    //
    doc.addPage();
    doc.text('back ' + size, 50, 10);
    // draw a triangle
    doc.scale(-1, 1).translate(-doc.page.width, 0);
    front = false;
    //doc.text('funky text', 300, 150);
    for (let group of groups) {
        let triangles = group.getTriangles();
        for (let tri of triangles) {
            let color = tri.backColor;
            if (tri.dz < 0)
                color = tri.frontColor;
            drawTriangle(doc, tri, color, "black", 1, front);
            drawTriangle(doc, tri, null, "#AAAAFF", 5, front);
            drawTriangle(doc, tri, null, "black", 1, front);
        }
    }
    if (showLattice) {
        drawDotPoints(doc);
    }
    doc.end();
    console.log('Done!');
}

function drawDots(size = "LETTER") {
    console.log('Starting...');
    doc = new PDFDocument({ size });
    let stream = doc.pipe(blobStream());
    stream.on("finish", () => handleFinish(stream));
    //
    // draw front side
    //
    doc.text('Hello Dots!', 50, 50);
    // draw a triangle
    for (let pt of dotPoints) {
        drawDot(doc, pt);
    }
    //
    // draw back side
    //
    doc.addPage();
    doc.text('Hello back dots', 50, 50);
    doc.scale(-1, 1).translate(-doc.page.width, 0);
    for (let pt of dotPoints) {
        drawDot(doc, pt);
    }
    doc.save();
    doc.end();
    console.log('Done!');
}

function handleFinish(stream) {
    console.log("*****finishing");

    blob = stream.toBlob("application/pdf");

    // or get a blob URL for display in the browser
    const url = stream.toBlobURL("application/pdf");
    const iframe = document.querySelector("iframe");
    iframe.src = url;
}

//const download_a = document.createElement("a");
//document.body.appendChild(download_a);
//download_a.style = "display: none";

function download(name = "flexaTemplate.pdf") {
    console.log("Downloading...");
    const download_a = document.createElement("a");
    document.body.appendChild(download_a);
    download_a.style = "display: none";

    if (!blob) {
        alert("No PDF to download");
        return;
    }
    var url = window.URL.createObjectURL(blob);
    let a = download_a;
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}

class PDFViewer {
    constructor() {
    }

    draw(sheet) {
        console.log("PDFViewer draw sheet:", sheet);
        pdfdraw(sheet.groups);
    }
}
