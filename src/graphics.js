/**
* graphics.js
*
* Contains functions for manipulating the canvases. Includes setup code for all canvases and all of the animation code
* for the robots.
*
* TODO: We should now have a global State we can access - Use it!
*/

import * as Core from "./core.js"
import State from "./core.js";
import Robot from "./robot.js";

/**
 * Draw a new grid onto the corresponding canvas using the size of the planet as boundaries.
 * @param  {int} planetX The x boundary of the current planet.
 * @param  {int} planetY The y boundary of the current planet.
 * @return {Object}      An object containing useful properties about the grid: It's height and width, the x and y
 *                       differences between its grid positions and also the size of the margin surrounding the
 *                       grid.
 */
export function initialiseGridCanvas(planetX, planetY) {

    /*
     * Adjust the internal resolution of the canvas to match the (relative) size of its container.
     * TODO: It would be nice if the canvas could dynamically readjust to window changes.
     */
    var graphicsContainer = document.getElementById("graphicsContainer");

    State.gridCanvas = document.getElementById("grid");

    State.gridCanvas.height = graphicsContainer.offsetHeight;
    State.gridCanvas.width = graphicsContainer.offsetWidth;

    State.gridContext = State.gridCanvas.getContext("2d");
    State.gridContext.clearRect(0, 0, State.gridCanvas.width, State.gridCanvas.height);

    // How far in from 0, 0 we want to draw the grid, we need a margin or the robots can't be centred on the grid
    var marginValue = 0;

    if ((planetX + planetY) < 15) {
        marginValue = 50;
    } else {
        marginValue = 25;
    }

    /*
     * We want to divide our grid based on the size of the planet so we need to consider the margin that surrounds
     * the grid in our calculations.
     */
    var xUp = (State.gridCanvas.width - (marginValue*2))/planetX;
    var yUp = (State.gridCanvas.height - (marginValue*2))/planetY;

    var xBoundary = State.gridCanvas.width - marginValue;
    var yBoundary = State.gridCanvas.height - marginValue;

    // We have to start a path to define the shape (a grid) we want to draw using stroke()
    State.gridContext.beginPath();

    for (var x = marginValue; x <= xBoundary; x += xUp) {

        /*
         * We're using floating point numbers for the difference between each grid position so errors can accrue as
         * the grid is drawn. Taking the floor of x once it's nearing the x boundary ensures that the last line of
         * the grid will be drawn. Quite hacky!
         */
        if ((x + xUp) > xBoundary) {
            x = Math.floor(x);
        }

        State.gridContext.moveTo(x, marginValue);
        State.gridContext.lineTo(x, yBoundary);

    }

    for (var y = marginValue; Math.floor(y) <= yBoundary; y += yUp) {

        /*
         * We're using floating point numbers for the difference between each grid position so errors can accrue as
         * the grid is drawn. Taking the floor of y once it's nearing the y boundary ensures that the last line of
         * the grid will be drawn. Quite hacky!
         */
        if ((y + yUp) > yBoundary) {
            y = Math.floor(y);
        }

        State.gridContext.moveTo(marginValue, y);
        State.gridContext.lineTo(xBoundary, y);

    }

    State.gridContext.closePath();

    // TODO: Make lineWidth scale with planet size
    if ((planetX + planetY) < 15) {
        State.gridContext.lineWidth = 7;
    } else {
        State.gridContext.lineWidth = 4;
    }

    State.gridContext.strokeStyle = "#B5F779";
    State.gridContext.stroke();

    console.log(State.gridContext);

    return {
        xDifference: xUp,
        yDifference: yUp,
        width: xBoundary,
        height: yBoundary,
        margin: marginValue
    };

}

/**
 * Initialise the canvas that active robots will be drawn to.
 */
export function initialiseRobotsCanvas() {

    // Adjust the internal resolution of the canvas to match the (relative) size of its container
    var graphicsContainer = document.getElementById("graphicsContainer");
    State.robotsCanvas = document.getElementById("robots");

    State.robotsCanvas.height = graphicsContainer.offsetHeight;
    State.robotsCanvas.width = graphicsContainer.offsetWidth;

    State.robotsContext = State.robotsCanvas.getContext("2d");
    State.robotsContext.clearRect(0, 0, State.robotsCanvas.width, State.robotsCanvas.height);

    // Chrome's JavaScript CPU profiler revealed setting this took lots of time so set it once here
    State.robotsContext.font = "0.8em Arial";

}

/**
 * Initialise the canvas that completed robots will be drawn to.
 */
export function initialiseFinishedRobotsCanvas() {

    // Adjust the internal resolution of the canvas to match the (relative) size of its container
    var graphicsContainer = document.getElementById("graphicsContainer");
    State.finishedRobotsCanvas = document.getElementById("finishedRobots");

    State.finishedRobotsCanvas.height = graphicsContainer.offsetHeight;
    State.finishedRobotsCanvas.width = graphicsContainer.offsetWidth;

    State.finishedRobotsContext = State.finishedRobotsCanvas.getContext("2d");
    State.finishedRobotsContext.clearRect(0, 0, State.finishedRobotsCanvas.width, State.finishedRobotsCanvas.height);

    State.finishedRobotsContext.font = "0.8em Arial";

}

/**
 * The animate function handles graphical position updates for the current robot based on the time elapsed between
 * frames.
 * @return {boolean} True if the robot has reached its destination, false otherwise.
 */
export function animate(timestamp) {

    var heading = State.robot.getHeading();
    var speed = State.robot.getSpeed();

    var nextPos = -1;
    var newPos = -1;

    // The time difference between frames used to calculate how far the robot needs to move this frame
    var dt = (timestamp - State.previousFrameTimestamp);

    if (State.instruction === "F") {

        if (heading === Robot.NORTH) {

            /*
             * Screen co-ordinates begin in the top left of the canvas but our co-ordinate system begins in the
             * bottom left so we need to translate the co-ordinate value accordingly.
             */
            nextPos = translateOrigin(State.gridInformation.yDifference * State.robot.getYPosition() +
                State.gridInformation.margin, State.gridInformation);

            // Update the canvas y position based on the time that's passed between frames
            newPos = State.robot.getCanvasYPosition() - (dt * speed);

            // If the robot has made it to the new grid square, we can stop animating
            if (newPos <= nextPos) {
                return true;
            }

            State.robot.setCanvasYPosition(newPos);

        } else if (heading === Robot.EAST) {

            nextPos = (State.gridInformation.xDifference * State.robot.getXPosition()) + State.gridInformation.margin;

            // Update the canvas x position based on the time that's passed between frames
            newPos = State.robot.getCanvasXPosition() + (dt * speed);

            // If the robot has made it to the new grid square, we can stop animating
            if (newPos >= nextPos) {
                return true;
            }

            State.robot.setCanvasXPosition(newPos);

        } else if (heading === Robot.SOUTH) {

            nextPos = translateOrigin(State.gridInformation.yDifference * State.robot.getYPosition() +
                State.gridInformation.margin, State.gridInformation);

            // Update the canvas y position based on the time that's passed between frames
            newPos = State.robot.getCanvasYPosition() + (dt * speed);

            // If the robot has made it to the new grid square, we can stop animating
            if (newPos >= nextPos) {
                return true;
            }

            State.robot.setCanvasYPosition(newPos);

        } else if (heading === Robot.WEST) {

            nextPos = State.gridInformation.xDifference * State.robot.getXPosition() + State.gridInformation.margin;

            // Update the canvas y position by a small increment
            newPos = State.robot.getCanvasXPosition() - (dt * speed);

            // If the robot has made it to the new grid square, we can stop animating
            if (newPos <= nextPos) {
                return true;
            }

            State.robot.setCanvasXPosition(newPos);

        }

        State.robotsContext.beginPath();
        State.robotsContext.clearRect(0, 0, State.robotsCanvas.width, State.robotsCanvas.height);

        State.robot.draw(State.gridInformation, State.robotsContext);

        // The animation isn't finished yet so return false
        return false;

    } else {

        // Some instructions don't require animation or may be unimplemented so simply return true
        return true;

    }

}

/**
 * Translate the origin to be in the bottom left hand corner of the co-ordinate system from the top left.
 * @param  {int}    coordinate      The co-ordinate value to convert.
 * @param  {Object} gridInformation An object with properties that define the properties of the current grid in use.
 * @return {int}                    The translated co-ordinate.
 */
export function translateOrigin(coordinate, gridInformation) {
    return (-coordinate) + (gridInformation.height + gridInformation.margin);
}
