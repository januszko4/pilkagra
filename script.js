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

        this.linesArr = [];
        this.points2dGrid = [];
        this.pointSize = 5;
    }
    run() {
        console.clear();

        this.getWidthAndHeightTilesFromUser();
        this.initializeCanvas();
        
        this.createPoints2dGrid();

        this.player = new Player(this, this.ctx, this.canvas, this.points2dGrid, this.WINDOW_WIDTH_TILES, this.WINDOW_HEIGHT_TILES, this.TILE_SIZE_PX, this);
        
        this.mouse = new Mouse(this.ctx, this.canvas, this.points2dGrid, this.TILE_SIZE_PX, this.player, this);
        this.mouse.addMoveEventToCanvas();
        this.mouse.addClickEventToCanvas();

        // clear console
        document.addEventListener("keydown", (e) => {
            if (e.key == "c") {
                console.clear();
            }
        });

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
        if (!WindowSizeValidator.validateWindowSizeAlert(this.WINDOW_WIDTH_TILES, this.WINDOW_HEIGHT_TILES)) {
            this.getWidthAndHeightTilesFromUser();
        }
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
        const centerY = Math.floor(this.WINDOW_HEIGHT_TILES / 2); // Center height of the grid
    
        for (let y = 1; y < this.WINDOW_HEIGHT_TILES; y++) { // Skip top and bottom edges
            for (let x = 1; x < this.WINDOW_WIDTH_TILES; x++) { // Skip left and right edges
                const UP = (y > 1);
                const DOWN = (y < this.WINDOW_HEIGHT_TILES - 1);
                const LEFT = (x > 1);
                const RIGHT = (x < this.WINDOW_WIDTH_TILES - 1);
    
                // Add goalies at the center height (2 points tall) on the left and right edges
                const isGoal = 
                    (x === 0 && (y === centerY || y === centerY - 1)) || // Left goalie
                    (x === this.WINDOW_WIDTH_TILES && (y === centerY || y === centerY - 1)); // Right goalie
    
                // Only add regular points if not on the edges
                if (!isGoal) {
                    this.points2dGrid.push(new Point(UP, DOWN, LEFT, RIGHT, x, y, false));
                }
            }
        }
    
        // Add goal points explicitly at the edges
        this.points2dGrid.push(new Point(false, true, false, true, 0, centerY, true)); // Left goalie (top)
        this.points2dGrid.push(new Point(true, false, false, true, 0, centerY - 1, true)); // Left goalie (bottom)
        this.points2dGrid.push(new Point(false, true, true, false, this.WINDOW_WIDTH_TILES, centerY, true)); // Right goalie (top)
        this.points2dGrid.push(new Point(true, false, true, false, this.WINDOW_WIDTH_TILES, centerY - 1, true)); // Right goalie (bottom)
    
        console.log(this.points2dGrid);
    }
    lineExists(x1, y1, x2, y2) {
        // Check both directions: (x1, y1) -> (x2, y2) and (x2, y2) -> (x1, y1)
        return this.linesArr.some(line => 
            (line.x1Tiles === x1 && line.y1Tiles === y1 && line.x2Tiles === x2 && line.y2Tiles === y2) ||
            (line.x1Tiles === x2 && line.y1Tiles === y2 && line.x2Tiles === x1 && line.y2Tiles === y1)
        );
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

class WindowSizeValidator {
    static validateWindowSizeAlert(windowWidth, windowHeight) {
        if (windowWidth % 2 != 0 || windowHeight % 2 != 0) {
            alert("Window width and height must be even numbers!");
            return false;
        }
        return true;
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
    constructor(game, ctx, canvas, points2dGrid, WINDOW_WIDTH_TILES, WINDOW_HEIGHT_TILES, TILE_SIZE_PX) {
        this.ctx = ctx;
        this.canvas = canvas
        this.TILE_SIZE_PX = TILE_SIZE_PX
        
        this.points2dGrid = points2dGrid;
        
        this.x = Math.floor(WINDOW_WIDTH_TILES / 2);
        this.y = Math.floor(WINDOW_HEIGHT_TILES / 2);

        this.color = "red";
        this.sizePx = 7;

        this.game = game;

    }
    draw() {
       this.ctx.fillStyle = this.color; 
       this.ctx.fillRect((this.x * this.TILE_SIZE_PX) - 0.5 * this.sizePx, (this.y * this.TILE_SIZE_PX) - 0.5 * this.sizePx, this.sizePx, this.sizePx);
    }
    TryToGoToCursorPointAndAddLine(closestPoint) {
        let closestPointXcoord = closestPoint.getXCoord();
        let closestPointYcoord = closestPoint.getYCoord();

        if ((this.x == closestPointXcoord) && (this.y == closestPointYcoord)) {
            console.log("Player at the same position as the closest point to the cursor.");
            return;
        }
        
        if (this.checkIsPointAdjacent(closestPointXcoord, closestPointYcoord)) {
            let lineExists = this.game.lineExists(this.x, this.y, closestPointXcoord, closestPointYcoord);
            
            if(lineExists) {
                console.log(`Line already exists, just moving player to the closest point ${closestPointXcoord}, ${closestPointYcoord}`);
                this.setXcoord(closestPointXcoord);
                this.setYcoord(closestPointYcoord);
                return;
            }
            else{
                let lineInstance = new Line(this.ctx, this.x, this.y, closestPointXcoord, closestPointYcoord, this.TILE_SIZE_PX);
                this.game.addLineToLineArr(lineInstance);

                this.setXcoord(closestPointXcoord);
                this.setYcoord(closestPointYcoord);
                console.log(`Created line and went to closest point to the cursor: ${closestPointXcoord}, ${closestPointYcoord}`);    
            }
        }
        else{
            console.log(`Point [${closestPointXcoord}, ${closestPointYcoord}] too far!`)
        }
    }
    checkIsPointAdjacent(closestPointXcoord, closestPointYcoord) {
        if ((Math.abs(this.x - closestPointXcoord) == 1 && Math.abs(this.y - closestPointYcoord) == 1) ||  // Diagonal
        (Math.abs(this.x - closestPointXcoord) == 1 && this.y === closestPointYcoord) ||  // Horizontal
        (Math.abs(this.y - closestPointYcoord) == 1 && this.x === closestPointXcoord))  // Vertical
        {
            return true;
        }
        return false;
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
    }
    addMoveEventToCanvas() {
        this.canvas.addEventListener("mousemove", (e) => {
            this.setMouseXandY(e, this.canvas);
        });
    }
    addClickEventToCanvas() {
        this.canvas.addEventListener("click", () => {
            // for debugging purposes
            // console.log(`Mouse clicked at: ${this.x}, ${this.y}`);
            
            let closestPoint = this.findClosestPoint();
            this.player.TryToGoToCursorPointAndAddLine(closestPoint);
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
    constructor(UP, DOWN, LEFT, RIGHT, x, y, isGoal) {
        this.UP = UP;
        this.DOWN = DOWN;
        this.LEFT = LEFT;
        this.RIGHT = RIGHT;
        this.x = x;
        this.y = y;

        this.pointSize = 5;

        this.isGoal = isGoal;
        this.color = isGoal ? "yellow" : "green";
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
    isGoalPoint() {
        return this.isGoal;
    }
}

function startGame() {
    const game = new Game(40);
    game.run();
}
