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
const MAX_LENGTH = 25;

function BF(am, w, h)
{
    this.init(am, w, h);
}

BF.prototype = new Algorithm();
BF.prototype.constructor = BF;
BF.superclass = Algorithm.prototype;

BF.prototype.init = function(am, w, h)
{
    BF.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

BF.prototype.addControls = function()
{
    this.controls = [];

    addLabelToAlgorithmBar("String");
    this.stringField = addControlToAlgorithmBar("Text", "");
    this.stringField.onkeydown = this.returnSubmit(this.stringField,  this.findCallback.bind(this), MAX_LENGTH, "OnlyLetter");
    this.controls.push(this.stringField);

    addLabelToAlgorithmBar("Pattern");
    this.patternField = addControlToAlgorithmBar("Text", "");
    this.patternField.onkeydown = this.returnSubmit(this.patternField,  this.findCallback.bind(this), MAX_LENGTH, "OnlyLetter");
    this.controls.push(this.patternField);

    this.findButton = addControlToAlgorithmBar("Button", "Find");
    this.findButton.onclick = this.findCallback.bind(this);
    this.controls.push(this.findButton);

    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

BF.prototype.enableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

BF.prototype.disableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

BF.prototype.setup = function()
{
    this.nextIndex = 0;
    this.ctrlIDs = [];
    this.textRowID = [];
    this.comparisonMatrixID = [];

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

BF.prototype.reset = function()
{
    this.textRowID = [];
    this.comparisonMatrixID = [];

    for (let i = 0; i < this.ctrlIDs.length; ++i)
    {
        this.cmd("Delete", this.ctrlIDs[i]);
    }

    this.ctrlIDs = [];
    this.nextIndex = this.initialIndex;
}

BF.prototype.findCallback = function(event)
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

BF.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearData.bind(this), "");
}

BF.prototype.clearData = function(ignored)
{
    this.commands = [];
    this.clearAll();
    return this.commands;
}

BF.prototype.find = function(str, pattern)
{
    this.commands = [];

    this.reset();

    let maxRows = str.length - pattern.length + 1;
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

    let iPointerID = this.nextIndex++;
    let jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", ARRAY_START_X, ARRAY_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, "#0000FF", ARRAY_START_X, ARRAY_START_Y + this.cellSize, this.cellSize / 2);

    let i = 0;
    let j = 0;
    let row = 0;
    while (i <= str.length - pattern.length)
    {
        for (let k = i; k < i + pattern.length; ++k)
        {
            this.cmd("SetText", this.comparisonMatrixID[row][k], pattern.charAt(k - i), xpos, ypos);
        }
        this.cmd("Step");
        while (j < pattern.length && pattern.charAt(j) === str.charAt(i + j))
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#2ECC71");
            j++;
            this.cmd("Step");
            if (j !== pattern.length)
            {
                let xpos = (i + j) * this.cellSize + ARRAY_START_X;
                this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
                let ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
                this.cmd("Move", jPointerID, xpos, ypos);
                this.cmd("Step");
            }
        }
        if (j !== pattern.length)
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#E74C3C");
        }
        i++;
        j = 0;
        row++;
        if (i <= str.length - pattern.length)
        {
            let xpos = (i + j) * this.cellSize + ARRAY_START_X;
            this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
            let ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.cmd("Move", jPointerID, xpos, ypos);
            this.cmd("Step");
        }
    }

    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);

    return this.commands;
}

BF.prototype.clearAll = function()
{
    this.commands = [];
    this.reset();
    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new BF(animMgr, canvas.width, canvas.height);
}
