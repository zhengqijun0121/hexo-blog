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
const BASE_LABEL_Y = 45;
const CHARACTER_VALUES_LABEL_Y = 60;
const TEXT_HASH_LABEL_START_Y = 100;
const PATTERN_HASH_LABEL_START_Y = 115;


function RK(am, w, h)
{
    this.init(am, w, h);
}

RK.prototype = new Algorithm();
RK.prototype.constructor = RK;
RK.superclass = Algorithm.prototype;

RK.prototype.init = function(am, w, h)
{
    RK.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

RK.prototype.addControls = function()
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

    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

RK.prototype.enableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

RK.prototype.disableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

RK.prototype.setup = function()
{
    this.nextIndex = 0;
    this.ctrlIDs = [];
    this.textRowID = [];
    this.comparisonMatrixID = [];

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

RK.prototype.reset = function()
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

RK.prototype.findCallback = function(event)
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

RK.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearData.bind(this), "");
}

RK.prototype.clearData = function(ignored)
{
    this.commands = [];
    this.clearAll();
    return this.commands;
}

RK.prototype.find = function(str, pattern)
{
    this.commands = [];

    this.reset();

    // Filter non-letters from string and make lower case
    str = str.replace(/[^a-zA-Z]/g, "").toLowerCase();
    pattern = pattern.replace(/[^a-zA-Z]/g, "").toLowerCase();

    const maxRows = str.length - pattern.length + 1;
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

    const labelsX = ARRAY_START_X + str.length * this.cellSize + 10;
    this.baseLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.baseLabelID);
    this.cmd("CreateLabel", this.baseLabelID, "Base constant = 1", labelsX, BASE_LABEL_Y, 0);
    this.characterValuesLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.characterValuesLabelID);
    this.cmd("CreateLabel", this.characterValuesLabelID, "Character values: a = 0, b = 1, ..., z = 25", labelsX, CHARACTER_VALUES_LABEL_Y, 0);
    this.textHashLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.textHashLabelID);
    this.cmd("CreateLabel", this.textHashLabelID, "Text hash:", labelsX, TEXT_HASH_LABEL_START_Y, 0);
    this.patternHashLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.patternHashLabelID);
    this.cmd("CreateLabel", this.patternHashLabelID, "Pattern hash:", labelsX, PATTERN_HASH_LABEL_START_Y, 0);

    let textCalculation = "";
    let textHash = 0;
    let patternCalculation = "";
    let patternHash = 0;
    for (let i = 0; i < pattern.length; ++i)
    {
        textHash += str.charCodeAt(i) - 97;
        textCalculation += str.charAt(i) + " + ";
        patternHash += pattern.charCodeAt(i) - 97;
        patternCalculation += pattern.charAt(i) + " + ";
    }
    textCalculation = textCalculation.substring(0, textCalculation.length - 2) + " = " + textHash;
    patternCalculation = patternCalculation.substring(0, patternCalculation.length - 2) + " = " + patternHash;
    const calculationsX = ARRAY_START_X + str.length * this.cellSize + 100;
    this.textHashCalculationID = this.nextIndex++;
    this.ctrlIDs.push(this.textHashCalculationID);
    this.cmd("CreateLabel", this.textHashCalculationID, textCalculation, calculationsX, TEXT_HASH_LABEL_START_Y, 0);
    this.patternHashCalculationID = this.nextIndex++;
    this.ctrlIDs.push(this.patternHashCalculationID);
    this.cmd("CreateLabel", this.patternHashCalculationID, patternCalculation, calculationsX, PATTERN_HASH_LABEL_START_Y, 0);

    const iPointerID = this.nextIndex++;
    const jPointerID = this.nextIndex++;

    let row = 0;
    for (let i = 0; i <= str.length - pattern.length; ++i)
    {
        for (let k = i; k < i + pattern.length; ++k)
        {
            this.cmd("SetText", this.comparisonMatrixID[row][k], pattern.charAt(k - i), xpos, ypos);
        }
        this.cmd("Step");
        if (patternHash === textHash)
        {
            xpos = i * this.cellSize + ARRAY_START_X;
            this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", xpos, ARRAY_START_Y, this.cellSize / 2);
            ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.cmd("CreateHighlightCircle", jPointerID, "#0000FF", xpos, ypos, this.cellSize / 2);
            this.cmd("Step");
            let j = 0;
            while (j < pattern.length && pattern.charAt(j) === str.charAt(i + j))
            {
                this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#2ECC71");
                j++;
                if (j !== pattern.length)
                {
                    xpos = (i + j) * this.cellSize + ARRAY_START_X;
                    this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
                    ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
                    this.cmd("Move", jPointerID, xpos, ypos);
                    this.cmd("Step");
                }
            }
            if (j !== pattern.length)
            {
                this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#E74C3C");
            }
            this.cmd("Delete", iPointerID);
            this.cmd("Delete", jPointerID);
            this.cmd("Step");
        }
        else
        {
            for (let k = i; k < i + pattern.length; ++k)
            {
                this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][k], "#FFFF4D");
            }
            this.cmd("Step");
        }
        if (i < str.length - pattern.length)
        {
            textHash = textHash - (str.charCodeAt(i) - 97) + (str.charCodeAt(i + pattern.length) - 97);
            textCalculation = "";
            for (let k = 0; k < pattern.length; ++k)
            {
                textCalculation += str.charAt(k + i + 1) + " + ";
            }
            textCalculation = textCalculation.substring(0, textCalculation.length - 2) + " = " + textHash;
            this.cmd("SetText", this.textHashCalculationID, textCalculation);
        }
        row++;
    }

    return this.commands;
}

RK.prototype.clearAll = function()
{
    this.commands = [];
    this.reset();
    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new RK(animMgr, canvas.width, canvas.height);
}
