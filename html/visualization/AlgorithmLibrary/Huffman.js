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


var HUFFMAN_INPUT_LABEL_X = 50;
var HUFFMAN_INPUT_LABEL_Y = 10;
var HUFFMAN_INPUT_ELEMENT_X = 70;
var HUFFMAN_INPUT_ELEMENT_Y = 5;
var HUFFMAN_INPUT_ELEMENT_SPACING = 10;

var HUFFMAN_NODE_HEIGHT_START = 450;
var HUFFMAN_NODE_HEIGHT_SPACING = 50;
var HUFFMAN_NODE_WIDTH_START = 100;
var HUFFMAN_NODE_WIDTH_SPACING = 40;

var HUFFMAN_ENCODE_TABLE_X = 5;
var HUFFMAN_ENCODE_TABLE_Y = 20;
var HUFFMAN_ENCODE_LABEL_X = 10;
var HUFFMAN_ENCODE_LABEL_Y = 25;
var HUFFMAN_ENCODE_ELEMENT_X = 20;
var HUFFMAN_ENCODE_ELEMENT_Y = 25;
var HUFFMAN_ENCODE_LINE_SPACING = 15;
var HUFFMAN_ENCODE_WIDTH_START = 20;
var HUFFMAN_ENCODE_WIDTH_SPACING = 6;

var HUFFMAN_ENCODE_OUT_LABEL_START = 35;
var HUFFMAN_ENCODE_OUT_LABEL_SPACING = 6;
var HUFFMAN_ENCODE_OUT_LABEL_Y = 20;
var HUFFMAN_ENCODE_OUT_ELEMENT_START = 35;
var HUFFMAN_ENCODE_OUT_ELEMENT_SPACING = 6;
var HUFFMAN_ENCODE_OUT_ELEMENT_Y = 32;
var HUFFMAN_ENCODE_OUT_LINE_SPACING = 12;

var HUFFMAN_DECODE_OUT_LABEL_START = 35;
var HUFFMAN_DECODE_OUT_LABEL_SPACING = 6;
var HUFFMAN_DECODE_OUT_LABEL_Y = 20;
var HUFFMAN_DECODE_OUT_ELEMENT_START = 35;
var HUFFMAN_DECODE_OUT_ELEMENT_SPACING = 6;
var HUFFMAN_DECODE_OUT_ELEMENT_Y = 32;
var HUFFMAN_DECODE_OUT_LINE_SPACING = 12;

var CODE_HEADER_TABLE_X = 200;
var CODE_HEADER_TABLE_Y = 30;
var CODE_HEADER_ELEMENT_X = 280;
var CODE_HEADER_ELEMENT_Y = 30;

var SHOW_RED_COLOR = "#FF0000";
var SHOW_BLUE_COLOR = "#0000FF";
var SHOW_BLACK_COLOR = "#000000";
var SHOW_GRAY_COLOR = "#808080";

var CHARS_SIZE = 256;
var MinPQSize = 16;
var PQ_SIZE = 256;

function Huffman(am, w, P)
{
    this.init(am, w, P);
}

Huffman.prototype = new Algorithm();
Huffman.prototype.constructor = Huffman;
Huffman.superclass = Algorithm.prototype;

Huffman.prototype.init = function(am, w, P)
{
    Huffman.superclass.init.call(this, am, w, P);
    this.nextIndex = 0;
    this.addControls();
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}

Huffman.prototype.addControls = function()
{
    this.controls = [];
    this.encodeField = addControlToAlgorithmBar("Text", "");
    this.encodeField.onkeydown = this.returnSubmit(this.encodeField, this.encodeCallback.bind(this), 135);
    this.encodeButton = addControlToAlgorithmBar("Button", "Encode");
    this.encodeButton.onclick = this.encodeCallback.bind(this);
    this.controls.push(this.encodeField);
    this.controls.push(this.encodeButton);
}

Huffman.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = false;
    }
}

Huffman.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; ++i)
    {
        this.controls[i].disabled = true;
    }
}

Huffman.prototype.setup = function()
{
    this.numChars = 0;
    this.numTrees = 0;
    this.frequencyChar = [];
    this.frequency = [];
    this.labTreeID = [];
    this.ctrlIDs = [];

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

Huffman.prototype.reset = function()
{
    for (var i = 0; i < this.ctrlIDs.length; ++i)
    {
        this.cmd("Delete", this.ctrlIDs[i]);
    }
    this.cmd("Step");
    this.ctrlIDs = [];
    this.nextIndex = this.initialIndex;
}

Huffman.prototype.encodeCallback = function(event)
{
    if (this.encodeField.value != "")
    {
        var encodeValue = this.encodeField.value;
        this.encodeField.value = "";
        this.implementAction(this.doEncode.bind(this), encodeValue);
    }
}

Huffman.prototype.getNumChars = function(chars)
{
    var num = 0;
    var freq = [];
    for (var i = 0; i < CHARS_SIZE; ++i) {
        freq[i] = 0;
    }

    for (var i = 0; i < chars.length; ++i) {
        freq[chars[i].charCodeAt()]++;
    }

    for (var i = 0; i < CHARS_SIZE; ++i) {
        if (freq[i] > 0) {
            this.frequencyChar[num] = String.fromCharCode(i);
            this.frequency[num] = freq[i];
            num++;
        }
    }

    return num;
}

Huffman.prototype.SortByFrequency = function()
{
    this.cmd("Step");
    // Select Sort
    for (var i = 0; i < this.numChars - 1; ++i)
    {
        var smallIndex = i;
        for (var j = i + 1; j < this.numChars; ++j)
        {
            if (this.frequency[j] < this.frequency[smallIndex])
            {
                smallIndex = j;
            }
        }
        if (i != smallIndex)
        {
            this.cmd("Move", this.labTreeID[i], smallIndex * HUFFMAN_NODE_WIDTH_SPACING + HUFFMAN_NODE_WIDTH_START, HUFFMAN_NODE_HEIGHT_START);
            this.cmd("Move", this.labTreeID[smallIndex], i * HUFFMAN_NODE_WIDTH_SPACING + HUFFMAN_NODE_WIDTH_START, HUFFMAN_NODE_HEIGHT_START);
            var tmp = this.frequency[i];
            this.frequency[i] = this.frequency[smallIndex];
            this.frequency[smallIndex] = tmp;
            tmp = this.frequencyChar[i];
            this.frequencyChar[i] = this.frequencyChar[smallIndex];
            this.frequencyChar[smallIndex] = tmp;
            tmp = this.labTreeID[i];
            this.labTreeID[i] = this.labTreeID[smallIndex];
            this.labTreeID[smallIndex] = tmp;
        }
    }
    this.cmd("Step");
    this.cmd("Step");
    this.cmd("Step");
}

Huffman.prototype.updateHeight = function(Root, Height, Flag=true)
{
    var stack = [];
    var p = Root;

    // preorderTraversal
    while (stack.length != 0 || p != null)
    {
        if (p != null)
        {
            stack.push(p);
            p.height = p.height + Height;
            p.y = HUFFMAN_NODE_HEIGHT_START - p.height * HUFFMAN_NODE_HEIGHT_SPACING;
            if (Flag)
            {
                this.cmd("SetForegroundColor", p.id, SHOW_RED_COLOR);
                this.cmd("Move", p.id, p.x, p.y);
            }
            p = p.left;
        }
        else
        {
            var node = stack.pop();
            p = node.right;
        }
    }

    this.cmd("Step");
    p = Root;

    // preorderTraversal
    while (stack.length != 0 || p != null)
    {
        if (p != null)
        {
            stack.push(p);
            if (Flag)
            {
                this.cmd("SetForegroundColor", p.id, SHOW_BLACK_COLOR);
            }
            p = p.left;
        }
        else
        {
            var node = stack.pop();
            p = node.right;
        }
    }
    this.cmd("Step");
}

Huffman.prototype.updatePosition = function(Root, Position, Flag=true)
{
    var stack = [];
    var p = Root;

    // preorderTraversal
    while (stack.length != 0 || p != null)
    {
        if (p != null)
        {
            stack.push(p);
            p.x = p.x + Position * HUFFMAN_NODE_WIDTH_SPACING;
            if (Flag)
            {
                this.cmd("Move", p.id, p.x, p.y);
            }
            p = p.left;
        }
        else
        {
            var node = stack.pop();
            p = node.right;
        }
    }
}

Huffman.prototype.getNumLeaves = function(Root)
{
    if (Root == null)
    {
        return 0;
    }
    else if (Root.left == null && Root.right == null)
    {
       return 1;
    }
    else
    {
        return this.getNumLeaves(Root.left) + this.getNumLeaves(Root.right);
    }
}

Huffman.prototype.buildHuffmanTree = function()
{
    var PQ = new MinHeap(PQ_SIZE);
    var Node = [];
    var MoveNode = [];
    for (var i = 0; i < this.numTrees; ++i)
    {
        Node[i] = new HuffmanNode();
        Node[i].weight = this.frequency[i];
        Node[i].ch = this.frequencyChar[i];
        Node[i].height = 0;
        Node[i].id = this.labTreeID[i];
        Node[i].x = i * HUFFMAN_NODE_WIDTH_SPACING + HUFFMAN_NODE_WIDTH_START;
        Node[i].y = HUFFMAN_NODE_HEIGHT_START;

        MoveNode[i] = new HuffmanNode();
        MoveNode[i].weight = this.frequency[i];
        MoveNode[i].ch = this.frequencyChar[i];
        MoveNode[i].height = 0;
        MoveNode[i].id = this.labTreeID[i];
        MoveNode[i].x = i * HUFFMAN_NODE_WIDTH_SPACING + HUFFMAN_NODE_WIDTH_START;
        MoveNode[i].y = HUFFMAN_NODE_HEIGHT_START;
        MoveNode[i].lastIndex = i;
        // PQ.Insert(Node[i]);
    }

    PQ.BuildHeap(Node, this.numTrees);

    while (PQ.GetSize() > 1)
    {
        var NewNode = new HuffmanNode();
        var NewLeftNode = PQ.DeleteMin();
        var NewRightNode = PQ.DeleteMin();

        // Keep NewLeftNode  == MoveNode[0]
        // Keep NewRightNode == MoveNode[1]
        if (NewRightNode.id == MoveNode[0].id)
        {
            var tmpNode = NewRightNode;
            NewRightNode = NewLeftNode;
            NewLeftNode = tmpNode;
        }
        else if (NewLeftNode.id != MoveNode[0].id)
        {
            for (var i = 1; i <= PQ.Size; ++i)
            {
                if (MoveNode[0].id == PQ.ArrayData[i].id)
                {
                    var tmpNode = PQ.ArrayData[i];
                    PQ.ArrayData[i] = NewLeftNode;
                    NewLeftNode = tmpNode;
                    break;
                }
            }
        }
        if (NewRightNode.id != MoveNode[1].id)
        {
            for (var i = 1; i <= PQ.Size; ++i)
            {
                if (MoveNode[1].id == PQ.ArrayData[i].id)
                {
                    var tmpNode = PQ.ArrayData[i];
                    PQ.ArrayData[i] = NewRightNode;
                    NewRightNode = tmpNode;
                    break;
                }
            }
        }

        NewNode.left = NewLeftNode;
        NewLeftNode.parent = NewNode;
        NewNode.right = NewRightNode;
        NewRightNode.parent = NewNode;
        NewNode.weight = NewNode.left.weight + NewNode.right.weight;
        NewNode.height = Math.max(NewNode.left.height, NewNode.right.height) + 1;
        NewNode.x = (NewNode.left.x + NewNode.right.x) / 2;
        NewNode.y = HUFFMAN_NODE_HEIGHT_START - NewNode.height * HUFFMAN_NODE_HEIGHT_SPACING;
        NewNode.id = this.nextIndex++;
        this.ctrlIDs.push(NewNode.id);
        PQ.Insert(NewNode);

        this.cmd("CreateCircle", NewNode.id, NewNode.weight, NewNode.x, NewNode.y);
        this.cmd("Connect", NewNode.id, NewNode.left.id);
        this.cmd("Connect", NewNode.id, NewNode.right.id);
        this.cmd("Step");

        // update height
        var lHeight = 0;
        var rHeight = 0;
        if (NewNode.left.height > NewNode.right.height)
        {
            rHeight = NewNode.left.height - NewNode.right.height;
            this.updateHeight(NewNode.right, rHeight);
        }
        else if (NewNode.left.height < NewNode.right.height)
        {
            lHeight = NewNode.right.height - NewNode.left.height;
            this.updateHeight(NewNode.left, lHeight);
        }

        var leftNode;
        var rightNode;
        var addNode = new HuffmanNode();
        for (var i = 0; i < MoveNode.length; ++i)
        {
            if (MoveNode[i].id == NewNode.left.id)
            {
                leftNode = MoveNode.splice(i, 1, addNode)[0];
                if (lHeight != 0)
                {
                    this.updateHeight(leftNode, lHeight, false);
                }
                break;
            }
        }

        for (var i = 0; i < MoveNode.length; ++i)
        {
            if (MoveNode[i].id == NewNode.right.id)
            {
                rightNode = MoveNode.splice(i, 1)[0];
                if (rHeight != 0)
                {
                    this.updateHeight(rightNode, rHeight, false);
                }
                break;
            }
        }
        addNode.left = leftNode;
        leftNode.parent = addNode;
        addNode.right = rightNode;
        rightNode.parent = addNode;
        addNode.weight = NewNode.weight;
        addNode.height = NewNode.height;
        addNode.x = NewNode.x;
        addNode.y = NewNode.y;
        addNode.ch = NewNode.ch;
        addNode.id = NewNode.id;

        for (var i = 0; i < MoveNode.length; ++i)
        {
            MoveNode[i].lastIndex = i;
        }

        // sort
        MoveNode.sort(function(a, b) {
            return a.weight - b.weight;
        });

        var map = new Map();
        for (var i = 0; i < MoveNode.length; ++i)
        {
            if (MoveNode[i].lastIndex > i)  // move left
            {
                var moveLeftPos = -this.getNumLeaves(addNode);
                map.set(MoveNode[i], moveLeftPos);
                MoveNode[i].lastIndex = i;
            }
            else if (MoveNode[i].lastIndex < i)  // move right
            {
                var moveRightPos = 0;
                for (var [key, value] of map)
                {
                    moveRightPos = moveRightPos + this.getNumLeaves(key);
                }
                map.set(MoveNode[i], moveRightPos);
                MoveNode[i].lastIndex = i;
            }
        }

        for (var [key, value] of map)
        {
            this.updatePosition(key, value);
            for (var j = 1; j <= PQ.Size; ++j)
            {
                if (key.id == PQ.ArrayData[j].id)
                {
                    this.updatePosition(PQ.ArrayData[j], value, false);
                    break;
                }
            }
            map.delete(key);
        }
        this.cmd("Step");
    }

    this.treeRoot = PQ.DeleteMin();

    console.log(this.treeRoot);
}

Huffman.prototype.getSortedLeaves = function(root)
{
    var arr = [];
    var stack = [];
    var p = root;

    // preorderTraversal
    while (stack.length != 0 || p != null)
    {
        if (p != null)
        {
            stack.push(p);
            if (p.left == null && p.right == null)
            {
                arr.push(p);
            }
            p = p.left;
        }
        else
        {
            var node = stack.pop();
            p = node.right;
        }
    }

    return arr;
}

Huffman.prototype.getSortedNodes = function(root)
{
    var arr = [];
    var stack = [];
    var p = root;

    // preorderTraversal
    while (stack.length != 0 || p != null)
    {
        if (p != null)
        {
            stack.push(p);
            arr.push(p);
            p = p.left;
        }
        else
        {
            var node = stack.pop();
            p = node.right;
        }
    }

    return arr;
}

Huffman.prototype.buildCodes = function(root)
{
    var leavesArray = this.getSortedLeaves(root);
    var nodesArray = this.getSortedNodes(root);
    this.enChars = new Array(leavesArray.length);
    this.enNodes = new Array(leavesArray.length);
    this.labEncodeID = new Array(leavesArray.length);
    for (var i = 0; i < leavesArray.length; ++i)
    {
        this.enChars[i] = new Array();
        this.enNodes[i] = new Array();
        this.labEncodeID[i] = new Array();
    }

    var j = 0;
    var k = 0;
    for (var i = 0; i < leavesArray.length; ++i)
    {
        var leaf = leavesArray[i];
        while (leaf != root)
        {
            for (j = 0; j < nodesArray.length; ++j)
            {
                if (leaf.parent.id == nodesArray[j].id)
                {
                    break;
                }
            }
            if (nodesArray[j].left === leaf)
            {
                this.enChars[i].splice(0, 0, "0");
                this.enNodes[i].splice(0, 0, leaf);
                if (!nodesArray[j].left.codeFlag)
                {
                    var codeID = this.nextIndex++;
                    this.ctrlIDs.push(codeID);
                    nodesArray[j].left.codeFlag = true;
                    nodesArray[j].left.codeID = codeID;
                    var xpos = (leaf.x + nodesArray[j].x) / 2 - 6;
                    var ypos = (leaf.y + nodesArray[j].y) / 2 - 6;
                    this.cmd("CreateLabel", codeID, "0", xpos, ypos);
                    ++k;
                }
                this.labEncodeID[i].splice(0, 0, nodesArray[j].left.codeID);
            }
            else
            {
                this.enChars[i].splice(0, 0, "1");
                this.enNodes[i].splice(0, 0, leaf);
                if (!nodesArray[j].right.codeFlag)
                {
                    var codeID = this.nextIndex++;
                    this.ctrlIDs.push(codeID);
                    nodesArray[j].right.codeFlag = true;
                    nodesArray[j].right.codeID = codeID;
                    var xpos = (leaf.x + nodesArray[j].x) / 2 + 6;
                    var ypos = (leaf.y + nodesArray[j].y) / 2 - 6;
                    this.cmd("CreateLabel", codeID, "1", xpos, ypos);
                    ++k;
                }
                this.labEncodeID[i].splice(0, 0, nodesArray[j].right.codeID);
            }
            leaf = nodesArray[j];
            if (leaf === root)
            {
                this.enNodes[i].splice(0, 0, leaf);
            }
        }
    }

    this.cmd("Step");

    for (var i = 0; i < leavesArray.length; ++i)
    {
        for (var j = 0; j < this.enChars[i].length; ++j)
        {
            this.cmd("SetForegroundColor", this.enNodes[i][j].id, SHOW_RED_COLOR);
            this.cmd("Step");
            this.codeText += this.enChars[i][j];
            this.cmd("SetText", this.codeTextID, this.codeText);
            this.cmd("SetForegroundColor", this.labEncodeID[i][j], SHOW_RED_COLOR);
            this.cmd("Disconnect", this.enNodes[i][j].id, this.enNodes[i][j + 1].id);
            this.cmd("Connect", this.enNodes[i][j].id, this.enNodes[i][j + 1].id, SHOW_RED_COLOR);
            this.cmd("SetForegroundColor", this.enNodes[i][j].id, SHOW_BLACK_COLOR);
            this.cmd("Step");
            this.cmd("Disconnect", this.enNodes[i][j].id, this.enNodes[i][j + 1].id);
            this.cmd("Connect", this.enNodes[i][j].id, this.enNodes[i][j + 1].id, SHOW_BLACK_COLOR);
            this.cmd("SetForegroundColor", this.labEncodeID[i][j], SHOW_BLACK_COLOR);
        }
        this.cmd("SetForegroundColor", this.enNodes[i][this.enChars[i].length].id, SHOW_RED_COLOR);

        var moveCodeText = this.codeText;
        var moveCodeTextID = this.nextIndex++;
        this.ctrlIDs.push(moveCodeTextID);
        this.cmd("CreateLabel", moveCodeTextID, moveCodeText, CODE_HEADER_ELEMENT_X, CODE_HEADER_ELEMENT_Y, 0);
        this.codeText = "";
        this.cmd("SetText", this.codeTextID, this.codeText);

        for (var k = 0; k < this.numChars; ++k)
        {
            if (this.encodeHeader[k] === this.enNodes[i][this.enChars[i].length].ch)
            {
                this.cmd("SetForegroundColor", this.encodeHeaderID[k], SHOW_RED_COLOR);
                this.cmd("Step");
                this.encodeArray[k] = moveCodeText;
                this.encodeArrayID[k] = moveCodeTextID;
                this.cmd("Move", moveCodeTextID, HUFFMAN_ENCODE_ELEMENT_X, HUFFMAN_ENCODE_ELEMENT_Y + k * HUFFMAN_ENCODE_LINE_SPACING);
                this.cmd("Step");
                this.cmd("SetForegroundColor", this.encodeHeaderID[k], SHOW_BLUE_COLOR);
                break;
            }
        }
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.enNodes[i][this.enChars[i].length].id, SHOW_BLACK_COLOR);
    }

    this.cmd("SetText", this.codeHeaderID, "");
    this.cmd("SetText", this.codeTextID, "");
}

Huffman.prototype.drawEncodeTable = function()
{
    this.encodeTableID = this.nextIndex++;
    this.ctrlIDs.push(this.encodeTableID);
    var width = this.treeRoot.height * HUFFMAN_ENCODE_WIDTH_SPACING + HUFFMAN_ENCODE_WIDTH_START;
    var height = this.numChars * HUFFMAN_ENCODE_LINE_SPACING + 4;

    /**
     * Bug: When using the backgroundColor and foregroundColor parameters, xJustify and yJustify are invalid.
     */
    // this.cmd("CreateRectangle", this.encodeTableID, "", width, height, HUFFMAN_ENCODE_TABLE_X, HUFFMAN_ENCODE_TABLE_Y, "left", "top", SHOW_BLACK_COLOR, SHOW_BLUE_COLOR);
    this.cmd("CreateRectangle", this.encodeTableID, "", width, height, HUFFMAN_ENCODE_TABLE_X, HUFFMAN_ENCODE_TABLE_Y, "left", "top");
    this.cmd("SetForegroundColor", this.encodeTableID, SHOW_BLUE_COLOR);

    this.encodeHeader = [];
    this.encodeHeaderID = [];
    this.encodeArray = [];
    this.encodeArrayID = [];
    for (var i = 0; i < this.numChars; ++i)
    {
        this.encodeHeaderID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.encodeHeaderID[i]);
        this.encodeHeader[i] = this.frequencyChar[i];
        this.cmd("CreateLabel", this.encodeHeaderID[i], this.encodeHeader[i], HUFFMAN_ENCODE_LABEL_X, HUFFMAN_ENCODE_LABEL_Y + i * HUFFMAN_ENCODE_LINE_SPACING, 0);
        this.cmd("SetForegroundColor", this.encodeHeaderID[i], SHOW_BLUE_COLOR);
    }
    this.cmd("Step");

    this.codeHeaderID = this.nextIndex++;
    this.ctrlIDs.push(this.codeHeaderID);
    this.cmd("CreateLabel", this.codeHeaderID, "Building Code:", CODE_HEADER_TABLE_X, CODE_HEADER_TABLE_Y, 0);
    this.cmd("SetForegroundColor", this.codeHeaderID, SHOW_BLUE_COLOR);
    this.codeTextID = this.nextIndex++;
    this.ctrlIDs.push(this.codeTextID);
    this.codeText = "";
    this.cmd("CreateLabel", this.codeTextID, this.codeText, CODE_HEADER_ELEMENT_X, CODE_HEADER_ELEMENT_Y, 0);
    this.cmd("Step");
}

Huffman.prototype.doEncode = function(elemToEncode)
{
    this.commands = [];

    this.reset();

    var inputLabelID = this.nextIndex++;
    this.ctrlIDs.push(inputLabelID);
    this.cmd("CreateLabel", inputLabelID, "Input: ", HUFFMAN_INPUT_LABEL_X, HUFFMAN_INPUT_LABEL_Y);

    var inputElementID = [];
    var inputFreqTimes = [];
    for (var i = 0; i < elemToEncode.length; ++i)
    {
        inputFreqTimes[i] = 0;
        inputElementID[i] = this.nextIndex++;
        this.ctrlIDs.push(inputElementID[i]);
        this.cmd("CreateLabel", inputElementID[i], elemToEncode[i], HUFFMAN_INPUT_ELEMENT_X + i * HUFFMAN_INPUT_ELEMENT_SPACING, HUFFMAN_INPUT_ELEMENT_Y, 0);
    }
    this.cmd("Step");

    // Show node
    this.numChars = this.getNumChars(elemToEncode);
    this.numTrees = this.numChars;
    for (var i = 0; i < this.numTrees; ++i)
    {
        this.labTreeID[i] = this.nextIndex++;
        this.ctrlIDs.push(this.labTreeID[i]);
        this.cmd("CreateCircle", this.labTreeID[i], "0\n'" + this.frequencyChar[i] + "'", i * HUFFMAN_NODE_WIDTH_SPACING + HUFFMAN_NODE_WIDTH_START, HUFFMAN_NODE_HEIGHT_START);
    }

    this.cmd("Step");
    // Calculate the number of characters
    for (var i = 0; i < elemToEncode.length; ++i)
    {
        var j = 0
        while (j < this.numChars)
        {
            if (this.frequencyChar[j] == elemToEncode[i])
            {
                inputFreqTimes[j]++;
                break;
            }
            else
            {
                ++j;
            }
        }
        if (i != 0)
        {
            this.cmd("SetForegroundColor", inputElementID[i - 1], SHOW_BLACK_COLOR);
        }
        this.cmd("SetForegroundColor", inputElementID[i], SHOW_RED_COLOR);
        this.cmd("SetForegroundColor", this.labTreeID[j], SHOW_RED_COLOR);
        this.cmd("SetText", this.labTreeID[j], inputFreqTimes[j] + "\n'" + this.frequencyChar[j] + "'");
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.labTreeID[j], SHOW_BLACK_COLOR);
        this.cmd("Step");
    }
    this.cmd("SetForegroundColor", inputElementID[elemToEncode.length - 1], SHOW_BLACK_COLOR);
    this.cmd("Step");

    // Sort node
    this.SortByFrequency();

    this.buildHuffmanTree();

    this.drawEncodeTable();

    this.buildCodes(this.treeRoot);

    var enOutputLabelID = this.nextIndex++;
    this.ctrlIDs.push(enOutputLabelID);
    var xpos = HUFFMAN_ENCODE_OUT_LABEL_START + this.treeRoot.height * HUFFMAN_ENCODE_OUT_LABEL_SPACING;
    var ypos = HUFFMAN_ENCODE_OUT_LABEL_Y;
    this.cmd("CreateLabel", enOutputLabelID, "Encoded Output:", xpos, ypos, 0);
    this.cmd("SetForegroundColor", enOutputLabelID, SHOW_BLUE_COLOR);
    var enOutputID = this.nextIndex++;
    this.ctrlIDs.push(enOutputID);
    this.enOutputText = "";
    var xpos = HUFFMAN_ENCODE_OUT_ELEMENT_START + this.treeRoot.height * HUFFMAN_ENCODE_OUT_ELEMENT_SPACING;
    var ypos = HUFFMAN_ENCODE_OUT_ELEMENT_Y;
    this.cmd("CreateLabel", enOutputID, this.enOutputText, xpos, ypos, 0);
    var enMoveOutID = this.nextIndex++;
    this.ctrlIDs.push(enMoveOutID);
    this.cmd("CreateLabel", enMoveOutID, "", 0, 0, 0);

    for (var i = 0; i < elemToEncode.length; ++i)
    {
        this.cmd("SetForegroundColor", inputElementID[i], SHOW_RED_COLOR);
        for (var j = 0; j < this.numChars; ++j)
        {
            if (this.encodeHeader[j] === elemToEncode[i])
            {
                this.cmd("SetForegroundColor", this.encodeHeaderID[j], SHOW_RED_COLOR);
                this.cmd("Step");
                var xMovePos = HUFFMAN_ENCODE_ELEMENT_X;
                var yMovePos = HUFFMAN_ENCODE_ELEMENT_Y + j * HUFFMAN_ENCODE_LINE_SPACING;
                this.cmd("SetPosition", enMoveOutID, xMovePos, yMovePos);
                this.cmd("SetText", enMoveOutID, this.encodeArray[j]);
                xMovePos = HUFFMAN_ENCODE_OUT_ELEMENT_START + this.treeRoot.height * HUFFMAN_ENCODE_OUT_ELEMENT_SPACING + this.enOutputText.length * 6;
                yMovePos = HUFFMAN_ENCODE_OUT_ELEMENT_Y;
                this.cmd("Move", enMoveOutID, xMovePos, yMovePos);
                this.cmd("Step");
                this.enOutputText += this.encodeArray[j];
                this.cmd("SetText", enOutputID, this.enOutputText);
                this.cmd("SetText", enMoveOutID, "");
                this.cmd("Step");
                this.cmd("SetForegroundColor", this.encodeHeaderID[j], SHOW_BLUE_COLOR);
                break;
            }
        }
        this.cmd("SetForegroundColor", inputElementID[i], SHOW_BLACK_COLOR);
        this.cmd("Step");
    }

    this.cmd("SetText", inputLabelID, "");
    for (var i = 0; i < elemToEncode.length; ++i)
    {
        this.cmd("SetText", inputElementID[i], "");
    }
    var xMovePos = HUFFMAN_ENCODE_OUT_LABEL_START + this.treeRoot.height * HUFFMAN_ENCODE_OUT_LABEL_SPACING;
    var yMovePos = HUFFMAN_ENCODE_OUT_LABEL_Y - HUFFMAN_ENCODE_LINE_SPACING;
    this.cmd("Move", enOutputLabelID, xMovePos, yMovePos);
    var xMovePos = HUFFMAN_ENCODE_OUT_ELEMENT_START + this.treeRoot.height * HUFFMAN_ENCODE_OUT_ELEMENT_SPACING;
    var yMovePos = HUFFMAN_ENCODE_OUT_ELEMENT_Y - HUFFMAN_ENCODE_LINE_SPACING;
    this.cmd("Move", enOutputID, xMovePos, yMovePos);
    this.cmd("Step");

    var deOutputLabelID = this.nextIndex++;
    this.ctrlIDs.push(deOutputLabelID);
    var xpos = xMovePos;
    var ypos = yMovePos + HUFFMAN_DECODE_OUT_LINE_SPACING;
    this.cmd("CreateLabel", deOutputLabelID, "Decoded output:", xpos, ypos, 0);
    this.cmd("SetForegroundColor", deOutputLabelID, SHOW_BLUE_COLOR);
    this.deOutputID = this.nextIndex++;
    this.ctrlIDs.push(this.deOutputID);
    this.deOutputText = "";
    var xpos = xMovePos;
    var ypos = ypos + HUFFMAN_DECODE_OUT_LINE_SPACING;
    this.cmd("CreateLabel", this.deOutputID, this.deOutputText, xpos, ypos, 0);
    this.cmd("Step");

    this.doDecode(this.treeRoot, this.enOutputText);  // Do decryption

    return this.commands;
}

Huffman.prototype.doDecode = function(root, encodeText)
{
    var p = root;
    var decodeStr = "";
    var deMoveOutID = this.nextIndex++;
    this.ctrlIDs.push(deMoveOutID);
    this.cmd("CreateLabel", deMoveOutID, "", 0, 0, 0);

    for (var i = 0; i < encodeText.length; ++i)
    {
        if (encodeText[i] === "0")
        {
            p = p.left;
        }
        else if (encodeText[i] === "1")
        {
            p = p.right;
        }

        decodeStr += encodeText[i];
        if (p.left == null && p.right == null)
        {
            for (var j = 0; j < this.enNodes.length; ++j)
            {
                if (p.id === this.enNodes[j][this.enNodes[j].length - 1].id)
                {
                    for (var k = 0; k < this.enChars[j].length; ++k)
                    {
                        this.cmd("SetForegroundColor", this.enNodes[j][k].id, SHOW_RED_COLOR);
                        this.cmd("Step");
                        this.cmd("SetForegroundColor", this.labEncodeID[j][k], SHOW_RED_COLOR);
                        this.cmd("Disconnect", this.enNodes[j][k].id, this.enNodes[j][k + 1].id);
                        this.cmd("Connect", this.enNodes[j][k].id, this.enNodes[j][k + 1].id, SHOW_RED_COLOR);
                        this.cmd("SetForegroundColor", this.enNodes[j][k].id, SHOW_BLACK_COLOR);
                        this.cmd("Step");
                        this.cmd("Disconnect", this.enNodes[j][k].id, this.enNodes[j][k + 1].id);
                        this.cmd("Connect", this.enNodes[j][k].id, this.enNodes[j][k + 1].id, SHOW_BLACK_COLOR);
                        this.cmd("SetForegroundColor", this.labEncodeID[j][k], SHOW_BLACK_COLOR);
                    }

                    var m = 0;
                    for (m = 0; m < this.encodeHeader.length; ++m)
                    {
                        if (p.ch === this.encodeHeader[m])
                        {
                            break;
                        }
                    }

                    this.cmd("SetForegroundColor", this.enNodes[j][this.enChars[j].length].id, SHOW_RED_COLOR);
                    this.cmd("SetForegroundColor", this.encodeArrayID[m], SHOW_RED_COLOR);
                    this.cmd("Step");

                    this.cmd("SetPosition", deMoveOutID, HUFFMAN_ENCODE_LABEL_X, HUFFMAN_ENCODE_LABEL_Y + m * HUFFMAN_ENCODE_LINE_SPACING);
                    this.cmd("SetText", deMoveOutID, p.ch);

                    var xMovePos = HUFFMAN_ENCODE_OUT_ELEMENT_START + this.treeRoot.height * HUFFMAN_ENCODE_OUT_ELEMENT_SPACING + this.deOutputText.length * 6;
                    var yMovePos = HUFFMAN_ENCODE_OUT_ELEMENT_Y - HUFFMAN_ENCODE_LINE_SPACING + 2 * HUFFMAN_DECODE_OUT_LINE_SPACING;
                    this.cmd("Move", deMoveOutID, xMovePos, yMovePos);
                    this.cmd("Step");
                    this.deOutputText += p.ch;
                    this.cmd("SetText", this.deOutputID, this.deOutputText);
                    this.cmd("SetText", deMoveOutID, "");
                    this.cmd("Step");
                    this.cmd("SetForegroundColor", this.enNodes[j][this.enChars[j].length].id, SHOW_BLACK_COLOR);
                    this.cmd("SetForegroundColor", this.encodeArrayID[m], SHOW_BLACK_COLOR);
                    break;
                }
            }
            decodeStr = "";
            p = root;
        }
    }

    this.cmd("Step");
    this.cmd("Step");
    this.cmd("Step");
}

/* Huffman Tree define */
function HuffmanNode()
{
    this.id = 0;
    this.weight = 0;  // Huffman
    this.ch = '';
    this.height = 0;
    this.x = 0;
    this.y = 0;
    this.lastIndex = 0;
    this.left = null;  // Huffman
    this.right = null;  // Huffman
    this.parent = null;
    this.codeFlag = false;
    this.codeTextID = 0;
}

/* MinHeap define */
function MinHeap(Capacity)
{
    return this.Initialize(Capacity);
}

/* Min Heap Function Implementation */
MinHeap.prototype.Initialize = function(MaxElements)
{
    if (MaxElements < MinPQSize)
    {
        console.log("Priority queue size is too small");
        return null;
    }

    this.Size = 0;
    this.Capacity = MaxElements || 0;
    this.ArrayData = [];

    /* Allocate the array plus one extra for sentinel */
    this.ArrayData[0] = new HuffmanNode();
    this.ArrayData[0].weight = Number.MIN_VALUE;

    return this;
}

MinHeap.prototype.MakeEmpty = function()
{
    this.Size = 0;
}

MinHeap.prototype.GetParentIndex = function(Index)
{
    return Index / 2;
}

MinHeap.prototype.GetChildIndex = function(Index)
{
    return Index * 2;
}

MinHeap.prototype.PercolateUp = function(Child)
{
    var Parent = this.GetParentIndex(Child);
    while (Child != 0)
    {
        Parent = this.GetParentIndex(Child);
        if (this.ArrayData[Parent].weight > this.ArrayData[Child].weight)
        {
            //[this.ArrayData[Parent], this.ArrayData[Child]] = [this.ArrayData[Child], this.ArrayData[Parent]];  // Swap
            var tmp = this.ArrayData[Parent];
            this.ArrayData[Parent] = this.ArrayData[Child];
            this.ArrayData[Child] = tmp;  // Swap
            Child = Parent;
        }
        else
        {
            break;
        }
    }
}

MinHeap.prototype.PercolateDown = function(Parent)
{
    var Child = this.GetChildIndex(Parent);
    while (Child <= this.Size)
    {
        /* Find smaller child */
        if (Child != this.Size && this.ArrayData[Child + 1].weight < this.ArrayData[Child].weight)
        {
            Child = Child + 1;
        }

        /* Percolate one level */
        if (this.ArrayData[Child] != undefined && this.ArrayData[Parent] != undefined &&
            this.ArrayData[Child].weight < this.ArrayData[Parent].weight)
        {
            var tmp = this.ArrayData[Parent];
            this.ArrayData[Parent] = this.ArrayData[Child];
            this.ArrayData[Child] = tmp;  // Swap

            /* Update index */
            Parent = Child;
            Child = this.GetChildIndex(Parent);
        }
        else
        {
            break;
        }
    }
}

/* P->Element[0] is a sentinel */
MinHeap.prototype.Insert = function(X)
{
    if (this.IsFull())
    {
        console.log("Priority queue is full");
        return;
    }

    /* Percolate up */
    var i = 0;
    for (i = ++this.Size; this.ArrayData[i / 2] != undefined && this.ArrayData[i / 2].weight > X.weight; i /= 2)
    {
        this.ArrayData[i] = this.ArrayData[i / 2];
    }

    this.ArrayData[i] = X;
}

MinHeap.prototype.DeleteMin = function()
{
    if (this.IsEmpty())
    {
        console.log("Priority queue is empty");
        return this.ArrayData[0];
    }

    var i = 0;
    var Child = 0;
    var MinElement = this.ArrayData[1];
    var LastElement = this.ArrayData[this.Size--];

    /* Percolate down */
    for (i = 1; i * 2 <= this.Size; i = Child)
    {
        /* Find smaller child */
        Child = i * 2;
        if (Child != this.Size && this.ArrayData[Child + 1].weight < this.ArrayData[Child].weight)
        {
            ++Child;
        }

        /* Percolate one level */
        if (LastElement.weight > this.ArrayData[Child].weight)
        {
            this.ArrayData[i] = this.ArrayData[Child];
        }
        else
        {
            break;
        }
    }

    this.ArrayData[i] = LastElement;

    return MinElement;
}

MinHeap.prototype.FindMin = function()
{
    if (!this.IsEmpty())
    {
        return this.ArrayData[1];
    }
    else
    {
        console.log("Priority Queue is empty");
        return this.ArrayData[0];
    }
}

/* Put N keys into binary heap */
MinHeap.prototype.BuildHeap = function(A, N)
{
    var i = 0;

    this.Size = N;
    for (i = 0; i < N; ++i)
    {
        this.ArrayData[i + 1] = A[i];
    }

    for (i = N / 2; i > 0; --i)
    {
        this.PercolateDown(i);
    }
}

MinHeap.prototype.DecreaseKey = function(P, X)
{
    if (P <= 0 || P > this.Size)
    {
        console.log("Position out of range");
        return;
    }

    this.ArrayData[P].weight = this.ArrayData[P].weight - X.weight;
    this.PercolateUp(P);
}

MinHeap.prototype.IncreaseKey = function(P, X)
{
    if (P <= 0 || P > this.Size)
    {
        console.log("Position out of range");
        return;
    }

    this.ArrayData[P].weight = this.ArrayData[P].weight + X.weight;
    this.PercolateDown(P);
}

MinHeap.prototype.Delete = function(P)
{
    if (P <= 0 || P > this.Size)
    {
        console.log("Position out of range");
        return;
    }

    var MaxElement = new HuffmanNode();
    MaxElement.weight = Number.MAX_VALUE;

    this.DecreaseKey(P, MaxElement);
    this.DeleteMin();
}

MinHeap.prototype.IsEmpty = function()
{
    return this.Size == 0;
}

MinHeap.prototype.IsFull = function()
{
    return this.Size == this.Capacity;
}

MinHeap.prototype.GetSize = function()
{
    return this.Size;
}

MinHeap.prototype.Retrieve = function(Index)
{
    return this.ArrayData[Index];
}
/* MinHeap EOF */

var currentAlg;

function init()
{
    var animMgr = initCanvas();
    currentAlg = new Huffman(animMgr, canvas.width, canvas.height);
}
