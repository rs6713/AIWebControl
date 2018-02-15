
var documentHeight=window.innerHeight;
var $document=$(document.body);
var wrapperHeight=$("#content").height();
var $nodes= $(".node");
var $items =  $('.item');
var positions=[];
var heights=[];
var paths=[];
var activePath="";


for(var i=0; i< $items.length; i++){
    var $item= $($items[i]);
    var height= $item.offset().top + documentHeight/2+ $item.height()/2;
    //if(height>wrapperHeight){
    //   height=wrapperHeight;
    //}
    positions.push(height);
}

console.log(wrapperHeight);
console.log($items);
console.log(positions);

for(var i=0; i< $items.length; i++){
    var lineLength=$("#line").height();
    var toppy= ((i* ( lineLength/($items.length-1) )) -10 )+"px" ;

    var node=document.createElement("div");
    node.className="node";
    var shimmer=document.createElement("div");
    shimmer.className="shimmer";

    console.log(lineLength, toppy);
    $("#line").append(node);
    $("#line .node").last().css({"top":toppy });
    $("#line").append(shimmer);
    $("#line .shimmer").last().css({"top":toppy });
}
$(".item").first().addClass("active");
$("#line .node").first().addClass("nodeActive");
$("#line .shimmer").first().addClass("nodeActive");
var $nodes= $(".node");
var $shimmers=$(".shimmer");

$( ".iterim" ).each(function( index ) {
    var previous=$( this ).prev().offset().top+$(this).prev().height();
    var next=$( this ).next().offset().top;
    var topoffset=(next-previous)/2 +"px";
    var leftoffset=Math.floor((10+ 60*Math.random())* window.innerWidth/100) ;
    console.log(topoffset, leftoffset);
    $(this).offset({"top":topoffset, "left":leftoffset});
});

var errorCallback = function(e) {
    console.log('Rejected', e);
}

var video;
var demovideo;
var canvas;
var context;

// Converts canvas to an image
function convertCanvasToImage(canvas) {
	var image = new Image();
    image.src = canvas.toDataURL("image/png");
	return image;
}
    // Not showing vendor prefixes.
    navigator.getUserMedia({video: true, audio: true}, function(localMediaStream) {
        video = document.getElementById("triggerCapture");
        demovideo= document.getElementById("demorun");
        video.src = window.URL.createObjectURL(localMediaStream);
        demovideo.src = window.URL.createObjectURL(localMediaStream);
        
        // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
        // See crbug.com/110938.
        video.onloadedmetadata = function(e) {
        // Ready to go. Do some stuff.
        };
    }, errorCallback);


    var clickTrigger=function(){
        console.log("new trigger clicked");
        if(!activePath){
            var path = document.createElementNS('http://www.w3.org/2000/svg','line');
            var svg= document.getElementById("actiontriggerpaths");
            
            var newpath={};
            path.setAttribute("x1",$(this).offset().left-$("#demoMenu").width());
            path.setAttribute("y1",$(this).offset().top);
            svg.appendChild(path);
            newpath.path=path;
            newpath.start=[$(this).offset().left-$("#demoMenu").width(), $(this).offset().top];
            newpath.stop=[];
            paths.push(newpath);
            activePath=$(this).parent().parent().attr('id');
        }
        if(activePath!=$(this).parent().parent().attr('id')){
            activePath="";
        } 
    }

$(document).ready(function(){
    //canvas = document.getElementById('canvas');
    //context = canvas.getContext('2d');
    //context.drawImage(video,0,0, 160, 120);
    //var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    $( "#start" ).click(function() {
        console.log("Start clicked");
        $("#contentContainer").css({"visibility":"visible"});
        $("#line").css({"visibility":"visible"});
        $("#frontHeader").addClass("fadeOut");
        $("#contentContainer").focus();
        $("#contentContainer").addClass("fadeIn");
        $("#line").addClass("fadeIn");
    });

    $("#demo").click(function(){
        $("#demoContainer").css({"visibility":"visible"});
    });

    $("#connectnav").click(function(){
        $("#demoContent").css({"display":"none"});
        $("#demoConnect").css({"display":"block"});
        $("#demoRun").css({"display":"none"});
    });
    $("#createnav").click(function(){
        $("#demoContent").css({"display":"block"});
        $("#demoConnect").css({"display":"none"});
        $("#demoRun").css({"display":"none"});
    });
    $("#runnav").click(function(){
        $("#demoContent").css({"display":"none"});
        $("#demoConnect").css({"display":"none"});
        $("#demoRun").css({"display":"block"});
    });

    $("body").on('click', '.triggerConnector', function() {
        //console.log("trigger clicked");
        if(!activePath){
            var path = document.createElementNS('http://www.w3.org/2000/svg','line');
            var svg= document.getElementById("actiontriggerpaths");
            //console.log($('#actiontriggerpaths').css("stroke-width"), parseInt($('#actiontriggerpaths').css("stroke-width")));
            var x1=$(this).offset().left-$("#demoMenu").width()+$(this).width()/2 - parseInt($('#actiontriggerpaths').css("stroke-width"))/2;
            var y1;
            if($(this).parent().parent().attr('id')=="triggersConnect"){
                //console.log($(this).outerHeight(), $(this).innerHeight(), $(this).css('padding-top'), parseInt($(this).css('padding-top')));
                y1=$(this).offset().top+ parseInt($(this).css('padding-top'));
                //console.log($(this).offset().top, $(this).css('padding-top'), y1);
            }else{
                y1=$(this).offset().top;
            }

            path.setAttribute("x1",x1);
            path.setAttribute("y1",y1);
            path.setAttribute("x2",x1);
            path.setAttribute("y2",y1);
            svg.appendChild(path);
            paths.push(path);

            activePath=$(this).parent().parent().attr('id');
        }
        if(activePath!=$(this).parent().parent().attr('id')){
            var current=paths[paths.length-1];
            var x2=$(this).offset().left-$("#demoMenu").width()+$(this).width()/2 - parseInt($('#actiontriggerpaths').css("stroke-width"))/2;
            var y2;

            if($(this).parent().parent().attr('id')=="triggersConnect"){
                y2=$(this).offset().top+ parseInt($(this).css('padding-top'));
            }else{
                y2=$(this).offset().top;
            }
            current.setAttribute("x2",  x2 );
            current.setAttribute("y2", y2 );

            activePath="";
        }
        
    });



    $("#demoConnect").mousemove(function(event) {
        if(paths.length!=0 && activePath){
            var current=paths[paths.length-1];
            //current.path.setAttribute("d",  "M"  + current.start[0] + " " + current.start[1] + " L" +  event.pageX + " " + event.pageY);
            var svg= document.getElementById("actiontriggerpaths");
            //current.path.remove();
            
            current.setAttribute("x2",  event.pageX-$("#demoMenu").width() );
            current.setAttribute("y2", event.pageY );
            //svg.appendChild(current.path);
        }
    });

});



//Can also add customisation so alternates the animation style based on odd even
$("#contentContainer").scroll(function(){
    //console.log("Scrolling", $("#contentContainer").scrollTop());
    var current=0;
    var nodeTop= $("#contentContainer").scrollTop()+ documentHeight+1;
    for(var i=0; i<positions.length;i++){
        
        if(nodeTop>positions[i]){
            current=i;
            $($items[i]).addClass('active');
            $($nodes[i]).addClass("nodeActive");
            $($shimmers[i]).addClass("nodeActive");
        }else{
            $($items[i]).removeClass('active');
            $($nodes[i]).removeClass("nodeActive");
            $($shimmers[i]).removeClass("nodeActive");
        }
    }
});


// Clicking the nodes of the traverse bar(that doesn't yet exist)
$nodes.each( function( index ) {
    var $node = $( this );
    $node.click( function() {
      $("#contentContainer").animate({ scrollTop: (positions[ index ]- documentHeight-1)}, 1000 );
    });
})