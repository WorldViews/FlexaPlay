
// use strict mode
"use strict";

let doc = null;
let size = "LETTER";
let blob = null;

let showLattice = false;
let showLabels = true;
let gridType = "NOGRID";

let showTriGrid = false;
let showHexGrid = false;

let svgViewer = null;
let pdfViewer = null;

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
//x0 = 0;
//y0 = 0;
let e1 = [s, 0];
let e2 = [s * Math.cos(a), s * Math.sin(a)];

function getPointXY(i, j) {
    let x = x0 + j * e1[0] + i * e2[0];
    let y = y0 + j * e1[1] + i * e2[1];
    let v = [x, y];
    v.label = `${i},${j}`;
    return v;
}

function getPointIJ(x, y) {
    x = x - x0;
    y = y - y0;
    let D = e1[0]*e2[1] - e2[0]*e1[1];
    let i = (-e1[1]*y + e1[0]*y) / D;
    let j = ( e2[1]*x - e2[0]*y) / D;
    return [i, j];
}

function testTransform() {
    let dmax = 0;
    for (let i = - 10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
            let pt = getPointXY(i, j);
            let [i1, j1] = getPointIJ(pt[0], pt[1]);
            let d2 =(i - i1)*(i - i1) + (j - j1)*(j - j1);
            console.log("i,j", i, j, "i1,j1", i1, j1, "d2:", d2);
            if (d2 > dmax)
                dmax = d2;
        }
    }
    console.log("dmax", dmax);
}

function getPoints(rows, cols, i0 = 0, j0 = 0) {
    let pts = [];
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            pts.push(getPointXY(i0+i, j0+j));
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
        this.frontColor = opts.frontColor;
        this.backColor = opts.backColor;
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
        let frontColor = "#FFBBBB";
        let backColor = "#DDDDFF";
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
            //console.log("xy", xy);
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
        //console.log("xy", xy);
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
let dotPoints = getPoints(30, 30, -10, -10);

function drawTriGrid() {
    gridType = "TRIGRID";
    draw();
}

function drawHexGrid() {
    gridType = "HEXGRID";
    draw();
}

function draw() {
    console.log("Drawing...");
    if (pdfViewer) {
        pdfViewer.draw();
    }
    if (svgViewer) {
        svgViewer.draw();
    }
}

function showFaceSelection(name) {
    console.log("face name:", name);
    $("#faceInfo").text(name);
}

function showMouseInfo(evt) {
    if (svgViewer)
        svgViewer.showMouseInfo(evt);
}


function init() {
    console.log("Initializing...");
    $("#paperSize").change(function () {
        size = $(this).val();
        console.log("size", size);
        draw();
    });

    $("#gridType").change(function () {
        gridType = $(this).val();
        console.log("gridType", gridType);
        draw();
    });

    $("#showLabels").change(function () {
        showLabels = $(this).prop("checked");
        console.log("showLabels", showLabels);
        draw();
    });

    $("#showLattice").change(function () {
        showLattice = $(this).prop("checked");
        console.log("showLattice", showLattice);
        draw();
    });

    $("#defstr").change(function () {
        let str = $(this).val();
        console.log("str", str);
        triangles = getTriangleStrip(str);
        draw();
    });
}

