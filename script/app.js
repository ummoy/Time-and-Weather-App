var app = angular.module('app', ['autocomplete','ngStorage']);
app.controller('MyCtrl', function($scope,$http,$localStorage){
	var db=[];
	var data=[];
	$scope.weather_data=getCityWiseData();
	
	/* below scope is used to show autocomple city list */
	$scope.doSomething = function(typedthings){
    $http({
        method: 'jsonp',
        url: 'http://gd.geobytes.com/AutoCompleteCity',
        params: {
			callback: 'JSON_CALLBACK',
            q: typedthings         
        }
    }).then(function (response) {
		
		if(response.data=="%s")
		{
			$scope.citys=""
		}
		else
		{
			$scope.citys= response.data;
			
		}
        
    });
  }
  /* Below function is triggered when user click on city search list item */
  $scope.doSomethingElse = function(suggestion){
	$scope.result=""  
	$http({
        method: 'jsonp',
        url: 'http://gd.geobytes.com/GetCityDetails',
        params: {
			callback: 'JSON_CALLBACK',
            fqcn: suggestion         
        }
    }).then(function (response) {
		getPrevCitydb=$localStorage.cityDB
		if(typeof getPrevCitydb != "undefined")
		{
			if(getPrevCitydb.length>=10)
			{
				alert("oops!!! you can view maximum 5 city at a time")
				return
			}
			for(i=0;i<getPrevCitydb.length;i+=2)
			{
				if(getPrevCitydb[i]==suggestion.substring(0,suggestion.indexOf(",")))
				{
					alert("You are already add this city")
					return
				}
			}
			getPrevCitydb.push(suggestion.substring(0,suggestion.indexOf(",")))
			getPrevCitydb.push(response.data.geobytesinternet)
			$localStorage.cityDB=getPrevCitydb;
		}
		else
		{
			array=[]
			array.push(suggestion.substring(0,suggestion.indexOf(",")))
			array.push(response.data.geobytesinternet)
			$localStorage.cityDB=array;
		}
		$scope.weather_data=getCityWiseData();
    });
	
	
	
  }
  /* below function is used to get weather information from openweathermap api */ 
  
  function getDatafromOpnWeather(cityname,countryCode)
  {
	  $http({
				method: 'jsonp',
				url: 'http://api.openweathermap.org/data/2.5/weather',
				params: {
					callback: 'JSON_CALLBACK',
					q:cityname+','+countryCode,
					appid:'664dd0f0d8d317ea0b820767585d3b28',
					units:'Metric'
				}
			}).then(function (response) {
				db.push(response.data.name);
				db.push(cityname);
				data.push(response.data)
				//return response.data
				
			});
  }
  
  function getCityWiseData()
  {
	getPrevCitydb=$localStorage.cityDB
	if(typeof getPrevCitydb != "undefined")
	{
		data=[];
		db=[];
		for(i=0,j=1;i<getPrevCitydb.length;i+=2,j+=2)
		{
			cityname=getPrevCitydb[i];
			//db.push(cityname);
			countryCode=getPrevCitydb[j];
			getDatafromOpnWeather(cityname,countryCode)

		}
		//console.log("initial db:"+db)
		return data;
	}
  }  
  /*Below function is called when user want to delete a city*/
  $scope.delCity=function(cityName) {
	  getPrevCitydb=$localStorage.cityDB
	  var index = db.indexOf(cityName);
	  if (index > -1) {
		  index2=db[index+1]
		  //console.log("from db array:" +index2)
		  index2 = getPrevCitydb.indexOf(index2);
		  //console.log("DB ARRAY:"+db)
		  //console.log("getprev ARRAY:"+getPrevCitydb)
		  //console.log("db index:"+index)
		  //console.log("getprev index:"+index2)
		  getPrevCitydb.splice(index2, 2);
		  db.splice(index,2)
		  $localStorage.cityDB=getPrevCitydb;
		  $scope.weather_data=getCityWiseData();
		  $scope.result=""
	  }
  }
  /* Below function is used for getting wind direction */
  $scope.getWindDirection = function(degree){
    if (degree>337.5) return 'North';
    if (degree>292.5) return 'North West';
    if(degree>247.5) return 'West';
    if(degree>202.5) return 'South West';
    if(degree>157.5) return 'South';
    if(degree>122.5) return 'South East';
    if(degree>67.5) return 'East';
    if(degree>22.5){return 'North East';}
    return 'North';
  }

});
/* Below directive is used for getting time for a specifie country using GOOGLE TimeZone Api */
app.directive("item", function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs,myCtrl) {
           	scope.myFunc(attrs.lat,attrs.lon)
			
        },
		controller: ['$scope', '$http', function($scope, $http) {
		$scope.myFunc=function(lat,lon)
		{
		 url="https://maps.googleapis.com/maps/api/timezone/json?location="+lat+","+lon+"&timestamp="+Math.floor(Date.now() / 1000)+"&sensor=false"
			$http.get(url).then(
				function(response) {
					offset=response.data.rawOffset/3600
					$scope.data=new Date( new Date().getTime() + offset * 3600 * 1000).toUTCString().replace( / GMT$/, "" )
			});
		}
    }],
		
		
        template: '<div class="day" style="text-align:center;float:none">{{data}}</div>'
    }
})
