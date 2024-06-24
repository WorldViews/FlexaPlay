
"use strict"

const SVGNS = "http://www.w3.org/2000/svg";

class SVGViewer {

    constructor(name = "svgcanv") {
        this.svgcanv = document.getElementById("svgcanv");
        //this.create();
        this.xx = 100;
    }

    showMouseInfo(evt) {
        let x = evt.clientX;
        let y = evt.clientY;
        let [i,j] = getPointIJ(x, y);
        i = Math.round(i);
        j = Math.round(j);
        let text = document.getElementById("mouseInfo");
        text.textContent = x + "," + y + "   " + i + "," + j;
    }

    clear() {
        while (this.svgcanv.firstChild) {
            this.svgcanv.removeChild(this.svgcanv.firstChild);
        }
    }

    draw() {
        this.clear();
        this.addTriangles();
        if (showLattice)
            this.addLattice();
        if (showLabels)
            this.addLabels()
    }

    addLattice() {
        let points = dotPoints;
        for (let pt of points) {
            this.addDot(pt);
        }
    }

    addTriangles(tris) {
        tris = tris || triangles;
        for (let tri of tris) {
            let color = tri.frontColor;
            if (tri.dz < 0) {
                color = tri.backColor;
            }
            this.addPoly(tri.points, tri.label, color);
        }
    }

    addLabels(tris) {
        tris = tris || triangles;
        for (let tri of tris) {
            let pts = tri.points;
            let label = tri.label;
            let x = (pts[0][0] + pts[1][0] + pts[2][0])/3;
            let y = (pts[0][1] + pts[1][1] + pts[2][1])/3;
            this.addLabel([x,y], label);
        }
    }
    
    addLabel(pt, label) {
        let [x,y] = pt;
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

    addDot(pt) {
        let [x,y] = pt;
        let dot = document.createElementNS(SVGNS, "circle");
        dot.setAttribute("fill", "red");
        dot.setAttribute("stroke", "black");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 2);
        this.svgcanv.appendChild(dot);
    }

    addPoly(points, name, color="pink") {
        // targeting the svg itself
        console.log("addPoly", points, name);
        if (!name) {
            name = "B" + points[0][0];
        }
        console.log("name", name)
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
}