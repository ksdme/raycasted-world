import P5, { Vector } from "p5"

type Color = (
  P5.Color
  | number
  | string
  | any
)

class Line {
  constructor(
    public a: number,
    public b: number,
    public c: number,
  ) {}

  intersects(line: Line): Vector | null {
    const determinant = this.a * line.b - line.a * this.b

    if (determinant === 0) {
      return null
    }
    else {
      return new Vector(
        Math.fround(((line.b * -this.c) - (this.b * -line.c)) / determinant),
        Math.fround(((this.a * -line.c) - (line.a * -this.c)) / determinant),
      )
    }
  }

  static fromPoints(from: Vector, to: Vector) {
    const a = to.y - from.y
    const b = from.x - to.x
    const c = -((a * from.x) + (b * from.y))
    return new Line(a, b, c)
  }

  static fromPointAngle(point: Vector, angle: number) {
    return this.fromPoints(
      new Vector(
        point.x + 10 * Math.cos(angle),
        point.y + 10 * Math.sin(angle),
      ),
      point,
    )
  }
}

class Wall {
  public line!: Line

  constructor(
    public color: Color,
    public from: P5.Vector,
    public to: P5.Vector,
  ) {
    this.line = Line.fromPoints(from, to)
  }
}

class Player {
  constructor(
    public fov = Math.PI / 6,
    public angle = Math.PI,
    public position = new Vector(30, 50),
  ) {}
}

function makeRayCast(walls: Wall[], position: Vector, angle: number): RayCastHit {
  const effectiveAngle = angle % (2 * Math.PI)

  let closestWall: Wall | null = null
  let closestDistance: number = Infinity

  function selectIfCloser(wall: Wall, intersection: Vector) {
    const distance = intersection.dist(position)

    if (distance < closestDistance) {
      closestWall = wall
      closestDistance = distance
    }
  }

  for (const wall of walls) {
    const ray = Line.fromPointAngle(position, angle);
    const intersection = wall.line.intersects(ray)

    if (intersection) {
      if (intersection.x >= Math.min(wall.from.x, wall.to.x)
          && intersection.x <= Math.max(wall.from.x, wall.to.x)
          && intersection.y >= Math.min(wall.from.y, wall.to.y)
          && intersection.y <= Math.max(wall.from.y, wall.to.y)) {
        if (effectiveAngle >= 0 && effectiveAngle <= Math.PI / 2) {
          if (intersection.x >= position.x && intersection.y >= position.y) {
            selectIfCloser(wall, intersection)
          }
        }
        else if (effectiveAngle > Math.PI / 2 && effectiveAngle <= Math.PI) {
          if (intersection.x <= position.x && intersection.y >= position.y) {
            selectIfCloser(wall, intersection)
          }
        }
        else if (effectiveAngle > Math.PI && effectiveAngle <= 1.5 * Math.PI) {
          if (intersection.x <= position.x && intersection.y <= position.y) {
            selectIfCloser(wall, intersection)
          }
        }
        else if (effectiveAngle > 1.5 * Math.PI && effectiveAngle <= 2 * Math.PI) {
          if (intersection.x >= position.x && intersection.y <= position.y) {
            selectIfCloser(wall, intersection)
          }
        }
      }
    }
  }

  return {
    wall: closestWall,
    distance: closestDistance,
  }
}

interface RayCastHit {
  wall: Wall | null
  distance: number | null
}

new P5((p5: P5) => {
  const light = "blue"
  const dark = "darkblue"

  const walls = [
    new Wall(light, new Vector(0, 0), new Vector(30, 0)),
    new Wall(dark,  new Vector(30, 0), new Vector(30, 30)),
    new Wall(light, new Vector(30, 30), new Vector(60, 30)),
    new Wall(dark,  new Vector(60, 30), new Vector(60, 0)),
    new Wall(light, new Vector(60, 0), new Vector(90, 0)),

    new Wall(light, new Vector(0, 0), new Vector(0, 60)),
    new Wall(light, new Vector(0, 60), new Vector(90, 60)),
    new Wall(light, new Vector(90, 60), new Vector(90, 0)),
  ]

  // Screen
  const width = p5.windowWidth * 0.96
  const gap = p5.windowWidth - width
  const height = p5.windowHeight - gap

  // State
  const player = new Player()

  // Setup
  p5.setup = () => {
    p5.createCanvas(width, height)
  }

  // Render loop.
  p5.draw = () => {
    p5.background(0)

    // Minimap
    p5.push()
      p5.translate(10, 10)

      for (const wall of walls) {
        p5.stroke(255)
        p5.line(wall.from.x, wall.from.y, wall.to.x, wall.to.y)
      }

      p5.push()
        p5.translate(player.position.x, player.position.y)

        p5.push()
          p5.fill(255)
          p5.rotate(player.angle)

          p5.line(3, 0, -3, -3)
          p5.line(3, 0, -3, 3)
        p5.pop()
      p5.pop()
    p5.pop()

    // Input
    if (p5.keyIsDown(p5.RIGHT_ARROW)) {
      player.angle += 0.025
    }
    else if (p5.keyIsDown(p5.LEFT_ARROW)) {
      player.angle -= 0.025
    }

    const step = p5.keyIsDown(p5.SHIFT)
      ? 0.4
      : 0.2

    if (p5.keyIsDown(p5.UP_ARROW)) {
      const offset = Vector.fromAngle(player.angle, step)
      player.position = Vector.add(player.position, offset)
    }
    else if (p5.keyIsDown(p5.DOWN_ARROW)) {
      const offset = Vector.fromAngle(player.angle, -step)
      player.position = Vector.add(player.position, offset)
    }

    // Render
    const dA = player.fov / width
    let column = 0
    let angle = player.angle - player.fov / 2

    while (column < width) {
      const hit = makeRayCast(walls, player.position, angle)

      if (hit.wall && hit.distance) {
        const tall = (1 / Math.max(0.001, hit.distance)) * 7500
        const padding = (height - tall) / 2

        p5.stroke(hit.wall.color)
        p5.line(column, padding, column, padding + tall)
      }

      column += 1
      angle += dA
    }
  }
})
