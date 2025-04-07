window.addEventListener("load", () => {
    const canvas = document.getElementById('canvas-fireworks');
    const context = canvas.getContext('2d');

    if (!canvas || !context) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const positions = {
        mouseX: width / 2,
        mouseY: height / 2,
        anchorX: width / 2,
        anchorY: height * 0.9,
    };

    const fireworks = [];
    const flecks = [];
    const numberOfFlecks = 25;

    const random = (min, max) => Math.random() * (max - min) + min;

    const getDistance = (x1, y1, x2, y2) => {
        const xDistance = x1 - x2;
        const yDistance = y1 - y2;
        return Math.sqrt(xDistance ** 2 + yDistance ** 2);
    };

    let mouseClicked = false;

    const attachEventListeners = () => {
        document.addEventListener('mousemove', (e) => {
            positions.mouseX = e.clientX;
            positions.mouseY = e.clientY;
        });

        document.addEventListener('mousedown', () => (mouseClicked = true));
        document.addEventListener('mouseup', () => (mouseClicked = false));
    };

    const loop = () => {
        requestAnimationFrame(loop);
        context.clearRect(0, 0, width, height);

        if (mouseClicked) {
            fireworks.push(new Firework());
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].draw(i);
        }

        for (let i = flecks.length - 1; i >= 0; i--) {
            flecks[i].draw(i);
        }
    };

    class Firework {
        constructor() {
            this.x = positions.anchorX;
            this.y = positions.anchorY;
            this.target_x = positions.mouseX;
            this.target_y = positions.mouseY;
            this.distanceToTarget = getDistance(this.x, this.y, this.target_x, this.target_y);
            this.distanceTraveled = 0;
            this.coordinates = [];
            this.angle = Math.atan2(this.target_y - this.y, this.target_x - this.x);
            this.speed = 15;
            this.friction = 0.99;
            this.hue = random(0, 360);

            for (let i = 0; i < 8; i++) {
                this.coordinates.push([this.x, this.y]);
            }
        }

        animate(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.friction;

            const velocity_x = Math.cos(this.angle) * this.speed;
            const velocity_y = Math.sin(this.angle) * this.speed;

            this.distanceTraveled = getDistance(
                positions.anchorX,
                positions.anchorY,
                this.x + velocity_x,
                this.y + velocity_y
            );

            if (this.distanceTraveled >= this.distanceToTarget) {
                for (let i = 0; i < numberOfFlecks; i++) {
                    flecks.push(new Fleck(this.target_x, this.target_y));
                }
                fireworks.splice(index, 1);
            } else {
                this.x += velocity_x;
                this.y += velocity_y;
            }
        }

        draw(index) {
            context.beginPath();
            context.moveTo(
                this.coordinates[this.coordinates.length - 1][0],
                this.coordinates[this.coordinates.length - 1][1]
            );
            context.lineTo(this.x, this.y);
            context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
            context.stroke();
            this.animate(index);
        }
    }

    class Fleck {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.coordinates = [];
            this.angle = random(0, Math.PI * 2);
            this.speed = random(1, 10);
            this.friction = 0.95;
            this.gravity = 2;
            this.hue = random(0, 360);
            this.alpha = 1;
            this.decay = random(0.015, 0.03);

            for (let i = 0; i < 7; i++) {
                this.coordinates.push([this.x, this.y]);
            }
        }

        animate(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;

            this.alpha -= this.decay;

            if (this.alpha <= this.decay) {
                flecks.splice(index, 1);
            }
        }

        draw(index) {
            context.beginPath();
            context.moveTo(
                this.coordinates[this.coordinates.length - 1][0],
                this.coordinates[this.coordinates.length - 1][1]
            );
            context.lineTo(this.x, this.y);
            context.strokeStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
            context.stroke();
            this.animate(index);
        }
    }

    attachEventListeners();
    loop();
});
