
var documentHeight=window.innerHeight;
var $document=$(document.body);
var wrapperHeight=$("#content").height();
var $nodes= $(".node");
var $items =  $('.item');
var positions=[];
var heights=[];


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
        video = document.querySelector('video');
        video.src = window.URL.createObjectURL(localMediaStream);
    
        // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
        // See crbug.com/110938.
        video.onloadedmetadata = function(e) {
        // Ready to go. Do some stuff.
        };
    }, errorCallback);



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