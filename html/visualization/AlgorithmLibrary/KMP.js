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
const ARRAY_START_Y = 30;
const MAX_LENGTH = 22;
const FAILURE_TABLE_START_Y = 100;

function KMP(am, w, h)
{
    this.init(am, w, h);
}

KMP.prototype = new Algorithm();
KMP.prototype.constructor = KMP;
KMP.superclass = Algorithm.prototype;

KMP.prototype.init = function(am, w, h)
{
    KMP.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

KMP.prototype.addControls = function()
{
    this.controls = [];

    addLabelToAlgorithmBar("String");
    this.stringField = addControlToAlgorithmBar("Text", "");
    this.stringField.onkeydown = this.returnSubmit(this.stringField, this.findCallback.bind(this), MAX_LENGTH, "OnlyLetter");
    this.controls.push(this.stringField);

    addLabelToAlgorithmBar("Pattern");
    this.patternField = addControlToAlgorithmBar("Text", "");
    this.patternField.onkeydown = this.returnSubmit(this.patternField, this.findCallback.bind(this), MAX_LENGTH, "OnlyLetter");
    this.controls.push(this.patternField);

    this.findButton = addControlToAlgorithmBar("Button", "Find");
    this.findButton.onclick = this.findCallback.bind(this);
    this.controls.push(this.findButton);
    addLabelToAlgorithmBar("or");
    this.bftButton = addControlToAlgorithmBar("Button", "Build Failure Table");
    this.bftButton.onclick = this.buildFailureTableCallback.bind(this);
    this.controls.push(this.bftButton);

    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

KMP.prototype.enableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

KMP.prototype.disableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

KMP.prototype.setup = function()
{
    this.ctrlIDs = [];
    this.textRowID = [];
    this.comparisonMatrixID = [];
    this.failureTableCharacterID = [];
    this.failureTableValueID = [];

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

KMP.prototype.reset = function()
{
    this.textRowID = [];
    this.comparisonMatrixID = [];
    this.failureTableCharacterID = [];
    this.failureTableValueID = [];

    for (let i = 0; i < this.ctrlIDs.length; ++i)
    {
        this.cmd("Delete", this.ctrlIDs[i]);
    }

    this.ctrlIDs = [];
    this.nextIndex = this.initialIndex;
}

KMP.prototype.findCallback = function(event)
{
    if (this.stringField.value != "" &&
        this.patternField.value != "" &&
        this.stringField.value.length >= this.patternField.value.length)
    {
        let stringVal = this.stringField.value;
        let patternVal = this.patternField.value;
        this.stringField.value = "";
        this.patternField.value = "";
        this.implementAction(this.find.bind(this), stringVal, patternVal);
    }
}

KMP.prototype.buildFailureTableCallback = function() {
    if (this.patternField.value !== "")
    {
        let patternVal = this.patternField.value;
        this.patternField.value = "";
        this.implementAction(this.onlyBuildFailureTable.bind(this), 0, patternVal);
    }
}

KMP.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearData.bind(this), "");
}

KMP.prototype.clearData = function(ignored)
{
    this.commands = [];
    this.clearAll();
    return this.commands;
}

KMP.prototype.find = function(str, pattern)
{
    this.commands = [];

    this.reset();

    const maxRows = this.getMaxRows(str, pattern);
    if (maxRows <= 10)
    {
        this.cellSize = 35;
        this.fontSize = 18;
    }
    else if (maxRows <= 14)
    {
        this.cellSize = 30;
        this.fontSize = 16;
    }
    else if (maxRows <= 17)
    {
        this.cellSize = 25;
        this.fontSize = 14;
    }
    else
    {
        this.cellSize = 20;
        this.fontSize = 12;
    }

    this.textRowID = new Array(str.length);
    this.comparisonMatrixID = new Array(maxRows);
    for (let i = 0; i < maxRows; ++i)
    {
        this.comparisonMatrixID[i] = new Array(str.length);
    }

    let xpos = 0;
    let ypos = 0;
    for (let i = 0; i < str.length; ++i)
    {
        xpos = i * this.cellSize + ARRAY_START_X;
        ypos = ARRAY_START_Y;
        this.textRowID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.textRowID[i]);
        this.cmd("CreateRectangle", this.textRowID[i], str.charAt(i), this.cellSize, this.cellSize, xpos, ypos, "center", "center", "#FFFFFF", "#000000", this.fontSize);
        this.cmd("SetBackgroundColor", this.textRowID[i], "#D3D3D3");
    }

    for (let row = 0; row < maxRows; ++row)
    {
        for (let col = 0; col < str.length; ++col)
        {
            xpos = col * this.cellSize + ARRAY_START_X;
            ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.comparisonMatrixID[row][col] = this.nextIndex++;
            this.ctrlIDs.push(this.comparisonMatrixID[row][col]);
            this.cmd("CreateRectangle", this.comparisonMatrixID[row][col], "", this.cellSize, this.cellSize, xpos, ypos, "center", "center", "#FFFFFF", "#000000", this.fontSize);
        }
    }

    const failureTable = this.buildFailureTable(str.length, pattern);
    const iPointerID = this.nextIndex++;
    const jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", ARRAY_START_X, ARRAY_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, "#0000FF", ARRAY_START_X, ARRAY_START_Y + this.cellSize, this.cellSize / 2);

    let i = 0;
    let j = 0;
    let row = 0;
    while (i <= str.length - pattern.length)
    {
        for (let k = i; k < i + pattern.length; k++)
        {
            this.cmd("SetText", this.comparisonMatrixID[row][k], pattern.charAt(k - i), xpos, ypos);
            if (k - i < j)
            {
                this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][k], "#FFFF4D");
            }
        }
        this.cmd("Step");
        while (j < pattern.length && pattern.charAt(j) === str.charAt(i + j))
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#2ECC71");
            j++;
            this.cmd("Step");
            if (j < pattern.length)
            {
                xpos = (i + j) * this.cellSize + ARRAY_START_X;
                this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
                ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
                this.cmd("Move", jPointerID, xpos, ypos);
                this.cmd("Step");
            }
        }
        if (j === 0)
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i], "#E74C3C");
            i++;
        }
        else
        {
            if (j !== pattern.length)
            {
                this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#E74C3C");
            }
            const nextAlignment = failureTable[j - 1];
            i += j - nextAlignment;
            j = nextAlignment;
        }
        row++;
        if (i <= str.length - pattern.length)
        {
            xpos = (i + j) * this.cellSize + ARRAY_START_X;
            this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
            ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.cmd("Move", jPointerID, xpos, ypos);
            this.cmd("Step");
        }
    }

    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);

    return this.commands;
}

KMP.prototype.getMaxRows = function(str, pattern)
{
    const failureTable = [];
    failureTable[0] = 0;
    let i = 0;
    let j = 1;
    while (j < pattern.length)
    {
        if (pattern.charAt(i) === pattern.charAt(j))
        {
            i++;
            failureTable[j] = i;
            j++;
        }
        else
        {
            if (i === 0)
            {
                failureTable[j] = i;
                j++;
            }
            else
            {
                i = failureTable[i - 1];
            }
        }
    }
    i = 0;
    j = 0;
    let maxRows = 0;
    while (i <= str.length - pattern.length)
    {
        while (j < pattern.length && pattern.charAt(j) === str.charAt(i + j))
        {
            j++;
        }
        if (j === 0)
        {
            i++;
        }
        else
        {
            const nextAlignment = failureTable[j - 1];
            i += j - nextAlignment;
            j = nextAlignment;
        }
        maxRows++;
    }
    return maxRows;
}

KMP.prototype.onlyBuildFailureTable = function(strLength, pattern)
{
    this.commands = [];
    this.reset();
    this.cellSize = 30;
    this.buildFailureTable(strLength, pattern);
    return this.commands;
}

KMP.prototype.buildFailureTable = function(strLength, pattern)
{
    // Display label
    const labelX = ARRAY_START_X + strLength * this.cellSize + 10;
    this.failureTableLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.failureTableLabelID);
    this.cmd("CreateLabel", this.failureTableLabelID, "Failure table:", labelX, FAILURE_TABLE_START_Y + 10, 0);

    // Display empty failure table
    const tableStartX = ARRAY_START_X + strLength * this.cellSize + 110;
    this.failureTableCharacterID = new Array(pattern.length);
    this.failureTableValueID = new Array(pattern.length);
    for (let i = 0; i < pattern.length; ++i)
    {
        const xpos = tableStartX + i * this.cellSize;
        this.failureTableCharacterID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.failureTableCharacterID[i]);
        this.cmd("CreateRectangle", this.failureTableCharacterID[i], pattern.charAt(i), this.cellSize, this.cellSize, xpos, FAILURE_TABLE_START_Y);
        this.cmd("SetBackgroundColor", this.failureTableCharacterID[i], "#D3D3D3");
        this.failureTableValueID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.failureTableValueID[i]);
        this.cmd("CreateRectangle", this.failureTableValueID[i], "", this.cellSize, this.cellSize, xpos, FAILURE_TABLE_START_Y + this.cellSize);
    }
    this.cmd("Step");

    // Display pointers and set first value to 0
    const iPointerID = this.nextIndex++;
    const jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", tableStartX, FAILURE_TABLE_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, "#FF0000", tableStartX + this.cellSize, FAILURE_TABLE_START_Y, this.cellSize / 2);
    this.cmd("SetText", this.failureTableValueID[0], 0);
    this.cmd("Step");

    const failureTable = [];
    failureTable[0] = 0;
    let i = 0;
    let j = 1;
    while (j < pattern.length)
    {
        if (pattern.charAt(i) === pattern.charAt(j))
        {
            i++;
            failureTable[j] = i;
            this.cmd("SetText", this.failureTableValueID[j], i);
            j++;
            if (j < pattern.length)
            {
                this.cmd("Move", iPointerID, tableStartX + i * this.cellSize, FAILURE_TABLE_START_Y);
                this.cmd("Move", jPointerID, tableStartX + j * this.cellSize, FAILURE_TABLE_START_Y);
            }
            this.cmd("Step");
        }
        else
        {
            if (i === 0)
            {
                failureTable[j] = i;
                this.cmd("SetText", this.failureTableValueID[j], i);
                j++;
                if (j < pattern.length)
                {
                    this.cmd("Move", jPointerID, tableStartX + j * this.cellSize, FAILURE_TABLE_START_Y);
                }
                this.cmd("Step");
            }
            else
            {
                i = failureTable[i - 1];
                this.cmd("Move", iPointerID, tableStartX + i * this.cellSize, FAILURE_TABLE_START_Y);
                this.cmd("Step");
            }
        }
    }

    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);

    return failureTable;
}

KMP.prototype.clearAll = function()
{
    this.commands = [];
    this.reset();
    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new KMP(animMgr, canvas.width, canvas.height);
}
