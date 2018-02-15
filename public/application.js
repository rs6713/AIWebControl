var mainApplicationModuleName= 'trainMe';
var mainApp= angular.module(mainApplicationModuleName, ['ngMaterial', 'ngMessages']);

mainApp.controller('mainController',['$scope', '$timeout','$mdToast' , "$mdDialog",function($scope, $timeout,$mdToast, $mdDialog){
    //578 433
    $scope.newTrigger="";
    $scope.newImages=[];
    $scope.triggers=[];
    $scope.colours=["#ff0000","#00ff00", "#0000ff", "#ffff00","#00ffff", "#ff00ff"];

    var captureVideo;
    var activeTrigger="";
    var activeAction="";
    
    $scope.connections=[];

    $scope.idealNoImages=40;
    $scope.captureFootage=false;
    $scope.removeImage=function(idx){
        $scope.newImages.splice(idx,1);
        if($scope.newImages.length<$scope.idealNoImages/2){
            $("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#C22614"});
        }
    }
    var getVideo=function(){
        if($scope.newImages.length<$scope.idealNoImages){
            canvas = document.getElementById('canvas');
            context = canvas.getContext('2d');
            context.drawImage(video,0,0,canvas.width,canvas.height); 

            console.log(canvas.width, canvas.height);
            $scope.newImages.push(canvas.toDataURL("image/png"));

            if($scope.newImages.length>=$scope.idealNoImages/2){
                $("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#4EDE94"});
            }
            $scope.$apply();
        }else{
            $scope.stopImages();
            $scope.captureFootage=false;
        }
    }
    $scope.actionActive=function(idx){
        if(activeAction===""){
            activeAction=idx;
            if(activeTrigger!==""){
                if( $scope.connections.indexOf([activeTrigger,activeAction])==-1){
                    $scope.connections.push([activeTrigger, activeAction]);
                }
                activeTrigger="";
                activeAction="";
            }  
        } 
    }
    $scope.triggerActive=function(idx){
        console.log($scope.connections);
        if(activeTrigger===""){
            activeTrigger=idx;
            if(activeAction!==""){
                if( $scope.connections.indexOf([activeTrigger,activeAction])==-1){
                    $scope.connections.push([activeTrigger, activeAction]);
                }
                activeTrigger="";
                activeAction="";
            }  
        } 
    }

    $scope.submitTrigger=function(){
        if($scope.newTrigger.length!=0 && $scope.newImages.length>=$scope.idealNoImages/2){
            var trigger={};
            trigger.images=$scope.newImages;
            trigger.name=$scope.newTrigger;
            $scope.triggers.push(trigger);
            $scope.newImages=[];
            $scope.newTrigger="";
            $("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#C22614"});
        }
    }
    $scope.toggleRecord=function(){
        if($scope.captureFootage){
            $scope.captureFootage=false;
            $scope.stopImages();
        }else{
            $scope.getImages();
            $scope.captureFootage=true;
        }
    }

    $scope.triggerType=function(index){
        if(index>=$scope.triggers.length){
            return "0.65em dashed #dddddd";
        }else{
            return "0.65em solid #351B43";       
        }
    }
    $scope.submitTriggerFormat=function(){
        if($scope.newTrigger.length!=0 && $scope.newImages.length>=$scope.idealNoImages/2){
            return "background-color: #24764C;cursor: pointer"
        }else{
            return "background-color: #dddddd;cursor: initial"
        }
    }

    $scope.noTriggers=function(){
        return Math.floor(($scope.newImages.length/$scope.idealNoImages)*100)
    }
    $scope.getImages=function(){
        console.log("I'm getting the video");
        captureVideo=setInterval(getVideo, 300);
        
    }
    $scope.stopImages=function(){
        clearInterval(captureVideo);
        
    }
}]);

//else{$("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#C22614"});}