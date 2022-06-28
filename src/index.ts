import P5, { Vector } from "p5"

type Color = (
  P5.Color
  | number
  | string
  | any
)

class Wall {
  constructor(
    public color: Color,
    public from: P5.Vector,
    public to: P5.Vector,
  ) {}

  intersect(vector: Vector): number {
    return 1
  }
}

class Player {
  constructor(
    public fov = Math.PI / 6,
    public angle = 0,
    public position = new Vector(30, 50),
  ) {}
}

new P5((p5: P5) => {
  const walls = [
    new Wall("deeppink",   new Vector(0, 0), new Vector(100, 0)),
    new Wall("dodgerblue", new Vector(0, 0), new Vector(0, 100)),
    new Wall("khaki",      new Vector(100, 100), new Vector(100, 0)),
    new Wall("tomato",     new Vector(100, 100), new Vector(0, 100)),
    new Wall("violet",     new Vector(0, 30), new Vector(30, 30)),
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
      player.angle += 0.1
      console.log('RIGHT_ARROW', player.angle)
    }
    else if (p5.keyIsDown(p5.LEFT_ARROW)) {
      player.angle -= 0.1
      console.log('LEFT_ARROW', player.angle)
    }

    if (p5.keyIsDown(p5.UP_ARROW)) {
      const offset = Vector.fromAngle(player.angle, 0.2)
      player.position = Vector.add(player.position, offset)
    }
    else if (p5.keyIsDown(p5.DOWN_ARROW)) {
      const offset = Vector.fromAngle(player.angle, -0.2)
      player.position = Vector.add(player.position, offset)
    }

    // Render
  }
})
