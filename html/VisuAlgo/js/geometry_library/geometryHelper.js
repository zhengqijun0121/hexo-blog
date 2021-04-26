var EPS=0.0000001;function cross(px,py,qx,qy,rx,ry){return(qx-px)*(ry-py)-(qy-py)*(rx-px);}
function ccw(x1,y1,x2,y2,x3,y3){return cross(x1,y1,x2,y2,x3,y3)>0;}
function getCircleLineIntersectionPoint(x1,y1,x2,y2,r,cx,cy){var baX=x2-x1;var baY=y2-y1;var caX=cx-x1;var caY=cy-y1;var a=baX*baX+baY*baY;var bBy2=baX*caX+baY*caY;var c=caX*caX+caY*caY-r*r;var pBy2=bBy2/a;var q=c/a;var disc=pBy2*pBy2-q;var tmpSqrt=Math.sqrt(disc);var abScalingFactor1=-pBy2+tmpSqrt;var abScalingFactor2=-pBy2-tmpSqrt;var r_x1=x1-baX*abScalingFactor1;var r_y1=y1-baY*abScalingFactor1
var r_x2=x1-baX*abScalingFactor2;var r_y2=y1-baY*abScalingFactor2
var res=new Array();res[0]=r_x1;res[1]=r_y1;res[2]=r_x2;res[3]=r_y2;return res;}
function calculateEdge(x1,y1,x2,y2){var pts=getCircleLineIntersectionPoint(x1,y1,x2,y2,15,x1,y1);var pts2=getCircleLineIntersectionPoint(x1,y1,x2,y2,15,x2,y2);var min=5000;var save1=0,save2=0;for(var i=1;i<=3;i+=2)
for(var j=1;j<=3;j+=2)
{var d=Math.sqrt((pts[i-1]-pts2[j-1])*(pts[i-1]-pts2[j-1])+(pts[i]-pts2[j])*(pts[i]-pts2[j]));if(d<min){min=d;save1=i;save2=j;}}
var beginPoint={"x":pts[save1-1],"y":pts[save1]};var endPoint={"x":pts2[save2-1],"y":pts2[save2]};return[beginPoint,endPoint];}
function getLinesIntersection(a1,b1,c1,a2,b2,c2){if(a1*b2-a2*b1==0)return[-1,1];return[(c1*b2-b1*c2)/(a1*b2-b1*a2),(a1*c2-c1*a2)/(a1*b2-b1*a2)];}
function getDistancePointToLine(x,y,a,b,c){return(Math.abs(a*x+y*b+c))/Math.sqrt(a*a+b*b);}
function getStraightLineCoordinate(x1,y1,x2,y2){var intersection=getLinesIntersection(1,1,x2+y2,1,-1,x1-y1);var min=getDistancePointToLine(x2,y2,1,-1,-x1+y1);var save=intersection;intersection=getLinesIntersection(-1,1,-x2+y2,1,1,x1+y1);var dist=getDistancePointToLine(x2,y2,1,1,-x1-y1);if(min>dist){min=dist;save=intersection;}
intersection=getLinesIntersection(0,1,y2,1,0,x1);dist=getDistancePointToLine(x2,y2,1,0,-x1);if(min>dist){min=dist;save=intersection;}
intersection=getLinesIntersection(-1,0,-x2,0,1,y1);dist=getDistancePointToLine(x2,y2,0,1,-y1);if(min>dist){min=dist;save=intersection;}
return save;}
function dist2P(x1,y1,x2,y2){return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));}
function lineIntersectSeg(px,py,qx,qy,Ax,Ay,Bx,By){var a=By-Ay;var b=Ax-Bx;var c=Bx*Ay-Ax*By;var u=Math.abs(a*px+b*py+c);var v=Math.abs(a*qx+b*qy+c);return[(px*v+qx*u)/(u+v),(py*v+qy*u)/(u+v)];}
function angle(ax,ay,ox,oy,bx,by){var ux=ax-ox,uy=ay-oy;var vx=bx-ox,vy=by-oy;return Math.acos((ux*vx+uy*vy)/Math.sqrt((ux*ux+uy*uy)*(vx*vx+vy*vy)));}
function hasCollinearPoints(pointList){var size=Object.size(pointList)
for(var i=0;i<size;i++){var p1=pointList[(i-1+size)%size];var p2=pointList[i];var p3=pointList[(i+1)%size];if(Math.abs(cross(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y))<EPS){return true;}}
return false;}
function hasAnyCollinearPoints(pointList){var size=Object.size(pointList)
for(var i=0;i<size;i++){for(var j=i+1;j<size;j++){for(var k=j+1;k<size;k++){var p1=pointList[i];var p2=pointList[j];var p3=pointList[k];if(Math.abs(cross(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y))<EPS){return true;}}}}
return false;}
function isSimplePolygon(pointList){var size=Object.size(pointList)
for(var i=0;i<size;i++){var p1=pointList[i];var p2=pointList[(i+1)%size];for(var j=2;j<size-1;j++){var p3=pointList[(i+j)%size];var p4=pointList[(i+j+1)%size];var cross1=cross(p3.x,p3.y,p1.x,p1.y,p2.x,p2.y);var cross2=cross(p4.x,p4.y,p1.x,p1.y,p2.x,p2.y);var cross3=cross(p1.x,p1.y,p3.x,p3.y,p4.x,p4.y);var cross4=cross(p2.x,p2.y,p3.x,p3.y,p4.x,p4.y);if(cross1*cross2<-EPS&&cross3*cross4<-EPS)return false;}}
return true;}
function isConvexPolygon(pointList){var size=Object.size(pointList);if(size<3)return false;var p1=pointList[0];var p2=pointList[1];var p3=pointList[2];var prevCcwResult=ccw(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y);for(var i=1;i<size;i++){var p1=pointList[i];var p2=pointList[(i+1)%size];var p3=pointList[(i+2)%size];var ccwResult=ccw(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y);if(ccwResult!=prevCcwResult)return false;}
return true;}