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


const LINKED_LIST_START_X = 50;
const LINKED_LIST_START_Y = 200;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;
const LINKED_LIST_ELEM_SPACING = 100;

const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const FAST_POS_X = 180;
const FAST_POS_Y = 60;
const FAST_LABEL_X = 130;
const FAST_LABEL_Y = 60;
const FAST_PTR_Y = 140;

const SLOW_POS_X = 280;
const SLOW_POS_Y = 60;
const SLOW_LABEL_X = 230;
const SLOW_LABEL_Y = 60;
const SLOW_PTR_Y = 260;

const DETECT_LABEL_X = 10;
const DETECT_LABEL_Y = 10;

const SHOW_RED_COLOR = "#C93756";
const SHOW_BLUE_COLOR = "#87CEEB";
const SHOW_BLACK_COLOR = "#000000";
const SHOW_WHITE_COLOR = "#FFFFFF";
const SHOW_GRAY_COLOR = "#808080";
const SHOW_GREEN_COLOR = "#3CB371";

function LLCycleDetection(am, w, h)
{
    this.init(am, w, h);
}

LLCycleDetection.prototype = new Algorithm();
LLCycleDetection.prototype.constructor = LLCycleDetection;
LLCycleDetection.superclass = Algorithm.prototype;

LLCycleDetection.prototype.init = function(am, w, h)
{
    LLCycleDetection.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
    this.implementAction(this.randomLinkedList.bind(this), "");
}

LLCycleDetection.prototype.addControls = function()
{
    this.controls = [];

    this.randomButton = addControlToAlgorithmBar("Button", "Random");
    this.randomButton.onclick = this.randomCallback.bind(this);
    this.controls.push(this.randomButton);

    this.detectButton = addControlToAlgorithmBar("Button", "Detect Cycle");
    this.detectButton.onclick = this.detectCallback.bind(this);
    this.controls.push(this.detectButton);

    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

LLCycleDetection.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

LLCycleDetection.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

LLCycleDetection.prototype.setup = function()
{
    this.ctrlIDs = [];
    this.moveIDs = [];
    this.fastID = this.nextIndex++;
    this.fastLabelID = this.nextIndex++;
    this.slowID = this.nextIndex++;
    this.slowLabelID = this.nextIndex++;
    this.fastIdx = 0;
    this.slowIdx = 0;
    this.cmd("CreateLabel", this.fastLabelID, "Fast", FAST_LABEL_X, FAST_LABEL_Y, true, 14);
    this.cmd("SetForegroundColor", this.fastLabelID, SHOW_BLUE_COLOR);
    this.cmd("CreateRectangle", this.fastID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, FAST_POS_X, FAST_POS_Y, "center", "center", SHOW_WHITE_COLOR, SHOW_BLACK_COLOR, 14);
    this.cmd("CreateLabel", this.slowLabelID, "Slow", SLOW_LABEL_X, SLOW_LABEL_Y, true, 14);
    this.cmd("SetForegroundColor", this.slowLabelID, SHOW_RED_COLOR);
    this.cmd("CreateRectangle", this.slowID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, SLOW_POS_X, SLOW_POS_Y, "center", "center", SHOW_WHITE_COLOR, SHOW_BLACK_COLOR, 14);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

LLCycleDetection.prototype.reset = function()
{
    for (let i = 0; i < this.ctrlIDs.length; ++i)
    {
        this.cmd("Delete", this.ctrlIDs[i]);
    }
    for (let i = 0; i < this.moveIDs.length; ++i)
    {
        this.cmd("Delete", this.moveIDs[i]);
    }
    this.moveIDs = [];
    this.ctrlIDs = [];
    this.nextIndex = this.initialIndex;
}

LLCycleDetection.prototype.randomCallback = function(event)
{
    this.implementAction(this.randomLinkedList.bind(this), "");
}

LLCycleDetection.prototype.detectCallback = function(event)
{
    this.implementAction(this.detectCycle.bind(this), "");
}

LLCycleDetection.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearAll.bind(this), "");
}

LLCycleDetection.prototype.randomLinkedList = function()
{
    this.commands = new Array();

    this.reset();

    this.ElemSize = this.randomNumber(6, 10);

    this.arrayData = [];
    for (let i = 0; i < this.ElemSize; ++i)
    {
        this.arrayData[i] = new LinkedListNode(this.randomNumber(10, 99));
        this.arrayData[i].id = this.nextIndex++;
        this.arrayData[i].x = LINKED_LIST_START_X + i * LINKED_LIST_ELEM_SPACING;
        this.arrayData[i].y = LINKED_LIST_START_Y;
        this.arrayData[i].index = i;
        this.ctrlIDs.push(this.arrayData[i].id);
        this.cmd("CreateCircle", this.arrayData[i].id, this.arrayData[i].data, this.arrayData[i].x, this.arrayData[i].y, 16);
        this.cmd("SetBackgroundColor", this.arrayData[i].id, SHOW_GRAY_COLOR);
        this.cmd("SetForegroundColor", this.arrayData[i].id, SHOW_WHITE_COLOR);
    }

    for (let i = 0; i < this.ElemSize - 1; ++i)
    {
        this.arrayData[i].next = this.arrayData[i + 1];
        this.cmd("Connect", this.arrayData[i].id, this.arrayData[i + 1].id);
    }

    this.randomIdx = this.randomNumber(0, this.ElemSize - 4);
    this.arrayData[this.ElemSize - 1].next = this.arrayData[this.randomIdx];
    let curve = 0.0;
    if (this.ElemSize - this.randomIdx === 4)
    {
        curve = -0.25;
    }
    else if (this.ElemSize - this.randomIdx === 5)
    {
        curve = -0.20;
    }
    else if (this.ElemSize - this.randomIdx === 6)
    {
        curve = -0.18;
    }
    else if (this.ElemSize - this.randomIdx === 7)
    {
        curve = -0.16;
    }
    else // this.ElemSize - this.randomIdx = 8 / 9 / 10
    {
        curve = -0.15;
    }
    this.cmd("Connect", this.arrayData[this.ElemSize - 1].id, this.arrayData[this.randomIdx].id, SHOW_BLACK_COLOR, curve);

    return this.commands;
}

LLCycleDetection.prototype.detectCycle = function(ignored)
{
    this.commands = new Array();

    this.clearAll();

    this.fastTextID = this.nextIndex++;
    this.fastSID = this.nextIndex++;
    this.fastEID = this.nextIndex++;
    this.slowTextID = this.nextIndex++;
    this.slowSID = this.nextIndex++;
    this.slowEID = this.nextIndex++;
    this.moveIDs.push(this.fastTextID);
    this.moveIDs.push(this.fastSID);
    this.moveIDs.push(this.fastEID);
    this.moveIDs.push(this.slowTextID);
    this.moveIDs.push(this.slowSID);
    this.moveIDs.push(this.slowEID);

    this.cmd("SetBackgroundColor", this.arrayData[0].id, SHOW_BLUE_COLOR);
    let xPos = LINKED_LIST_START_X;
    let yPos = FAST_PTR_Y;
    this.cmd("CreateLabel", this.fastTextID, "Fast", xPos, yPos);
    this.cmd("CreateLabel", this.fastSID, "", xPos, yPos + 3);
    this.cmd("CreateLabel", this.fastEID, "", xPos, yPos + 40);
    this.cmd("Connect", this.fastSID, this.fastEID, SHOW_BLUE_COLOR);
    this.cmd("SetForegroundColor", this.fastTextID, SHOW_BLUE_COLOR);
    this.cmd("Step");
    this.cmd("Step");
    this.cmd("SetBackgroundColor", this.arrayData[0].id, SHOW_GRAY_COLOR);

    this.fastIdx = 0;
    this.slowIdx = 1;
    this.cmd("SetText", this.fastID, this.fastIdx);
    this.cmd("SetText", this.slowID, this.slowIdx);

    let slow = this.arrayData[0].next;
    let fast = this.arrayData[0].next.next;

    this.cmd("SetBackgroundColor", slow.id, SHOW_RED_COLOR);
    xPos = slow.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
    yPos = SLOW_PTR_Y;
    this.cmd("CreateLabel", this.slowTextID, "Slow", xPos, yPos);
    this.cmd("CreateLabel", this.slowSID, "", xPos, yPos - 3);
    this.cmd("CreateLabel", this.slowEID, "", xPos, yPos - 40);
    this.cmd("Connect", this.slowSID, this.slowEID, SHOW_RED_COLOR);
    this.cmd("SetForegroundColor", this.slowTextID, SHOW_RED_COLOR);

    xPos = fast.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
    yPos = FAST_PTR_Y;
    this.cmd("Move", this.fastTextID, xPos, yPos);
    this.cmd("Move", this.fastSID, xPos, yPos + 3);
    this.cmd("Move", this.fastEID, xPos, yPos + 40);
    this.cmd("SetBackgroundColor", fast.id, SHOW_BLUE_COLOR);

    this.cmd("Step");
    this.cmd("Step");
    this.cmd("SetBackgroundColor", slow.id, SHOW_GRAY_COLOR);
    this.cmd("SetBackgroundColor", fast.id, SHOW_GRAY_COLOR);

    while (slow !== fast)
    {
        this.fastIdx++;
        if (this.fastIdx === this.ElemSize)
        {
            this.fastIdx = 0;
        }
        this.slowIdx++;
        if (this.slowIdx === this.ElemSize)
        {
            this.slowIdx = 0;
        }
        this.cmd("SetText", this.fastID, this.fastIdx);
        this.cmd("SetText", this.slowID, this.slowIdx);

        slow = slow.next;
        fast = fast.next.next;

        xPos = slow.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        yPos = SLOW_PTR_Y;
        this.cmd("Move", this.slowTextID, xPos, yPos);
        this.cmd("Move", this.slowSID, xPos, yPos - 3);
        this.cmd("Move", this.slowEID, xPos, yPos - 40);
        this.cmd("SetBackgroundColor", slow.id, SHOW_RED_COLOR);

        xPos = fast.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        yPos = FAST_PTR_Y;
        this.cmd("Move", this.fastTextID, xPos, yPos);
        this.cmd("Move", this.fastSID, xPos, yPos + 3);
        this.cmd("Move", this.fastEID, xPos, yPos + 40);
        this.cmd("SetBackgroundColor", fast.id, SHOW_BLUE_COLOR);

        this.cmd("Step");
        this.cmd("Step");
        this.cmd("SetBackgroundColor", slow.id, SHOW_GRAY_COLOR);
        this.cmd("SetBackgroundColor", fast.id, SHOW_GRAY_COLOR);
    }

    this.slowIdx = 0;
    this.cmd("SetText", this.slowID, this.slowIdx);

    let cycleStartPosition = 0;
    slow = this.arrayData[0];
    xPos = slow.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
    yPos = SLOW_PTR_Y;
    this.cmd("Move", this.slowTextID, xPos, yPos);
    this.cmd("Move", this.slowSID, xPos, yPos - 3);
    this.cmd("Move", this.slowEID, xPos, yPos - 40);
    this.cmd("SetBackgroundColor", slow.id, SHOW_RED_COLOR);

    xPos = fast.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
    yPos = FAST_PTR_Y;
    this.cmd("Move", this.fastTextID, xPos, yPos);
    this.cmd("Move", this.fastSID, xPos, yPos + 3);
    this.cmd("Move", this.fastEID, xPos, yPos + 40);
    this.cmd("SetBackgroundColor", fast.id, SHOW_BLUE_COLOR);

    this.cmd("Step");
    this.cmd("Step");
    this.cmd("SetBackgroundColor", slow.id, SHOW_GRAY_COLOR);
    this.cmd("SetBackgroundColor", fast.id, SHOW_GRAY_COLOR);

    while (slow !== fast)
    {
        this.fastIdx++;
        if (this.fastIdx === this.ElemSize)
        {
            this.fastIdx = 0;
        }
        this.slowIdx++;
        if (this.slowIdx === this.ElemSize)
        {
            this.slowIdx = 0;
        }
        this.cmd("SetText", this.fastID, this.fastIdx);
        this.cmd("SetText", this.slowID, this.slowIdx);
        slow = slow.next;
        fast = fast.next;
        cycleStartPosition += 1;
        if (slow === fast)
        {
            break;
        }

        xPos = slow.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        yPos = SLOW_PTR_Y;
        this.cmd("Move", this.slowTextID, xPos, yPos);
        this.cmd("Move", this.slowSID, xPos, yPos - 3);
        this.cmd("Move", this.slowEID, xPos, yPos - 40);
        this.cmd("SetBackgroundColor", slow.id, SHOW_RED_COLOR);

        xPos = fast.index * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        yPos = FAST_PTR_Y;
        this.cmd("Move", this.fastTextID, xPos, yPos);
        this.cmd("Move", this.fastSID, xPos, yPos + 3);
        this.cmd("Move", this.fastEID, xPos, yPos + 40);
        this.cmd("SetBackgroundColor", fast.id, SHOW_BLUE_COLOR);

        this.cmd("Step");
        this.cmd("Step");
        this.cmd("SetBackgroundColor", slow.id, SHOW_GRAY_COLOR);
        this.cmd("SetBackgroundColor", fast.id, SHOW_GRAY_COLOR);
    }

    this.fastIdx = this.slowIdx;
    this.cmd("SetText", this.fastID, this.fastIdx);

    xPos = this.slowIdx * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
    yPos = SLOW_PTR_Y;
    this.cmd("Move", this.slowTextID, xPos, yPos);
    this.cmd("Move", this.slowSID, xPos, yPos - 3);
    this.cmd("Move", this.slowEID, xPos, yPos - 40);

    xPos = this.slowIdx * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
    yPos = FAST_PTR_Y;
    this.cmd("Move", this.fastTextID, xPos, yPos);
    this.cmd("Move", this.fastSID, xPos, yPos + 3);
    this.cmd("Move", this.fastEID, xPos, yPos + 40);
    this.cmd("Step");
    this.cmd("Step");

    let cycleLength = 1;
    fast = slow.next;
    this.cmd("SetBackgroundColor", slow.id, SHOW_GREEN_COLOR);
    this.cmd("Step");
    this.cmd("SetEdgeColor", slow.id, fast.id, SHOW_GREEN_COLOR);
    this.cmd("Step");
    while (slow !== fast)
    {
        this.cmd("SetBackgroundColor", fast.id, SHOW_GREEN_COLOR);
        this.cmd("Step");
        this.cmd("SetEdgeColor", fast.id, fast.next.id, SHOW_GREEN_COLOR);
        this.cmd("Step");
        fast = fast.next;
        cycleLength += 1;
    }

    this.detectLabelId = this.nextIndex++;
    this.moveIDs.push(this.detectLabelId);
    const detectStr = "Cycle start position: " + this.slowIdx + ", length: " + cycleLength;
    this.cmd("CreateLabel", this.detectLabelId, detectStr, DETECT_LABEL_X, DETECT_LABEL_Y, 0);

    return this.commands;
}

LLCycleDetection.prototype.clearAll = function()
{
    this.commands = [];

    for (let i = 0; i < this.moveIDs.length; ++i)
    {
        this.cmd("Delete", this.moveIDs[i]);
    }
    this.moveIDs = [];

    this.fastIdx = 0;
    this.slowIdx = 0;
    this.cmd("SetText", this.fastID, this.fastIdx);
    this.cmd("SetText", this.slowID, this.slowIdx);
    for (let i = 0; i < this.ctrlIDs.length - 1; ++i)
    {
        this.cmd("SetBackgroundColor", this.ctrlIDs[i], SHOW_GRAY_COLOR);
        this.cmd("SetEdgeColor", this.ctrlIDs[i], this.ctrlIDs[i + 1], SHOW_BLACK_COLOR);
    }
    this.cmd("SetBackgroundColor", this.ctrlIDs[this.ctrlIDs.length - 1], SHOW_GRAY_COLOR);
    this.cmd("SetEdgeColor", this.ctrlIDs[this.ctrlIDs.length - 1], this.ctrlIDs[this.randomIdx], SHOW_BLACK_COLOR);

    return this.commands;
}

function LinkedListNode(val)
{
    this.data = val;
    this.next = null;
    this.x = 0;
    this.y = 0;
    this.id = 0;
    this.index = 0;
}

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new LLCycleDetection(animMgr, canvas.width, canvas.height);
}
