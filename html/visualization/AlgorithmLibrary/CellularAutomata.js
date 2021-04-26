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


const ARRAY_START_X = 100;
const ARRAY_START_Y = 50;
const ARRAY_ELEM_WIDTH = 40;
const ARRAY_ELEM_HEIGHT = 40;
const ARRAY_LINE_SPACING = 130;
const ARRAY_MIN_SIZE = 5;
const ARRAY_MAX_SIZE = 15;
const ARRAY_START_ROW_LAB = 15;
const ARRAY_START_COL_LAB = 65;

const GENERATIONS = 4;
const FILL_CHANCE = 0.55;

const SHOW_RED_COLOR = "#C93756";
const SHOW_BLUE_COLOR = "#87CEEB";
const SHOW_BLACK_COLOR = "#000000";
const SHOW_WHITE_COLOR = "#FFFFFF";
const SHOW_GRAY_COLOR = "#808080";

function CellularAutomata(am, w, h)
{
    this.init(am, w, h);
}

CellularAutomata.prototype = new Algorithm();
CellularAutomata.prototype.constructor = CellularAutomata;
CellularAutomata.superclass = Algorithm.prototype;

CellularAutomata.prototype.init = function(am, w, h)
{
    CellularAutomata.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

CellularAutomata.prototype.addControls = function()
{
    this.controls = [];

    addLabelToAlgorithmBar("Size (5 ~ 15):");
    this.sizeField = addControlToAlgorithmBar("Text", "", "10");
    this.sizeField.onkeydown = this.returnSubmit(this.sizeField, this.playCallback.bind(this), 2, "OnlyDigit");
    this.controls.push(this.sizeField);

    this.playButton = addControlToAlgorithmBar("Button", "Play");
    this.playButton.onclick = this.playCallback.bind(this);
    this.controls.push(this.playButton);

    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

CellularAutomata.prototype.enableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

CellularAutomata.prototype.disableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

CellularAutomata.prototype.setup = function()
{
    this.ctrlIDs = [];
    this.G = [];
    this.nextG = [];

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

CellularAutomata.prototype.reset = function()
{
    this.G = [];
    this.nextG = [];

    for (let i = 0; i < this.ctrlIDs.length; ++i)
    {
        this.cmd("Delete", this.ctrlIDs[i]);
    }

    this.ctrlIDs = [];
    this.nextIndex = this.initialIndex;
}

CellularAutomata.prototype.playCallback = function(event)
{
    if (this.sizeField.value != "")
    {
        let sizeVal = this.sizeField.value;
        this.sizeField.value = "";
        if (sizeVal >= ARRAY_MIN_SIZE && sizeVal <= ARRAY_MAX_SIZE)
        {
            this.implementAction(this.play.bind(this), sizeVal);
        }
    }
}

CellularAutomata.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearAll.bind(this), "");
}

CellularAutomata.prototype.play = function(gridSize)
{
    this.commands = [];

    this.reset();

    for (let i = 0; i < gridSize; ++i)
    {
        this.G[i] = [];
        this.nextG[i] = [];
        for (let j = 0; j < gridSize; j++)
        {
            if (Math.random() < FILL_CHANCE || i === 0 || j === 0 || i === gridSize - 1 || j === gridSize - 1)
            {
                this.G[i][j] = '#';
            }
            else
            {
                this.G[i][j] = '.';
            }
            this.nextG[i][j] = '#';
        }
    }

    this.arrayID = [];
    this.arrayRowLabelID = [];
    this.arrayColLabelID = [];
    for (let i = 0; i < gridSize; ++i)
    {
        this.arrayID[i] = [];
        this.arrayRowLabelID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.arrayRowLabelID[i]);
        this.arrayColLabelID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.arrayColLabelID[i]);
        let xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        let yPos = ARRAY_START_ROW_LAB;
        this.cmd("CreateLabel", this.arrayRowLabelID[i], i, xPos, yPos, true, 14);
        xPos = ARRAY_START_COL_LAB;
        yPos = i * ARRAY_ELEM_HEIGHT + ARRAY_START_Y;
        this.cmd("CreateLabel", this.arrayColLabelID[i], i, xPos, yPos, true, 14);
        for (let j = 0; j < gridSize; ++j)
        {
            this.arrayID[i][j] = this.nextIndex++;
            this.ctrlIDs.push(this.arrayID[i][j]);
            xPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
            yPos = i * ARRAY_ELEM_HEIGHT + ARRAY_START_Y;
            if (this.G[i][j] === '#')
            {
                this.cmd("CreateRectangle", this.arrayID[i][j], this.G[i][j], ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xPos, yPos, "center", "center", SHOW_RED_COLOR, SHOW_WHITE_COLOR, 18);
            }
            else
            {
                this.cmd("CreateRectangle", this.arrayID[i][j], this.G[i][j], ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xPos, yPos, "center", "center", SHOW_GRAY_COLOR, SHOW_WHITE_COLOR, 18);
            }
        }
    }

    for (let it = 0; it < GENERATIONS; ++it) {
        this.CA('#', '.');
    }

    return this.commands;
}

CellularAutomata.prototype.CA = function(fillShape, emptyShape) {
    let nextGrid = [];

    for (let i = 0; i < this.G.length; ++i)
    {
        nextGrid[i] = [];
        for (let j = 0; j < this.G[i].length; ++j)
        {
            let adjCount = 0;
            let twoAwayCount = 0;
            // look at the states of the neighboring cells
            for (let x = -2; x <= 2; ++x)
            {
                for (let y = -2; y <= 2; ++y)
                {
                    if ((i + x >= 0 && i + x < this.G.length) && (j + y >= 0 && j + y < this.G[i].length))
                    {
                        if (!(x !== 0 && y !== 0) && this.G[i + x][j + y] === emptyShape)
                        {
                            if (x === -2 || x === 2 || y === -2 || y === 2)
                            {
                                twoAwayCount++;
                            }
                            else
                            {
                                adjCount++;
                            }
                        }
                    }
                }
            }

            // change the current cell's state according to these rules
            if (adjCount >= 5)
            {
                nextGrid[i][j] = fillShape;
            }
            else if (adjCount <= 1)
            {
                if (twoAwayCount < 3)
                {
                    nextGrid[i][j] = fillShape;
                }
                else
                {
                    nextGrid[i][j] = emptyShape;
                }
            }
            else
            {
                nextGrid[i][j] = emptyShape;
            }
        }
    }

    for (let i = 0; i < nextGrid.length; ++i)
    {
        for (let j = 0; j < nextGrid[i].length; ++j)
        {
            this.cmd("SetBackgroundColor", this.arrayID[i][j], SHOW_BLUE_COLOR);
            this.cmd("SetText", this.arrayID[i][j], this.G[i][j]);
            this.cmd("Step");

            this.G[i][j] = nextGrid[i][j];
            if (this.G[i][j] === fillShape)
            {
                this.cmd("SetText", this.arrayID[i][j], this.G[i][j]);
                this.cmd("SetBackgroundColor", this.arrayID[i][j], SHOW_RED_COLOR);
            }
            else
            {
                this.cmd("SetText", this.arrayID[i][j], this.G[i][j]);
                this.cmd("SetBackgroundColor", this.arrayID[i][j], SHOW_GRAY_COLOR);
            }
        }
    }
}

CellularAutomata.prototype.clearAll = function()
{
    this.commands = [];
    this.reset();
    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new CellularAutomata(animMgr, canvas.width, canvas.height);
}
