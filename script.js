function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

class Game {
    
    constructor(TILE_SIZE_PX) {
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.TILE_SIZE_PX = TILE_SIZE_PX;

        this.canvasWidthPx;
        this.canvasHeightPx;

        this.WINDOW_WIDTH_TILES;
        this.WINDOW_HEIGHT_TILES;

        this.points2dGrid = [];
        this.pointSize = 5;
    }
    run() {

        this.getWidthAndHeightTilesFromUser();
        this.initializeCanvas();
        
        this.createPoints2dGrid();

        this.player = new Player(this.ctx, this.canvas, this.points2dGrid, this.WINDOW_WIDTH_TILES, this.WINDOW_HEIGHT_TILES, this.TILE_SIZE_PX);
        this.player.addMovementListenerToCanvas();
        
        let mouse = new Mouse(this.canvas, this.points2dGrid, this.TILE_SIZE_PX, this.player);
        
        /* LOOP */

        this.drawingLoop();
    }

    drawingLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.drawLineGrid();
        this.drawPointsFromGrid2d();
        this.player.draw();
    
        requestAnimationFrame(() => this.drawingLoop());
    }

    getWidthAndHeightTilesFromUser() {
        this.WINDOW_WIDTH_TILES = parseInt(prompt("Pass width (tiles, odd):"));
        this.WINDOW_HEIGHT_TILES = parseInt(prompt("Pass height (tiles, odd):"));
    }
    initializeCanvas() {
        this.canvas.width = this.WINDOW_WIDTH_TILES * this.TILE_SIZE_PX;
        this.canvas.height = this.WINDOW_HEIGHT_TILES * this.TILE_SIZE_PX;
    }


    createPoints2dGrid() {
        for (let y = 1; y < this.WINDOW_HEIGHT_TILES; y++) {
            for (let x = 1; x < this.WINDOW_WIDTH_TILES; x++) {
                const UP = (y > 1);
                const DOWN = (y < this.WINDOW_HEIGHT_TILES - 1);
                const LEFT = (x > 1);
                const RIGHT = (x < this.WINDOW_WIDTH_TILES - 1);
                
                this.points2dGrid.push(new Point(UP, DOWN, LEFT, RIGHT, x, y));
            }
        }
        console.log(this.points2dGrid);
    }
    drawPointsFromGrid2d(){
        this.points2dGrid.forEach((point) => {
            this.ctx.fillStyle = point.getPointColor();
            
            // subtract (0.5 * pointSize) to fix the origin of point
            this.ctx.fillRect((point.getXCoord() * this.TILE_SIZE_PX) - 0.5 * point.getPointSize(), (point.getYCoord() * this.TILE_SIZE_PX) - 0.5 * point.getPointSize(), point.getPointSize(), point.getPointSize());
        });
    }
    drawLineGrid() {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= this.WINDOW_WIDTH_TILES; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.TILE_SIZE_PX, 0);
            this.ctx.lineTo(x * this.TILE_SIZE_PX, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.WINDOW_HEIGHT_TILES; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.TILE_SIZE_PX);
            this.ctx.lineTo(this.canvas.width, y * this.TILE_SIZE_PX);
            this.ctx.stroke();
        }
    }
}



class Player {
    constructor(ctx, canvas, points2dGrid, WINDOW_WIDTH_TILES, WINDOW_HEIGHT_TILES, TILE_SIZE_PX) {
        this.ctx = ctx;
        this.canvas = canvas
        this.TILE_SIZE_PX = TILE_SIZE_PX
        
        this.points2dGrid = points2dGrid;
        
        this.x = Math.floor(WINDOW_WIDTH_TILES / 2);
        this.y = Math.floor(WINDOW_HEIGHT_TILES / 2);

        this.color = "red";
        this.sizePx = 7;
    }
    draw() {
       this.ctx.fillStyle = this.color; 
       this.ctx.fillRect((this.x * this.TILE_SIZE_PX) - 0.5 * this.sizePx, (this.y * this.TILE_SIZE_PX) - 0.5 * this.sizePx, this.sizePx, this.sizePx);
    }
    addMovementListenerToCanvas() {
        document.addEventListener("keydown", (e) => {
            switch(e.key) {
                case "w":
                    this.TryToMoveUp();
                    break;
                case "s":
                    this.TryToMoveDown();
                    break;
                case "a":
                    this.TryToMoveLeft();
                    break;
                case "d":
                    this.TryToMoveRight();
                    break;
            }
        });
    }

    TryToMoveUp() {
        const point = this.findPointWithSameCoords();
        if (this.checkIfCanMoveUp(point)) {
            this.moveUp();
            console.log("Moved up!");
        }
        else {
            console.log("You cannot move up!");
        }
    }
    TryToMoveDown() {
        const point = this.findPointWithSameCoords();
        if (this.checkIfCanMoveDown(point)) {
            this.moveDown();
            console.log("Moved down!");
        }
        else {
            console.log("You cannot move down!");
        }
    }
    TryToMoveLeft() {
        const point = this.findPointWithSameCoords();
        if (this.checkIfCanMoveLeft(point)) {
            this.moveLeft();
            console.log("Moved left!");
        }
        else {
            console.log("You cannot move left!");
        }
    }
    TryToMoveRight() {
        const point = this.findPointWithSameCoords();
        if (this.checkIfCanMoveRight(point)) {
            this.moveRight();
            console.log("Moved right!");
        }
        else {
            console.log("You cannot move right!");
        }
    }

    checkIfCanMoveUp(point) {
        if (point.getUp()){
            return true;
        }
        return false;
    }
    checkIfCanMoveDown(point) {
        if (point.getDown()){
            return true;
        }
        return false;
    }
    checkIfCanMoveLeft(point) {
        if (point.getLeft()){
            return true;
        }
        return false;
    }
    checkIfCanMoveRight(point) {
        if (point.getRight()){
            return true;
        }
        return false;
    }

    moveUp() {
        this.setYcoord(this.y - 1);
    }
    moveDown() {
        this.setYcoord(this.y + 1);
    }
    moveLeft() {
        this.setXcoord(this.x - 1);
    }
    moveRight() {
        this.setXcoord(this.x + 1);
    }


    findPointWithSameCoords() {
        return this.points2dGrid.find(point => point.getXCoord() == this.x && point.getYCoord() == this.y);
    }

    setXcoord(newXcoord) {
        this.x = newXcoord;
    }
    setYcoord(newYcoord) {
        this.y = newYcoord;
    }
    setCoords(newXcoord, newYcoord) {
        this.x = newXcoord;
        this.y = newYcoord;
    }
}

class Mouse {
    constructor(canvas, points2dGrid, TILE_SIZE_PX, player) {
        this.player = player;
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.points2dGrid = points2dGrid;
        this.TILE_SIZE_PX = TILE_SIZE_PX;

        document.addEventListener("mousedown", (e) => {
            if (e.button == 0) { // LMB
                this.setMouseXandY(e, this.canvas);
                console.log(`LMB clicked at: ${this.x}, ${this.y}`);
                
                const closestPoint = this.findClosestPoint();
                this.player.setCoords(closestPoint.getXCoord(), closestPoint.getYCoord());
            }
        });
    }
    
    setMouseXandY(event, canvas) {
        const rect = canvas.getBoundingClientRect(); // Get the canvas position
        
        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;
    }
    findClosestPoint() {
        let closestPoint = null;
        let minDistance = Infinity;

        this.points2dGrid.forEach((point) => {
            const pointX = point.getXCoord();
            const pointY = point.getYCoord();

            const distance = calculateDistance(this.x, this.y, pointX * this.TILE_SIZE_PX, pointY * this.TILE_SIZE_PX);

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        });

        console.log("Closest point to the cursor:", closestPoint);
        return closestPoint;
    }
}


class Point {
    constructor(UP, DOWN, LEFT, RIGHT, x, y) {
        this.UP = UP;
        this.DOWN = DOWN;
        this.LEFT = LEFT;
        this.RIGHT = RIGHT;
        this.x = x;
        this.y = y;

        this.pointSize = 5;
        this.color = "green";
    }
    getUp() {
        return this.UP;
    }
    getDown() {
        return this.DOWN;
    }
    getLeft() {
        return this.LEFT;
    }
    getRight() {
        return this.RIGHT;
    }

    getXCoord() {
        return this.x;
    }
    getYCoord() {
        return this.y;
    }
    getPointSize() {
        return this.pointSize;
    }
    getPointColor() {
        return this.color;
    }
}

function startGame() {
    const game = new Game(40);
    game.run();
}
