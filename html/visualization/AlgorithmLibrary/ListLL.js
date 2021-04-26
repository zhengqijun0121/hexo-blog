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


var LINKED_LIST_START_X = 200;
var LINKED_LIST_START_Y = 150;
var LINKED_LIST_ELEM_WIDTH = 70;
var LINKED_LIST_ELEM_HEIGHT = 30;
var LINKED_LIST_INSERT_X = 250;
var LINKED_LIST_INSERT_Y = 50;
var LINKED_LIST_ELEMS_PER_LINE = 8;
var LINKED_LIST_ELEM_SPACING = 100;
var LINKED_LIST_LINE_SPACING = 100;

var HEAD_POS_X = 100;
var HEAD_POS_Y = 150;
var HEAD_LABEL_X = 30;
var HEAD_LABEL_Y = 150;
var HEAD_LABEL_DUMMY_X = 100;
var HEAD_LABEL_DUMMY_Y = 150;
var HEAD_ELEM_WIDTH = 30;
var HEAD_ELEM_HEIGHT = 30;

var TAIL_LABEL_X = 180;
var TAIL_LABEL_Y = 150;
var TAIL_ELEM_SPACING = 80;

var LIST_LABEL_X = 50;
var LIST_LABEL_Y = 30;
var LIST_ELEMENT_X = 120;
var LIST_ELEMENT_Y = 30;

var SIZE = 32;

function ListLL(am, w, h)
{
    this.init(am, w, h);
}

ListLL.prototype = new Algorithm();
ListLL.prototype.constructor = ListLL;
ListLL.superclass = Algorithm.prototype;

ListLL.prototype.init = function(am, w, h)
{
    ListLL.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

ListLL.prototype.addControls = function()
{
    this.controls = [];

    this.addField = addControlToAlgorithmBar("Text", "", "12 or 13,16,21");
    this.addField.onkeydown = this.returnSubmit(this.addField, this.addCallback.bind(this), 40, "MultiDigLet");
    this.addButton = addControlToAlgorithmBar("Button", "Add");
    this.addButton.onclick = this.addCallback.bind(this);
    this.controls.push(this.addField);
    this.controls.push(this.addButton);

    this.removeField = addControlToAlgorithmBar("Text", "");
    this.removeField.onkeydown = this.returnSubmit(this.removeField, this.removeCallback.bind(this), 6);
    this.removeButton = addControlToAlgorithmBar("Button", "Remove");
    this.removeButton.onclick = this.removeCallback.bind(this);
    this.controls.push(this.removeField);
    this.controls.push(this.removeButton);

    this.clearButton = addControlToAlgorithmBar("Button", "Clear Stack");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

ListLL.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

ListLL.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

ListLL.prototype.setup = function()
{
    this.linkedListElemID = new Array(SIZE);
    for (var i = 0; i < SIZE; ++i)
    {
        this.linkedListElemID[i] = this.nextIndex++;
    }

    this.headID = this.nextIndex++;
    this.headLabelID = this.nextIndex++;
    this.headDummyLabelID = this.nextIndex++;
    this.tailLabelID = this.nextIndex++;
    this.leftoverLabelID = this.nextIndex++;

    this.arrayData = new Array(SIZE);
    this.length = 0;

    this.cmd("CreateLabel", this.headLabelID, "Head", HEAD_LABEL_X, HEAD_LABEL_Y);
    this.cmd("CreateLinkedList", this.headID, "" , LINKED_LIST_ELEM_WIDTH, LINKED_LIST_ELEM_HEIGHT, HEAD_POS_X, HEAD_POS_Y, 0.25, 0, 1, 1);
    this.cmd("CreateLabel", this.headDummyLabelID, "Dummy", HEAD_LABEL_DUMMY_X, HEAD_LABEL_DUMMY_Y);
    this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_LABEL_X, TAIL_LABEL_Y);
    this.cmd("Connect", this.headLabelID, this.headID);
    this.cmd("Connect", this.tailLabelID, this.headID);
    this.cmd("SetNull", this.headID, 1);
    this.cmd("CreateLabel", this.leftoverLabelID, "", LIST_LABEL_X, LIST_LABEL_Y);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

ListLL.prototype.resetLinkedListPositions = function()
{
    for (var i = 0; i < this.length; ++i)
    {
        var nextX = (i % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        var nextY = Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
        this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
    }
}

ListLL.prototype.reset = function()
{
    this.length = 0;
    this.nextIndex = this.initialIndex;
}

ListLL.prototype.addCallback = function(event)
{
    if (this.length < SIZE && this.addField.value != "")
    {
        var addVal = this.addField.value;
        this.addField.value = "";
        this.implementAction(this.add.bind(this), addVal);
    }
}

ListLL.prototype.removeCallback = function(event)
{
    if (this.length > 0 && this.removeField.value != "")
    {
        var removeVal = this.removeField.value;
        this.removeField.value = "";
        this.implementAction(this.remove.bind(this), removeVal);
    }
}

ListLL.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearAll.bind(this), "");
}

ListLL.prototype.add = function(elemToAdd)
{
    this.commands = new Array();

    const elemArr = elemToAdd.replace(/\s*/g, "").split(",");
    for (let loop = 0; loop < elemArr.length; ++loop)
    {
        const element = elemArr[loop].substring(elemArr[loop].length - 6);
        var labAddID = this.nextIndex++;
        var labAddValID = this.nextIndex++;
        this.arrayData[this.length] = element;

        this.cmd("SetText", this.leftoverLabelID, "");

        this.cmd("CreateLinkedList", this.linkedListElemID[this.length], "" , LINKED_LIST_ELEM_WIDTH, LINKED_LIST_ELEM_HEIGHT,LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y, 0.25, 0, 1, 1);
        this.cmd("CreateLabel", labAddID, "Adding Value: ", LIST_LABEL_X, LIST_LABEL_Y);
        this.cmd("CreateLabel", labAddValID, element, LIST_ELEMENT_X, LIST_ELEMENT_Y);
        this.cmd("Step");

        this.cmd("Move", labAddValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
        this.cmd("Step");

        this.cmd("SetText", this.linkedListElemID[this.length], element);
        this.cmd("Delete", labAddValID);
        this.cmd("Step");

        if (this.length == 0)
        {
            this.cmd("SetNull", this.headID, 0);
            this.cmd("SetNull", this.linkedListElemID[this.length], 1);
            this.cmd("Disconnect", this.tailLabelID, this.headID);
            this.cmd("Step");
            this.cmd("Connect", this.headID, this.linkedListElemID[this.length]);
            this.cmd("Step");
        }
        else
        {
            this.cmd("SetNull", this.linkedListElemID[this.length - 1], 0);
            this.cmd("SetNull", this.linkedListElemID[this.length], 1);
            this.cmd("Connect", this.linkedListElemID[this.length - 1], this.linkedListElemID[this.length]);
            this.cmd("Step");
        }

        this.cmd("Disconnect", this.tailLabelID, this.linkedListElemID[this.length - 1]);
        this.cmd("Step");
        this.cmd("Connect", this.tailLabelID, this.linkedListElemID[this.length]);
        this.cmd("Step");

        var tailX = this.length % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X + TAIL_ELEM_SPACING;
        var tailY = Math.floor(this.length / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
        this.cmd("Move", this.tailLabelID, tailX, tailY);
        this.cmd("Step");

        this.length++;
        this.resetLinkedListPositions();

        this.cmd("Delete", labAddID);
        this.cmd("Step");
        this.cmd("Step");
    }

    return this.commands;
}

ListLL.prototype.remove = function(elemToRemove)
{
    this.commands = new Array();

    var labRemoveID = this.nextIndex++;
    var labRemoveValID = this.nextIndex++;

    this.cmd("SetText", this.leftoverLabelID, "");
    this.cmd("Step");

    var findFlag = false;
    for (var i = 0; i < this.length; ++i)
    {
        if (i > 0)
        {
            this.cmd("SetHighlight", this.linkedListElemID[i - 1], 0);
        }
        this.cmd("SetHighlight", this.linkedListElemID[i], 1);
        this.cmd("Step");
        if (this.arrayData[i] == elemToRemove)
        {
            findFlag = true;
            this.cmd("CreateLabel", labRemoveID, "Remove Value: ", LIST_LABEL_X, LIST_LABEL_Y);
            this.cmd("CreateLabel", labRemoveValID, elemToRemove, LIST_ELEMENT_X, LIST_ELEMENT_Y);
            this.cmd("Step");

            if (this.length == 1)
            {
                this.cmd("Disconnect", this.headID, this.linkedListElemID[i]);
                this.cmd("Connect", this.tailLabelID, this.headID);
                this.cmd("SetNull", this.headID, 1);
            }
            else
            {
                if (i == 0)
                {
                    this.cmd("Disconnect", this.headID, this.linkedListElemID[i]);
                    this.cmd("Connect", this.headID, this.linkedListElemID[i + 1]);
                }
                else if (i == this.length - 1)
                {
                    this.cmd("Disconnect", this.linkedListElemID[i - 1], this.linkedListElemID[i]);
                    this.cmd("Connect", this.linkedListElemID[i - 1], this.tailLabelID);
                    this.cmd("SetNull", this.linkedListElemID[i - 1], 1);
                }
                else
                {
                    this.cmd("Disconnect", this.linkedListElemID[i - 1], this.linkedListElemID[i]);
                    this.cmd("Connect", this.linkedListElemID[i - 1], this.linkedListElemID[i + 1]);
                }
                this.cmd("Step");
            }

            this.cmd("Step");
            this.cmd("SetText", this.linkedListElemID[i], "");
            this.cmd("Delete", this.linkedListElemID[i]);
            this.cmd("Step");

            this.length--;
            for (var j = i; j < this.length + 1; ++j)
            {
                this.arrayData[j] = this.arrayData[j + 1];
                this.linkedListElemID[j] = this.linkedListElemID[j + 1];
            }

            this.resetLinkedListPositions();

            if (this.length == 0)
            {
                this.cmd("Move", this.tailLabelID, TAIL_LABEL_X, TAIL_LABEL_Y);
                this.cmd("Step");
            }
            else
            {
                var tailX = (this.length - 1) % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X + TAIL_ELEM_SPACING;
                var tailY = Math.floor((this.length - 1) / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
                this.cmd("Move", this.tailLabelID, tailX, tailY);
                this.cmd("Step");
            }
            break;
        }
    }

    if (!findFlag)
    {
        this.cmd("SetHighlight", this.linkedListElemID[this.length - 1], 0);
        this.cmd("SetText", this.leftoverLabelID, "Remove element value [" + elemToRemove + "] is not in the list");
        this.cmd("Step");
    }
    else
    {
        this.cmd("SetText", this.leftoverLabelID, "Removed Value: " + elemToRemove);
        this.cmd("Step");
        this.cmd("Delete", labRemoveValID);
        this.cmd("Delete", labRemoveID);
        this.cmd("Step");
    }

    return this.commands;
}

ListLL.prototype.clearAll = function()
{
    this.commands = new Array();
    for (var i = 0; i < this.length; ++i)
    {
        this.cmd("Delete", this.linkedListElemID[i]);
    }
    this.length = 0;
    this.cmd("SetNull", this.headID, 1);
    return this.commands;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new ListLL(animMgr, canvas.width, canvas.height);
}
