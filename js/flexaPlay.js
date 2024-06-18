
let doc = null;
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

let a = Math.PI / 3;
let s = 60;
let x0 = 100;
let y0 = 100;
let e1 = [s, 0];
let e2 = [s*Math.cos(a), s*Math.sin(a)];

function getPoint(i,j) {
    let x = x0 + j*e1[0] + i*e2[0];
    let y = y0 + j*e1[1] + i*e2[1]
    return [x, y];
}

function getPoints(rows, cols) {
    let pts = [];
    for (var i=0; i< rows; i++) {
        for (var j=0; j<cols; j++) {
            pts.push(getPoint(i,j));
        }
    }
    return pts;
}


getTriangles = (rows, cols, singleColor) => {
    let x0 = 70;
    let y0 = 100;
    let dy = 100;
    //let dx = 2*Math.cos(Math.PI / 3) * dy;
    let dx = dy * Math.sqrt(3) / 2;
    let tris = [];
    let colors = ["#FF3300", "#0033FF", "#33FF33"];

    for (let k = 0; k < rows; k++) {
        for (let j = 0; j < cols; j++) {
            if ((k+j) % 2 == 0) {
                let i = k/2;
                let y1 = y0 + i * dy;
                let x1 = x0 + j * dx;
                let y2 = y1 + dy / 2;
                let x2 = x1 + dx;
                let y3 = y1 + dy;
                let x3 = x1;
                let color = colors[(i + j) % 3];
                if (singleColor)
                    color = singleColor;
                let tri = {
                    color,
                    points: [[x1, y1], [x2, y2], [x3, y3]]
                };
                tris.push(tri);
            }
            else {
                let i = (k-1)/2;
                let y1 = y0 + i * dy + dy/2;
                let x1 = x0 + j * dx + dx;
                let y2 = y1 + dy / 2;
                let x2 = x1 - dx;
                let y3 = y1 + dy;
                let x3 = x1;
                let color = colors[(i + j) % 3];
                if (singleColor)
                    color = singleColor;
                let tri = {
                    color,
                    points: [[x1, y1], [x2, y2], [x3, y3]]
                };
                tris.push(tri);
           }
        }
    }
    return tris;
}

//let triangles = genTriangles(10, 4);
let triangles = getTriangles(20, 7, "white");
//let dotPoints = [[100,100], [200, 100], [100, 200]]
let dotPoints = getPoints(8, 3);

function drawTriangle(doc, tri, color = "#FF3300", lineColor="#000000", width = 4) {
    let pts = tri.points;
    color = tri.color;
    doc
    /*
        .moveTo(pts[0][0], pts[0][1])
        .lineTo(pts[1][0], pts[1][1])
        .lineTo(pts[2][0], pts[2][1])
        .lineTo(pts[0][0], pts[0][1])
    */
        .polygon(...pts)
        .lineWidth(width)
        //.fill(color)
        //.fillAndStroke(color, lineColor)
        .stroke(lineColor);
}

function drawDot(doc, pt, color = "#993300") {
    //doc.save()
    doc.circle(pt[0], pt[1], 3)
        .fill(color);
}

function draw(size = "LETTER") {
    console.log('Starting...');
    doc = new PDFDocument({ size });
    stream = doc.pipe(blobStream());
    stream.on("finish", handleFinish);
    //
    // draw front side
    //
    doc.text('Hello front page!', 50, 50);
    // draw a triangle
    for (let tri of triangles) {
        drawTriangle(doc, tri, "white", "#AAAAFF", 5);
        drawTriangle(doc, tri, "white", "black", 1);
    }
    //
    // draw back side
    //
    doc.addPage();
    doc.text('Hello back page', 50, 50);
    // draw a triangle
    doc.scale(-1, 1).translate(-doc.page.width, 0);
    //doc.text('funky text', 300, 150);
    for (let tri of triangles) {
        drawTriangle(doc, tri, "white", "#AAAAFF", 5);
        drawTriangle(doc, tri, "white", "black", 1);
    }
    doc.save();
    doc.end();
    console.log('Done!');
}

function drawDots(size = "LETTER") {
    console.log('Starting...');
    doc = new PDFDocument({ size });
    stream = doc.pipe(blobStream());
    stream.on("finish", handleFinish);
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

function handleFinish() {
    console.log("finishing");

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

