

"use strict";

import * as THREE from 'three';

window.THREE = THREE;

const A90 = Math.PI / 2;

class TJSObj {

    constructor(viewer) {
        console.log("TJSObj constructor");
        this.viewer = viewer;
        this.scene = null;
    }

    init(scene) {
        console.log("TJSObj.init");
        this.scene = scene;
    }

    clear() {
        console.log("TJSObj.clear");
    }
}


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

class Hexagon extends TJSObj {
    constructor(viewer) {
        super(viewer);
        this.phi = 30 * Math.PI / 180;
        this.points = [];
        this.tris = [];
        this.dots = [];
        this.showTris = true;
        this.showDots = true;
    }

    init(scene) {
        console.log("Hexagon.init");
        this.scene = scene;
        this.add(scene);
    }

    clear() {
        console.log("Hexagon.clear");
        for (let tri of this.tris) {
            this.scene.remove(tri);
        }
        this.tris = [];
        console.log("clear dots:", this.dots);
        for (let dot of this.dots) {
            this.scene.remove(dot);
        }
        this.dots = [];
        //render();
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
                let phi2 = phi/3;
                rho = r * Math.cos(phi2);
                h2 = r * Math.sin(phi2);
                //rho = r;
                //h2 = 0;
            }
            let a = i * Math.PI / 3;
            let x = rho * Math.cos(a);
            let y = rho * Math.sin(a);
            let pt = [x, y, h + h2];
            this.points.push(pt);
        }
        if (this.showDots) {
            for (let pt of this.points) {
                let dot = this.viewer.addDot(scene, pt, 0xff0000);
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
                let tri = this.viewer.addTriangle(scene, [p0, p1, p2], c);
                this.tris.push(tri);
            }
        }
    }

    tick() {
        console.log("Hexagon.tick");
        if (this.tris.length > 0 || this.dots.length > 0) {
            this.clear();
        }
        this.add(this.scene);
    }
}


class Mobius extends TJSObj {

    constructor(viewer, phi) {
        super(viewer);
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

    init(scene) {
        console.log("Mobius.init");
        super.init(scene);
        //this.scene = scene;
        this.add(scene);
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

        let v = this.viewer;
        for (var i = 0; i < n; i++) {
            let p1 = rpts1[i];
            let p2 = rpts2[i];
            let p3 = rpts1[i + 1];
            let p4 = rpts2[i + 1];
            if (this.showDots) {
                let dot1 = v.addDot(scene, p1, 0xff0000);
                let dot2 = v.addDot(scene, p2, 0x00ff00);
                this.dots.push(dot1);
                this.dots.push(dot2);
            }
            if (this.showTris) {
                let tri1 = v.addTriangle(scene, [p1, p2, p3], 0x0000ff);
                let tri2 = v.addTriangle(scene, [p2, p3, p4], 0xff3333);
                this.tris.push(tri1);
                this.tris.push(tri2);
            }
        }
    }

    clear() {
        console.log("clear");
        for (let tri of this.tris) {
            this.scene.remove(tri);
        }
        this.tris = [];
        for (let dot of this.dots) {
            this.scene.remove(dot);
        }
        this.dots = [];
    }

    tick() {
        console.log("Mobius.tick");
        if (this.tris.length > 0 || this.dots.length > 0) {
            this.clear();
        }
        this.phi += 0.01;
        this.add(this.scene);
    }
}

//window.Mobius = Mobius;
//window.Hexagon = Hexagon;

export { TJSObj, Mobius, Hexagon };


