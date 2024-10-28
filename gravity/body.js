class Body {
  constructor(r, p, v) {
    this.r = r;
    this.m = (4 / 3) * PI * r * r * r;
    this.p = p;
    this.v = v;
    this.a = createVector(0, 0);
  }

  attract(other) {
    let dist = p5.Vector.sub(other.p, this.p);
    let distMag = mag(dist);
    let f = (G * other.m) / sq(distMag);
    this.a.add(p5.Vector.setMag(dist, f));
  }
  move() {
    this.v.add(this.a);
    this.p.add(this.v);
    if (this.p.x > width) {
      this.p.x = 0;
    } else if (this.p.x < 0) {
      this.p.x = width;
    }
    if (this.p.y > height) {
      this.p.y = 0;
    } else if (this.p.y < 0) {
      this.p.y = height;
    }
    this.a.set(0, 0);
  }

  show() {
    noStroke();
    colorMode(HSB);
    fill(hue % 360, 255, 255);
    ellipse(this.p.x, this.p.y, this.r * 2, this.r * 2);
  }
}
