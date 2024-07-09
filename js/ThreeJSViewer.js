

"use strict";

import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TJS from './TJSObj.js';

let renderer, scene, camera, gui, guiData;

window.THREE = THREE;
window.TJS = TJS;

const A90 = Math.PI / 2;

console.log("callinig init");
init();


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
            showSheet: true,
            twists: 1.0,
            phi: 0,
            flex: 0,
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
        gui.add(guiData, 'flex', 0, 1).name('Flex').onChange(update);
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
            let phi = guiData.flex * Math.PI / 2;
            this.hexagon.phi = phi;
        }
        this.tick();
        render();
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
            this.addTriangle(scene, [
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
        if (this.hexagon) {
            this.hexagon.clear();
        }
        render();
    }

    addMobius(phi = 0) {
        this.mobius = new TJS.Mobius(this, phi)
        this.mobius.init(scene);
        this.addHexagon();
        render();
    }

    addHexagon() {
        this.hexagon = new TJS.Hexagon(this);
        this.hexagon.init(scene);
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
        render();
        if (!this.running) {
            console.log("tick - not running");
            return;
        }
        let self = this;
        requestAnimationFrame(() => { self.tick(); });
        //render();
    }

    addDot(scene, pt, color) {
        //console.log("ThreeJSViewer.addDot", pt, color);
        let geometry = new THREE.SphereGeometry(1, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: color });
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(pt[0], pt[1], pt[2]);
        scene.add(sphere);
        return sphere;
    }

    addTriangle(scene, pts, frontColor, backColor) {
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
        //const mat1 = new THREE.MeshBasicMaterial({
        const mat1 = new THREE.MeshLambertMaterial({
            color: frontColor,
            //side: THREE.DoubleSide
        });
        mat1.emissive.setHex(frontColor);
        mat1.emissiveIntensity = 0.05;

        //const mat2 = new THREE.MeshBasicMaterial({
        //    color: backColor,
        //    //side: THREE.DoubleSide
        //});

        const mesh = new THREE.Mesh(geometry, mat1);
        //const mymesh = new THREE.Mesh(geometry, [mat1, mat2]);
        //console.log("mymesh", mymesh);
        scene.add(mesh);
        return mesh;
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

    addLights(scene);
    //addTriangles();
    render();
}

function addLights(scene) {
    const light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.set(20, 20, 20);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(-1, -1, -1);
    scene.add(light2);

    const light3 = new THREE.AmbientLight(0xffffff, 0.5);
    light3.intensity = 1.0;
    scene.add(light3);

    // add some point lights
    const light4 = new THREE.PointLight(0xffffff, 1, 100);
    light4.position.set(50, 50, 100);
    light4.intensity = 1.0;
    scene.add(light4);
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


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    render();

}

function render() {

    renderer.render(scene, camera);

}

//window.addDot = addDot;
//window.addTriangle = addTriangle;

export { ThreeJSViewer };

