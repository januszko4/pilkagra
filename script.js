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

        this.linesArr = [new Line(this.ctx, 3, 3, 4, 4, this.TILE_SIZE_PX)];
        this.points2dGrid = [];
        this.pointSize = 5;
    }
    run() {
        console.clear();

        this.getWidthAndHeightTilesFromUser();
        this.initializeCanvas();
        
        this.createPoints2dGrid();

        this.player = new Player(this.ctx, this.canvas, this.points2dGrid, this.WINDOW_WIDTH_TILES, this.WINDOW_HEIGHT_TILES, this.TILE_SIZE_PX, this);
        this.player.addMovementListenerToCanvas();
        
        this.mouse = new Mouse(this.ctx, this.canvas, this.points2dGrid, this.TILE_SIZE_PX, this.player, this);

        /* LOOP */
        this.gameLoop();
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.drawLineGrid();
        this.drawPointsFromGrid2d();
        this.drawLinesFromLinesArr();
        this.player.draw();
    
        requestAnimationFrame(() => this.gameLoop());
    }

    getWidthAndHeightTilesFromUser() {
        this.WINDOW_WIDTH_TILES = parseInt(prompt("Pass width (tiles, odd):"));
        this.WINDOW_HEIGHT_TILES = parseInt(prompt("Pass height (tiles, odd):"));
    }
    initializeCanvas() {
        this.canvas.width = this.WINDOW_WIDTH_TILES * this.TILE_SIZE_PX;
        this.canvas.height = this.WINDOW_HEIGHT_TILES * this.TILE_SIZE_PX;
    }

    drawLinesFromLinesArr() {
        this.linesArr.forEach((lineInstance) => {
            lineInstance.draw();
        });
    }
    addLineToLineArr(lineInstance) {
        this.linesArr.push(lineInstance);
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

class Line {
    constructor(ctx, x1Tiles, y1Tiles, x2Tiles, y2Tiles, TILE_SIZE_PX) {
        this.ctx = ctx;
        this.TILE_SIZE_PX = TILE_SIZE_PX;

        this.x1Tiles = x1Tiles;
        this.y1Tiles = y1Tiles;
        this.x2Tiles = x2Tiles;
        this.y2Tiles= y2Tiles;
    }
    draw() {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "blue";
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x1Tiles * this.TILE_SIZE_PX, this.y1Tiles * this.TILE_SIZE_PX);
        this.ctx.lineTo(this.x2Tiles * this.TILE_SIZE_PX, this.y2Tiles * this.TILE_SIZE_PX);
        this.ctx.stroke();
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
                case "c":
                    console.clear();
                    break;
            }
        });
    }
    TryTogoToCursorPoint(closestPoint) {
        let closestPointXcoord = closestPoint.getXCoord();
        let closestPointYcoord = closestPoint.getYCoord();

        if ((this.x == closestPointXcoord) && (this.y == closestPointYcoord)) {
            console.log("Player at the same position as the closest point.");
            return;
        }
        
        // lord forgive me for my if statements...
        if ((Math.abs(this.x - closestPointXcoord) == 1 && Math.abs(this.y - closestPointYcoord) == 1) ||  // Diagonal
        (Math.abs(this.x - closestPointXcoord) == 1 && this.y === closestPointYcoord) ||  // Horizontal
        (Math.abs(this.y - closestPointYcoord) == 1 && this.x === closestPointXcoord))  // Vertical
        {
            this.setXcoord(closestPointXcoord);
            this.setYcoord(closestPointYcoord);
            console.log(`Went to closest point to the cursor: ${closestPointXcoord}, ${closestPointYcoord}`);
        }
        else{
            console.log(`Point [${closestPointXcoord}, ${closestPointYcoord}] too far!`)
        }
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
}

class Mouse {
    constructor(ctx, canvas, points2dGrid, TILE_SIZE_PX, player, game) {
        this.ctx = ctx;
        this.game = game;

        this.player = player;
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.points2dGrid = points2dGrid;
        this.TILE_SIZE_PX = TILE_SIZE_PX;

        this.canvas.addEventListener("mousemove", (e) => {
            this.setMouseXandY(e, this.canvas);
        });

        this.canvas.addEventListener("click", () => {
            console.log(`Mouse clicked at: ${this.x}, ${this.y}`);
            
            let closestPoint = this.findClosestPoint();
            this.player.TryTogoToCursorPoint(closestPoint);
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

        return closestPoint;
    }
}

class RestrictionX {
    static draw(ctx, x, y, TILE_SIZE_PX) {
        ctx.strokeStyle = "blue"; // Color of the X
        ctx.lineWidth = 20;       // Line thickness to make it bold

        // Draw the X shape (diagonal lines crossing each other)
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE_PX, y * TILE_SIZE_PX); // Start point of first diagonal
        ctx.lineTo((x + 1) * TILE_SIZE_PX, (y + 1) * TILE_SIZE_PX); // End point of first diagonal
        ctx.moveTo((x + 1) * TILE_SIZE_PX, y * TILE_SIZE_PX); // Start point of second diagonal
        ctx.lineTo(x * TILE_SIZE_PX, (y + 1) * TILE_SIZE_PX); // End point of second diagonal
        ctx.stroke();
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
