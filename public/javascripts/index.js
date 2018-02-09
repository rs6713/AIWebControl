
var documentHeight=window.innerHeight;
var $document=$(document.body);
var wrapperHeight=$("#content").height();
var $nodes= $(".node");
var $items =  $('.item');
var positions=[];
var heights=[];


for(var i=0; i< $items.length; i++){
    var $item= $($items[i]);
    var height= $item.offset().top + documentHeight/2;
    if(height>wrapperHeight){
        height=wrapperHeight;
    }
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

$(document).ready(function(){
    $( "#start" ).click(function() {
        console.log("Start clicked");
        $("#contentContainer").css({"visibility":"visible"});
        $("#line").css({"visibility":"visible"});
        $("#frontHeader").addClass("fadeOut");
        $("#contentContainer").focus();
        $("#contentContainer").addClass("fadeIn");
        $("#line").addClass("fadeIn");
    });
});

//Can also add customisation so alternates the animation style based on odd even
$("#contentContainer").scroll(function(){
    console.log("Scrolling", $("#contentContainer").scrollTop());
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
      $("#contentContainer").animate({ scrollTop: (positions[ index ] - documentHeight/1.5)}, 1000 );
    });
})