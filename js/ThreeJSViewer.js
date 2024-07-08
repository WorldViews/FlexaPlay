

"use strict";

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let renderer, scene, camera, gui, guiData;

window.THREE = THREE;

const A90 = Math.PI / 2;

init();

//
// parametric definition of torus, with u and v
// being angle around lager and smaller cicles.
// r1 and r2 are the radii of the circles.
// u and v are in range 0 to 2*PI
function torus(u, v, r1 = 80, r2 = 20) {
    let x = (r1 + r2 * Math.cos(v)) * Math.cos(u);
    let y = (r1 + r2 * Math.cos(v)) * Math.sin(u);
    let z = r2 * Math.sin(v);
    return [x, y, z];
}

class Hexagon {
    constructor() {
        this.phi = 30 * Math.PI / 180;
        this.points = [];
        this.tris = [];
        this.dots = [];
        this.showTris = true;
        this.showDots = true;
    }

    clear() {
        console.log("clear");
        for (let tri of this.tris) {
            scene.remove(tri);
        }
        this.tris = [];
        for (let dot of this.dots) {
            scene.remove(dot);
        }
        this.dots = [];
        render();
    }

    add(scene) {
        console.log("hexagon.add", scene);
        let h = 1;
        let r = 30;
        let p0 = [0, 0, h];
        this.points = [p0];
        let phi = this.phi;
        console.log("phi:", phi);
        let rho, h2;
        for (let i = 0; i < 6; i++) {
            if (i % 2) {
                rho = r * Math.cos(phi);
                h2 = r * Math.sin(phi);
            }
            else {
                rho = r;
                h2 = 0;
            }
            let a = i * Math.PI / 3;
            let x = rho * Math.cos(a);
            let y = rho * Math.sin(a);
            let pt = [x, y, h + h2];
            this.points.push(pt);
        }
        if (this.showDots) {
            for (let pt of this.points) {
                let dot = addDot(scene, pt, 0xff0000);
                this.dots.push(dot);
            }
        }
        if (this.showTris) {
            let p0 = this.points[0];
            for (let i = 0; i < 6; i++) {
                let p1 = this.points[i + 1];
                let p2 = this.points[(i + 1) % 6 + 1];
                let c = i % 2 ? 0x00ff00 : 0xff0000;
                console.log("p0:", p0, "p1:", p1, "p2:", p2, "c:", c);
                let tri = addTriangle(scene, [p0, p1, p2], c);
                this.tris.push(tri);
            }
        }

        render();
    }

    tick() {
        console.log("Hexagon.tick");
        if (this.tris.length > 0 || this.dots.length > 0) {
            this.clear();
        }
        this.add(scene);
        render();
    }
}


class Mobius {

    constructor() {
        this.phi = 0;
        this.numSegs = 90;
        this.ntwists = 1;
        this.tris = [];
        this.dots = [];
        this.rpts1 = [];
        this.rpts2 = [];
        this.showDots = true;
        this.showTris = false;
    }

    add(scene) {
        console.log("addMobius");
        let n = this.numSegs;
        let r1 = 50;
        let r2 = 8;
        let ntwists = this.ntwists;
        this.rpts1 = [];
        this.rpts2 = [];
        let rpts1 = this.rpts1;
        let rpts2 = this.rpts2;
        console.log("****************** ntwists:", ntwists);

        //console.log("rpts1", rpts1);
        let phi = this.phi;
        //let phi = 180 * Math.PI / 180;
        for (var i = 0; i <= n; i++) {
            let t1 = i / n;
            let u1 = 2 * Math.PI * t1;
            let v1 = phi + ntwists * t1 * 2 * Math.PI;
            rpts1.push(torus(u1, v1, r1, r2));
            let t2 = (i + 1) / n;
            let u2 = 2 * Math.PI * t2;
            let v2 = v1 + A90;
            rpts2.push(torus(u2, v2, r1, r2));
        }
        //console.log("rpts1", rpts1);

        for (var i = 0; i < n; i++) {
            let p1 = rpts1[i];
            let p2 = rpts2[i];
            let p3 = rpts1[i + 1];
            let p4 = rpts2[i + 1];
            if (this.showDots) {
                let dot1 = addDot(scene, p1, 0xff0000);
                let dot2 = addDot(scene, p2, 0x00ff00);
                this.dots.push(dot1);
                this.dots.push(dot2);
            }
            if (this.showTris) {
                let tri1 = addTriangle(scene, [p1, p2, p3], 0x0000ff);
                let tri2 = addTriangle(scene, [p2, p3, p4], 0xff3333);
                this.tris.push(tri1);
                this.tris.push(tri2);
            }
        }
        render();
    }

    clear() {
        console.log("clear");
        for (let tri of this.tris) {
            scene.remove(tri);
        }
        this.tris = [];
        for (let dot of this.dots) {
            scene.remove(dot);
        }
        this.dots = [];
        render();
    }

    tick() {
        console.log("Mobius.tick");
        if (this.tris.length > 0 || this.dots.length > 0) {
            this.clear();
        }
        this.phi += 0.01;
        this.add(scene);
        render();
    }
}

class ThreeJSViewer {

    constructor() {
        console.log("ThreeJSViewer constructor");
        this.running = false;
        this.mobius = null;
        this.hexagon = null;
        guiData = {
            currentURL: 'models/svg/tiger.svg',
            numSegs: 20,
            showFaces: true,
            showDots: true,
            showSheet: false,
            twists: 1.0,
            phi: 0
        }
        this.guiData = guiData;
        this.createGUI();
    }

    createGUI() {
        console.log("createGUI");
        if (gui) gui.destroy();
        gui = new GUI();
        //let self = this;
        //let update = e => self.update(e);
        let update = this.update.bind(this);
        gui.add(guiData, 'currentURL', {
            'Tiger': 'models/svg/tiger.svg',
            'Joins and caps': 'models/svg/lineJoinsAndCaps.svg',
            'Hexagon': 'models/svg/hexagon.svg',
            'singlePointTest3': 'models/svg/singlePointTest3.svg',
            'emptyPath': 'models/svg/emptyPath.svg',

        }).name('SVG File').onChange(update);
        gui.add(guiData, 'numSegs', {
            '8': 8,
            '10': 10,
            '16': 16,
            '20': 20,
            '40': 40,
            '80': 80,
        }).name('Num Segs').onChange(update);
        gui.add(guiData, 'twists', {
            '0': 0,
            '0.5': 0.5,
            '1': 1,
            '1.5': 1.5,
            '2': 2,
            '3': 3,
        }).name('Twists').onChange(update);
        gui.add(guiData, 'phi', 0, 2 * Math.PI).name('phi').onChange(update);
        gui.add(guiData, 'showFaces').name('Show Triangles').onChange(update);
        gui.add(guiData, 'showDots').name('Show Points').onChange(update);
        gui.add(guiData, 'showSheet').name('Show Sheet').onChange(update);
    }

    update() {
        console.log("ThreeJSViewer.update");
        if (!this.mobius) {
            console.log("no mobius");
            return;
        }
        this.mobius.showDots = guiData.showDots;
        this.mobius.showTris = guiData.showFaces;
        this.mobius.ntwists = guiData.twists;
        this.mobius.numSegs = guiData.numSegs;
        this.mobius.phi = guiData.phi;
        if (this.hexagon) {
            this.hexagon.showDots = guiData.showDots;
            this.hexagon.showTris = guiData.showFaces;
            this.hexagon.phi = guiData.phi;
        }
        this.tick();
    }

    draw(sheet) {
        console.log("ThreeJSViewer draw", sheet);
        if (this.guiData.showSheet) {
            this.drawSheet(sheet);
        }
        render();
    }

    drawSheet(sheet) {
        console.log("ThreeJSViewer drawSheet", sheet);
        this.clear();
        // draw for each triangle
        for (let group of sheet.groups) {
            console.log("tjs.draw group", group);
            this.drawGroup(group);
        }
        render();
    }

    drawGroup(group) {
        let tris = group.triangles;
        for (let tri of tris) {
            console.log("tri", tri);
            let pts = tri.points;
            console.log(" pts:", pts);
            let h = 10;
            let f = 0.1;
            let color = tri.frontColor;
            console.log("color", color);
            addTriangle(scene, [
                [f * pts[0][0], f * pts[0][1], h],
                [f * pts[1][0], f * pts[1][1], h],
                [f * pts[2][0], f * pts[2][1], h]
            ], color);
        }
    }


    clear() {
        console.log("clear");
        if (this.mobius) {
            this.mobius.clear();
        }
        render();
    }

    addMobius(phi = 0) {
        this.mobius = new Mobius(phi)
        this.mobius.add(scene);
        this.addHexagon();
    }

    addHexagon() {
        this.hexagon = new Hexagon();
        this.hexagon.add(scene);
    }

    run() {
        if (this.running) {
            console.log("already running");
            return;
        }
        this.running = true;
        this.tick();
    }

    stop() {
        this.running = false;
    }

    tick() {
        console.log("tick");
        if (this.mobius) {
            this.mobius.tick();
        }
        if (this.hexagon) {
            this.hexagon.tick();
        }
        if (!this.running) {
            console.log("tick - not running");
            return;
        }
        let self = this;
        requestAnimationFrame(() => { self.tick(); });
        render();
    }
}

window.ThreeJSViewer = ThreeJSViewer;


function init() {
    console.log("threejs init");

    const container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 200);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.screenSpacePanning = true;

    //

    window.addEventListener('resize', onWindowResize);

    guiData = {
        //currentURL: 'models/svg/tiger.svg',
        currentURL: 'models/svg/flexaTemplate.svg',
        drawFillShapes: true,
        drawStrokes: true,
        fillShapesWireframe: false,
        strokesWireframe: false
    };

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0b0b0);

    //

    const helper = new THREE.GridHelper(160, 10, 0x8d8d8d, 0xc1c1c1);
    helper.rotation.x = Math.PI / 2;
    scene.add(helper);

    //addTriangles();
    render();
}


function addTriangles() {
    console.log("addTriangles");
    let h = 1;
    let p1 = [0, 0, h];
    let p2 = [10, 0, h];
    let p3 = [0, 10, h];
    addTriangle(scene, [p1, p2, p3], 0xff0000);
    addTriangle(scene, [[20, 20, h], [30, 20, h], [20, 30, h]], 0x00ff00);
    addTriangle(scene, [[50, 60], [50, 90], [70, 6]], 0x00ffff);
    render();
}

function addTriangle(scene, pts, frontColor, backColor) {
    //console.log("addTriangle", pts, frontColor, backColor);
    frontColor = frontColor || 0xff0000;
    backColor = backColor || frontColor;

    let geometry = new THREE.BufferGeometry();

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    let p1 = pts[0];
    let p2 = pts[1];
    let p3 = pts[2];
    const vertices = new Float32Array([
        p1[0], p1[1], p1[2], // v0
        p2[0], p2[1], p2[2], // v1
        p3[0], p3[1], p3[2], // v2
    ]);
    if (0) {
        console.log("p1:", p1[0], p1[1], p1[2]);
        console.log("p2:", p2[0], p2[1], p2[2]);
        console.log("p3:", p3[0], p3[1], p3[2]);
    }

    let indices = new Uint16Array([
        0, 1, 2, // first triangle
        2, 1, 0
        //  2, 3, 0  // second triangle
    ]);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    window.geometry = geometry;
    //geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    //geometry.faces[0].matererialIndex = 0;
    //geometry.faces[1].matererialIndex = 1;
    const mat1 = new THREE.MeshBasicMaterial({
        color: frontColor,
        //side: THREE.DoubleSide
    });
    const mat2 = new THREE.MeshBasicMaterial({
        color: backColor,
        //side: THREE.DoubleSide
    });
    const mymesh = new THREE.Mesh(geometry, mat1);
    //const mymesh = new THREE.Mesh(geometry, [mat1, mat2]);
    //console.log("mymesh", mymesh);
    scene.add(mymesh);
    return mymesh;
}

function addDot(scene, pt, color) {
    //console.log("addDot", pt, color);
    let geometry = new THREE.SphereGeometry(1, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: color });
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pt[0], pt[1], pt[2]);
    scene.add(sphere);
    return sphere;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    render();

}

function render() {

    renderer.render(scene, camera);

}
