
// use strict mode
"use strict";

let doc = null;
let size = "LETTER";
let blob = null;
//let blobStream = null;

let tri0 = {
    color: "#FF3300",
    points: [[0, 200], [60, 250], [60, 150]]
}

let tri1 = {
    color: "#0033FF",
    points: [[110, 200], [200, 250], [200, 150]]
}

let tri2 = {
    color: "#33FF33",
    points: [[600, 400], [800, 400], [700, 300]]
}

let triangles0 = [tri0, tri1, tri2];

function getMidPoint(tri) {
    let pts = tri.points;
    let x = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
    let y = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    return [x, y];
}

let a = Math.PI / 3;
let s = 60;
let x0 = 100;
let y0 = 100;
let e1 = [s, 0];
let e2 = [s * Math.cos(a), s * Math.sin(a)];

function getPoint(i, j) {
    let x = x0 + j * e1[0] + i * e2[0];
    let y = y0 + j * e1[1] + i * e2[1]
    return [x, y];
}

function getPoints(rows, cols) {
    let pts = [];
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            pts.push(getPoint(i, j));
        }
    }
    return pts;
}

function getMidPoint(tri) {
    let pts = tri.points;
    let x = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
    let y = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    return [x, y];
}

class Triangle {
    constructor(points, opts = {}) {
        this.points = points;
        this.frontColor = opts.backColor;
        this.label = opts.label;
        this.dz = opts.dz;
    }

    getPoints() {
        return this.points;
    }
}

function getTriangle(points, opts) {
    return new Triangle(points, opts);
}

// find point distance r from p0 in direction h
function getPt(p0, r, h) {
    return [p0.x + r * Math.cos(h), p0.y + r * Math.sin(h)]
}

const A120 = 2 * Math.PI / 3.0;
const A60 = Math.PI / 3.0;

function getTriangleStrip(nav = "RRRLR") {
    let tris = [];
    let r = 60;
    let h = 0;
    let x0 = 100;
    let y0 = 100;
    let p0 = { x: x0, y: y0 };
    let x = x0;
    let y = y0;
    nav = nav.toUpperCase();
    let xy = null;
    let tri = null;
    let triNum = 0;
    let dz = 1;
    for (let i = 0; i < nav.length; i++) {
        let c = nav[i];
        let h1 = h;
        let h2 = h + A120;
        let h3 = h - A120;
        p0 = { x, y };
        let frontColor = "#FFAAAA";
        let backColor = "#AAAAFF";
        if (c == "S") {
            triNum++;
            tri = getTriangle([getPt(p0, r, h1), getPt(p0, r, h2), getPt(p0, r, h3)],
            { frontColor, backColor, dz, label: `T${triNum}` });
            tris.push(tri);
            continue;
        }
        if (c == "R") {
            h += A60;
        }
        else if (c == "L") {
            h -= A60;
        }
        else if (c == "U") {
            if (tri == null) {
                alert("U must follow a triangle");
                return;
            }
            dz *= -1;
            h += Math.PI;
            console.log("xy", xy);
            h1 = h;
            h2 = h + A120;
            h3 = h - A120;
            xy = getPt(p0, r, h);
            x = xy[0];
            y = xy[1];
            p0 = { x, y };
            tri.points = [getPt(p0, r, h1), getPt(p0, r, h2), getPt(p0, r, h3)];
            tri.dz = dz;
            continue;
        }
        else {
            alert("Invalid character in nav string " + c);
            return;
        }
        xy = getPt(p0, r, h);
        console.log("xy", xy);
        h1 = h;
        h2 = h + A120;
        h3 = h - A120;
        x = xy[0];
        y = xy[1];
        p0 = { x, y };
        triNum++;
        tri = getTriangle([getPt(p0, r, h1), getPt(p0, r, h2), getPt(p0, r, h3)],
                            { frontColor, backColor, dz, label: `T${triNum}` });
        tris.push(tri);
    }
    return tris;
}

function getTriangleArray(rows, cols, singleColor) {
    let x0 = 70;
    let y0 = 100;
    let dy = 100;
    //let dx = 2*Math.cos(Math.PI / 3) * dy;
    let dx = dy * Math.sqrt(3) / 2;
    let tris = [];
    let colors = ["#FF3300", "#0033FF", "#33FF33"];

    for (let k = 0; k < rows; k++) {
        for (let j = 0; j < cols; j++) {
            if ((k + j) % 2 == 0) {
                let i = k / 2;
                let y1 = y0 + i * dy;
                let x1 = x0 + j * dx;
                let y2 = y1 + dy / 2;
                let x2 = x1 + dx;
                let y3 = y1 + dy;
                let x3 = x1;
                let color = colors[(i + j) % 3];
                if (singleColor)
                    color = singleColor;
                let tri = getTriangle([[x1, y1], [x2, y2], [x3, y3]], { color, label: `${k},${j}` });
                tris.push(tri);
            }
            else {
                let i = (k - 1) / 2;
                let y1 = y0 + i * dy + dy / 2;
                let x1 = x0 + j * dx + dx;
                let y2 = y1 + dy / 2;
                let x2 = x1 - dx;
                let y3 = y1 + dy;
                let x3 = x1;
                let color = colors[(i + j) % 3];
                if (singleColor)
                    color = singleColor;
                let tri = getTriangle([[x1, y1], [x2, y2], [x3, y3]], { color, label: `${k},${j}` });
                tris.push(tri);
            }
        }
    }
    return tris;
}

//let triangles = genTriangles(10, 4);
//let triangles = getTriangles(10, 4, "white");
// let triangles = getTriangleArray(14, 5, "white");
let triangles = getTriangleStrip("RRLRLRLR");
triangles = getTriangleStrip("RRLLRLRURLRRLR");
//let dotPoints = [[100,100], [200, 100], [100, 200]]
let dotPoints = getPoints(8, 3);
let showLabels = true;

function drawTriangle(doc, tri, color = "#FF3300", lineColor = "#000000", width = 4, front = true) {
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
    let mpt = getMidPoint(tri);
    console.log("mpt", mpt);
    let [x, y] = mpt;
    console.log("x,y", x, y);
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
    doc.circle(pt[0], pt[1], 3)
        .fill(color);
}


function draw() {
    console.log('Starting...');
    console.log("size", size);
    doc = new PDFDocument({ size });
    let stream = doc.pipe(blobStream());
    stream.on("finish", () => handleFinish(stream));
    //
    // draw front side
    //
    doc.text('Front ' + size, 50, 20);
    // draw a triangle
    let front = true;
    for (let tri of triangles) {
        let color = tri.frontColor;
        if (tri.dz < 0)
            color = tri.backColor;
        drawTriangle(doc, tri, color, "black", 1, front);
        drawTriangle(doc, tri, null, "#AAAAFF", 5, front);
        drawTriangle(doc, tri, null, "black", 1, front);
    }
    //
    // draw back side
    //
    doc.addPage();
    doc.text('back ' + size, 50, 20);
    // draw a triangle
    doc.scale(-1, 1).translate(-doc.page.width, 0);
    front = false;
    //doc.text('funky text', 300, 150);
    for (let tri of triangles) {
        let color = tri.backColor;
        if (tri.dz < 0)
            color = tri.frontColor;
        drawTriangle(doc, tri, color, "black", 1, front);
        drawTriangle(doc, tri, null, "#AAAAFF", 5, front);
        drawTriangle(doc, tri, null, "black", 1, front);
    }
    doc.save();
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

function init() {
    console.log("Initializing...");
    $("#paperSize").change(function () {
        size = $(this).val();
        console.log("size", size);
        draw();
    });

    $("#showLabels").change(function () {
        showLabels = $(this).prop("checked");
        console.log("showLabels", showLabels);
        draw();
    });

    $("#defstr").change(function () {
        let str = $(this).val();
        console.log("str", str);
        triangles = getTriangleStrip(str);
        draw();
    });
}

