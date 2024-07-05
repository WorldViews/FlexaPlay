


import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let renderer, scene, camera, gui, guiData;

window.THREE = THREE;

init();

//

class ThreeJSViewer {

    constructor() {
        console.log("ThreeJSViewer constructor");
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
            let f = 0.1;
            let color = tri.frontColor;
            console.log("color", color);
            addTriangle(scene, [
                [f*pts[0][0], f*pts[0][1]],
                [f*pts[1][0], f*pts[1][1]],
                [f*pts[2][0], f*pts[2][1]]
            ], color);
        }
    }

    add() {
        addTriangle(scene, [[-20, -20], [-40, -20], [-20, -40]], 0x00ffff);
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

    addTriangles();
}


function addTriangles() {
    console.log("addTriangles");
    //

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0b0b0);

    //

    const helper = new THREE.GridHelper(160, 10, 0x8d8d8d, 0xc1c1c1);
    helper.rotation.x = Math.PI / 2;
    scene.add(helper);


    let p1 = [0, 0];
    let p2 = [10, 0];
    let p3 = [0, 10];
    addTriangle(scene, [p1, p2, p3], 0xff0000);
    addTriangle(scene, [[20, 20], [30, 20], [20, 30]], 0x00ff00);
    addTriangle(scene, [[50, 60], [50, 90], [70, 6]], 0x00ffff);

    render();

}

function addTriangle(scene, pts, frontColor, backColor) {
    console.log("addTriangle", pts, frontColor, backColor);
    frontColor = frontColor || 0xff0000;
    backColor = backColor || frontColor;

    let geometry = new THREE.BufferGeometry();

    // create a simple square shape. We duplicate the top left and bottom right
    // vertices because each vertex needs to appear once per triangle.
    let s = 10;
    let h = 1;
    let p1 = pts[0];
    let p2 = pts[1];
    let p3 = pts[2];
    const vertices = new Float32Array([
        p1[0], p1[1], h, // v0
        p2[0], p2[1], h, // v1
        p3[0], p3[1], h, // v2
    ]);

    let indices = new Uint16Array([
        0, 1, 2, // first triangle
        2, 1, 0
        //  2, 3, 0  // second triangle
    ]);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    console.log("geometry", geometry);
    console.log("faces", geometry.faces);
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
    console.log("mymesh", mymesh);
    scene.add(mymesh);
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
