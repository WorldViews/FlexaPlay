


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

    // add() {
    //    alert("sss");
    //    addTriangle(scene, [[-20, -20], [-40, -20], [-20, -40]], 0x00ffff);
    //}

    addMobiusXXX() {
        console.log("addMobius");
        addTriangle(scene, [[-20, -20, 0], [-40, -20, 0], [-40, -10, 10]], 0x00ffff);
        render();
    }

    addMobius() {
        console.log("----------------------------------------------------");
        console.log("addMobius");
        let h1 = 1;
        let h2 = 15;
        let n = 8;
        let r = 20;
        let rpts = [];
        for (var i = 0; i <= n; i++) {
            let t = i / n;
            let x = r * Math.cos(2 * Math.PI * t);
            let y = r * Math.sin(2 * Math.PI * t);
            rpts.push([x, y, h1]);
        }
        if (1) {
            for (var i = 0; i < n; i++) {
                let p1 = rpts[i];
                let p2 = rpts[i + 1];
                let p3;
                p3 = [p1[0], p1[1], h2];
                addTriangle(scene, [p1, p2, p3], 0x0000ff);
                p1 = [p2[0], p2[1], h2];
                addTriangle(scene, [p1, p2, p3], 0xffaaaa);
            }
        }
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
    //


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
    console.log("addTriangle", pts, frontColor, backColor);
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
    console.log("p1:", p1[0], p1[1], p1[2]);
    console.log("p2:", p2[0], p2[1], p2[2]);
    console.log("p3:", p3[0], p3[1], p3[2]);

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
