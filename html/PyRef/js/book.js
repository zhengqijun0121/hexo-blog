// .js for py-book. installs content-loaded hook

// arg is button followed by div which it does show/hide alternately
function showHide(button) {
  if (button.nextElementSibling.style.display == "block") {
    button.nextElementSibling.style.display = "none";
  } else {
    button.nextElementSibling.style.display = "block";
  }
}


// Functions for pre-reveal format
function preSetup(pre) {
  var text = pre.innerHTML;
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith('&gt;') && lines[i].trim()) {
      lines[i] = '<span class=pshow>??</span><span class=phide>' + lines[i] + '</span>';
    }
  }
  pre.innerHTML = lines.join('\n');
}

function initReveals() {
  var pres = document.getElementsByClassName('reveal');
  for (var pre of pres) {
    preSetup(pre);
  }
}

function preShow(pre) {
  var spans = pre.getElementsByTagName('span');
  for (var span of spans) {
    if (span.getAttribute('class') == 'phide') span.setAttribute('class', 'pshow');
    else span.setAttribute('class', 'phide');
  }
}

var chaps = [
["python-reference.html", "Python Reference"],
["python-about.html", "About Python"],
["python-interpreter.html", "Python Interpreter"],
["python-command.html", "Command Line"],
["python-style1.html", "Style1"],
["python-style-readable.html", "Style Readable"],
["python-style-decomposition.html", "Style Decomp"],
["python-var.html", "Variables"],
["python-math.html", "Math"],
["python-function.html", "Functions"],
["python-for.html", "For Loop"],
["python-while.html", "While Loop"],
["python-if.html", "If and Comparisons"],
["python-boolean.html", "Boolean and or not"],
["python-range.html", "Range"],
["python-string.html", "Strings"],
["python-print.html", "print() Standard Out"],
["python-input.html", "input()"],
["python-file.html", "File Read Write"],
["python-list.html", "Lists"],
["python-main.html", "main() Command Line Args"],
["python-dict.html", "Dicts"],
["python-nocopy.html", "Python No Copy"],
["python-tuple.html", "Tuples"],
["python-map-lambda.html", "Map Lambda"],
["python-comprehension.html", "Comprehensions"],
["python-sort.html", "Sorting"],
];


// Filename of current url
function filename() {
  var slash = location.pathname.lastIndexOf('/');
  return location.pathname.substring(slash + 1);
}

// <p> version
function tocHtmlP(chaps) {
  var html = ""; // "<p class=big><a href='./'>Nick's Python Reference</a>\n";
  var fname = filename();
  for (var i=0; i<chaps.length; i++) {
    var pair = chaps[i];
    var entry = 'entry';
    if (i == 0) entry += ' big';
    if (pair[0] == fname) entry += ' yellow';
    html += '<p class="' + entry + '"><a href="' + pair[0] + '">' + pair[1] + '</a></p>\n';
  }
  // css hack: need to add one at bottom so scroll goes far enough - css mystery
  html += '<p class="entry">&nbsp;</p>\n';
  return html
}


// return html for chaps
function tocHtmlUl(chaps) {
  var html = "<p>Nick's Python Book\n";
  html += '<ul>\n';
  var fname = filename();
  for (var i=0; i<chaps.length; i++) {
    var entry = 'entry';
    if (pair[0] == fname) entry = 'entry yellow';
    html += '<li><span class="' + entry + '"><a href="' + pair[0] + '">' + pair[1] + '</a></span></li>\n';
  }
  html += '</ul>';
  return html
}

// install toc html
function setToc() {
  var toc = document.getElementById('toc');
  if (toc) {
    toc.innerHTML = tocHtmlP(chaps);
  }
}

// Set document title by digging h1 out of text -
// could set title manually in html, but easy to forget
function setTitle() {
  var ttag = document.getElementsByTagName('title');
  if (ttag && ttag.length) return;
  var h1s =  document.getElementsByTagName('h1');
  if (h1s.length) {
    var title = h1s[0];
    var text = title.textContent;
    text = text.replace('Python ', '');  // shorter look better as tab title!
    text = text.replace('The ', '');  // shorter look better as tab title!
    document.title = text;

  }
}

// more high-road on-load handler - complete page
window.addEventListener('DOMContentLoaded', (event) => {
  setToc();
  setTitle();
});
