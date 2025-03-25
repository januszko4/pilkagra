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

        this.player1Move = true;
        this.player2Move = false;
    }
    run() {
        console.clear();

        this.getWidthAndHeightTilesFromUser();
        
        this.initializeScreen();
        
        
        this.createPoints2dGrid();

        this.player = new Player(this, this.ctx, this.canvas, this.points2dGrid, this.WINDOW_WIDTH_TILES, this.WINDOW_HEIGHT_TILES, this.TILE_SIZE_PX, this);
        this.updatePlayerTurnParagraph();

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
    updatePlayerTurnParagraph() {
        document.getElementById("move").innerHTML = this.player1Move ? "Player 1's move" : "Player 2's move";
    }
    initializeScreen() {
        this.initializeCanvas();
        this.initializeMoveCtn();
    }
    getWidthAndHeightTilesFromUser() {
        this.WINDOW_WIDTH_TILES = parseInt(prompt("Pass width (tiles, even):"));
        this.WINDOW_HEIGHT_TILES = parseInt(prompt("Pass height (tiles, even):"));
        if (!WindowSizeValidator.validateWindowSizeAlert(this.WINDOW_WIDTH_TILES, this.WINDOW_HEIGHT_TILES)) {
            this.getWidthAndHeightTilesFromUser();
        }
    }
    initializeMoveCtn() {
        const children = document.querySelectorAll("#move-ctn > *"); // Select all direct children of #move-ctn
        children.forEach((child) => {
            child.style.visibility = "visible"; // Set visibility to visible
        });
    }
    initializeCanvas() {
        document.querySelector("canvas").style.visibility = "visible";
        document.querySelectorAll("#game-window > p").forEach((p) => {
            p.style.visibility = "visible";
        });
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
        // kill me
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
        this.points2dGrid.push(new Point(true, false, false, true, 0, centerY + 1, true)); // Left goalie (bottom)

        this.points2dGrid.push(new Point(false, true, true, false, this.WINDOW_WIDTH_TILES, centerY, true)); // Right goalie (top)
        this.points2dGrid.push(new Point(true, false, true, false, this.WINDOW_WIDTH_TILES, centerY - 1, true)); // Right goalie (bottom)
        this.points2dGrid.push(new Point(true, false, true, false, this.WINDOW_WIDTH_TILES, centerY + 1, true)); // Right goalie (bottom)
    
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
    switchPlayersTurn() {
        this.player1Move = !this.player1Move;
        this.player2Move = !this.player2Move;
    }
    getLinesArr() {
        return this.linesArr
    }
    getPlayer1Move() {
        return this.player1Move;
    }
    getPlayer2Move() {
        return this.player2Move;
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
    static checkIflineExists(game, x1, y1, x2, y2) {
        // Check both directions: (x1, y1) -> (x2, y2) and (x2, y2) -> (x1, y1)
        const exists = game.getLinesArr().some(line => 
            (line.x1Tiles === x1 && line.y1Tiles === y1 && line.x2Tiles === x2 && line.y2Tiles === y2) ||
            (line.x1Tiles === x2 && line.y1Tiles === y2 && line.x2Tiles === x1 && line.y2Tiles === y1)
        );
        return exists;
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
        const targetX = closestPoint.getXCoord();
        const targetY = closestPoint.getYCoord();
    
        if (!this.checkIfPlayerCanGoToPoint(targetX, targetY)) {
            return;
        }
    
        const hasLineFromTarget = this.game.linesArr.some(line =>
            (line.x1Tiles === targetX && line.y1Tiles === targetY) ||
            (line.x2Tiles === targetX && line.y2Tiles === targetY)
        );
    
        this.moveToPointAndCreateLine(targetX, targetY);
    
        if (!hasLineFromTarget) {
            this.game.switchPlayersTurn();
            this.game.updatePlayerTurnParagraph();
        } else {
            console.log("Bounce! " + this.getCurrentPlayerThatsMoving() + " keeps their turn.");
        }
        this.checkifAllAdjacentPointsHaveLines();
    }
    getCurrentPlayerThatsMoving() {
        return this.game.getPlayer1Move() ? "Player1" : "Player2" ; 
    }
    checkIfPlayerCanGoToPoint(targetX, targetY) {
        if (this.checkIfPlayerAlreadyAtPoint(targetX, targetY)) {
            console.log(`Point [${targetX}, ${targetY}] is the player's current position.`);
            return false;
        }
    
        if (!this.checkIsPointAdjacent(targetX, targetY)) {
            console.log(`Point [${targetX}, ${targetY}] is not adjacent.`);
            return false;
        }
    
        if (Line.checkIflineExists(this.game, this.x, this.y, targetX, targetY)) {
            console.log(`A line already exists between [${this.x}, ${this.y}] and [${targetX}, ${targetY}].`);
            return false;
        }
        return true;
    }
    getValidAdjacentPoints() {
        const potentialAdjacentPoints = [
            { x: this.x - 1, y: this.y },     // Left
            { x: this.x + 1, y: this.y },     // Right
            { x: this.x, y: this.y - 1 },     // Up
            { x: this.x, y: this.y + 1 },     // Down
            { x: this.x - 1, y: this.y - 1 }, // Top-left diagonal
            { x: this.x + 1, y: this.y - 1 }, // Top-right diagonal
            { x: this.x - 1, y: this.y + 1 }, // Bottom-left diagonal
            { x: this.x + 1, y: this.y + 1 }  // Bottom-right diagonal
        ];
    
        // Filter out points that are out of bounds
        const validAdjacentPoints = potentialAdjacentPoints.filter(point => 
            point.x >= 1 && point.y >= 1 && // Ensure x and y are at least 1
            point.x < this.game.WINDOW_WIDTH_TILES && 
            point.y < this.game.WINDOW_HEIGHT_TILES
        );
    
        return validAdjacentPoints;
    }
    checkifAllAdjacentPointsHaveLines() {
        const adjacentPoints = this.getValidAdjacentPoints();
    
        console.log(`Checking lines from adjacent points to player at [${this.x}, ${this.y}]...`);
    
        const allPointsHaveLines = adjacentPoints.every(point => {
            const hasLine = Line.checkIflineExists(this.game, point.x, point.y, this.x, this.y);
            console.log(`Line from [${point.x}, ${point.y}] to [${this.x}, ${this.y}]: ${hasLine}`);
            return hasLine;
        });
    
        if (allPointsHaveLines) {
            console.log(this.getCurrentPlayerThatsMoving() + " lost! No more moves available.");
            return true;
        }
        return false;
    }

    // Helper
    checkIfPlayerAlreadyAtPoint(targetX, targetY) {
        return this.x === targetX && this.y === targetY;
    }
    
    moveToPointAndCreateLine(targetX, targetY) {
        const lineInstance = new Line(this.ctx, this.x, this.y, targetX, targetY, this.TILE_SIZE_PX);
        this.game.addLineToLineArr(lineInstance);
    
        this.setXcoord(targetX);
        this.setYcoord(targetY);
    
        console.log(`Created line and moved to point [${targetX}, ${targetY}].`);
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
