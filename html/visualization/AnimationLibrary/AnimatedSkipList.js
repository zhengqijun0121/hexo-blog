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


const NINF = '\u2212\u221E'; // Negative infinity
const PINF = '\u221E'; // Positive infinity

function AnimatedSkipList(id, val, wth, hgt, fillColor, edgeColor)
{
    this.init(id, val, wth, hgt, fillColor, edgeColor);
}

AnimatedSkipList.prototype = new AnimatedObject();
AnimatedSkipList.prototype.constructor = AnimatedSkipList;
AnimatedSkipList.superclass = AnimatedObject.prototype;

AnimatedSkipList.prototype.init = function(id, val, wth, hgt, fillColor, edgeColor)
{
    AnimatedSkipList.superclass.init.call(this);

    this.objectID = id;
    this.w = wth;
    this.h = hgt;
    this.backgroundColor = fillColor;
    this.foregroundColor = edgeColor;
    this.highlighted = false;
    this.label = val;
    this.labelPosX = 0;
    this.labelPosY = 0;
    this.labelColor = edgeColor;
    this.nullPointer = false;
}

AnimatedSkipList.prototype.setNull = function(np)
{
    if (this.nullPointer != np)
    {
        this.nullPointer = np;
    }
}

AnimatedSkipList.prototype.getNull = function()
{
    return this.nullPointer;
}

AnimatedSkipList.prototype.left = function()
{
    return this.x - this.w / 2.0;
}

AnimatedSkipList.prototype.right = function()
{
    return this.x + this.w / 2.0;
}

AnimatedSkipList.prototype.top = function()
{
    return this.y - this.h / 2.0;
}

AnimatedSkipList.prototype.bottom = function()
{
    return this.y + this.h / 2.0;
}

// TODO: Should we move this to the draw function, and save the
//       space of the arrays?  Bit of a leftover from the Flash code,
//       which did drawing differently
AnimatedSkipList.prototype.resetTextPosition = function()
{
    this.labelPosX = this.x;
    this.labelPosY = this.y;
}

AnimatedSkipList.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor)
{
    switch (anchor)
    {
        case 0:  // Top
            return [this.x, this.top()];
        case 1:  // Bottom
            return [this.x, this.bottom()];
        case 2:  // Left
            return [this.left(), this.y];
        case 3:  // Right
            return [this.right(), this.y];
        default:
            return this.getClosestCardinalPoint(fromX, fromY);
    }
}

AnimatedSkipList.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
    return this.getClosestCardinalPoint(fromX, fromY);  // Normal anchor
}

AnimatedSkipList.prototype.setWidth = function(wdth)
{
    this.w = wdth;
    this.resetTextPosition();
}

AnimatedSkipList.prototype.setHeight = function(hght)
{
    this.h = hght;
    this.resetTextPosition();
}

AnimatedSkipList.prototype.getWidth = function()
{
    return this.w;
}

AnimatedSkipList.prototype.getHeight = function()
{
    return this.h;
}

AnimatedSkipList.prototype.draw = function(ctx)
{
    const startX = this.left();
    const startY = this.top();

    if (this.highlighted)
    {
        ctx.strokeStyle = "#FF0000";
        ctx.fillStyle = "#FF0000";

        ctx.beginPath();
        ctx.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
        ctx.lineTo(startX + this.w + this.highlightDiff, startY - this.highlightDiff);
        ctx.lineTo(startX + this.w + this.highlightDiff, startY + this.h + this.highlightDiff);
        ctx.lineTo(startX - this.highlightDiff, startY + this.h + this.highlightDiff);
        ctx.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
    ctx.strokeStyle = this.foregroundColor;
    ctx.fillStyle = this.backgroundColor;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + this.w, startY);
    ctx.lineTo(startX + this.w, startY + this.h);
    ctx.lineTo(startX, startY + this.h);
    ctx.lineTo(startX, startY);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2;

    this.resetTextPosition();
    ctx.fillStyle = this.labelColor;
    if (this.label === NINF || this.label === PINF)
    {
        ctx.font = '18px sans-serif';
    }
    ctx.fillText(this.label, this.labelPosX, this.labelPosY);
}

AnimatedSkipList.prototype.setTextColor = function(color)
{
    this.labelColor = color;
}

AnimatedSkipList.prototype.getTextColor = function()
{
    return this.labelColor;
}

AnimatedSkipList.prototype.getText = function()
{
    return this.label;
}

AnimatedSkipList.prototype.setText = function(newText)
{
    this.label = newText;
    this.resetTextPosition();
}

AnimatedSkipList.prototype.setHighlight = function(value)
{
    if (value !== this.highlighted)
    {
        this.highlighted = value;
    }
}

AnimatedSkipList.prototype.createUndoDelete = function()
{
    return new UndoDeleteSkipList(this.objectID, this.label, this.x, this.y, this.w, this.h, this.labelColor,
                                    this.backgroundColor, this.foregroundColor, this.layer, this.nullPointer);
}

function UndoDeleteSkipList(id, lab, x, y, w, h, labColors, bgColor, fgColor, l, np)
{
    this.objectID = id;
    this.posX = x;
    this.posY = y;
    this.width = w;
    this.height = h;
    this.backgroundColor= bgColor;
    this.foregroundColor = fgColor;
    this.label = lab;
    this.labelColor = labColors;
    this.layer = l;
    this.nullPointer = np;
}

UndoDeleteSkipList.prototype = new UndoBlock();
UndoDeleteSkipList.prototype.constructor = UndoDeleteSkipList;

UndoDeleteSkipList.prototype.undoInitialStep = function(world)
{
    world.addSkipListObject(this.objectID, this.label, this.width, this.height, this.backgroundColor, this.foregroundColor);
    world.setNodePosition(this.objectID, this.posX, this.posY);
    world.setLayer(this.objectID, this.layer);
    world.setHighlight(this.objectID, this.highlighted, this.highlightColor);
    world.setNull(this.objectID, this.nullPointer);
}
