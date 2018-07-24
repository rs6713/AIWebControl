
//var angular=require("angular");

import './javascripts/index.js';
import {Array1D, ENV, Scalar, tidy, Tidy} from 'deeplearn';

import * as dl from "deeplearn";

console.log(tidy, Tidy, Array1D, dl.tidy, dl.Tidy);







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
    var models=["Fully Connected Feed Forward Network"];
    
    $scope.connections=[];
    

    console.log(dl);
     //no.training iteration examples, calc cost averaged over to minimise fluctuation.
    const math=ENV.math;
    var initialLearningRate=0.001;
    var graph;
    var session; 
    var optimizer;
    var inputTensor;
    var targetTensor;
    var predictionTensor;
    var modelRunner;

    $scope.modelResult=0;
    $scope.currentModel=models[0];
    $scope.modelResultAction=0;
    $scope.resultConfidence=0;

    var generateImage=function(img){
        console.log(img);
    }

    function createFullyConnectedLayer(graph, inputLayer, layerIndex, sizeOfThisLayer, includeRelu = true, includeBias = true) {
        return graph.layers.dense(
            'fully_connected_' + layerIndex, inputLayer, sizeOfThisLayer,
            includeRelu ? (x) => graph.relu(x) : undefined, includeBias);
    }
    function normalizeInput(x){
        //console.log(x)
        var maxX=Math.max(...x);
        var minX=Math.min(...x);
        var diff= maxX-minX;
        //console.log(maxX, minX, diff);
        var res=x.map(c=> (c-minX)/diff);
        console.log(res)
        return res
    }

    function predict(img){
        let classProb = 0;
        //dl.tidy((keep, track) => {
          const mapping = [{
            tensor: inputTensor,
            data: img, //actual data
          }];
          const evalOutput = session.eval(predictionTensor, mapping);
          const values = evalOutput.dataSync();

        return values;
    }

    $scope.trainModel= async function(){
        console.log("Beginning to train the model")

            graph = new dl.Graph();
            var noCats= $scope.triggers.length;
            console.log($scope.triggers.map(x=> x.images.length));
            var temp=$scope.triggers.map(x=> x.images.length);
            var N= Math.min(...temp );
            // Tensors to contain input and target tensors
            var trainImages=[];
            var trainCats=[];
            console.log($scope.triggers);
            console.log("N: ", N)
            console.log("Number categories:", noCats);



            for (var i=0; i< $scope.triggers.length; i++){
                for(var u=0; u< N; u++){
                    
                    trainImages.push($scope.triggers[i].images[u].data);
                    var cat=[];
                    for(var c=0; c<noCats;c++){
                        if(c==i){
                            cat.push(1);
                        }else{
                            cat.push(0);
                        }
                    }
                    
                    //console.log(dl.oneHot(dl.Array1D([i]), $scope.triggers.length))
                    trainCats.push(cat);
                    
                }
            }
            console.log(trainImages)
            console.log(trainCats)
            /*
            for(var i=0; i< trainImages.length; i++){
                for(var h=0; h< trainImages[i].length; h++){
                    for(var r=0; r<trainImages[i][h].length;r++){
                        console.log(trainImages[i][h][r]);
                        trainImages[i][h][r]= trainImages[i][h][r].reduce((a,b)=> a+b)/trainImages[i][h][r].length
                    }
                }
            }
            */
            //console.log(trainImages.length);
            //console.log(trainImages[0].length);
            //console.log( trainImages[0][0].length); 
            //trainImages= np.mean(trainImages, axis=4)
            var temp=document.getElementById("canvas");
            var imgSize=temp.width*temp.height;
            inputTensor = graph.placeholder('input images', [imgSize]);//[N, 140,105] 150 300
            targetTensor = graph.placeholder('output labels', [noCats]);//noCats


            console.log("training images, training categories size", trainImages.length, trainCats.length)
            var inputArray = trainImages.map(c => dl.Array1D.new(normalizeInput(c)));
            console.log("Train categories", trainCats)
            var targetArray = trainCats.map(c => dl.Array1D.new(c));

            console.log("number of examples:", inputArray.length, targetArray.length);
            console.log(`There are ${N} min no.images, ${targetArray.length} examples`);
            //console.log(`Batch size is ${batchSize}, initial learn rate 0.042`)
            console.log("Number of categories: ", noCats);
            let fullyConnectedLayer = createFullyConnectedLayer(graph, inputTensor, 0, 128);
            //fullyConnectedLayer = createFullyConnectedLayer(graph, fullyConnectedLayer, 1, 32);
            fullyConnectedLayer = createFullyConnectedLayer(graph, fullyConnectedLayer, 2, 16);
            predictionTensor = createFullyConnectedLayer(graph, fullyConnectedLayer, 3, noCats, false, false);
           
            var costTensor =graph.softmaxCrossEntropyCost(predictionTensor, targetTensor);
            //var costTensor=graph.meanSquaredCost(targetTensor, predictionTensor);

            console.log("target array", targetArray);
            console.log("input array", inputArray);
            session = new dl.Session(graph, math);

            optimizer = new dl.SGDOptimizer(initialLearningRate);
            //optimizer= new dl.AdamOptimizer(initialLearningRate);

            console.log(`Preparing shuffled input, ${inputArray.length}, ${targetArray.length}`)
            console.log("target array", targetArray);
            const shuffledInputProviderBuilder = new dl.InCPUMemoryShuffledInputProviderBuilder([inputArray, targetArray]);
            console.log("now getting input providers")
            const [inputProvider, targetProvider] = shuffledInputProviderBuilder.getInputProviders();
            console.log("inputprovider",inputProvider);
            console.log("feeding entries", targetProvider)
            var feedEntries = [
                {tensor: inputTensor, data: inputProvider},
                {tensor: targetTensor, data: targetProvider}
            ];
        
            const NUM_BATCHES = inputArray.length-10;
            console.log(`Training using ${NUM_BATCHES} images`);
            var step = 0;
            var cost;
            const batchSize=5;

            //perform batch training, could have been as simple as session.train,
            //but this allows alteration learning rate, gpu acceleration
            function trainBatch(shouldFetchCost) {
                // Every 42 steps, lower the learning rate by 15%.
                //const learningRate = initialLearningRate * Math.pow(0.85, Math.floor(step / 42));
                //optimizer.setLearningRate(learningRate);
            
                // Train 1 batch. 
                let costValue = -1;
                //Put in dl tidy to accelerate math ops on GPU
                //dl.tidy(() => {
                    const cost = session.train(
                        costTensor, feedEntries, batchSize, optimizer,
                        shouldFetchCost ? dl.CostReduction.MEAN : dl.CostReduction.NONE);

                    if (!shouldFetchCost) {
                        // We only train. We do not compute the cost.
                        return;
                    }
                
                    // Compute the cost (by calling get), which requires transferring data
                    // from the GPU.
                    console.log("cost:",cost.get()); 
                return cost;
            }


            for (let i = 0; i < NUM_BATCHES; i++) {
                // Train takes a cost tensor to minimize. Trains one batch. Returns the
                // average cost as a Scalar.
                var shouldFetchCost=(step%batchSize)==0;
                cost=trainBatch(shouldFetchCost);
                step++;
                //if(step%5==0){console.log(cost);}
                //console.log('last average cost (' + i + '): ' + await cost.val());
            }

            var count=0;
         
            //Generate 
            for(var i=0; i< trainImages.length; i++){
                var temp= predict(inputArray[i]);
                var temp2=targetArray[i].getValues();
                if(temp.indexOf(Math.max(...temp))==temp2.indexOf(Math.max(...temp2))){
                    count+=1;
                }
            }
            console.log("Success rate: ", count/trainImages.length);
            $scope.modelAccuracy= Math.floor((count/trainImages.length)*100);

    }
    var getModelResult=function(){
        var canvas = document.getElementById('demoruncanvas');
        var context = canvas.getContext('2d');
        var video= document.getElementById('demorun');
        context.drawImage(video,0,0,canvas.width,canvas.height); 
        var img=context.getImageData(0,0, canvas.width, canvas.height).data;
        var imgToAdd=[];
        for(var i=0; i< img.length; i+=4 ){ //4 to skip, reduce resolution by
            imgToAdd.push((img[i]+img[i+1]+img[i+2])/3); 
        }
        imgToAdd= dl.Array1D.new(imgToAdd);
        //console.log("Image to predict", imgToAdd);
        var result=predict(imgToAdd);
        console.log("Model Prediction", result);
        $scope.modelResult=result.indexOf(Math.max(...result));
        var temp= result.map(c=> c- Math.min(0,  Math.min(...result)));
        console.log("Adjusted results", temp);
        $scope.resultConfidence= Math.floor( (Math.max(...temp)/ temp.reduce((a,b)=> a+b)) *100 );
        $scope.modelResultAction=$scope.connections[$scope.modelResult];
        console.log("Result Confidence:", $scope.resultConfidence, "trigger:", $scope.modelResult, $scope.triggers[$scope.modelResult].name, "action: ",$scope.connections[$scope.modelResult] )
        $scope.$apply();
    }

    $scope.runModel= function(){
        if(modelRunner){
            clearInterval(modelRunner);
            modelRunner="";
        }else{
            modelRunner=setInterval(getModelResult, 500);
        }
        
    }

    $scope.idealNoImages=100;
    $scope.captureFootage=false;
    $scope.removeImage=function(idx){
        $scope.newImages.splice(idx,1);
        if($scope.newImages.length<$scope.idealNoImages/2){
            $("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#C22614"});
        }
    }
    var getVideo=function(){
        if($scope.newImages.length<$scope.idealNoImages){
            var canvas1 = document.getElementById('canvas');
            var context = canvas1.getContext('2d');
            var video= document.getElementById('triggerCapture');
            context.drawImage(video,0,0,canvas1.width,canvas1.height); 
            var img=context.getImageData(0,0, canvas1.width, canvas1.height).data;

            var imgToAdd=[];

            for(var i=0; i< img.length; i+=4 ){ //4 to skip, reduce resolution by
                imgToAdd.push((img[i]+img[i+1]+img[i+2])/3); 
            }

            $scope.newImages.push({ 
                "url":canvas.toDataURL("image/png"),
                "data":imgToAdd
            });
            console.log(imgToAdd.length);

            

            if($scope.newImages.length>=$scope.idealNoImages/2){
                $("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#4EDE94"});
            }
            $scope.$apply();
        }else{
            $scope.stopImages();
            $scope.captureFootage=false;
        }
    }
    $scope.getBorderRadius=function(){
        if(!$scope.captureFootage){
            return "100%";
        }else{
            return "1em";
        }
    }

    $scope.actionActive=function(idx){
        if(activeAction===""){
            activeAction=idx;
            if(activeTrigger!==""){
                if( $scope.connections.indexOf([activeTrigger,activeAction])==-1){
                    $scope.connections[activeTrigger]= activeAction;
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
                    $scope.connections[activeTrigger]= activeAction;
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
            return {"border":"0.65em dashed #dddddd"};
        }else{
            return {"box-shadow": "0 4px 5px 0 rgba(0,0,0,.14), 0 5px 10px 0 rgba(0,0,0,.12), 0 0px 4px -1px rgba(0,0,0,.2)"};       
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
        captureVideo=setInterval(getVideo, 100);
        
    }
    $scope.stopImages=function(){
        clearInterval(captureVideo);
        
    }


}]);

//else{$("#createTrigger #triggerconsole md-progress-linear .md-container").css({"background-color":"#C22614"});}


/*
            var can=document.getElementById("tempcanvas");
            var ctx= can.getContext('2d');
            var imgData = ctx.createImageData(can.width, can.height); // width x height
            var data = imgData.data;
            var imd=normalizeInput($scope.triggers[0].images[0].data);
            var trainCats2=[];
            console.log("length of scope trigger image",$scope.triggers[0].images[0].data.length);
            // copy img byte-per-byte into our ImageData
            for (var i = 0, len = imd.length ; i < len; i++) {
                data[i*4]=imd[i]*255;
                data[(i*4)+1]=imd[i]*255;
                data[(i*4)+2]=imd[i]*255;
                data[(i*4)+3]=255;
            }
            console.log("Image data", imgData);
            // now we can draw our imagedata onto the canvas
            ctx.putImageData(imgData, 0, 0);
            //ctx.putImageData(data,0,0);
*/

/*
            for(var i=0; i< img.length; i+=4*4 ){ //4 to skip, reduce resolution by
                imgToAdd.push((img[i]+img[i+1]+img[i+2])/3); 
                if(i% (300*4)==0){
                    i+= (300*4*3);
                } 
            }
*/

            //img.reduce((a,b,c,d)=> (a+b+c)) need skipping
            //downsampling by 4 each way

                        //img.reduce((a,b,c,d)=> (a+b+c)) need skipping
            //downsampling by 4 each way

            //console.log(` Input array elem` , targetArray[0].getValues() , ` and predicted ${predict(inputArray[0])}`);
            //console.log(` Input array elem `, targetArray[targetArray.length-1].getValues() , `and predicted ${predict(inputArray[inputArray.length-1])}`);
            //predict(inputArray[inputArray.length-1]);


                        //var targetArray=trainCats2.map(c => dl.Array1D.new(c));
           // var targetArray= dl.Array1D(trainCats2);
            //var temp=[].concat.apply([], trainImages);

            //var inputArray=dl.Array2D.new([trainImages.length,trainImages[0].length],trainImages);
            //var targetArray=dl.Array2D.new([trainCats.length, 1], trainCats);

            //var inputArray=dl.NDArray.make([trainImages.length,trainImages[0].length,1], { values: temp });
            //var targetArray=dl.NDArray.make([trainCats.length,1, 1], { values: trainCats });
            //var targetArray = trainCats.map(c => dl.Array1D(c));
            //inputArray= dl.Array2D(inputArray);
            //targetArray= dl.Array2D(targetArray);


 /** Runs the example. */
//async function runExample() {
    /*
  const math = ENV.math;

  const a = Array1D.new([1, 2, 3]);
  const b = Scalar.new(2);
  const result = math.add(a, b);
  console.log(await result.data()); // Float32Array([3, 4, 5])
  result.data().then((data) => console.log(data));

  console.log(dl);
  console.log(dl.default);

  const math2 = dl.ENV.math;
  const a2 = dl.Array1D.new([1, 2, 3]);
  const b2 = dl.Scalar.new(2);
  const result2 = math2.add(a2, b2);
  console.log(await result2.data()); // Float32Array([3, 4, 5])
  result2.data().then((data) => console.log(data));
*/


  // Option 3: Synchronous download of data.
  // This is simpler, but blocks the UI until the GPU is done.
  //console.log(result.dataSync());   
  
  /*
  const math = ENV.math;

  const a = dl.Array1D.new([1, 2, 3]);
  const b = dl.Scalar.new(2);
  const c = dl.Array1D.new([1, 2, 3]);
  console.log(a,c);
    console.log(  math.sum( math.equal(a,c)).getValues()[0] );
    //math.batchNormalization2D()
    
   
 //console.log("hello",   a.getValues() )
  //var d=dl.Array2D(c);

  
  const result = math.add(a,b); // a is not modified, result is a new tensor
  result.data().then(data => console.log(data)); // Float32Array([3, 4, 5]
  
  // Alternatively you can use a blocking call to get the data.
  // However this might slow your program down if called repeatedly.
  console.log(result.dataSync()); // Float32Array([3, 4, 5]


    //shape 140, 105
    //const images=Array3D([])
    //images- N * width * height * channels
    //img.reshape([images.shape[0], -1, 3]).squeeze()

*/
     