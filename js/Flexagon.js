
// use strict mode
"use strict";

let doc = null;
//let size = "LEGAL";
const LEGAL = "LEGAL";
const LETTER = "LETTER";
const TABLOID = "TABLOID";

let size = LETTER;
let blob = null;

let showLattice = false;
let showLabels = false;
let gridType = "NOGRID";

let showTriGrid = false;
let showHexGrid = false;

let svgViewer = null;
let pdfViewer = null;
let threeJSViewer = null;

const A60 = Math.PI / 3;
const A120 = 2 * Math.PI / 3;

//let s = 60;   // triangle side length
let side_length = 60;

let x0 = 80;
let y0 = 100;
x0 = 260;
y0 = 200;

const E1 = [side_length, 0];
const E2 = [side_length * Math.cos(A60), side_length * Math.sin(A60)];

class App {
    constructor() {
        this.init();
    }

    init() {
        console.log("App init");
    }

    getPointXY(i, j) {
        let x = x0 + j * E1[0] + i * E2[0];
        let y = y0 + j * E1[1] + i * E2[1];
        let v = [x, y];
        v.label = `${i},${j}`;
        return v;
    }

    getPointIJ(x, y) {
        x = x - x0;
        y = y - y0;
        let D = E1[0] * E2[1] - E2[0] * E1[1];
        let i = (-E1[1] * y + E1[0] * y) / D;
        let j = (E2[1] * x - E2[0] * y) / D;
        i = Math.round(i);
        j = Math.round(j);
        return [i, j];
    }

    getTrianglesAt(i, j) {
        let names = [];
        for (let name in triMap) {
            let tri = triMap[name];
            if (tri.ij[0] == i && tri.ij[1] == j) {
                names.push(name);
            }
        }
        return names;
    }

}


function testTransform() {
    let dmax = 0;
    for (let i = - 10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
            let pt = app.getPointXY(i, j);
            let [i1, j1] = app.getPointIJ(pt[0], pt[1]);
            let d2 = (i - i1) * (i - i1) + (j - j1) * (j - j1);
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
            pts.push(app.getPointXY(i0 + i, j0 + j));
        }
    }
    return pts;
}

class Triangle {
    constructor(points, opts = {}) {
        this.points = points;
        this.frontColor = opts.frontColor;
        this.backColor = opts.backColor;
        this.label = opts.label;
        this.name = opts.name;
        this.dir = opts.dir;
        this.ij = opts.ij;
        this.dz = opts.dz;
    }

    // Return the mid point of a triangle
    getMidPoint() {
        let pts = this.points;
        let x = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
        let y = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
        return [x, y];
    }

    getPoints() {
        return this.points;
    }
}

class Group {
    constructor(triangles = null) {
        triangles = triangles || [];
        this.triangles = triangles;
    }

    getTriangles() {
        return this.triangles;
    }
}

class Sheet {
    constructor() {
        this.groups = [];
    }
}

let triMap = {};

function registerTriangles(sheet) {
    triMap = {};
    for (let group of sheet.groups) {
        for (let tri of group.triangles) {
            if (tri.name) {
                triMap[tri.name] = tri;
            }
        }
    }
}

function getTriangle(points, opts) {
    let tri = new Triangle(points, opts);
    if (opts.name) {
        triMap[opts.name] = tri;
    }
    return tri;
}

// find point distance r from p0 in direction h
function getPt(p0, r, h) {
    return [p0.x + r * Math.cos(h), p0.y + r * Math.sin(h)]
}

// return a group containing a strip of triangles The strip is
// not necessarily straight, but it is a chain of connected triangles
function getTriangleStrip(nav = "RRRLR", ij0 = [0, 0]) {
    let tris = [];
    let r = side_length;
    let h = 0;
    let x0 = 100;
    let y0 = 100;
    x0 = 200;
    y0 = 200;
    let pt = app.getPointXY(ij0[0], ij0[1]);
    x0 = pt[0];
    y0 = pt[1];
    let [i, j] = ij0;
    //let p0 = { x: x0, y: y0 };
    let x = x0;
    let y = y0;
    nav = nav.toUpperCase();
    let xy = null;
    let tri = null;
    let triNum = 0;
    let dir = 0;
    let dz = 1;
    for (let k = 0; k < nav.length; k++) {
        let c = nav[k];
        let h1 = h;
        let h2 = h + A120;
        let h3 = h - A120;
        let p0 = { x, y };
        let frontColor = "#FFBBBB";
        let backColor = "#DDDDFF";
        let name = `T${triNum}`;
        let label = `T${i},${j}`;
        if (c == "S") {
            triNum++;
            tri = getTriangle([getPt(p0, r, h1), getPt(p0, r, h2), getPt(p0, r, h3)],
                { ij: [i, j], dir, frontColor, backColor, dz, label, name });
            tris.push(tri);
            continue;
        }
        if (c == "R") {
            h += A60;
            dir += 1;
        }
        else if (c == "L") {
            h -= A60;
            dir -= 1;
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
            // not tested
            let ij = app.getPointIJ(x, y);
            tri.ij = ij;
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
        let ij = app.getPointIJ(x, y);
        ij = ij.map(Math.round);
        label = `T${ij[0]},${ij[1]}`;
        triNum++;
        tri = getTriangle([getPt(p0, r, h1), getPt(p0, r, h2), getPt(p0, r, h3)],
            { frontColor, backColor, dz, dir, ij, label, name });
        tris.push(tri);
    }
    let group = new Group(tris);
    return group;
}

// Return a group of triangles providing a template for a
// a tryhexa flexagon
function getTriHexagonTemplate(ij = [0, 0]) {
    let group = getTriangleStrip("SRRLRLRLRL", ij);
    let tris = group.triangles;
    //let colors = ["#CCCCCC", "#33FF33", "yellow", "blue" ]
    let colors = ["#CCCCCC", "#FFBBBB", "#BBBBFF", "#BBFFBB"];
    let c1 = 1;
    let c2 = 2;
    let c3 = 3;
    let facesBack = [c1, c2, c2, c3, c3, c1, c1, c2, c2, c3];
    let facesFront = [0, c3, c1, c1, c2, c2, c3, c3, c1, 0];
    for (let i = 0; i < tris.length; i++) {
        tris[i].frontColor = colors[facesFront[i]];
        tris[i].backColor = colors[facesBack[i]];
    }
    return group;
}

function getTriangleArray(rows, cols, singleColor) {
    let x0 = 40;
    let y0 = 40;
    let dy = 60;
    //let dx = 2*Math.cos(Math.PI / 3) * dy;
    let dx = dy * Math.sqrt(3) / 2;
    let sheet = new Sheet();
    let tris = [];
    //let colors = ["#FF3300", "#0033FF", "#33FF33"];
    let colors = ["#FFAAAA", "#AAAAFF", "#AAFFAA"];

    for (let k = 0; k < rows; k++) {
        for (let j = 0; j < cols; j++) {
            let label = `${k},${j}`;
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
                let tri = getTriangle([[x1, y1], [x2, y2], [x3, y3]],
                    { frontColor: color, backColor: color, label });
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
                let tri = getTriangle([[x1, y1], [x2, y2], [x3, y3]],
                    { frontColor: color, backColor: color, label });
                tris.push(tri);
            }
        }
    }
    let group = new Group(tris);
    sheet.groups.push(group);
    return sheet;
}

let app = new App();

// let triangles = getTriangleArray(14, 5, "white");
let sheet = new Sheet();

let triangles = getTriangleStrip("RRLRLRLR");
triangles = getTriangleStrip("RRLLRLRURLRRLR");

sheet.groups.push(getTriHexagonTemplate());
sheet.groups.push(getTriHexagonTemplate([0, 2]));
sheet.groups.push(getTriHexagonTemplate([0, 4]));

//sheet = getTriangleArray(23, 10, "white");

let dotPoints = getPoints(30, 30, -10, -10);

let SHEETS = {
    "starter": "S",
    'test1': "RRLRLRLR",
    'test2': "RRLLRLRURLRRLR",
    'trihexaflexagon': "SLRURLRURLRU",
    'trihex strip': {
        type: 'sheet',
        groups: [getTriHexagonTemplate([-2, 0])]
    },
    '3 trihex strips': {
        type: 'sheet',
        groups: [
            getTriHexagonTemplate(),
            getTriHexagonTemplate([0, 2]),
            getTriHexagonTemplate([0, 4])]
    },
}

function drawTriGrid() {
    gridType = "TRIGRID";
    draw();
}

function drawHexGrid() {
    gridType = "HEXGRID";
    draw();
}

function setSheet(sheetDef) {
    console.log("setSheet", sheetDef);
    if (typeof sheetDef == 'string') {
        $("#defstr").val(sheetDef);
        triangles = getTriangleStrip(sheetDef);
        sheet.groups = [triangles];
    }
    else if (sheetDef.type == 'sheet') {
        sheet = sheetDef;
    }
    registerTriangles(sheet);
    draw();
}

function draw() {
    console.log("Drawing...");
    if (pdfViewer) {
        console.log("call pdfViewer sheet", sheet);
        pdfViewer.draw(sheet);
    }
    if (svgViewer) {
        console.log("call svgViewer sheet", sheet);
        svgViewer.draw(sheet);
    }
    if (threeJSViewer) {
        console.log("call threeJSViewer sheet", sheet);
        threeJSViewer.draw(sheet);
    }
}

function showFaceSelection(name) {
    console.log("face name:", name);
    let tri = triMap[name];
    let str = name;
    if (tri) {
        console.log("tri", tri);
        str = `name: ${name} ${tri.label} ij: ${tri.ij} dz: ${tri.dz} dir: ${tri.dir}  \n`;
    }
    $("#faceInfo").text(str);
    log(str);
}

function showMouseInfo(evt) {
    if (svgViewer)
        svgViewer.showMouseInfo(evt);
}

function log(str) {
    console.log(str);
    let logdiv = $("#logdiv");
    logdiv.append(str + "<br>\n");
    $("#logdiv").animate({ scrollTop: $(document).height() }, "slow");
}

function init() {
    console.log("Initializing...");
    jqinit();
}

function jqinit() {
    $("#paperSize").val(size);
    $("#gridType").val(gridType);
    $("#showLabels").prop("checked", showLabels);
    $("#showLattice").prop("checked", showLattice);

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

    $("#showLog").change(function () {
        let showLog = $(this).prop("checked");
        console.log("showLog", showLog);
        if (showLog)
            $("#logdiv").show();
        else
            $("#logdiv").hide();
    });

    $("#defstr").change(function () {
        let str = $(this).val();
        console.log("str", str);
        triangles = getTriangleStrip(str);
        sheet.groups = [triangles];
        draw();
    });

    // for each sheet in SHEETS, add an option to the select element
    let sel = $("#sheet");
    for (let key in SHEETS) {
        let opt = $("<option>").attr("value", key).text(key);
        sel.append(opt);
    }
    // when the select element changes, get the value and set the defstr value
    // to the corresponding value in SHEETS
    sel.change(function () {
        let key = $(this).val();
        let sheetDef = SHEETS[key];
        console.log("sheetDef", sheetDef);
        setSheet(sheetDef);
    });
}

