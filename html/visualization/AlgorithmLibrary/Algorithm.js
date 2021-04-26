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


function addLabelToAlgorithmBar(labelName)
{
    let element = document.createTextNode(labelName);

    let tableEntry = document.createElement("td");
    tableEntry.appendChild(element);

    let controlBar = document.getElementById("AlgorithmSpecificControls");

    // Append the element in page (in span).
    controlBar.appendChild(tableEntry);

    return element;
}

// TODO:  Make this stackable like radio buttons
//        (keep backwards compatible, thought)
function addCheckboxToAlgorithmBar(boxLabel)
{
    let element = document.createElement("input");

    element.setAttribute("type", "checkbox");
    element.setAttribute("value", boxLabel);

    let label = document.createTextNode(boxLabel);

    let tableEntry = document.createElement("td");
    tableEntry.appendChild(element);
    tableEntry.appendChild(label);

    let controlBar = document.getElementById("AlgorithmSpecificControls");

    // Append the element in page (in span).
    controlBar.appendChild(tableEntry);

    return element;
}

function addRadioButtonGroupToAlgorithmBar(buttonNames, groupName)
{
    let buttonList = [];
    let newTable = document.createElement("table");

    for (let i = 0; i < buttonNames.length; ++i)
    {
        let midLevel = document.createElement("tr");
        let bottomLevel = document.createElement("td");

        let button = document.createElement("input");
        button.setAttribute("type", "radio");
        button.setAttribute("name", groupName);
        button.setAttribute("value", buttonNames[i]);
        bottomLevel.appendChild(button);
        midLevel.appendChild(bottomLevel);
        let txtNode = document.createTextNode(" " + buttonNames[i]);
        bottomLevel.appendChild(txtNode);
        newTable.appendChild(midLevel);
        buttonList.push(button);
    }

    let topLevelTableEntry = document.createElement("td");
    topLevelTableEntry.appendChild(newTable);

    let controlBar = document.getElementById("AlgorithmSpecificControls");
    controlBar.appendChild(topLevelTableEntry);

    return buttonList;
}

function addControlToAlgorithmBar(type, value, placeholder) {
    let element = document.createElement("input");

    element.setAttribute("type", type);
    element.setAttribute("value", value);
    if (type.toUpperCase() == "TEXT" && placeholder !== undefined)
    {
        element.setAttribute("placeholder", placeholder);
    }

    let tableEntry = document.createElement("td");
    tableEntry.appendChild(element);

    let controlBar = document.getElementById("AlgorithmSpecificControls");
    // Append the element in page (in span).
    controlBar.appendChild(tableEntry);

    return element;
}

function updateControlToAlgorithmBar(pos, type, value) {
    let element = document.getElementById("AlgorithmSpecificControls");
    element.childNodes[pos].childNodes[0].setAttribute(type, value);
    return element;
}

function Algorithm(am)
{
}

Algorithm.prototype.setCodeAlpha = function(code, newAlpha)
{
    for (let i = 0; i < code.length; ++i)
    {
        for (let j = 0; j < code[i].length; ++j)
        {
            this.cmd("SetAlpha", code[i][j], newAlpha);
        }
    }
}

Algorithm.prototype.addCodeToCanvasBase = function(code, start_x, start_y, line_height, standard_color, layer)
{
    layer = typeof layer !== 'undefined' ? layer : 0;
    let codeID = Array(code.length);
    for (let i = 0; i < code.length; ++i)
    {
        codeID[i] = new Array(code[i].length);
        for (let j = 0; j < code[i].length; ++j)
        {
            codeID[i][j] = this.nextIndex++;
            this.cmd("CreateLabel", codeID[i][j], code[i][j], start_x, start_y + i * line_height, 0);
            this.cmd("SetForegroundColor", codeID[i][j], standard_color);
            this.cmd("SetLayer", codeID[i][j], layer);
            if (j > 0)
            {
                this.cmd("AlignRight", codeID[i][j], codeID[i][j - 1]);
            }
        }
    }
    return codeID;
}

Algorithm.prototype.init = function(am, w, h)
{
    this.animationManager = am;
    am.addListener("AnimationStarted", this, this.disableUI);
    am.addListener("AnimationEnded", this, this.enableUI);
    am.addListener("AnimationUndo", this, this.undo);
    this.canvasWidth = w;
    this.canvasHeight = h;

    this.actionHistory = [];
    this.recordAnimation = true;
    this.commands = [];
}

// Overload in subclass
Algorithm.prototype.sizeChanged = function(newWidth, newHeight)
{
}

/* Override!!! */
// Algorithm.prototype.implementAction = function(func, val)
// {
//     let nxt = [func, val];
//     this.actionHistory.push(nxt);
//     let retVal = func(val);
//     this.animationManager.StartNewAnimation(retVal);
// }

/* Implement variable parameter functions */
Algorithm.prototype.implementAction = function(func, ...args)
{
    let nxt = [func, args];
    this.actionHistory.push(nxt);
    let retVal = func(...args);
    this.animationManager.StartNewAnimation(retVal);
}

Algorithm.prototype.isAllDigits = function(str)
{
    for (let i = str.length - 1; i >= 0; --i)
    {
        if (str.charAt(i) < "0" || str.charAt(i) > "9")
        {
            return false;
        }
    }
    return true;
}

Algorithm.prototype.normalizeNumber = function(input, maxLen)
{
    if (!this.isAllDigits(input) || input == "")
    {
        return input;
    }
    else
    {
        return ("OOO0000" + input).substr(-maxLen, maxLen);
    }
}

Algorithm.prototype.randomLetterString = function(len)
{
    const arr = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd',
        'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z'
    ];
    let str = "";
    if (len === undefined)
    {
        len = 1;
    }
    for (let i = 0; i < len; ++i)
    {
        str += arr[Math.floor(Math.random() * arr.length)];
    }

    return str;
}

Algorithm.prototype.randomDigLetString = function(len)
{
    const arr = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd',
        'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7',
        '8', '9'
    ];
    let str = "";
    if (len === undefined)
    {
        len = 1;
    }
    for (let i = 0; i < len; ++i)
    {
        str += arr[Math.floor(Math.random() * arr.length)];
    }

    return str;
}

Algorithm.prototype.randomNumber = function(minNum, maxNum)
{
    if (maxNum === undefined)
    {
        maxNum = 100;
    }
    if (minNum === undefined)
    {
        minNum = 0;
    }

    return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
}

Algorithm.prototype.randomDigitString = function(minNum, maxNum, len)
{
    let str = "";
    if (len === undefined)
    {
        len = 1;
    }
    for (let i = 0; i < len - 1; ++i)
    {
        str += this.randomNumber(minNum, maxNum) + ",";
    }
    str += this.randomNumber(minNum, maxNum);

    return str;
}

Algorithm.prototype.disableUI = function(event)
{
    // to be overridden in base class
}

Algorithm.prototype.enableUI = function(event)
{
    // to be overridden in base class
}

/**
 * 8 -> BS  9 -> Tab  37 -> Left Arrow  38 -> Up Arrow  39 -> Right Arrow  40 -> Down Arrow  46 -> Delete
 */
function controlKey(keyASCII)
{
    return keyASCII == 8 || keyASCII == 9 || keyASCII == 37 || keyASCII == 38 ||
           keyASCII == 39 || keyASCII == 40 || keyASCII == 46;
}

Algorithm.prototype.returnSubmitFloat = function(field, func, maxSize)
{
    if (maxSize != undefined)
    {
        field.size = maxSize;
    }
    return function(event)
    {
        let keyASCII = 0;
        if (window.event) // IE
        {
            keyASCII = event.keyCode;
        }
        else if (event.which) // Netscape/Firefox/Opera
        {
            keyASCII = event.which;
        }
        // Submit on return
        if (keyASCII == 13)
        {
            func();
        }
        // Control keys (arrows, del, etc) are always OK
        else if (controlKey(keyASCII))
        {
            return;
        }
        // - (minus sign) only OK at beginning of number
        //  (For now we will allow anywhere -- hard to see where the beginning of the number is ...)
        //else if (keyASCII == 109 && field.value.length == 0)
        else if (keyASCII == 109 || keyASCII == 189)
        {
            return;
        }
        // Digits are OK if we have enough space
        else if ((maxSize != undefined || field.value.length < maxSize) &&
                 ((keyASCII >= 48 && keyASCII <= 57) || (keyASCII >= 96 && keyASCII <= 105)))
        {
            return;
        }
        // . (Decimal point) is OK if we haven't had one yet, and there is space
        else if ((maxSize != undefined || field.value.length < maxSize) &&
                 (keyASCII == 190 || keyASCII == 110) && field.value.indexOf(".") == -1)
        {
            return;
        }
        // Nothing else is OK
        else
        {
            return false;
        }
    }
}

/**
 * @param mode:
 *   1. "OnlyDigit":    [48, 57] + [96, 105]
 *   2. "OnlyLetter":   [65, 90]
 *   3. "OnlyDigLet":   [48, 57] + [65, 90] + [96, 105]
 *   4. "MultiDigit":   [32] + [48, 57] + [96, 105] + [188]
 *   5. "MultiLetter":  [32] + [65, 90] + [188]
 *   6. "MultiDigLet":  [32] + [48, 57] + [65, 90] + [96, 105] + [188]
 *
 *   [,]->[188]  [Space]->[32]  [0, 9]->[48, 57] + [96, 105]  [A, Z]->[65, 90]
 */
Algorithm.prototype.returnSubmit = function(field, func, maxSize, mode)
{
    if (maxSize != undefined)
    {
        field.size = maxSize;
    }
    return function(event)
    {
        let keyASCII = 0;
        if (window.event) // IE
        {
            keyASCII = event.keyCode;
        }
        else if (event.which) // Netscape/Firefox/Opera
        {
            keyASCII = event.which;
        }

        if (keyASCII == 13 && func !== null)
        {
            func();
        }
        else if (keyASCII == 190 || keyASCII == 59 || keyASCII == 173 || keyASCII == 189)
        {
            return false;
        }
        else if (maxSize != undefined && field.value.length >= maxSize)
        {
            if (!controlKey(keyASCII))
            {
                return false;
            }
        }
        else if (mode.toUpperCase() === "ONLYDIGIT")
        {
            if (keyASCII < 48 || (keyASCII > 57 && keyASCII < 96) || keyASCII > 105)
            {
                if (!controlKey(keyASCII))
                {
                    return false;
                }
            }
        }
        else if(mode.toUpperCase() === "ONLYLETTER")
        {
            if (keyASCII < 65 || keyASCII > 90)
            {
                if (!controlKey(keyASCII))
                {
                    return false;
                }
            }
        }
        else if (mode.toUpperCase() === "ONLYDIGLET")
        {
            if (keyASCII < 48 || (keyASCII > 57 && keyASCII < 65) || (keyASCII > 90 && keyASCII < 96) || keyASCII > 105)
            {
                if (!controlKey(keyASCII))
                {
                    return false;
                }
            }
        }
        else if(mode.toUpperCase() === "MULTIDIGIT")
        {
            if (keyASCII < 32 || (keyASCII > 32 && keyASCII < 48) || (keyASCII > 57 && keyASCII < 96) || (keyASCII > 105 && keyASCII < 188) || keyASCII > 188)
            {
                if (!controlKey(keyASCII))
                {
                    return false;
                }
            }
        }
        else if(mode.toUpperCase() === "MULTILETTER")
        {
            if (keyASCII < 32 || (keyASCII > 32 && keyASCII < 65) || (keyASCII > 90 && keyASCII < 188) || keyASCII > 188)
            {
                if (!controlKey(keyASCII))
                {
                    return false;
                }
            }
        }
        else if(mode.toUpperCase() === "MULTIDIGLET")
        {
            if (keyASCII < 32 || (keyASCII > 32 && keyASCII < 48) || (keyASCII > 57 && keyASCII < 65) || (keyASCII > 90 && keyASCII < 96) || (keyASCII > 105 && keyASCII < 188) || keyASCII > 188)
            {
                if (!controlKey(keyASCII))
                {
                    return false;
                }
            }
        }
    }
}

Algorithm.prototype.addReturnSubmit = function(field, action)
{
    field.onkeydown = this.returnSubmit(field, action, 4);
}

Algorithm.prototype.reset = function()
{
    // to be overridden in base class
    // (Throw exception here?)
}

Algorithm.prototype.undo = function(event)
{
    // Remove the last action (the one that we are going to undo)
    this.actionHistory.pop();
    // Clear out our data structure.  Be sure to implement reset in
    //   every AlgorithmAnimation subclass!
    this.reset();
    //  Redo all actions from the beginning, throwing out the animation
    //  commands (the animation manager will update the animation on its own).
    //  Note that if you do something non-deterministic, you might cause problems!
    //  Be sure if you do anything non-deterministic (that is, calls to a random
    //  number generator) you clear out the undo stack here and in the animation
    //  manager.
    //
    //  If this seems horribly inefficient -- it is! However, it seems to work well
    //  in practice, and you get undo for free for all algorithms, which is a non-trivial
    //  gain.
    let len = this.actionHistory.length;
    this.recordAnimation = false;
    for (let i = 0; i < len; ++i)
    {
        this.actionHistory[i][0](this.actionHistory[i][1]);
    }
    this.recordAnimation = true;
}

Algorithm.prototype.clearHistory = function()
{
    this.actionHistory = [];
}

// Helper method to add text input with nice border.
//  AS3 probably has a built-in way to do this.   Replace when found.

// Helper method to create a command string from a bunch of arguments
Algorithm.prototype.cmd = function()
{
    if (this.recordAnimation)
    {
        let command = arguments[0];
        for (let i = 1; i < arguments.length; ++i)
        {
            command = command + "<;>" + String(arguments[i]);
        }
        this.commands.push(command);
    }
}
