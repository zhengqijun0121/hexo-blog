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


function AnimatedBTreeNode(id, widthPerElem, h, numElems, fillColor, edgeColor)
{
    this.init(id, widthPerElem, h, numElems, fillColor, edgeColor);
}

AnimatedBTreeNode.prototype = new AnimatedObject();
AnimatedBTreeNode.prototype.constructor = AnimatedBTreeNode;
AnimatedBTreeNode.superclass = AnimatedObject.prototype;

AnimatedBTreeNode.MIN_WIDTH = 10;
AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT = 5;

AnimatedBTreeNode.prototype.init = function(id, widthPerElem, h, numElems, fillColor, edgeColor)
{
    AnimatedBTreeNode.superclass.init.call(this);

    this.objectID = id;
    this.backgroundColor = fillColor;
    this.foregroundColor = edgeColor;
    this.widthPerElement = widthPerElem;
    this.nodeHeight = h;
    this.numLabels = numElems;
    this.labels = new Array(this.numLabels);
    this.labelColors = new Array(this.numLabels);
    for (let i = 0; i < this.numLabels; ++i)
    {
        this.labelColors[i] = this.foregroundColor;
    }
}

AnimatedBTreeNode.prototype.getNumElements = function()
{
    return this.numLabels;
}

AnimatedBTreeNode.prototype.getWidth = function()
{
    if (this.numLabels > 0)
    {
        return (this.widthPerElement * this.numLabels);
    }
    else
    {
        return AnimatedBTreeNode.MIN_WIDTH;
    }
}

AnimatedBTreeNode.prototype.setNumElements = function(newNumElements)
{
    if (this.numLabels < newNumElements)
    {
        for (let i = this.numLabels; i < newNumElements; ++i)
        {
            this.labels[i] = "";
            this.labelColors[i] = this.foregroundColor;
        }
        this.numLabels = newNumElements;
    }
    else if (this.numLabels > newNumElements)
    {
        for (let i = newNumElements; i < this.numLabels; ++i)
        {
            this.labels[i] = null;
        }
        this.numLabels = newNumElements;
    }
}

AnimatedBTreeNode.prototype.left = function()
{
    return this.x - this.getWidth() / 2.0;
}

AnimatedBTreeNode.prototype.right = function()
{
    return this.x + this.getWidth() / 2.0;
}

AnimatedBTreeNode.prototype.top = function()
{
    return this.y - this.nodeHeight / 2.0;
}

AnimatedBTreeNode.prototype.bottom = function()
{
    return this.y + this.nodeHeight / 2.0;
}

AnimatedBTreeNode.prototype.draw = function(ctx)
{
    let startX = this.left();
    let startY = this.top();

    if (startX == NaN)
    {
        startX = 0;
    }

    if (this.highlighted)
    {
        ctx.strokeStyle = "#ff0000";
        ctx.fillStyle = "#ff0000";

        ctx.beginPath();
        ctx.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
        ctx.lineTo(startX + this.getWidth() + this.highlightDiff, startY - this.highlightDiff);
        ctx.lineTo(startX + this.getWidth() + this.highlightDiff, startY + this.nodeHeight + this.highlightDiff);
        ctx.lineTo(startX - this.highlightDiff, startY + this.nodeHeight + this.highlightDiff);
        ctx.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    ctx.strokeStyle = this.foregroundColor;
    ctx.fillStyle = this.backgroundColor;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + this.getWidth(), startY);
    ctx.lineTo(startX + this.getWidth(), startY + this.nodeHeight);
    ctx.lineTo(startX, startY + this.nodeHeight);
    ctx.lineTo(startX, startY);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = AnimatedBTreeNode.superclass.labelFontSize + 'px sans-serif';  // default['10px sans-serif']
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.numLabels; ++i)
    {
        let labelX = this.x - this.widthPerElement * this.numLabels / 2 + this.widthPerElement / 2 + i * this.widthPerElement;
        let labelY = this.y;

        ctx.fillStyle = this.labelColors[i];
        ctx.fillText(this.labels[i], labelX, labelY);
    }
}

AnimatedBTreeNode.prototype.getHeight = function()
{
    return this.nodeHeight;
}

AnimatedBTreeNode.prototype.setForegroundColor = function(newColor)
{
    this.foregroundColor = newColor;
    for (let i = 0; i < this.numLabels; ++i)
    {
        this.labelColor[i] = newColor;
    }
}

// TODO:  Kill the magic numbers here
AnimatedBTreeNode.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor)
{
    if (anchor == 0)
    {
        return [this.left() + AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
    }
    else if (anchor == this.numLabels)
    {
        return [this.right() - AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
    }
    else
    {
        return [this.left() + anchor * this.widthPerElement, this.y];
    }
}

AnimatedBTreeNode.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
    if (fromY < this.y - this.nodeHeight / 2)
    {
        return [this.x, this.y - this.nodeHeight / 2];
    }
    else if (this.fromY > this.y + this.nodeHeight / 2)
    {
        return [this.x, this.y + this.nodeHeight / 2];
    }
    else if (fromX < this.x - this.getWidth() / 2)
    {
        return [this.x - this.getWidth() / 2, this.y];
    }
    else
    {
        return [this.x + this.getWidth() / 2, this.y];
    }
}

AnimatedBTreeNode.prototype.createUndoDelete = function()
{
    return new UndoDeleteBTreeNode(this.objectID, this.numLabels, this.labels, this.x, this.y, this.widthPerElement, this.nodeHeight, this.labelColors, this.backgroundColor, this.foregroundColor, this.layer, this.highlighted);
}

AnimatedBTreeNode.prototype.getTextColor = function(textIndex)
{
    textIndex = (textIndex == undefined) ? 0 : textIndex;
    return this.labelColors[textIndex];
}

AnimatedBTreeNode.prototype.getText = function(index)
{
    index = (index == undefined) ? 0 : index;
    return this.labels[index];
}

AnimatedBTreeNode.prototype.setTextColor = function(color, textIndex)
{
    textIndex = (textIndex == undefined) ? 0 : textIndex;
    this.labelColors[textIndex] = color;
}

AnimatedBTreeNode.prototype.setText = function(newText, textIndex)
{
    textIndex = (textIndex == undefined) ? 0 : textIndex;
    this.labels[textIndex] = newText;
}

function UndoDeleteBTreeNode(id, numLab, labelText, x, y, wPerElement, nHeight, lColors, bgColor, fgColor, l, highlighted)
{
    this.objectID = id;
    this.posX = x;
    this.posY = y;
    this.widthPerElem = wPerElement;
    this.nodeHeight = nHeight;
    this.backgroundColor= bgColor;
    this.foregroundColor = fgColor;
    this.numElems = numLab;
    this.labels = labelText;
    this.labelColors = lColors;
    this.layer = l;
    this.highlighted = highlighted;
}

UndoDeleteBTreeNode.prototype = new UndoBlock();
UndoDeleteBTreeNode.prototype.constructor = UndoDeleteBTreeNode;

UndoDeleteBTreeNode.prototype.undoInitialStep = function(world)
{
    world.addBTreeNode(this.objectID, this.widthPerElem, this.nodeHeight, this.numElems, this.backgroundColor, this.foregroundColor);
    world.setNodePosition(this.objectID, this.posX, this.posY);
    for (let i = 0; i < this.numElems; ++i)
    {
        world.setText(this.objectID, this.labels[i], i);
        world.setTextColor(this.objectID, this.labelColors[i], i);
    }
    world.setHighlight(this.objectID, this.highlighted);
    world.setLayer(this.objectID, this.layer);
}
