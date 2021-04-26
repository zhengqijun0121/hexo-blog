// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL David Galles OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco


// Global timer used for doing animation callbacks.
//  TODO:  Make this an instance variable of Animation Manager.
var timer;
var swapped = false;

function reorderSibling(node1, node2)
{
    node1.parentNode.replaceChild(node1, node2);
    node1.parentNode.insertBefore(node2, node1);
}

function swapControlDiv()
{
    swapped = !swapped;
    if (swapped) {
        reorderSibling(document.getElementById('canvas'), document.getElementById('generalAnimationControlSection'));
        setCookie("VisualizationControlSwapped", "true", 30);
    } else {
        reorderSibling(document.getElementById('generalAnimationControlSection'), document.getElementById('canvas'));
        setCookie("VisualizationControlSwapped", "false", 30);
    }
}

// Utility function to read a cookie
function getCookie(cookieName)
{
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; ++i)
    {
        let x = cookies[i].substr(0, cookies[i].indexOf("="));
        let y = cookies[i].substr(cookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == cookieName)
        {
            return unescape(y);
        }
    }
}

// Utility function to write a cookie
function setCookie(cookieName, value, expireDays)
{
    let exDate = new Date();
    exDate.setDate(exDate.getDate() + expireDays);
    let cookieValue = escape(value) + ((expireDays == null) ? "" : "; expires=" + exDate.toUTCString());
    document.cookie = cookieName + "=" + value;
}

const ANIMATION_SPEED_DEFAULT = 75;

// TODO:  Move these out of global space into animation manager?
var objectManager;
var animationManager;
var canvas;

var paused = false;
var playPauseBackButton;
var skipBackButton;
var stepBackButton;
var stepForwardButton;
var skipForwardButton;

var widthEntry;
var heightEntry;
var sizeButton;

/**
 * @param mode:
 *   1. "OnlyDigit":    [48, 57] + [96, 105]
 *   2. "OnlyLetter":   [65, 90]
 *   3. "OnlyDigLet":   [48, 57] + [65, 90] + [96, 105]
 *   4. "MultiDigit":   [32] + [48, 57] + [96, 105] + [188]
 *   5. "MultiLetter":  [32] + [65, 90] + [188]
 *   6. "MultiDigLet":  [32] + [48, 57] + [65, 90] + [96, 105] + [188]
 *
 *   [,]->[188]  [Space]->[32]  [0, 9]->[48, 57] + [96, 105]  [A, Z]->[65, 90]
 */
function returnSubmit(field, func, maxSize, mode)
{
    if (maxSize != undefined)
    {
        field.size = maxSize;
    }
    return function(event)
    {
        let keyASCII = 0;
        if(window.event) // IE
        {
            keyASCII = event.keyCode;
        }
        else if (event.which) // Netscape/Firefox/Opera
        {
            keyASCII = event.which;
        }

        if (keyASCII == 13)
        {
            func();
            return false;
        }
        else if (keyASCII == 59 || keyASCII == 45 || keyASCII == 46 || keyASCII == 190 || keyASCII == 173)
        {
            return false;
        }
        else if (maxSize != undefined && field.value.length >= maxSize)
        {
            if (!controlKey(keyASCII))
            {
                return false;
            }
        }
        else if (mode.toUpperCase() === "ONLYDIGIT")
        {
            if (keyASCII < 48 || (keyASCII > 57 && keyASCII < 96) || keyASCII > 105)
            {
                return false;
            }
        }
        else if(mode.toUpperCase() === "ONLYLETTER")
        {
            if (keyASCII < 65 || keyASCII > 90)
            {
                return false;
            }
        }
        else if (mode.toUpperCase() === "ONLYDIGLET")
        {
            if (keyASCII < 48 || (keyASCII > 57 && keyASCII < 65) || (keyASCII > 90 && keyASCII < 96) || keyASCII > 105)
            {
                return false;
            }
        }
        else if(mode.toUpperCase() === "MULTIDIGIT")
        {
            if (keyASCII < 32 || (keyASCII > 32 && keyASCII < 48) || (keyASCII > 57 && keyASCII < 96) || (keyASCII > 105 && keyASCII < 188) || keyASCII > 188)
            {
                return false;
            }
        }
        else if(mode.toUpperCase() === "MULTILETTER")
        {
            if (keyASCII < 32 || (keyASCII > 32 && keyASCII < 65) || (keyASCII > 90 && keyASCII < 188) || keyASCII > 188)
            {
                return false;
            }
        }
        else if(mode.toUpperCase() === "MULTIDIGLET")
        {
            if (keyASCII < 32 || (keyASCII > 32 && keyASCII < 48) || (keyASCII > 57 && keyASCII < 65) || (keyASCII > 90 && keyASCII < 96) || (keyASCII > 105 && keyASCII < 188) || keyASCII > 188)
            {
                return false;
            }
        }

        return true;
    }
}

function animWaiting()
{
    stepForwardButton.disabled = false;
    if (skipBackButton.disabled == false)
    {
        stepBackButton.disabled = false;
    }
    objectManager.statusReport.setText("Animation Paused");
    objectManager.statusReport.setForegroundColor("#FF0000");
}

function animStarted()
{
    skipForwardButton.disabled = false;
    skipBackButton.disabled = false;
    stepForwardButton.disabled = true;
    stepBackButton.disabled = true;
    objectManager.statusReport.setText("Animation Running");
    objectManager.statusReport.setForegroundColor("#009900");
}

function animEnded()
{
    skipForwardButton.disabled = true;
    stepForwardButton.disabled = true;
    if (skipBackButton.disabled == false && paused)
    {
        stepBackButton.disabled = false;
    }
    objectManager.statusReport.setText("Animation Completed");
    objectManager.statusReport.setForegroundColor("#000000");
}

function anumUndoUnavailable()
{
    skipBackButton.disabled = true;
    stepBackButton.disabled = true;
}

function timeout()
{
    // We need to set the timeout *first*, otherwise if we
    // try to clear it later, we get behavior we don't want ...
    timer = setTimeout('timeout()', 30);
    animationManager.update();
    objectManager.draw();
}

function doStep()
{
    animationManager.step();
}

function doSkip()
{
    animationManager.skipForward();
}

function doSkipBack()
{
    animationManager.skipBack();
}

function doStepBack()
{
    animationManager.stepBack();
}

function doPlayPause()
{
    paused = !paused;
    if (paused)
    {
        playPauseBackButton.setAttribute("value", "play");
        if (skipBackButton.disabled == false)
        {
            stepBackButton.disabled = false;
        }
    }
    else
    {
        playPauseBackButton.setAttribute("value", "pause");
    }
    animationManager.SetPaused(paused);
}

function addControl(type, name, location)
{
    let element = document.createElement("input");
    element.setAttribute("type", type);
    element.setAttribute("value", name);

    let tableEntry = document.createElement("td");
    tableEntry.appendChild(element);

    let controlBar = document.getElementById(tableEntry);

    // Append the element in page (in span).
    controlBar.appendChild(element);
    return element;
}

function addControlToAnimationBar(type, name, containerType)
{
    if (containerType == undefined)
    {
        containerType = "input";
    }
    let element = document.createElement(containerType);
    element.setAttribute("type", type);
    element.setAttribute("value", name);

    let tableEntry = document.createElement("td");
    tableEntry.appendChild(element);

    var controlBar = document.getElementById("GeneralAnimationControls");

    //Append the element in page (in span).
    controlBar.appendChild(tableEntry);
    return element;
}

function initCanvas()
{
    canvas = document.getElementById("canvas");
    objectManager = new ObjectManager();
    animationManager = new AnimationManager(objectManager);

    skipBackButton = addControlToAnimationBar("Button", "Skip Back");
    skipBackButton.onclick = animationManager.skipBack.bind(animationManager);
    stepBackButton = addControlToAnimationBar("Button", "Step Back");
    stepBackButton.onclick = animationManager.stepBack.bind(animationManager);
    playPauseBackButton = addControlToAnimationBar("Button", "Pause");
    playPauseBackButton.onclick = doPlayPause;
    stepForwardButton = addControlToAnimationBar("Button", "Step Forward");
    stepForwardButton.onclick = animationManager.step.bind(animationManager);
    skipForwardButton = addControlToAnimationBar("Button", "Skip Forward");
    skipForwardButton.onclick = animationManager.skipForward.bind(animationManager);

    let element = document.createElement("div");
    element.setAttribute("display", "inline-block");
    element.setAttribute("float", "left");

    let tableEntry = document.createElement("td");
    let controlBar = document.getElementById("GeneralAnimationControls");
    let newTable = document.createElement("table");
    let midLevel = document.createElement("tr");
    let bottomLevel = document.createElement("td");
    midLevel.appendChild(bottomLevel);
    bottomLevel.appendChild(element);
    newTable.appendChild(midLevel);

    midLevel = document.createElement("tr");
    bottomLevel = document.createElement("td");
    bottomLevel.align = "center";
    let txtNode = document.createTextNode("Animation Speed");
    midLevel.appendChild(bottomLevel);
    bottomLevel.appendChild(txtNode);
    newTable.appendChild(midLevel);

    tableEntry.appendChild(newTable);

    //Append the element in page (in span).
    controlBar.appendChild(tableEntry);

    //tableEntry.appendChild(element);

    let speed = getCookie("VisualizationSpeed");
    if (speed == null || speed == "")
    {
        speed = ANIMATION_SPEED_DEFAULT;
    }
    else
    {
        speed = parseInt(speed);
    }

    $(element).slider({
        animate: true,
        value: speed,
        change: function(e, ui)
        {
            setCookie("VisualizationSpeed", String(ui.value), 30);
        },
        slide: function(e, ui){
            animationManager.SetSpeed(ui.value);
        }
    });

    animationManager.SetSpeed(speed);

    element.setAttribute("style", "width:200px");

    let width = getCookie("VisualizationWidth");
    if (width == null || width == "")
    {
        width = canvas.width;
    }
    else
    {
        width = parseInt(width);
    }
    let height = getCookie("VisualizationHeight");
    if (height == null || height == "")
    {
        height = canvas.height;
    }
    else
    {
        height = parseInt(height);
    }

    let swappedControls = getCookie("VisualizationControlSwapped");
    swapped = swappedControls == "true";
    if (swapped)
    {
        reorderSibling(document.getElementById('canvas'), document.getElementById('generalAnimationControlSection'));
    }

    canvas.width = width;
    canvas.height = height;

    tableEntry = document.createElement("td");
    txtNode = document.createTextNode(" w:");
    tableEntry.appendChild(txtNode);
    controlBar.appendChild(tableEntry);

    widthEntry = addControlToAnimationBar("Text", canvas.width);
    widthEntry.size = 4;
    widthEntry.onkeydown = this.returnSubmit(widthEntry, animationManager.changeSize.bind(animationManager), 4, "OnlyDigit");

    tableEntry = document.createElement("td");
    txtNode = document.createTextNode("       h:");
    tableEntry.appendChild(txtNode);
    controlBar.appendChild(tableEntry);

    heightEntry = addControlToAnimationBar("Text", canvas.height);
    heightEntry.onkeydown = this.returnSubmit(heightEntry, animationManager.changeSize.bind(animationManager), 4, "OnlyDigit");

    // heightEntry.size = 4;
    sizeButton = addControlToAnimationBar("Button", "Change Canvas Size");
    sizeButton.onclick = animationManager.changeSize.bind(animationManager);

    swapButton = addControlToAnimationBar("Button", "Move Controls");
    swapButton.onclick = swapControlDiv;

    animationManager.addListener("AnimationStarted", this, animStarted);
    animationManager.addListener("AnimationEnded", this, this.animEnded);
    animationManager.addListener("AnimationWaiting", this, this.animWaiting);
    animationManager.addListener("AnimationUndoUnavailable", this, this.anumUndoUnavailable);
    objectManager.width = canvas.width;
    objectManager.height = canvas.height;
    return animationManager;
}

function AnimationManager(objectManager)
{
    // Holder for all animated objects.
    // All animation is done by manipulating objects in\
    // this container
    this.animatedObjects = objectManager;

    // Control variables for stopping / starting animation
    this.animationPaused = false;
    this.awaitingStep = false;
    this.currentlyAnimating = false;

    // Array holding the code for the animation.  This is
    // an array of strings, each of which is an animation command
    // currentAnimation is an index into this array
    this.AnimationSteps = [];
    this.currentAnimation = 0;

    this.previousAnimationSteps = [];

    // Control variables for where we are in the current animation block.
    //  currFrame holds the frame number of the current animation block,
    //  while animationBlockLength holds the length of the current animation
    //  block (in frame numbers).
    this.currFrame = 0;
    this.animationBlockLength = 0;

    //  The animation block that is currently running.  Array of singleAnimations
    this.currentBlock = null;

    /////////////////////////////////////
    // Variables for handling undo.
    ////////////////////////////////////
    //  A stack of UndoBlock objects (subclassed, UndoBlock is an abstract base class)
    //  each of which can undo a single animation element
    this.undoStack = [];
    this.doingUndo = false;

    // A stack containing the beginning of each animation block, as an index
    // into the AnimationSteps array
    this.undoAnimationStepIndices = [];
    this.undoAnimationStepIndicesStack = [];

    this.animationBlockLength = 10;

    this.lerp = function(from, to, percent)
    {
        return (to - from) * percent + from;
    }

    // Pause / unpause animation
    this.SetPaused = function(pausedValue)
    {
        this.animationPaused = pausedValue;
        if (!this.animationPaused)
        {
            this.step();
        }
    }

    // Set the speed of the animation, from 0 (slow) to 100 (fast)
    this.SetSpeed = function(newSpeed)
    {
        this.animationBlockLength = Math.floor((100 - newSpeed) / 2);
    }

    this.parseBool = function(str)
    {
        let uppercase = str.toUpperCase();
        let returnVal = !(uppercase == "False" || uppercase == "f" || uppercase == " 0" || uppercase == "0" || uppercase == "");
        return returnVal;
    }

    this.parseColor = function(clr)
    {
        if (clr.charAt(0) == "#")
        {
            return clr;
        }
        else if (clr.substring(0, 2) == "0x")
        {
            return "#" + clr.substring(2);
        }
    }

    this.changeSize = function()
    {
        let width = parseInt(widthEntry.value);
        let height = parseInt(heightEntry.value);

        if (width > 100)
        {
            canvas.width = width;
            this.animatedObjects.width = width;
            setCookie("VisualizationWidth", String(width), 30);
        }
        if (height > 100)
        {
            canvas.height = height;
            this.animatedObjects.height = height;
            setCookie("VisualizationHeight", String(height), 30);
        }
        width.value = canvas.width;
        heightEntry.value = canvas.height;

        this.animatedObjects.draw();
        this.fireEvent("CanvasSizeChanged", {width:canvas.width, height:canvas.height});
    }

    this.startNextBlock = function()
    {
        this.awaitingStep = false;
        this.currentBlock = [];
        let undoBlock = [];
        if (this.currentAnimation == this.AnimationSteps.length)
        {
            this.currentlyAnimating = false;
            this.awaitingStep = false;
            this.fireEvent("AnimationEnded", "NoData");
            clearTimeout(timer);
            this.animatedObjects.update();
            this.animatedObjects.draw();
            return;
        }
        this.undoAnimationStepIndices.push(this.currentAnimation);

        let foundBreak = false;
        let anyAnimations = false;

        while (this.currentAnimation < this.AnimationSteps.length && !foundBreak)
        {
            let nextCommand = this.AnimationSteps[this.currentAnimation].split("<;>");
            if (nextCommand[0].toUpperCase() == "CREATECIRCLE")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);
                args[1] = nextCommand[2];
                args[2] = nextCommand[3] === undefined ? 0 : parseInt(nextCommand[3]);
                args[3] = nextCommand[4] === undefined ? 0 : parseInt(nextCommand[4]);
                args[4] = nextCommand[5] === undefined ? 12 : parseInt(nextCommand[5]);  // fontSize
                args[5] = nextCommand[6] === undefined ? 1 : parseInt(nextCommand[6]);  // lineWidth

                this.animatedObjects.addCircleObject(args[0], args[1], args[4], args[5]);
                this.animatedObjects.setNodePosition(args[0], args[2], args[3]);

                undoBlock.push(new UndoCreate(args[0]));
            }
            else if (nextCommand[0].toUpperCase() == "CONNECT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);
                args[1] = parseInt(nextCommand[2]);
                args[2] = nextCommand[3] === undefined ? "#000000" : this.parseColor(nextCommand[3]);
                args[3] = nextCommand[4] === undefined ? 0.0 : parseFloat(nextCommand[4]);
                args[4] = nextCommand[5] === undefined ? true : this.parseBool(nextCommand[5]);
                args[5] = nextCommand[6] === undefined ? "" : nextCommand[6];
                args[6] = nextCommand[7] === undefined ? 0 : parseInt(nextCommand[7]);

                this.animatedObjects.connectEdge(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);

                undoBlock.push(new UndoConnect(args[0], args[1], false));
            }
            else if (nextCommand[0].toUpperCase() == "CREATERECTANGLE")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = nextCommand[2];  // label
                args[2] = parseInt(nextCommand[3]);  // width
                args[3] = parseInt(nextCommand[4]);  // height
                args[4] = nextCommand[5] === undefined ? 0 : parseInt(nextCommand[5]);  // initial_x
                args[5] = nextCommand[6] === undefined ? 0 : parseInt(nextCommand[6]);  // initial_y
                args[6] = nextCommand[7] === undefined ? "center" : nextCommand[7];  // xJustify
                args[7] = nextCommand[8] === undefined ? "center" : nextCommand[8];  // yJustify
                args[8] = nextCommand[9] === undefined ? "#FFFFFF" : this.parseColor(nextCommand[9]);  // background color
                args[9] = nextCommand[10] === undefined ? "#000000" : this.parseColor(nextCommand[10]);  // foreground color
                args[10] = nextCommand[11] === undefined ? 12 : parseInt(nextCommand[11]);  // fontSize
                args[11] = nextCommand[12] === undefined ? 1 : parseInt(nextCommand[12]);  // lineWidth

                this.animatedObjects.addRectangleObject(args[0], args[1], args[2], args[3], args[6], args[7], args[8], args[9], args[10], args[11]);
                this.animatedObjects.setNodePosition(args[0], args[4], args[5]);

                undoBlock.push(new UndoCreate(args[0]));
            }
            else if (nextCommand[0].toUpperCase() == "MOVE")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // toX
                args[2] = parseInt(nextCommand[3]);  // toY

                let toX = this.animatedObjects.getNodeX(args[0]);
                let toY = this.animatedObjects.getNodeY(args[0]);
                let nextAnim = new SingleAnimation(args[0], toX, toY, args[1], args[2]);

                this.currentBlock.push(nextAnim);

                undoBlock.push(new UndoMove(nextAnim.objectID, nextAnim.toX, nextAnim.toY, nextAnim.fromX, nextAnim.fromY));

                anyAnimations = true;
            }
            else if (nextCommand[0].toUpperCase() == "MOVETOALIGNRIGHT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // otherID

                let oldXY = [this.animatedObjects.getNodeX(args[0]), this.animatedObjects.getNodeY(args[0])];
                let newXY = this.animatedObjects.getAlignRightPos(args[0], args[1]);
                let nextAnim = new SingleAnimation(args[0], oldXY[0], oldXY[1], newXY[0], newXY[1]);

                this.currentBlock.push(nextAnim);

                undoBlock.push(new UndoMove(nextAnim.objectID, nextAnim.toX, nextAnim.toY, nextAnim.fromX, nextAnim.fromY));

                anyAnimations = true;
            }
            else if (nextCommand[0].toUpperCase() == "STEP")
            {
                foundBreak = true;
            }
            else if (nextCommand[0].toUpperCase() == "SETFOREGROUNDCOLOR")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = this.parseColor(nextCommand[2]);  // color

                let oldColor = this.animatedObjects.foregroundColor(args[0]);

                this.animatedObjects.setForegroundColor(args[0], args[1]);

                undoBlock.push(new UndoSetForegroundColor(args[0], oldColor));
            }
            else if (nextCommand[0].toUpperCase() == "SETBACKGROUNDCOLOR")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = this.parseColor(nextCommand[2]);  // color

                let oldColor = this.animatedObjects.backgroundColor(args[0]);

                this.animatedObjects.setBackgroundColor(args[0], args[1]);

                undoBlock.push(new UndoSetBackgroundColor(args[0], oldColor));
            }
            else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = this.parseBool(nextCommand[2]);  // highlightVal

                this.animatedObjects.setHighlight(args[0], args[1]);

                undoBlock.push(new UndoHighlight(args[0], !args[1]));
            }
            else if (nextCommand[0].toUpperCase() == "DISCONNECT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // fromID
                args[1] = parseInt(nextCommand[2]);  // toID

                let undoConnect = this.animatedObjects.disconnect(args[0], args[1]);
                if (undoConnect != null)
                {
                    undoBlock.push(undoConnect);
                }
            }
            else if (nextCommand[0].toUpperCase() == "SETALPHA")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseFloat(nextCommand[2]);  // alphaVal

                let oldAlpha = this.animatedObjects.getAlpha(args[0]);

                this.animatedObjects.setAlpha(args[0], args[1]);

                undoBlock.push(new UndoSetAlpha(args[0], oldAlpha));
            }
            else if (nextCommand[0].toUpperCase() == "SETTEXT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = nextCommand[2];  // newText
                args[2] = nextCommand[3] === undefined ? 0 : parseInt(nextCommand[3]);  // textIndex

                let oldText = this.animatedObjects.getText(args[0], args[2]);

                this.animatedObjects.setText(args[0], args[1], args[2]);
                if (oldText != undefined)
                {
                    undoBlock.push(new UndoSetText(args[0], oldText, args[2]));
                }
            }
            else if (nextCommand[0].toUpperCase() == "DELETE")
            {
                let objectID = parseInt(nextCommand[1]);
                let removedEdges = this.animatedObjects.deleteIncident(objectID);
                if (removedEdges.length > 0)
                {
                    undoBlock = undoBlock.concat(removedEdges);
                }
                let obj = this.animatedObjects.getObject(objectID);
                if (obj != null)
                {
                    undoBlock.push(obj.createUndoDelete());
                    this.animatedObjects.removeObject(objectID);
                }
            }
            else if (nextCommand[0].toUpperCase() == "CREATEHIGHLIGHTCIRCLE")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = this.parseColor(nextCommand[2]);  // color
                args[2] = nextCommand[3] === undefined ? 0 : parseInt(nextCommand[3]);  // initial_x
                args[3] = nextCommand[4] === undefined ? 0 : parseInt(nextCommand[4]);  // initial_y
                args[4] = nextCommand[5] === undefined ? 20 : parseFloat(nextCommand[5]);  // radius

                this.animatedObjects.addHighlightCircleObject(args[0], args[1], args[4]);
                this.animatedObjects.setNodePosition(args[0], args[2], args[3]);

                undoBlock.push(new UndoCreate(args[0]));
            }
            else if (nextCommand[0].toUpperCase() == "CREATELABEL")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = nextCommand[2];  // label
                args[2] = nextCommand[3] === undefined ? 0 : parseInt(nextCommand[3]);  // initial_x
                args[3] = nextCommand[4] === undefined ? 0 : parseInt(nextCommand[4]);  // initial_y
                args[4] = nextCommand[5] === undefined ? true : this.parseBool(nextCommand[5]);  // centered
                args[5] = nextCommand[6] === undefined ? 12 : parseInt(nextCommand[6]);  // fontSize

                this.animatedObjects.addLabelObject(args[0], args[1], args[4], args[5]);
                this.animatedObjects.setNodePosition(args[0], args[2], args[3]);

                undoBlock.push(new UndoCreate(args[0]));
            }
            else if (nextCommand[0].toUpperCase() == "SETEDGECOLOR")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // fromID
                args[1] = parseInt(nextCommand[2]);  // toID
                args[2] = this.parseColor(nextCommand[3]);  // newColor

                let oldColor = this.animatedObjects.setEdgeColor(args[0], args[1], args[2]);

                undoBlock.push(new UndoSetEdgeColor(args[0], args[1], oldColor));
            }
            else if (nextCommand[0].toUpperCase() == "SETEDGEALPHA")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // fromID
                args[1] = parseInt(nextCommand[2]);  // toID
                args[2] = parseFloat(nextCommand[3]);  // alphaVal

                let oldAlpha = this.animatedObjects.setEdgeAlpha(args[0], args[1], args[2]);

                undoBlock.push(new UndoSetEdgeAlpha(args[0], args[1], oldAlpha));
            }
            else if (nextCommand[0].toUpperCase() == "SETEDGEHIGHLIGHT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // fromID
                args[1] = parseInt(nextCommand[2]);  // toID
                args[2] = this.parseBool(nextCommand[3]);  // highlightVal

                let oldHighlight = this.animatedObjects.setEdgeHighlight(args[0], args[1], args[2]);

                undoBlock.push(new UndoHighlightEdge(args[0], args[1], oldHighlight));
            }
            else if (nextCommand[0].toUpperCase() == "SETHEIGHT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // newHeight

                let oldHeight = this.animatedObjects.getHeight(args[0]);
                this.animatedObjects.setHeight(args[0], args[1]);

                undoBlock.push(new UndoSetHeight(args[0], oldHeight));
            }
            else if (nextCommand[0].toUpperCase() == "SETLAYER")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // newLayer

                this.animatedObjects.setLayer(args[0], args[1]);
                //TODO: Add undo information here
            }
            else if (nextCommand[0].toUpperCase() == "CREATELINKEDLIST")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = nextCommand[2];  // label
                args[2] = parseInt(nextCommand[3]);  // width
                args[3] = parseInt(nextCommand[4]);  // height
                args[4] = nextCommand[5] === undefined ? 0 : parseInt(nextCommand[5]);  // initial_x
                args[5] = nextCommand[6] === undefined ? 0 : parseInt(nextCommand[6]);  // initial_y
                args[6] = nextCommand[7] === undefined ? 0.25 : parseFloat(nextCommand[7]);  // linkPercent
                args[7] = nextCommand[8] === undefined ? true : this.parseBool(nextCommand[8]);  // verticalOrientation
                args[8] = nextCommand[9] === undefined ? false : this.parseBool(nextCommand[9]);  // linkPosEnd
                args[9] = nextCommand[10] === undefined ? 1 : parseInt(nextCommand[10]);  // numLabels
                args[10] = nextCommand[11] === undefined ? "#FFFFFF" : this.parseColor(parseInt(nextCommand[11]));  // backgroundColor
                args[11] = nextCommand[12] === undefined ? "#000000" : this.parseColor(parseInt(nextCommand[12]));  // foregroundColor

                this.animatedObjects.addLinkedListObject(args[0], args[1], args[2], args[3], args[6], args[7], args[8], args[9], args[10], args[11]);
                this.animatedObjects.setNodePosition(args[0], args[4], args[5]);

                undoBlock.push(new UndoCreate(args[0]));
            }
            else if (nextCommand[0].toUpperCase() == "SETNULL")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = this.parseBool(nextCommand[2]);  // nullValue

                let oldNull = this.animatedObjects.getNull(args[0]);

                this.animatedObjects.setNull(args[0], args[1]);

                undoBlock.push(new UndoSetNull(args[0], oldNull));
            }
            else if (nextCommand[0].toUpperCase() == "SETTEXTCOLOR")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = this.parseColor(nextCommand[2]);  // newColor
                args[2] = nextCommand[3] === undefined ? 0 : parseInt(nextCommand[3]);  // textIndex

                let oldColor = this.animatedObjects.getTextColor(args[0], args[2]);

                this.animatedObjects.setTextColor(args[0], args[1], args[2]);

                undoBlock.push(new UndoSetTextColor(args[0], oldColor, args[2]));
            }
            else if (nextCommand[0].toUpperCase() == "CREATEBTREENODE")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // widthPerLabel
                args[2] = parseInt(nextCommand[3]);  // height
                args[3] = parseInt(nextCommand[4]);  // numLabels
                args[4] = nextCommand[5] === undefined ? 0 : parseInt(nextCommand[5]);  // initial_x
                args[5] = nextCommand[6] === undefined ? 0 : parseInt(nextCommand[6]);  // initial_y
                args[6] = nextCommand[7] === undefined ? "#FFFFFF" : this.parseColor(nextCommand[7]);  // backgroundColor
                args[7] = nextCommand[8] === undefined ? "#000000" : this.parseColor(nextCommand[8]);  // foregroundColor

                this.animatedObjects.addBTreeNode(args[0], args[1], args[2], args[3], args[6], args[7]);
                this.animatedObjects.setNodePosition(args[0], args[4], args[5]);

                undoBlock.push(new UndoCreate(args[0]));
            }
            else if (nextCommand[0].toUpperCase() == "SETWIDTH")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // newWidth

                let oldWidth = this.animatedObjects.getWidth(args[0]);

                this.animatedObjects.setWidth(args[0], args[1]);

                undoBlock.push(new UndoSetWidth(args[0], oldWidth));
            }
            else if (nextCommand[0].toUpperCase() == "SETNUMELEMENTS")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // numElements

                let oldElem = this.animatedObjects.getObject(args[0]);

                undoBlock.push(new UndoSetNumElements(oldElem, args[1]));

                this.animatedObjects.setNumElements(args[0], args[1]);
            }
            else if (nextCommand[0].toUpperCase() == "SETPOSITION")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // objectID
                args[1] = parseInt(nextCommand[2]);  // toX
                args[2] = parseInt(nextCommand[3]);  // toY

                let oldX = this.animatedObjects.getNodeX(args[0]);
                let oldY = this.animatedObjects.getNodeY(args[0]);

                undoBlock.push(new UndoSetPosition(args[0], oldX, oldY));

                this.animatedObjects.setNodePosition(args[0], args[1], args[2]);
            }
            else if (nextCommand[0].toUpperCase() == "ALIGNRIGHT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // object1ID
                args[1] = parseInt(nextCommand[2]);  // object2ID

                let oldX = this.animatedObjects.getNodeX(args[0]);
                let oldY = this.animatedObjects.getNodeY(args[0]);

                undoBlock.push(new UndoSetPosition(args[0], oldX, oldY));

                this.animatedObjects.alignRight(args[0], args[1]);
            }
            else if (nextCommand[0].toUpperCase() == "ALIGNLEFT")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // object1ID
                args[1] = parseInt(nextCommand[2]);  // object2ID

                let oldX = this.animatedObjects.getNodeX(args[0]);
                let oldY = this.animatedObjects.getNodeY(args[0]);

                undoBlock.push(new UndoSetPosition(args[0], oldX, oldY));

                this.animatedObjects.alignLeft(args[0], args[1]);
            }
            else if (nextCommand[0].toUpperCase() == "ALIGNTOP")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // object1ID
                args[1] = parseInt(nextCommand[2]);  // object2ID

                let oldX = this.animatedObjects.getNodeX(args[0]);
                let oldY = this.animatedObjects.getNodeY(args[0]);

                undoBlock.push(new UndoSetPosition(args[0], oldX, oldY));

                this.animatedObjects.alignTop(args[0], args[1]);
            }
            else if (nextCommand[0].toUpperCase() == "ALIGNBOTTOM")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // object1ID
                args[1] = parseInt(nextCommand[2]);  // object2ID

                let oldX = this.animatedObjects.getNodeX(args[0]);
                let oldY = this.animatedObjects.getNodeY(args[0]);

                undoBlock.push(new UndoSetPosition(args[0], oldX, oldY));

                this.animatedObjects.alignBottom(args[0], args[1]);
            }
            else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHTINDEX")
            {
                let args = [];
                args[0] = parseInt(nextCommand[1]);  // object1ID
                args[1] = parseInt(nextCommand[2]);  // newIndex

                let oldIndex = this.animatedObjects.getHighlightIndex(args[0]);

                undoBlock.push(new UndoSetHighlightIndex(args[0], oldIndex));

                this.animatedObjects.setHighlightIndex(args[0], args[1]);
            }
            else
            {
                // throw "Unknown command: " + nextCommand[0];
            }

            this.currentAnimation = this.currentAnimation + 1;
        }
        this.currFrame = 0;

        // Hack:  If there are not any animations, and we are currently paused,
        // then set the current frame to the end of the animation, so that we will
        // advance immediately upon the next step button.  If we are not paused, then
        // animate as normal.

        if (!anyAnimations && this.animationPaused || (!anyAnimations && this.currentAnimation == this.AnimationSteps.length))
        {
            this.currFrame = this.animationBlockLength;
        }

        this.undoStack.push(undoBlock);
    }

    //  Start a new animation.  The input parameter commands is an array of strings,
    //  which represents the animation to start
    this.StartNewAnimation = function(commands)
    {
        clearTimeout(timer);
        if (this.AnimationSteps != null)
        {
            this.previousAnimationSteps.push(this.AnimationSteps);
            this.undoAnimationStepIndicesStack.push(this.undoAnimationStepIndices);
        }
        if (commands == undefined || commands.length == 0)
        {
            this.AnimationSteps = ["Step"];
        }
        else
        {
            this.AnimationSteps = commands;
        }
        this.undoAnimationStepIndices = new Array();
        this.currentAnimation = 0;
        this.startNextBlock();
        this.currentlyAnimating = true;
        this.fireEvent("AnimationStarted", "NoData");
        timer = setTimeout('timeout()', 30);
    }

    // Step backwards one step.  A no-op if the animation is not currently paused
    this.stepBack = function()
    {
        if (this.awaitingStep && this.undoStack != null && this.undoStack.length != 0)
        {
            //  TODO:  Get events working correctly!
            this.fireEvent("AnimationStarted", "NoData");
            clearTimeout(timer);

            this.awaitingStep = false;
            this.undoLastBlock();
            // Re-kick the timer.  The timer may or may not be running at this point,
            // so to be safe we'll kill it and start it again.
            clearTimeout(timer);
            timer = setTimeout('timeout()', 30);
        }
        else if (!this.currentlyAnimating && this.animationPaused && this.undoAnimationStepIndices != null)
        {
            this.fireEvent("AnimationStarted", "NoData");
            this.currentlyAnimating = true;
            this.undoLastBlock();
            // Re-kick the timer.  The timer may or may not be running at this point,
            // so to be safe we'll kill it and start it again.
            clearTimeout(timer);
            timer = setTimeout('timeout()', 30);
        }
    }
    // Step forwards one step.  A no-op if the animation is not currently paused
    this.step = function()
    {
        if (this.awaitingStep)
        {
            this.startNextBlock();
            this.fireEvent("AnimationStarted", "NoData");
            this.currentlyAnimating = true;
            // Re-kick the timer.  The timer should be going now, but we've had some difficulty with
            // it timing itself out, so we'll be safe and kick it now.
            clearTimeout(timer);
            timer = setTimeout('timeout()', 30);
        }
    }

    /// WARNING:  Could be dangerous to call while an animation is running ...
    this.clearHistory = function()
    {
        this.undoStack = [];
        this.undoAnimationStepIndices = null;
        this.previousAnimationSteps = [];
        this.undoAnimationStepIndicesStack = [];
        this.AnimationSteps = null;
        this.fireEvent("AnimationUndoUnavailable", "NoData");
        clearTimeout(timer);
        this.animatedObjects.update();
        this.animatedObjects.draw();
    }

    this.skipBack = function()
    {
        let keepUndoing = this.undoAnimationStepIndices != null && this. undoAnimationStepIndices.length != 0;
        if (keepUndoing)
        {
            for (let i = 0; this.currentBlock != null && i < this.currentBlock.length; ++i)
            {
                let objectID = this.currentBlock[i].objectID;
                this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
            }
            if (this.doingUndo)
            {
                this.finishUndoBlock(this.undoStack.pop());
            }
            while (keepUndoing)
            {
                this.undoLastBlock();
                for (let i = 0; i < this.currentBlock.length; ++i)
                {
                    objectID = this.currentBlock[i].objectID;
                    this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
                }
                keepUndoing = this.finishUndoBlock(this.undoStack.pop());
            }
            clearTimeout(timer);
            this.animatedObjects.update();
            this.animatedObjects.draw();
            if (this.undoStack == null || this.undoStack.length == 0)
            {
                this.fireEvent("AnimationUndoUnavailable", "NoData");
            }
        }
    }

    this.resetAll = function()
    {
        this.clearHistory();
        this.animatedObjects.clearAllObjects();
        this.animatedObjects.draw();
        clearTimeout(timer);
    }

    this.skipForward = function()
    {
        if (this.currentlyAnimating)
        {
            this.animatedObjects.runFast = true;
            while (this.AnimationSteps != null && this.currentAnimation < this.AnimationSteps.length)
            {
                for (let i = 0; this.currentBlock != null && i < this.currentBlock.length; ++i)
                {
                    let objectID = this.currentBlock[i].objectID;
                    this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
                }
                if (this.doingUndo)
                {
                    this.finishUndoBlock(this.undoStack.pop());
                }
                this.startNextBlock();
                for (let i = 0; i < this.currentBlock.length; ++i)
                {
                    let objectID = this.currentBlock[i].objectID;
                    this.animatedObjects.setNodePosition(objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
                }
            }
            this.animatedObjects.update();
            this.currentlyAnimating = false;
            this.awaitingStep = false;
            this.doingUndo = false;
            this.animatedObjects.runFast = false;
            this.fireEvent("AnimationEnded", "NoData");
            clearTimeout(timer);
            this.animatedObjects.update();
            this.animatedObjects.draw();
        }
    }

    this.finishUndoBlock = function(undoBlock)
    {
        for (let i = undoBlock.length - 1; i >= 0; i--)
        {
            undoBlock[i].undoInitialStep(this.animatedObjects);
        }
        this.doingUndo = false;

        // If we are at the final end of the animation ...
        if (this.undoAnimationStepIndices.length == 0)
        {
            this.awaitingStep = false;
            this.currentlyAnimating = false;
            this.undoAnimationStepIndices = this.undoAnimationStepIndicesStack.pop();
            this.AnimationSteps = this.previousAnimationSteps.pop();
            this.fireEvent("AnimationEnded", "NoData");
            this.fireEvent("AnimationUndo", "NoData");
            this.currentBlock = [];
            if (this.undoStack == null || this.undoStack.length == 0)
            {
                this.currentlyAnimating = false;
                this.awaitingStep = false;
                this.fireEvent("AnimationUndoUnavailable", "NoData");
            }

            clearTimeout(timer);
            this.animatedObjects.update();
            this.animatedObjects.draw();

            return false;
        }
        return true;
    }

    this.undoLastBlock = function()
    {
        if (this.undoAnimationStepIndices.length == 0)
        {
            // Nothing on the undo stack.  Return
            return;
        }
        if (this.undoAnimationStepIndices.length > 0)
        {
            this.doingUndo = true;
            let anyAnimations = false;
            this.currentAnimation = this.undoAnimationStepIndices.pop();
            this.currentBlock = [];
            let undo = this.undoStack[this.undoStack.length - 1];
            for (let i = undo.length - 1; i >= 0; i--)
            {
                let animateNext = undo[i].addUndoAnimation(this.currentBlock);
                anyAnimations = anyAnimations || animateNext;
            }
            this.currFrame = 0;

            // Hack:  If there are not any animations, and we are currently paused,
            // then set the current frame to the end of the animation, so that we will
            // advance immediately upon the next step button.  If we are not paused, then
            // animate as normal.
            if (!anyAnimations && this.animationPaused)
            {
                this.currFrame = this.animationBlockLength;
            }
            this.currentlyAnimating = true;
        }
    }
    this.setLayer = function(shown, layers)
    {
        this.animatedObjects.setLayer(shown, layers);
        // Drop in an extra draw call here, just in case we are not
        // in the middle of an update loop when this changes
        this.animatedObjects.draw();
    }

    this.setAllLayers = function(layers)
    {
        this.animatedObjects.setAllLayers(layers);
        // Drop in an extra draw call here, just in case we are not
        // in the middle of an update loop when this changes
        this.animatedObjects.draw();
    }

    this.update = function()
    {
        if (this.currentlyAnimating)
        {
            this.currFrame = this.currFrame + 1;
            for (let i = 0; i < this.currentBlock.length; ++i)
            {
                if (this.currFrame == this.animationBlockLength || (this.currFrame == 1 && this.animationBlockLength == 0))
                {
                    this.animatedObjects.setNodePosition(this.currentBlock[i].objectID, this.currentBlock[i].toX, this.currentBlock[i].toY);
                }
                else if (this.currFrame < this.animationBlockLength)
                {
                    let objectID = this.currentBlock[i].objectID;
                    let percent = 1 / (this.animationBlockLength - this.currFrame);
                    let oldX = this.animatedObjects.getNodeX(objectID);
                    let oldY = this.animatedObjects.getNodeY(objectID);
                    let targetX = this.currentBlock[i].toX;
                    let targetY = this.currentBlock[i].toY;
                    let newX = this.lerp(this.animatedObjects.getNodeX(objectID), this.currentBlock[i].toX, percent);
                    let newY = this.lerp(this.animatedObjects.getNodeY(objectID), this.currentBlock[i].toY, percent);
                    this.animatedObjects.setNodePosition(objectID, newX, newY);
                }
            }
            if (this.currFrame >= this.animationBlockLength)
            {
                if (this.doingUndo)
                {
                    if (this.finishUndoBlock(this.undoStack.pop()))
                    {
                        this.awaitingStep = true;
                        this.fireEvent("AnimationWaiting", "NoData");
                    }
                }
                else
                {
                    if (this.animationPaused && (this.currentAnimation < this.AnimationSteps.length))
                    {
                        this.awaitingStep = true;
                        this.fireEvent("AnimationWaiting", "NoData");
                        this.currentBlock = [];
                    }
                    else
                    {
                        this.startNextBlock();
                    }
                }
            }
            this.animatedObjects.update();
        }
    }
}

AnimationManager.prototype = new EventListener();
AnimationManager.prototype.constructor = AnimationManager;

function SingleAnimation(id, fromX, fromY, toX, toY)
{
    this.objectID = id;
    this.fromX = fromX;
    this.fromY = fromY;
    this.toX = toX;
    this.toY = toY;
}
