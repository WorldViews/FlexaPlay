
"use strict"

const SVGNS = "http://www.w3.org/2000/svg";

class SVGViewer {

    constructor(name = "svgcanv") {
        this.svgcanv = document.getElementById("svgcanv");
        //this.create();
        this.xx = 100;
    }

    screenToSVG(screenX, screenY) {
        let svg = this.svgcanv;
        var p = svg.createSVGPoint()
        p.x = screenX
        p.y = screenY
        return p.matrixTransform(svg.getScreenCTM().inverse());
    }

    SVGToScreen(svgX, svgY) {
        let svg = this.svgcanv;
        var p = svg.createSVGPoint()
        p.x = svgX
        p.y = svgY
        return p.matrixTransform(svg.getScreenCTM());
    }

    test0() {
        var pt = screenToSVG(20, 30);
        console.log("screenToSVG: ", pt);

        var pt = SVGToScreen(pt.x, pt.y);
        console.log("SVGToScreen: ", pt);
    }

    showMouseInfo(evt) {
        let x = evt.clientX;
        let y = evt.clientY;
        let p = this.screenToSVG(x, y);
        let [i, j] = app.getPointIJ(p.x, p.y);
        i = i.toFixed(2);
        j = j.toFixed(2);
        i = Math.round(i);
        j = Math.round(j);
        let text = document.getElementById("mouseInfo");
        let tris = app.getTrianglesAt(i, j);
        let trisStr = ""+tris;
        text.textContent = x + "," + y + "   " + i + "," + j +"  " + trisStr;
    }

    clear() {
        while (this.svgcanv.firstChild) {
            this.svgcanv.removeChild(this.svgcanv.firstChild);
        }
    }

 //   draw(groups = null) {
    draw(sheet) {
        console.log("SVGViewer draw sheet:", sheet);
        let groups = sheet.groups;
        this.clear();
        if (!groups) {
            alert("depicate empty groups to svgdraw");
            groups = new Group([triangles]);
        }
        this.clear();
        for (let group of groups) {
            this.drawGroup(group);
        }
        if (showLattice)
            this.addLattice();
        if (showLabels)
            this.addLabels(groups)
        if (gridType == "TRIGRID") {
            this.addTriGrid();
        }
        if (gridType == "SMALLTRIGRID") {
            this.addSmallTriGrid();
        }
        if (gridType == "BIGTRIGRID") {
            this.addBigTriGrid();
        }
        if (gridType == "HEXGRID") {
            this.addHexGrid();
        }
    }

    drawGroup(group) {
        this.addTriangles(group.getTriangles());
    }

    addLattice() {
        let points = dotPoints;
        for (let pt of points) {
            this.addDot(pt);
            this.addLabel(pt, pt.label);
        }
    }

    addHexGrid() {
        let fillFace = false;
        let getPointXY = app.getPointXY;
        for (let i = -10; i <= 20; i += 1) {
            for (let jj = -10; jj <= 20; jj += 3) {
                let j = jj + (i % 3);
                let p0 = getPointXY(i, j);
                let p1 = getPointXY(i + 1, j);
                let p2 = getPointXY(i, j + 1);
                let p3 = getPointXY(i - 1, j + 1);
                let p4 = getPointXY(i - 1, j);
                let p5 = getPointXY(i, j - 1);
                let p6 = getPointXY(i + 1, j - 1);
                let pts = [p1, p2, p3, p4, p5, p6];
                let fill = "none";
                if (fillFace) {
                    fill = ["#FFAAAA", "#AAFFAA", "#AAAAFF"][(i + 3000) % 3];
                }
                this.addPoly(pts, `H${i}_${j}`, fill);
                this.addDot(p0, 3, "red");
            }
        }
    }

    addTriGrid() {
        let j;
        let getPointXY = app.getPointXY;
        for (let i = -5; i <= 5; i += 1) {
            for (let jj = -10; jj <= 20; jj += 3) {
                // get center of triangle
                j = jj + (i % 3);
                let p0 = getPointXY(i, j);
                let p1 = getPointXY(i, j - 1);
                let p2 = getPointXY(i - 1, j + 1);
                let p3 = getPointXY(i + 1, j);
                let p4 = getPointXY(i, j + 2);
                this.addDot(p0, 3, "green");
                this.addEdge(p1, p2);
                this.addEdge(p1, p3);
                this.addEdge(p2, p3);
                this.addEdge(p2, p4);
                this.addEdge(p3, p4);
            }
        }
    }

    addSmallTriGrid() {
        let getPointXY = app.getPointXY;
        for (let i = -10; i <= 20; i++) {
            for (let j = -10; j <= 20; j++) {
                let p0 = getPointXY(i, j);
                let p1 = getPointXY(i + 1, j);
                let p2 = getPointXY(i, j + 1);
                this.addEdge(p0, p1);
                this.addEdge(p0, p2);
                this.addEdge(p1, p2);
            }
        }
    }

    addBigTriGrid() {
        let getPointXY = app.getPointXY;
        for (let i = -10; i <= 20; i += 2) {
            for (let j = -10; j <= 20; j += 2) {
                let p0 = getPointXY(i, j);
                let p1 = getPointXY(i + 2, j);
                let p2 = getPointXY(i, j + 2);
                this.addEdge(p0, p1);
                this.addEdge(p0, p2);
                this.addEdge(p1, p2);
            }
        }
    }

    addTriangles(tris) {
        tris = tris || triangles;
        for (let tri of tris) {
            let color = tri.frontColor;
            if (tri.dz < 0) {
                color = tri.backColor;
            }
            this.addPoly(tri.points, tri.name, color);
        }
    }

    addLabels(groups) {
        for (let group of groups) {
            let tris = group.triangles;
            for (let tri of tris) {
                let pts = tri.points;
                let label = tri.label;
                let x = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
                let y = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
                this.addLabel([x, y], label);
            }
        }
    }

    addLabel(pt, label) {
        let [x, y] = pt;
        let text = document.createElementNS(SVGNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("fill", "black");
        text.setAttribute("text-anchor", "middle");
        //text.setAttribute("alignment-baseline", "central");
        text.textContent = label;
        //text.textAnchor = "middle";
        this.svgcanv.appendChild(text);
    }

    addDot(pt, r = 2, color = "red") {
        let [x, y] = pt;
        let dot = document.createElementNS(SVGNS, "circle");
        dot.setAttribute("fill", color);
        dot.setAttribute("stroke", color);
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", r);
        this.svgcanv.appendChild(dot);
    }

    addEdge(p1, p2, name, color = "brown") {
        //this.addPoly([p1, p2], name, color);
        // targeting the svg itself
        //console.log("addEdge", p1, p2, name, color);
        //console.log("name", name)
        // make a simple rectangle
        let line = document.createElementNS(SVGNS, "line");
        line.setAttribute("stroke", color);
        line.setAttribute("x1", p1[0]);
        line.setAttribute("y1", p1[1]);
        line.setAttribute("x2", p2[0]);
        line.setAttribute("y2", p2[1]);
        this.svgcanv.appendChild(line);
    }

    addPoly(points, name, color = "pink") {
        // targeting the svg itself
        //console.log("addPoly", points, name);
        if (!name) {
            name = "B" + points[0][0];
        }
        //console.log("name", name)
        let svgcanv = this.svgcanv;
        // make a simple rectangle
        let poly = document.createElementNS(SVGNS, "polygon");
        poly.setAttribute("fill", color);
        poly.setAttribute("stroke", "black");

        //
        let pointsStr = "";
        for (let i = 0; i < points.length; i++) {
            pointsStr += points[i][0] + "," + points[i][1] + " ";
        }
        poly.setAttribute("points", pointsStr);
        // append the new rectangle to the svg
        //let text2 = document.getElementById("text2");
        svgcanv.appendChild(poly);
        //text2.textContent = name;
        poly.addEventListener('click', function (event) {
            //if (!event.target.matches('.click-me')) return;
            console.log("click name:", name);
            console.log("target:", event.target);
            showFaceSelection(name);
            //text2.textContent = name;
        }, false);
    }

    create(name = "svgcanv") {
        this.svg = document.createElementNS(SVGNS, "svg");
        let svg = this.svg;
        svg.setAttribute("id", name);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("baseProfile", "full");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }

    download(name = "flexaTemplate.svg") {
        console.log("Downloading...");
        const download_a = document.createElement("a");
        document.body.appendChild(download_a);
        download_a.style = "display: none";
    
        let blob = new Blob([this.svgcanv.outerHTML], { type: "image/svg+xml" });
        if (!blob) {
            alert("No SVG to download");
            return;
        }
        var url = window.URL.createObjectURL(blob);
        let a = download_a;
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}