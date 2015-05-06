/**
 * robot.js
 *
 * Contains the constructor required to create a Robot along with the logic to handle each instruction.
 */

import * as Core from "./core.js";
import State from "./core.js";
import * as Graphics from "./graphics.js";

/**
 * Constructor for making a Robot object.
 * @param {int}  initialXPosition The robot's starting X position.
 * @param {int}  initialYPosition The robot's starting Y position.
 * @param {char} initialHeading  The direction the robot is facing.
 */
export default class Robot {

    constructor(initialXPosition, initialYPosition, initialHeading, gridInformation) {

        /**
         * Internal heading values: Counted clockwise from north
         * Defining them outside of this doesn't seem to get them "counted" with the export
         */
        Robot.NUMBER_OF_DIRECTIONS = 4;
        Robot.NORTH = 0;
        Robot.EAST = 1;
        Robot.SOUTH = 2;
        Robot.WEST = 3;

        if (initialXPosition < 0 || initialYPosition < 0 || initialXPosition > Robot.currentPlanet.getXBoundary() ||
            initialYPosition > Robot.currentPlanet.getYBoundary()) {

            throw "<b>Robot Placement Out of Bounds: </b>" + initialXPosition + ", " + initialYPosition;

        } else {

            this.xPosition = initialXPosition;
            this.yPosition = initialYPosition;

            this.canvasXPosition = (gridInformation.xDifference * this.xPosition) + gridInformation.margin;
            this.canvasYPosition = Graphics.translateOrigin((gridInformation.yDifference * this.yPosition) + gridInformation.margin,
                gridInformation);

            // Use the size of the planet to establish a suitable speed for the robots - Totally arbitrary!
            this.speed = (1/(State.planet.getXBoundary() + State.planet.getYBoundary())) * 1.5;

            // Set up the size of the robot in canvas co-ordinates, scales with the size of the grid
            if ((Robot.currentPlanet.getXBoundary() + Robot.currentPlanet.getYBoundary()) < 25) {
                this.length = 50;
                this.width = 50;
            } else {
                this.length = 30;
                this.width = 30;
            }

            // Headings are represented internally as numbers so we need to do a conversion
            if (initialHeading === "N") {
                this.heading = Robot.NORTH;
            } else if (initialHeading === "E") {
                this.heading = Robot.EAST;
            } else if (initialHeading === "S") {
                this.heading = Robot.SOUTH;
            } else if (initialHeading === "W") {
                this.heading = Robot.WEST;
            } else {
                throw "<b>Robot Creation Error:</b> Invalid current heading";
            }

            // Robot has been successfully created so increase the count
            Robot.robotCount++;
            this.id = Robot.robotCount;
            this.isLost = false;

        }

    }

    /**
     * Draw a robot (currently a grey square...) onto a selected canvas.
     * @param  {Object} gridInformation An object whose properties are various useful information about the created
     *                                  grid.
     * @param  {Object} context         The canvas context to draw to.
     */
    draw(gridInformation, context) {

        // Draw the robot centred on the grid point
        context.beginPath();
        context.rect(this.canvasXPosition - (this.width/2), this.canvasYPosition - (this.length/2), this.width, this.length);
        context.fillStyle = '#EFEFEF';
        context.fill();

        // Add an outline to the robot
        context.strokeStyle = '#BFBFBF';
        context.lineWidth = 5;
        context.stroke();

        // Draw the robot's number on it
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = "#BFBFBF";
        context.textAlign = 'center';
        context.strokeText(this.id + " " + Robot.headingToString(this.heading), this.canvasXPosition, this.canvasYPosition);

    }

    /**
     * Execute the instruction given to the robot and update its internal state.
     * @param  {char} instruction A character representing the instruction to execute.
     */
    executeInstruction(instruction, gridInformation) {

        // Save values that get accessed a lot early on so that we don't have to keep accessing the getter method
        var heading = this.getHeading();
        var xPosition = this.getXPosition();
        var yPosition = this.getYPosition();

        var smell = Robot.currentPlanet.getSmellFromCoordinates(xPosition, yPosition);
        var currentPlanetXBoundary = Robot.currentPlanet.getXBoundary();
        var currentPlanetYBoundary = Robot.currentPlanet.getYBoundary();

        if (!(this.isLost)) {

            switch (instruction) {

                // Using mod n allows us to add (n - 1) to the heading to get the next heading the left
                case 'L':
                    this.setHeading((heading + (Robot.NUMBER_OF_DIRECTIONS - 1)) % Robot.NUMBER_OF_DIRECTIONS);
                    break;

                // Same again but we add 1 to get the next heading to the right
                case 'R':
                    this.setHeading((heading + 1) % Robot.NUMBER_OF_DIRECTIONS);
                    break;

                case 'F':

                    switch (heading) {

                        case Robot.NORTH:

                            if ((yPosition + 1) > currentPlanetYBoundary && !smell) {
                                this.setIsLost(true);
                            } else if ((yPosition + 1) > currentPlanetYBoundary && smell) {
                                // Do nothing if we're about to leave the grid but we can smell lost robots
                            } else {
                                this.setYPosition(yPosition + 1);
                            }

                            break;

                        case Robot.EAST:

                            if ((xPosition + 1) > currentPlanetXBoundary && !smell) {
                                this.setIsLost(true);
                            } else if ((xPosition + 1) > currentPlanetXBoundary && smell) {
                                    // Do nothing if we're about to leave the grid but we can smell lost robots
                            } else {
                                this.setXPosition(xPosition + 1);
                            }

                            break;

                        case Robot.SOUTH:

                            if ((yPosition - 1) < 0 && !smell) {
                                this.setIsLost(true);
                            } else if ((yPosition - 1) < 0 && smell) {
                                // Do nothing if we're about to leave the grid but we can smell lost robots
                            } else {
                                this.setYPosition(yPosition - 1);
                            }

                            break;

                        case Robot.WEST:

                            if ((xPosition - 1) < 0 && !smell) {
                                this.setIsLost(true);
                            } else if ((xPosition - 1) < 0 && smell) {
                                // Do nothing if we're about to leave the grid but we can smell lost robots
                            } else {
                                this.setXPosition(xPosition - 1);
                            }

                            break;

                    }

                    break;


                default:
                    // Just in case the instruction is unimplemented
                    break;

            }

        }

    }

    /**
     * Get some information about the robot with added HTML tags.
     * @return {String} A string containing useful information about the robot.
     */
    getFancyPositionInformation() {

        if (this.isLost) {
            return "<b>Robot " + Robot.robotCount + "</b>" + ": " + this.getXPosition() + " " + this.getYPosition() +
            " " + Robot.headingToString(this.getHeading()) + " " + "<b>LOST</b>";
        } else {
            return "<b>Robot " + Robot.robotCount + "</b>" + ": " + this.getXPosition() + " " + this.getYPosition() +
                " " + Robot.headingToString(this.getHeading());
        }

    }

    // TODO: These give us encapsulation but do we really need it?
    getXPosition() {
        return this.xPosition;
    }

    getYPosition() {
        return this.yPosition;
    }

    getHeading() {
        return this.heading;
    }

    getWidth() {
        return this.width;
    }

    getLength() {
        return this.length;
    }

    getCanvasXPosition() {
        return this.canvasXPosition;
    }

    getCanvasYPosition() {
        return this.canvasYPosition;
    }

    getSpeed() {
        return this.speed;
    }

    setXPosition(newXPosition) {
        this.xPosition = newXPosition;
    }

    setYPosition(newYPosition) {
        this.yPosition = newYPosition;
    }

    setHeading(newHeading) {
        this.heading = newHeading;
    }

    setIsLost(newIsLost) {
        this.isLost = newIsLost;
    }

    setCanvasXPosition(newCanvasXPosition) {
        this.canvasXPosition = newCanvasXPosition;
    }

    setCanvasYPosition(newCanvasYPosition) {
        this.canvasYPosition = newCanvasYPosition;
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

}


/**
 * We're giving the Robot object two methods of its own that you can call without needing an instance. These act as
 * static functions.
 */
Robot.setPlanet = function(planet) {
    this.currentPlanet = planet;
};

Robot.setRobotCount = function(count) {
    this.robotCount = count;
};

/**
 * Convert a (numerical) heading value back into its String form.
 * TODO: Refactor using an enum maybe?
 * @param  {int}    heading A numerical value representing the current heading.
 * @return {String}         The String form of that value.
 */
Robot.headingToString = function(heading) {

    switch (heading) {
        case Robot.NORTH:
            return "N";
        case Robot.EAST:
            return "E";
        case Robot.SOUTH:
            return "S";
        case Robot.WEST:
            return "W";
        default:
            return"?";

    }

};
