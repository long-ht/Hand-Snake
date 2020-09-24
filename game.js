const canvas = document.getElementById('game')
canvas.width = 1000
canvas.height = 750
const c = canvas.getContext('2d')
let highScore = 0
c.font = "80px Arial";
c.textAlign = "center";
c.textBaseline = "middle";
let animating = false;

const snake = {
    xVelocity: 0,
    yVelocity: 0,
    x: 500,
    y: 300,
    tail: [{ x: 500, y: 350 }],

    move: function () {
        const preX = this.x
        const preY = this.y
        this.x += this.xVelocity
        this.y += this.yVelocity
        if (food.x == snake.x && food.y == snake.y) {
            this.tail.push({ x: preX, y: preY })
            food.relocate()
        } else {
            for (let i = 0; i < this.tail.length - 1; i++) {
                this.tail[i] = this.tail[i + 1]
            }
            this.tail[this.tail.length - 1] = { x: preX, y: preY }
        }
        console.log(this.tail);
    },

    death: function () {
        let xTest = this.x
        let yTest = this.y
        if (xTest > 1000 || xTest < 0 || yTest > 750 || yTest < 0) {
            return true
        }
        return this.tail.some(function (element) {
            return (element.x == xTest && element.y == yTest)
        })
    },

    reset: function () {
        this.xVelocity = 0
        this.yVelocity = -50
        this.x = 500
        this.y = 300
        this.tail = [{ x: 500, y: 350 }]
    }
}

const food = {
    x: Math.floor(Math.random() * 16) * 50,
    y: Math.floor(Math.random() * 12) * 50,

    relocate: function () {
        let X = Math.floor(Math.random() * 20) * 50;
        let Y = Math.floor(Math.random() * 15) * 50;

        while (
            snake.tail.some(function (element) {
                return (element.x == X && element.y == Y)
            })) {
            const X = Math.floor(Math.random() * 20) * 50;
            const Y = Math.floor(Math.random() * 15) * 50;
        }
        this.x = X
        this.y = Y
    },
}

//Animation
let stop = false;
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;

// initialize the timer variables and start the animation
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}
// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

function animate() {

    if (!animating) {
        c.fillStyle = '#FFFFFF'
        c.fillText("GAME OVER", 500, 375)
        return
    }
    // request another frame

    requestAnimationFrame(animate)


    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here
        snake.move()

        if (snake.death()) {
            highScore = (highScore > snake.tail.length - 1) ? highScore : snake.tail.length - 1
            document.getElementById('point').innerHTML = highScore
            animating = false
        }

        c.clearRect(0, 0, 1000, 750)
        c.fillStyle = '#86b2a3'
        c.fillRect(snake.x, snake.y, 50, 50)
        c.fillStyle = '#ced2af'
        snake.tail.forEach(element => {
            c.fillRect(element.x, element.y, 50, 50)
        });
        c.fillStyle = '#ef435e'
        c.fillRect(food.x, food.y, 50, 50)
    }
}

const start = document.getElementById("start")
window.addEventListener('model loaded', () => {
    start.innerText = "Start";
    start.onclick = () => {
        snake.reset()
        food.relocate()
        animating = true
        startAnimating(2)
    }
    window.addEventListener('up', (event) => {
        const preLocation = snake.tail[snake.tail.length - 1]
        if (preLocation.y + 50 == snake.y && snake.x == preLocation.x) {
            return
        }
        snake.xVelocity = 0
        snake.yVelocity = -50
    })

    window.addEventListener('down', (event) => {
        const preLocation = snake.tail[snake.tail.length - 1]
        if (preLocation.y - 50 == snake.y && snake.x == preLocation.x) {
            return
        }
        snake.xVelocity = 0
        snake.yVelocity = 50
    })

    window.addEventListener('left', (event) => {
        const preLocation = snake.tail[snake.tail.length - 1]
        if (preLocation.y == snake.y && snake.x == preLocation.x + 50) {
            return
        }
        snake.xVelocity = -50
        snake.yVelocity = 0
    })

    window.addEventListener('right', (event) => {
        const preLocation = snake.tail[snake.tail.length - 1]
        if (preLocation.y == snake.y && snake.x == preLocation.x - 50) {
            return
        }
        snake.xVelocity = 50
        snake.yVelocity = 0
    })
})
