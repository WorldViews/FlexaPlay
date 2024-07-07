


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
        this.mobiTris = [];
        this.mobiPhi = 0;
        guiData = {
            currentURL: 'models/svg/tiger.svg',
            numSegs: 20,
            showFaces: true,
            showDots: true,
            twists: 1.0
        }
        this.guiData = guiData;
        this.createGUI();
    }

    createGUI() {
        console.log("createGUI");
        if (gui) gui.destroy();
        gui = new GUI();
        let self = this;
        let update = e => self.update(e);
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
        gui.add(guiData, 'showFaces').name('Show Triangles').onChange(update);
        gui.add(guiData, 'showDots').name('Show Points').onChange(update);
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
        this.tick();
    }

    draw(sheet) {
        console.log("ThreeJSViewer draw", sheet);
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


    addMobiusOLD() {
        console.log("----------------------------------------------------");
        console.log("addMobius");
        let h1 = 1;
        let h2 = 20;
        let n = 10;
        let r = 40;
        let rpts = [];
        for (var i = 0; i <= n; i++) {
            let t = i / n;
            let x = r * Math.cos(2 * Math.PI * t);
            let y = r * Math.sin(2 * Math.PI * t);
            rpts.push([x, y, h1]);
        }
        let rpts2 = [];
        for (var i = 0; i <= n; i++) {
            let t = (i + 0.5) / n;
            let x = r * Math.cos(2 * Math.PI * t);
            let y = r * Math.sin(2 * Math.PI * t);
            rpts2.push([x, y, h2]);
        }
        let rpts1 = rpts;
        if (1) {
            for (var i = 0; i < n; i++) {
                let p1 = rpts1[i];
                let p2 = rpts2[i];
                let p3 = rpts1[i + 1];
                let p4 = rpts2[i + 1];
                addTriangle(scene, [p1, p2, p3], 0x0000ff);
                addTriangle(scene, [p2, p3, p4], 0xff3333);
            }
        }
        render();
    }

    addMobius2() {
        console.log("----------------------------------------------------");
        console.log("addMobius");
        let n = 10;
        let r = 40;
        let ntwists = 1;
        let rpts1 = [];
        let rpts2 = [];
        for (var i = 0; i <= n; i++) {
            let t1 = i / n;
            let u1 = 2 * Math.PI * t1;
            let v1 = 0 + ntwists * t1 * Math.PI;
            rpts1.push(torus(u1, v1, r, 10));
            let t2 = (i + 0.5) / n;
            let u2 = 2 * Math.PI * t2;
            let v2 = v1 + Math.PI;
            rpts2.push(torus(u2, v2, r, 10));
        }

        for (var i = 0; i < n; i++) {
            let p1 = rpts1[i];
            let p2 = rpts2[i];
            let p3 = rpts1[i + 1];
            let p4 = rpts2[i + 1];
            addTriangle(scene, [p1, p2, p3], 0x0000ff);
            addTriangle(scene, [p2, p3, p4], 0xff3333);
        }
        render();
    }

    clear() {
        console.log("clear");
        for (let tri of this.mobiTris) {
            scene.remove(tri);
        }
        this.mobiTris = [];
        render();
    }

    addMobiusAlt(phi = 0) {
        console.log("----------------------------------------------------");
        console.log("addMobius");
        let n = 30;
        let r1 = 50;
        let r2 = 8;
        let ntwists = 0.5;
        let rpts1 = [];
        let rpts2 = [];
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

        for (var i = 0; i < n; i++) {
            let p1 = rpts1[i];
            let p2 = rpts2[i];
            let p3 = rpts1[i + 1];
            let p4 = rpts2[i + 1];
            let tri1 = addTriangle(scene, [p1, p2, p3], 0x0000ff);
            let tri2 = addTriangle(scene, [p2, p3, p4], 0xff3333);
            this.mobiTris.push(tri1);
            this.mobiTris.push(tri2);
        }
        render();
    }

    addMobius(phi = 0) {
        this.mobius = new Mobius(phi)
        this.mobius.add(scene);
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
