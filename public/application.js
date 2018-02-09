var mainApplicationModuleName= 'trainMe';
var mainApp= angular.module(mainApplicationModuleName, ['ngMaterial', 'ngMessages']);

mainApp.controller('mainController',['$scope', '$timeout','$mdToast' , "$mdDialog",function($scope, $timeout,$mdToast, $mdDialog){
    //578 433
    $scope.newTrigger="";
    $scope.newImages=[];
    var captureVideo;
    var getVideo=function(){
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        context.drawImage(video,0,0, 320, 180); 
        $scope.newImages.push(canvas.toDataURL("image/png"));
    }
    $scope.getImages=function(){
        console.log("I'm getting the video");
        captureVideo=setInterval(getVideo, 500);
    }
    $scope.stopImages=function(){
        clearInterval(captureVideo);
    }
}]);