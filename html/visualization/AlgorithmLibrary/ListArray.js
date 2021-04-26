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


var ARRAY_START_X = 100;
var ARRAY_START_Y = 250;
var ARRAY_ELEM_WIDTH = 50;
var ARRAY_ELEM_HEIGHT = 50;
var ARRAY_ELEMS_PER_LINE = 18;
var ARRAY_LINE_SPACING = 130;

var LIST_LABEL_X = 50;
var LIST_LABEL_Y = 30;
var LIST_ELEMENT_X = 120;
var LIST_ELEMENT_Y = 30;

var LIST_LEN_LABEL_X = 93;
var LIST_LEN_LABEL_Y = 150;
var LIST_LEN_ELEMENT_X = 130;
var LIST_LEN_ELEMENT_Y = 150;

var LIST_CUR_LABEL_X = 100;
var LIST_CUR_LABEL_Y = 180;
var LIST_CUR_SPACING_Y = 70;
var LIST_CUR_WIDTH = 50;

var INDEX_COLOR = "#0000FF";
var LEN_COLOR = "#00FF00";
var FG_RED_COLOR = "#FF0000";
var FG_BLUE_COLOR = "#0000FF";
var FG_BLACK_COLOR = "#000000";
var FG_GREEN_COLOR = "#00FF00";

var SIZE = 18;

function ListArray(am, w, h)
{
    this.init(am, w, h);
}

ListArray.prototype = new Algorithm();
ListArray.prototype.constructor = ListArray;
ListArray.superclass = Algorithm.prototype;

ListArray.prototype.init = function(am, w, h)
{
    ListArray.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

ListArray.prototype.addControls = function()
{
    this.controls = [];

    this.lengthButton = addControlToAlgorithmBar("Button", "Length");
    this.lengthButton.onclick = this.lengthCallback.bind(this);
    this.addField = addControlToAlgorithmBar("Text", "", "12 or 13,16,21");
    this.addField.onkeydown = this.returnSubmit(this.addField, this.addCallback.bind(this), 40, "MultiDigLet");
    this.addButton = addControlToAlgorithmBar("Button", "Add");
    this.addButton.onclick = this.addCallback.bind(this);
    this.removeField = addControlToAlgorithmBar("Text", "");
    this.removeField.onkeydown = this.returnSubmit(this.removeField, this.removeCallback.bind(this), 6);
    this.removeButton = addControlToAlgorithmBar("Button", "Remove");
    this.removeButton.onclick = this.removeCallback.bind(this);
    this.printButton = addControlToAlgorithmBar("Button", "Print");
    this.printButton.onclick = this.printCallback.bind(this);
    this.clearButton = addControlToAlgorithmBar("Button", "Clear List");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.lengthButton);
    this.controls.push(this.addField);
    this.controls.push(this.addButton);
    this.controls.push(this.removeField);
    this.controls.push(this.removeButton);
    this.controls.push(this.printButton);
    this.controls.push(this.clearButton);

    this.firstButton = addControlToAlgorithmBar("Button", "First");
    this.firstButton.onclick = this.firstCallback.bind(this);
    this.nextButton = addControlToAlgorithmBar("Button", "Next");
    this.nextButton.onclick = this.nextCallback.bind(this);
    this.currentButton = addControlToAlgorithmBar("Button", "Current");
    this.currentButton.onclick = this.currentCallback.bind(this);
    this.insertField = addControlToAlgorithmBar("Text", "");
    this.insertField.onkeydown = this.returnSubmit(this.insertField, this.insertCallback.bind(this), 6);
    this.insertButton = addControlToAlgorithmBar("Button", "Insert");
    this.insertButton.onclick = this.insertCallback.bind(this);
    this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
    this.deleteButton.onclick = this.deleteCallback.bind(this);
    this.controls.push(this.firstButton);
    this.controls.push(this.nextButton);
    this.controls.push(this.currentButton);
    this.controls.push(this.insertField);
    this.controls.push(this.insertButton);
    this.controls.push(this.deleteButton);
}

ListArray.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

ListArray.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

ListArray.prototype.setup = function()
{
    this.nextIndex = 0;

    this.arrayID = new Array(SIZE);
    this.arrayLabelID = new Array(SIZE);
    for (var i = 0; i < SIZE; ++i)
    {
        this.arrayID[i] = this.nextIndex++;
        this.arrayLabelID[i] = this.nextIndex++;
    }

    /* List ADT */
    this.arrayData = new Array(SIZE);
    this.arrayLength = 0;

    this.leftoverLabelID = this.nextIndex++;
    this.labLengthID = this.nextIndex++;
    this.labLengthValID = this.nextIndex++;
    this.cmd("CreateLabel", this.leftoverLabelID, "", LIST_LABEL_X, LIST_LABEL_Y);
    this.cmd("CreateLabel", this.labLengthID, "Length:", LIST_LEN_LABEL_X, LIST_LEN_LABEL_Y);
    this.cmd("CreateLabel", this.labLengthValID, this.arrayLength, LIST_LEN_ELEMENT_X, LIST_LEN_ELEMENT_Y);

    this.curIndex = -1;
    this.labCurrentID = this.nextIndex++;
    this.labCurSID = this.nextIndex++;
    this.labCurEID = this.nextIndex++;
    this.cmd("CreateLabel", this.labCurrentID, "Current", LIST_CUR_LABEL_X, LIST_CUR_LABEL_Y);
    this.cmd("CreateLabel", this.labCurSID, "", LIST_CUR_LABEL_X, LIST_CUR_LABEL_Y + 3);
    this.cmd("CreateLabel", this.labCurEID, "", ARRAY_START_X, ARRAY_START_Y - 25);
    this.cmd("SetForegroundColor", this.labCurrentID, LEN_COLOR);

    for (var i = 0; i < SIZE; ++i)
    {
        var xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
        this.cmd("CreateRectangle", this.arrayID[i], "", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xpos, ypos);
        this.cmd("CreateLabel", this.arrayLabelID[i], i, xpos, ypos + ARRAY_ELEM_HEIGHT);
        this.cmd("SetForegroundColor", this.arrayLabelID[i], INDEX_COLOR);
    }

    this.initialIndex = this.nextIndex;
    this.highlight1ID = this.nextIndex++;

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

ListArray.prototype.reset = function()
{
    this.arrayData = new Array(SIZE);
    this.arrayLength = 0;
    this.curIndex = -1;
    this.nextIndex = this.initialIndex;
}

ListArray.prototype.lengthCallback = function(event)
{
    this.implementAction(this.length.bind(this), "");
}

ListArray.prototype.addCallback = function(event)
{
    if (this.arrayLength < SIZE && this.addField.value != "")
    {
        var addVal = this.addField.value;
        this.addField.value = "";
        this.implementAction(this.add.bind(this), addVal);
    }
}

ListArray.prototype.removeCallback = function(event)
{
    if (this.arrayLength > 0 && this.removeField.value != "")
    {
        var removeVal = this.removeField.value;
        this.removeField.value = "";
        this.implementAction(this.remove.bind(this), removeVal);
    }
}

ListArray.prototype.printCallback = function(event)
{
    this.implementAction(this.print.bind(this), "");
}

ListArray.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearAll.bind(this), "");
}

ListArray.prototype.firstCallback = function(event)
{
    this.implementAction(this.first.bind(this), "");
}

ListArray.prototype.nextCallback = function(event)
{
    this.implementAction(this.next.bind(this), "");
}

ListArray.prototype.currentCallback = function(event)
{
    this.implementAction(this.current.bind(this), "");
}

ListArray.prototype.insertCallback = function(event)
{
    if (this.arrayLength > 0 && this.insertField.value != "")
    {
        var insertVal = this.insertField.value;
        this.insertField.value = "";
        this.implementAction(this.insertCurrent.bind(this), insertVal);
    }
}

ListArray.prototype.deleteCallback = function(event)
{
    this.implementAction(this.deleteCurrent.bind(this), "");
}

ListArray.prototype.length = function()
{
    this.commands = new Array();

    this.cmd("SetText", this.leftoverLabelID, "");

    var labLenID = this.nextIndex++;
    var labLenValID = this.nextIndex++;

    this.cmd("CreateLabel", labLenID, "Length =", LIST_LABEL_X, LIST_LABEL_Y);
    this.cmd("CreateLabel", labLenValID, this.arrayLength, LIST_LEN_ELEMENT_X, LIST_LEN_ELEMENT_Y);
    this.cmd("Step");
    this.cmd("Move", labLenValID, LIST_ELEMENT_X, LIST_ELEMENT_Y);
    this.cmd("Step");
    this.cmd("Step");
    this.cmd("Step");

    this.cmd("Delete", labLenID);
    this.cmd("Delete", labLenValID);
    this.cmd("Step");

    return this.commands;
}

ListArray.prototype.add = function(elemToAdd)
{
    this.commands = new Array();

    const elemArr = elemToAdd.replace(/\s*/g, "").split(",");
    for (let loop = 0; loop < elemArr.length; ++loop)
    {
        const element = elemArr[loop].substring(elemArr[loop].length - 6);
        var labAddID = this.nextIndex++;
        var labAddValID = this.nextIndex++;
        this.arrayData[this.arrayLength] = element;

        this.cmd("SetText", this.leftoverLabelID, "");
        this.cmd("CreateLabel", labAddID, "Adding Value: ", LIST_LABEL_X, LIST_LABEL_Y);
        this.cmd("CreateLabel", labAddValID, element, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("Step");

        this.cmd("SetForegroundColor", this.labLengthValID, FG_RED_COLOR);
        this.cmd("SetForegroundColor", this.arrayLabelID[this.arrayLength], FG_RED_COLOR);
        this.cmd("Step");

        this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("Step");

        var xpos = (this.arrayLength % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = Math.floor(this.arrayLength / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

        this.cmd("Move", this.highlight1ID, xpos, ypos);
        this.cmd("Step");

        this.cmd("Move", labAddValID, xpos, ypos);
        this.cmd("Step");

        this.cmd("SetText", this.arrayID[this.arrayLength], element);
        this.cmd("Delete", this.highlight1ID);
        this.cmd("Delete", labAddID);
        this.cmd("Delete", labAddValID);
        this.cmd("Step");

        this.cmd("SetText", this.labLengthValID, this.arrayLength + 1);
        this.cmd("SetForegroundColor", this.labLengthValID, FG_BLACK_COLOR);
        this.cmd("SetForegroundColor", this.arrayLabelID[this.arrayLength], INDEX_COLOR);
        this.cmd("Step");

        this.arrayLength++;
        this.cmd("Step");
        this.cmd("Step");
    }

    return this.commands;
}

ListArray.prototype.remove = function(elemToRemove)
{
    this.commands = new Array();

    var labRemoveID = this.nextIndex++;
    var labRemoveValID = this.nextIndex++;

    this.cmd("SetText", this.leftoverLabelID, "");
    this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR, ARRAY_START_X, ARRAY_START_Y);
    this.cmd("Step");

    var findFlag = false;
    for (var i = 0; i < this.arrayLength; ++i)
    {
        var xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
        this.cmd("SetPosition", this.highlight1ID, xpos, ypos);
        this.cmd("Step");
        if (this.arrayData[i] == elemToRemove)
        {
            findFlag = true;
            this.cmd("CreateLabel", labRemoveID, "Remove Value: ", LIST_LABEL_X, LIST_LABEL_Y);
            this.cmd("CreateLabel", labRemoveValID, elemToRemove, xpos, ypos);
            this.cmd("Step");
            this.cmd("Move", this.highlight1ID, LIST_ELEMENT_X, LIST_ELEMENT_Y);
            this.cmd("Step");
            this.cmd("Move", labRemoveValID, LIST_ELEMENT_X, LIST_ELEMENT_Y);
            this.cmd("Step");
            this.cmd("SetText", this.arrayID[i], "");
            this.cmd("Step");

            var k = 0;
            for (var j = i; j < this.arrayLength - 1; ++j)
            {
                this.arrayData[j] = this.arrayData[j + 1];
                var labMoveID = this.nextIndex++;
                this.cmd("CreateLabel", labMoveID, this.arrayData[j], xpos + (++k) * ARRAY_ELEM_WIDTH, ypos);
                this.cmd("SetText", this.arrayID[j + 1], "");
                this.cmd("Step");
                this.cmd("Move", labMoveID, xpos + (k - 1) * ARRAY_ELEM_WIDTH, ypos);
                this.cmd("Step");
                this.cmd("SetText", this.arrayID[j], this.arrayData[j]);
                this.cmd("Step");
                this.cmd("Delete", labMoveID);
            }

            this.cmd("SetText", this.labLengthValID, this.arrayLength - 1);
            this.cmd("Step");
            this.arrayLength--;
            break;
        }
    }

    this.cmd("Delete", this.highlight1ID);
    this.cmd("Step");

    /* Not find deleted element */
    if (!findFlag)
    {
        var labRemoveNgID = this.nextIndex++;
        this.cmd("CreateLabel", labRemoveNgID, "Remove element value [" + elemToRemove + "] is not in the list", LIST_LABEL_X, LIST_LABEL_Y);
        this.cmd("Step");
        this.cmd("Delete", labRemoveNgID);
        this.cmd("Step");
    } else {
        this.cmd("Delete", labRemoveID);
        this.cmd("Delete", labRemoveValID);
        this.cmd("Step");
    }

    return this.commands;
}

ListArray.prototype.print = function()
{
    this.commands = new Array();

    this.cmd("SetText", this.leftoverLabelID, "");
    if (this.arrayLength > 0)
    {
        var listStr = "Print List:";
        for (var i = 0; i < this.arrayLength; ++i)
        {
            this.curIndex = 0;
            listStr = listStr + " " + this.arrayData[i];
            this.cmd("SetText", this.leftoverLabelID, listStr);
            this.cmd("Step");
        }
    } else {
        this.cmd("SetText", this.leftoverLabelID, "List is empty.");
    }

    return this.commands;
}

ListArray.prototype.clearAll = function()
{
    this.commands = new Array();
    this.cmd("SetText", this.leftoverLabelID, "");

    for (var i = 0; i < SIZE; ++i)
    {
        this.cmd("SetText", this.arrayID[i], "");
    }

    this.arrayLength = 0;
    if (this.curIndex != -1)
    {
        var xpos = ARRAY_START_X;
        var ypos = ARRAY_START_Y - LIST_CUR_SPACING_Y;

        this.cmd("Disconnect", this.labCurSID, this.labCurEID);
        this.cmd("SetPosition", this.labCurrentID, xpos, ypos);
        this.cmd("SetPosition", this.labCurSID, xpos, ypos + 3);
        this.cmd("SetPosition", this.labCurEID, xpos, ARRAY_START_Y - 25);
        this.cmd("Step");
        this.curIndex = -1;
    }

    return this.commands;
}

ListArray.prototype.first = function()
{
    this.commands = new Array();

    this.cmd("SetText", this.leftoverLabelID, "");
    if (this.arrayLength > 0)
    {
        var xpos = ARRAY_START_X;
        var ypos = ARRAY_START_Y - LIST_CUR_SPACING_Y;
        this.cmd("Move", this.labCurrentID, xpos, ypos);
        this.cmd("Move", this.labCurSID, xpos, ypos + 3);
        this.cmd("Move", this.labCurEID, xpos, ARRAY_START_Y - 25);
        this.cmd("Connect", this.labCurSID, this.labCurEID, FG_GREEN_COLOR);
        this.cmd("Step");
        this.curIndex = 0;
    }
    else
    {
        this.cmd("SetText", this.leftoverLabelID, "List is empty.");
    }

    return this.commands;
}

ListArray.prototype.next = function()
{
    this.commands = new Array();

    this.cmd("SetText", this.leftoverLabelID, "");
    if (this.arrayLength > 0)
    {
        if (this.curIndex >= 0 && this.curIndex < this.arrayLength - 1)
        {
            this.curIndex++;
            var xpos = (this.curIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
            var ypos = Math.floor(this.curIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y - LIST_CUR_SPACING_Y;
            var yepos = Math.floor(this.curIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
            this.cmd("Move", this.labCurrentID, xpos, ypos);
            this.cmd("Move", this.labCurSID, xpos, ypos + 3);
            this.cmd("Move", this.labCurEID, xpos, yepos - 25);
            this.cmd("Step");
        }
        else
        {
            var xpos = ARRAY_START_X;
            var ypos = ARRAY_START_Y - LIST_CUR_SPACING_Y;
            this.cmd("Disconnect", this.labCurSID, this.labCurEID);
            this.cmd("SetPosition", this.labCurrentID, xpos, ypos);
            this.cmd("SetPosition", this.labCurSID, xpos, ypos + 3);
            this.cmd("SetPosition", this.labCurEID, xpos, ARRAY_START_Y - 25);
            this.cmd("SetText", this.leftoverLabelID, "");
            this.cmd("Step");
            this.curIndex = -1;
        }
    }
    else
    {
        this.cmd("SetText", this.leftoverLabelID, "List is empty.");
    }

    return this.commands;
}

ListArray.prototype.current = function()
{
    this.commands = new Array();

    this.cmd("SetText", this.leftoverLabelID, "");
    if (this.curIndex != -1)
    {
        var labCurID = this.nextIndex++;
        var labCurValID = this.nextIndex++;
        var xpos = (this.curIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = Math.floor(this.curIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

        this.cmd("CreateLabel", labCurID, "Current Element:", LIST_LABEL_X, LIST_LABEL_Y);
        this.cmd("CreateLabel", labCurValID, this.arrayData[this.curIndex], xpos, ypos);
        this.cmd("Step");

        xpos = LIST_ELEMENT_X;
        ypos = LIST_ELEMENT_Y;
        this.cmd("Move", labCurValID, xpos, ypos);
        this.cmd("Step");

        this.cmd("Delete", labCurID);
        this.cmd("Delete", labCurValID);
        this.cmd("Step");
    }
    else
    {
        var labCurNgID = this.nextIndex++;
        this.cmd("CreateLabel", labCurNgID, "Iterator not in the list: Current not valid", LIST_LABEL_X + 50, LIST_LABEL_Y);
        this.cmd("Step");

        this.cmd("Delete", labCurNgID);
        this.cmd("Step");
        this.cmd("Step");
        this.cmd("Step");
    }

    return this.commands;
}

ListArray.prototype.insertCurrent = function(elemToInsert)
{
    this.commands = new Array();
    this.cmd("SetText", this.leftoverLabelID, "");
    if (this.curIndex != -1)
    {
        var labInsertID = this.nextIndex++;
        var labInsertValID = this.nextIndex++;
        var xpos = (this.arrayLength % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = Math.floor(this.arrayLength / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

        this.cmd("CreateLabel", labInsertID, "Insert Value: ", LIST_LABEL_X, LIST_LABEL_Y);
        this.cmd("CreateLabel", labInsertValID, elemToInsert, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("Step");

        var k = 0;
        for (var j = this.arrayLength - 1; j > this.curIndex; --j)
        {
            this.arrayData[j + 1] = this.arrayData[j];
            var labMoveID = this.nextIndex++;
            this.cmd("CreateLabel", labMoveID, this.arrayData[j + 1], xpos - (++k) * ARRAY_ELEM_WIDTH, ypos);
            this.cmd("SetText", this.arrayID[j], "");
            this.cmd("Step");
            this.cmd("Move", labMoveID, xpos - (k - 1) * ARRAY_ELEM_WIDTH, ypos);
            this.cmd("Step");
            this.cmd("SetText", this.arrayID[j + 1], this.arrayData[j + 1]);
            this.cmd("Step");
            this.cmd("Delete", labMoveID);
        }

        // Move the last item
        this.arrayData[this.curIndex + 1] = this.arrayData[this.curIndex];
        var labMoveID = this.nextIndex++;
        this.cmd("CreateLabel", labMoveID, this.arrayData[this.curIndex + 1], xpos - (++k) * ARRAY_ELEM_WIDTH, ypos);
        this.cmd("SetText", this.arrayID[this.curIndex], "");
        this.cmd("Step");
        this.cmd("Move", labMoveID, xpos - (k - 1) * ARRAY_ELEM_WIDTH, ypos);
        this.arrayData[this.curIndex] = elemToInsert;  // save inserted value
        this.cmd("Move", this.labCurrentID, xpos - (k - 1) * ARRAY_ELEM_WIDTH, ypos - LIST_CUR_SPACING_Y);
        this.cmd("Move", this.labCurSID, xpos - (k - 1) * ARRAY_ELEM_WIDTH, ypos - LIST_CUR_SPACING_Y + 3);
        this.cmd("Move", this.labCurEID, xpos - (k - 1) * ARRAY_ELEM_WIDTH, ypos - 25);
        this.cmd("Step");
        this.cmd("SetText", this.arrayID[this.curIndex + 1], this.arrayData[this.curIndex + 1]);
        this.cmd("Step");
        this.cmd("Delete", labMoveID);

        this.cmd("Move", this.highlight1ID, xpos - k * ARRAY_ELEM_WIDTH, ypos);
        this.cmd("Step");
        this.cmd("Move", labInsertValID, xpos - k  * ARRAY_ELEM_WIDTH, ypos);
        this.cmd("SetText", this.arrayID[this.curIndex], elemToInsert);
        this.cmd("Step");

        this.cmd("Delete", this.highlight1ID);
        this.cmd("Delete", labInsertID);
        this.cmd("Delete", labInsertValID);
        this.cmd("Step");

        this.cmd("SetText", this.labLengthValID, this.arrayLength + 1);
        this.cmd("Step");

        this.curIndex++;
        this.arrayLength++;
    }
    else
    {
        var labInsertNgID = this.nextIndex++;
        this.cmd("CreateLabel", labInsertNgID, "Iterator not in the list: cannot insert", LIST_LABEL_X + 50, LIST_LABEL_Y);
        this.cmd("Step");

        this.cmd("Delete", labInsertNgID);
        this.cmd("Step");
        this.cmd("Step");
        this.cmd("Step");
    }

    return this.commands;
}

ListArray.prototype.deleteCurrent = function()
{
    this.commands = new Array();

    this.cmd("SetText", this.leftoverLabelID, "");
    if (this.curIndex != -1)
    {
        var labDeleteID = this.nextIndex++;
        var labDeleteValID = this.nextIndex++;
        var xpos = (this.curIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = Math.floor(this.curIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

        this.cmd("CreateLabel", labDeleteID, "Remove Value: ", LIST_LABEL_X, LIST_LABEL_Y);
        this.cmd("CreateLabel", labDeleteValID, this.arrayData[this.curIndex], xpos, ypos);
        this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR, xpos, ypos);
        this.cmd("SetText", this.arrayID[this.curIndex], "");
        this.cmd("Step");
        this.cmd("Move", this.highlight1ID, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("Step");
        this.cmd("Move", labDeleteValID, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("Step");

        var k = 0;
        for (var j = this.curIndex; j < this.arrayLength - 1; ++j)
        {
            this.arrayData[j] = this.arrayData[j + 1];
            var labMoveID = this.nextIndex++;
            this.cmd("CreateLabel", labMoveID, this.arrayData[j], xpos + (++k) * ARRAY_ELEM_WIDTH, ypos);
            this.cmd("SetText", this.arrayID[j + 1], "");
            this.cmd("Step");
            this.cmd("Move", labMoveID, xpos + (k - 1) * ARRAY_ELEM_WIDTH, ypos);
            this.cmd("Step");
            this.cmd("SetText", this.arrayID[j], this.arrayData[j]);
            this.cmd("Step");
            this.cmd("Delete", labMoveID);
        }

        /* delete the last item */
        if (this.curIndex == this.arrayLength - 1)
        {
            xpos = ARRAY_START_X;
            ypos = ARRAY_START_Y - LIST_CUR_SPACING_Y;
            this.cmd("Disconnect", this.labCurSID, this.labCurEID);
            this.cmd("SetPosition", this.labCurrentID, xpos, ypos);
            this.cmd("SetPosition", this.labCurSID, xpos, ypos + 3);
            this.cmd("SetPosition", this.labCurEID, xpos, ARRAY_START_Y - 25);
            this.cmd("Step");
            this.curIndex = -1;
        }

        this.cmd("Delete", this.highlight1ID);
        this.cmd("Delete", labDeleteID);
        this.cmd("Delete", labDeleteValID);
        this.cmd("Step");

        this.cmd("SetText", this.labLengthValID, this.arrayLength - 1);
        this.cmd("Step");

        this.arrayLength--;
    }
    else
    {
        var labDeleteNgID = this.nextIndex++;
        this.cmd("CreateLabel", labDeleteNgID, "Iterator not in the list: Current not valid", LIST_LABEL_X + 50, LIST_LABEL_Y);
        this.cmd("Step");

        this.cmd("Delete", labDeleteNgID);
        this.cmd("Step");
        this.cmd("Step");
        this.cmd("Step");
    }

    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new ListArray(animMgr, canvas.width, canvas.height);
}
