function GeometryVisu(isDrawingPolygonParam){var isDrawingPolygon=true;if(typeof(isDrawingPolygonParam)!="undefined"){isDrawingPolygon=isDrawingPolygonParam;}
var maxNumberVertex=100,grid=20,width=640,height=360,colors=d3.scale.category10();d3.select("#drawgraph #viz").selectAll('svg').remove();var svg=d3.select('#drawgraph #viz').append('svg').attr('width',width).attr('height',height);var countNodeId=new Array(maxNumberVertex);for(var i=countNodeId.length;i>=0;i--)
countNodeId[i]=0;var nodeList=[];var edgeList=[];svg.append('svg:defs').append('svg:marker').attr('id','end-arrow').attr('viewBox','0 -5 10 10').attr('refX',6).attr('markerWidth',3).attr('markerHeight',3).attr('orient','auto').append('svg:path').attr('d','M0,-5L10,0L0,5').attr('fill','#000');var drag_line=svg.append('svg:path').attr('class','link dragline hidden').attr('d','M0,0L0,0');var path;var circle;var selected_node=null,selected_link=null,mousedown_link=null,mousedown_node=null,mouseup_node=null;var isPolygonClosed=false;function resetMouseVars(){mousedown_node=null;mouseup_node=null;mousedown_link=null;}
function rewriteJsonResult(){var json="[";for(var i=0;i<nodeList.length;i++){var obj={x:nodeList[i].x,y:nodeList[i].y}
json+=JSON.stringify(obj);if(i!==nodeList.length-1)json+=",";}
json=json.concat("]");JSONresult=json;}
function redraw(){svg.selectAll('g').remove();path=svg.append('svg:g').selectAll('path');circle=svg.append('svg:g').selectAll('g');circle=circle.data(nodeList,function(d){return d.id;});circle.selectAll('circle').style('fill',function(d){return colors(d.id);});var g=circle.enter().append('svg:g');g.append('svg:circle').attr('class','node').attr('r',16).attr('cx',function(d){return d.x;}).attr('cy',function(d){return d.y;}).style('fill',function(d){return d3.rgb(238,238,238);}).on('mousedown',function(d){if(d3.event.ctrlKey)return;mousedown_node=d;if(isDrawingPolygon&&mousedown_node.id===0&&nodeList.length>2){edgeList.push({source:getLastNode(),target:mousedown_node})
redoStack=[];isPolygonClosed=true;canRedoClosePolygon=false;}
redraw();});g.append('svg:text').attr('x',function(d){return d.x;}).attr('y',function(d){return d.y+16/3;}).attr('class','id').text(function(d){return(isDrawingPolygon?d.id:"");});path=path.data(edgeList);path.enter().append('svg:path').attr('class','link').attr('d',function(d){var deltaX=d.target.x-d.source.x,deltaY=d.target.y-d.source.y,dist=Math.sqrt(deltaX*deltaX+deltaY*deltaY),normX=deltaX/dist,normY=deltaY/dist,sourcePadding=12,targetPadding=17;targetPadding=12;var sourceX=d.source.x+(sourcePadding*normX),sourceY=d.source.y+(sourcePadding*normY),targetX=d.target.x-(targetPadding*normX),targetY=d.target.y-(targetPadding*normY);return 'M'+sourceX+','+sourceY+'L'+targetX+','+targetY;});rewriteJsonResult();}
function dist2D(x1,y1,x2,y2){return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));}
function getLastNode(){if(nodeList.length==0)return null;return nodeList[nodeList.length-1];}
function getNextNodeId(){var lastNode=getLastNode();return(lastNode===null?0:(lastNode.id+1));}
function mousedown(){svg.classed('active',true);if(d3.event.ctrlKey||mousedown_node||mousedown_link)return;if(isPolygonClosed)return;var point=d3.mouse(this),node={id:getNextNodeId()};var lastNode=getLastNode();node.x=point[0];node.y=point[1];node.x=parseInt(node.x)-parseInt(node.x)%grid;node.y=parseInt(node.y)-parseInt(node.y)%grid;nodeList.push(node);if(lastNode!=null&&isDrawingPolygon){edgeList.push({source:lastNode,target:node});}
redoStack=[];canRedoClosePolygon=false;redraw();}
function mousemove(){if(!mousedown_node)return;drag_line.attr('d','M'+mousedown_node.x+','+mousedown_node.y+'L'+d3.mouse(this)[0]+','+d3.mouse(this)[1]);redraw();}
function mouseup(){if(mousedown_node)drag_line.classed('hidden',true);svg.classed('active',false);resetMouseVars();}
function spliceedgeListForNode(node){var toSplice=edgeList.filter(function(l){return(l.source===node||l.target===node);});toSplice.map(function(l){edgeList.splice(edgeList.indexOf(l),1);});}
var lastKeyDown=-1;var drag=d3.behavior.drag().on("drag",function(d){var dragTarget=d3.select(this).select('circle');var new_cx,new_cy;dragTarget.attr("cx",function(){new_cx=d3.mouse($("svg")[0])[0];return new_cx;}).attr("cy",function(){new_cy=d3.mouse($("svg")[0])[1];return new_cy;});d.x=new_cx;d.y=new_cy;d.x=parseInt(d.x)-parseInt(d.x)%grid;d.y=parseInt(d.y)-parseInt(d.y)%grid;redraw();});var ctrlDown=false;var redoStack=[];var canRedoClosePolygon=false;function keydown(){if(d3.event.keyCode===17){ctrlDown=true;}
console.log(ctrlDown+" "+d3.event.keyCode);if(ctrlDown){var size;switch(d3.event.keyCode){case 89:size=Object.size(redoStack);if(canRedoClosePolygon&&size==0){var currentLastNode=getLastNode();edgeList.push({source:currentLastNode,target:nodeList[0]});canRedoClosePolygon=false;isPolygonClosed=true;redraw();}else if(size>0){var currentLastNode=getLastNode();var lastNode=redoStack[size-1];redoStack.splice(size-1,1);nodeList.push(lastNode);if(currentLastNode!=null&&isDrawingPolygon){edgeList.push({source:currentLastNode,target:lastNode});}
redraw();}
break;case 90:if(isPolygonClosed){size=Object.size(edgeList);edgeList.splice(size-1,1);isPolygonClosed=false;canRedoClosePolygon=true;}else{size=Object.size(nodeList);if(size>0){var lastNode=nodeList[size-1];redoStack.push(lastNode);nodeList.splice(size-1,1);spliceedgeListForNode(lastNode);}}
redraw();break;}}}
function keyup(){if(d3.event.keyCode===17){ctrlDown=false;}}
svg.on('mousedown',mousedown).on('mousemove',mousemove).on('mouseup',mouseup);d3.select(window).on('keydown',keydown).on('keyup',keyup);redraw();}
function initGeometryVisu(isDrawingPolygonParam){var toWrite='\
  <script>var JSONresult;</script>\
    <div id="main">\
      <div id="draw-status"><p>Status</p></div>\
      <div id="draw-warn"><p>No Warning</p></div>\
      <div id="draw-err"><p>No Error</p></div>\
      <div id="viz">\
\
        <svg onClick = "GeometryVisu('+isDrawingPolygonParam+'); " width="640" height="360"><defs><marker id="end-arrow" viewBox="0 -5 10 10" refX="6" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,-5L10,0L0,5" fill="#000"></path></marker></defs><path class="link dragline hidden" d="M0,0L0,0"></path><g><path class="link" d="M108.48528137423857,108.48528137423857L191.51471862576142,191.51471862576142"></path><path class="link" d="M208.48528137423858,208.48528137423858L291.5147186257614,291.5147186257614"></path></g><g><g><circle class="node" r="16" cx="100" cy="100" style="fill: rgb(238, 238, 238);"></circle><text x="100" y="105.33333333333333" class="id">0</text></g><g><circle class="node" r="16" cx="200" cy="200" style="fill: rgb(238, 238, 238);"></circle><text x="200" y="205.33333333333334" class="id">1</text></g><g><circle class="node" r="16" cx="300" cy="300" style="fill: rgb(238, 238, 238);"></circle><text x="300" y="305.3333333333333" class="id">2</text></g></g><g></g>\
        <text x = "250" y = "100"> &bull; Click on empty space to add point</text>\
        <text x = "250" y = "125"> &bull; Ctrl + Z to undo</text>\
        <text x = "250" y = "150"> &bull; Ctrl + Y to redo</text>\
        <text x = "250" y = "175"> '+(isDrawingPolygonParam?'&bull; Click on point 0 to close the polygon':'')+'</text>\
      </svg>\
    </div>\
\
\
    <div id="drawgraph-actions">\
      <p onclick=drawCancel()>Cancel</p>\
      <p onclick=GeometryVisu('+isDrawingPolygonParam+')>Clear</p>\
      <p id="done-button" onclick="drawDone()">Done</p>\
      <form id="drawgraph-form">\
        <!--<input type="checkbox" id="submit" name="submit" value="submit" checked="checked">Submit drawn graph to database for random graph and online quiz purposes\
        <br>--><input type="checkbox" id="copy" name="submit" value="submit" checked="checked">Copy JSON text to clipboard\
      </form>\
    </div>\
\
  ';$('#drawgraph').html(toWrite);$('#copy').removeAttr('checked');}