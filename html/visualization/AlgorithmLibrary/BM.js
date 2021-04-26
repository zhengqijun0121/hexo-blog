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
const PATTERN_START_Y = 100;
const LAST_TABLE_START_Y = 200;

function BM(am, w, h)
{
    this.init(am, w, h);
}

BM.prototype = new Algorithm();
BM.prototype.constructor = BM;
BM.superclass = Algorithm.prototype;

BM.prototype.init = function(am, w, h)
{
    BM.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

BM.prototype.addControls = function()
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
    addLabelToAlgorithmBar('or');
    this.blotButton = addControlToAlgorithmBar("Button", "Build Last Occurrence Table");
    this.blotButton.onclick = this.buildLastOccurrenceTableCallback.bind(this);
    this.controls.push(this.blotButton);

    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

BM.prototype.enableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

BM.prototype.disableUI = function(event)
{
    for (let i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

BM.prototype.setup = function()
{
    this.nextIndex = 0;
    this.ctrlIDs = [];
    this.textRowID = [];
    this.comparisonMatrixID = [];
    this.patternTableCharacterID = [];
    this.patternTableIndexID = [];

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

BM.prototype.reset = function()
{
    this.textRowID = [];
    this.comparisonMatrixID = [];
    this.patternTableCharacterID = [];
    this.patternTableIndexID = [];

    for (let i = 0; i < this.ctrlIDs.length; ++i)
    {
        this.cmd("Delete", this.ctrlIDs[i]);
    }

    this.ctrlIDs = [];
    this.nextIndex = this.initialIndex;
}

BM.prototype.findCallback = function(event)
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

BM.prototype.buildLastOccurrenceTableCallback = function(event)
{
    if (this.patternField.value !== '')
    {
        let patternVal = this.patternField.value;
        this.patternField.value = "";
        this.implementAction(this.onlyBuildLastOccurrenceTable.bind(this), 0, patternVal);
    }
}

BM.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearData.bind(this), "");
}

BM.prototype.clearData = function(ignored)
{
    this.commands = [];
    this.clearAll();
    return this.commands;
}

BM.prototype.find = function(str, pattern)
{
    this.commands = [];

    this.reset();

    const maxRows = this.getMaxRows(str, pattern);
    if (maxRows <= 14)
    {
        this.cellSize = 30;
    }
    else if (maxRows <= 17)
    {
        this.cellSize = 25;
    }
    else
    {
        this.cellSize = 20;
    }

    this.textRowID = new Array(str.length);
    this.comparisonMatrixID = new Array(maxRows);
    for (let i = 0; i < maxRows; ++i)
    {
        this.comparisonMatrixID[i] = new Array(str.length);
    }

    for (let i = 0; i < str.length; ++i)
    {
        const xpos = i * this.cellSize + ARRAY_START_X;
        const ypos = ARRAY_START_Y;
        this.textRowID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.textRowID[i]);
        this.cmd("CreateRectangle", this.textRowID[i], str.charAt(i), this.cellSize, this.cellSize, xpos, ypos);
        this.cmd("SetBackgroundColor", this.textRowID[i], '#D3D3D3');
    }

    let xpos;
    let ypos;
    for (let row = 0; row < maxRows; row++)
    {
        for (let col = 0; col < str.length; col++)
        {
            xpos = col * this.cellSize + ARRAY_START_X;
            ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.comparisonMatrixID[row][col] = this.nextIndex++;
            this.ctrlIDs.push(this.comparisonMatrixID[row][col]);
            this.cmd("CreateRectangle", this.comparisonMatrixID[row][col], '', this.cellSize, this.cellSize, xpos, ypos);
        }
    }

    const lastTable = this.buildLastTable(str.length, pattern);
    const iPointerID = this.nextIndex++;
    const jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, '#0000FF', ARRAY_START_X + (pattern.length - 1) * this.cellSize, ARRAY_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, '#0000FF', ARRAY_START_X + (pattern.length - 1) * this.cellSize, ARRAY_START_Y + this.cellSize, this.cellSize / 2);

    let i = 0;
    let j = pattern.length - 1;
    let row = 0;
    while (i <= str.length - pattern.length)
    {
        for (let k = i; k < i + pattern.length; k++)
        {
            this.cmd("SetText", this.comparisonMatrixID[row][k], pattern.charAt(k - i), xpos, ypos);
        }
        this.cmd("Step");
        while (j >= 0 && pattern.charAt(j) === str.charAt(i + j))
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], '#2ECC71');
            j--;
            this.cmd("Step");
            if (j >= 0)
            {
                const xpos = (i + j) * this.cellSize + ARRAY_START_X;
                this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
                const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
                this.cmd("Move", jPointerID, xpos, ypos);
                this.cmd("Step");
            }
        }
        if (j === -1)
        {
            i++;
        }
        else
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], '#E74C3C');
            let shift;
            if (str.charAt(i + j) in lastTable)
            {
                shift = lastTable[str.charAt(i + j)];
            }
            else
            {
                shift = -1;
            }
            if (shift < j)
            {
                i += j - shift;
            }
            else
            {
                i++;
            }
        }
        j = pattern.length - 1;
        row++;
        if (i <= str.length - pattern.length)
        {
            const xpos = (i + j) * this.cellSize + ARRAY_START_X;
            this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
            const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.cmd("Move", jPointerID, xpos, ypos);
        }
    }

    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);

    return this.commands;
}

BM.prototype.getMaxRows = function(text, pattern)
{
    const lastTable = {};
    for (let i = 0; i < pattern.length; ++i)
    {
        lastTable[pattern.charAt(i)] = i;
    }
    let i = 0;
    let j = pattern.length - 1;
    let maxRows = 0;
    while (i <= text.length - pattern.length)
    {
        while (j >= 0 && pattern.charAt(j) === text.charAt(i + j))
        {
            j--;
        }
        if (j === -1)
        {
            i++;
        }
        else
        {
            let shift;
            if (text.charAt(i + j) in lastTable)
            {
                shift = lastTable[text.charAt(i + j)];
            }
            else
            {
                shift = -1;
            }
            if (shift < j)
            {
                i += j - shift;
            }
            else
            {
                i++;
            }
        }
        j = pattern.length - 1;
        maxRows++;
    }
    return maxRows;
}

BM.prototype.onlyBuildLastOccurrenceTable = function(strLength, pattern)
{
    this.commands = [];
    this.reset();
    this.cellSize = 30;
    this.buildLastTable(strLength, pattern);
    return this.commands;
}

BM.prototype.buildLastTable = function(strLength, pattern)
{
    // Display labels
    const labelsX = ARRAY_START_X + strLength * this.cellSize + 10;
    this.patternTableLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.patternTableLabelID);
    this.cmd("CreateLabel", this.patternTableLabelID, 'Pattern:', labelsX, PATTERN_START_Y - 5, 0);
    this.lastTableLabelID = this.nextIndex++;
    this.ctrlIDs.push(this.lastTableLabelID);
    this.cmd("CreateLabel", this.lastTableLabelID, 'Last occurrence table:', labelsX, LAST_TABLE_START_Y + 10, 0);

    // Display pattern table
    const patternTableStartX = ARRAY_START_X + strLength * this.cellSize + 80;
    this.patternTableCharacterID = new Array(pattern.length);
    this.patternTableIndexID = new Array(pattern.length);
    for (let i = 0; i < pattern.length; ++i)
    {
        const xpos = patternTableStartX + i * this.cellSize;
        this.patternTableCharacterID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.patternTableCharacterID[i]);
        this.cmd("CreateRectangle", this.patternTableCharacterID[i], pattern.charAt(i), this.cellSize, this.cellSize, xpos, PATTERN_START_Y);
        this.patternTableIndexID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.patternTableIndexID[i]);
        this.cmd("CreateLabel", this.patternTableIndexID[i], i, xpos, PATTERN_START_Y + this.cellSize);
    }

    // Create and display last occurrence table
    const lastTable = {};
    const lotStartX = ARRAY_START_X + strLength * this.cellSize + 155;
    let j = 0;

    const lotPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", lotPointerID, '#0000FF', patternTableStartX, PATTERN_START_Y, this.cellSize / 2);
    this.cmd("SetHighlight", lotPointerID, 1);

    for (let i = 0; i < pattern.length; ++i)
    {
        let xpos = patternTableStartX + i * this.cellSize;
        this.cmd("Move", lotPointerID, xpos, PATTERN_START_Y);
        if (lastTable[pattern.charAt(i)])
        {
            this.cmd("SetText", lastTable[pattern.charAt(i)][1], i);
            this.cmd("SetHighlight", lastTable[pattern.charAt(i)][1], 1);
            lastTable[pattern.charAt(i)][0] = i;
        }
        else
        {
            xpos = lotStartX + j * this.cellSize;
            this.ctrlIDs.push(this.nextIndex);
            this.cmd("CreateRectangle", this.nextIndex, pattern.charAt(i), this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y);
            this.cmd("SetBackgroundColor", this.nextIndex++, '#D3D3D3');
            this.ctrlIDs.push(this.nextIndex);
            this.cmd("CreateRectangle", this.nextIndex, i, this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y + this.cellSize);
            this.cmd("SetHighlight", this.nextIndex, 1);
            j++;
            lastTable[pattern.charAt(i)] = [i, this.nextIndex++];
        }
        this.cmd("Step");
        this.cmd("SetHighlight", lastTable[pattern.charAt(i)][1], 0);
    }

    // Display '*' entry
    this.cmd("Delete", lotPointerID);
    const xpos = lotStartX + j * this.cellSize;
    this.ctrlIDs.push(this.nextIndex);
    this.cmd("CreateRectangle", this.nextIndex, '*', this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y);
    this.cmd("SetBackgroundColor", this.nextIndex++, '#D3D3D3');
    this.ctrlIDs.push(this.nextIndex);
    this.cmd("CreateRectangle", this.nextIndex++, '-1', this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y + this.cellSize);
    this.cmd("Step");
    Object.keys(lastTable).map(char => (lastTable[char] = lastTable[char][0])); // Return only indices

    return lastTable;
}

BM.prototype.clearAll = function()
{
    this.commands = [];
    this.reset();
    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new BM(animMgr, canvas.width, canvas.height);
}
