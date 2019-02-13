({
    
    //get the metadata for the fields specified from the setup
    describeObjects:function(component, event, helper, callback){
        var toDescribe = helper.generateDescribeParameters(component, event, helper);
        if(toDescribe != {}) helper.callServer("c.describeIt",{toDescribe:toDescribe},component, event, helper, callback); 
        
        
    },
    
    generateDescribeParameters:function(component, event, helper){
        var setup = component.get('v.setup');
        var toDescribe = {};
        for(var objectName in setup){
            var objectSetup = setup[objectName];
            toDescribe[objectName] = helper.isArray(objectSetup.fieldNames) ? objectSetup.fieldNames : [];
        }
        return toDescribe;
    },
    
    //get the metadata for the fields specified from the setup
    //and at the same time query the initial data
    describeObjectsAndQueryData:function(component, event, helper, callback){
        var toDescribe = helper.generateDescribeParameters(component, event, helper);
        var queryMap =helper.generateMapOfQueries(component, event, helper);
        if(toDescribe != {} || queryMap != {}) helper.callServer("c.describeItAndQuery",{toDescribe:toDescribe, mapOfQueries:queryMap},component, event, helper, callback); 
        
        
    },
    
    //queries that depends on data loaded first...
    queryRelatedRecords:function(component, event, helper, callback){        
        var queryMap = helper.generateRelatedMapOfQueries(component, event, helper);
        if(queryMap != {}){  helper.runQueryMap(queryMap, component, event, helper, callback); return true; }
        return false;
    },
    
    //generates the queries for the related data
    generateRelatedMapOfQueries:function(component, event, helper){
        var setup = component.get('v.setup');
        var queryMap = {};
        for(var objectName in setup){
            var objectSetup = setup[objectName];
            if(helper.isArray(objectSetup.fieldNames) &&  (objectSetup.adhoc_data != null &&  objectSetup.adhoc_data != undefined) ){
                var idFromLoadedRecord = '';
                var cacheData = component.get('v.dataCache');
                if(helper.isObject(cacheData)){
                    var resultSet = cacheData[objectSetup.adhoc_data.relatedObject];
                    
                    if(resultSet != null && resultSet.length > 0){
                        idFromLoadedRecord = resultSet[0][objectSetup.adhoc_data.idValueFrom];                        
                    }
                    
                    var whereCondition = " Id ='"+idFromLoadedRecord+"'";
                    if(objectSetup.whereCondition != null && objectSetup.whereCondition != undefined)
                        for(var key in objectSetup.whereCondition){
                            if(whereCondition != '') whereCondition += ' and ';
                            whereCondition += key+"='"+objectSetup.whereCondition[key]+"'";
                        }
                    
                    queryMap[objectName] = 'select ' + objectSetup.fieldNames.join(',') + ' from ' + objectName +(whereCondition != '' ? ' where '+ whereCondition : '');
                    
                }
                
            }
        }
        return queryMap;
    },
    
    //query records where adhoc_data is null
    queryRecords:function(component, event, helper, callback){
        var queryMap =helper.generateMapOfQueries(component, event, helper);
        if(queryMap != {}) helper.runQueryMap(queryMap, component, event, helper, callback);
    },
    generateMapOfQueries:function(component, event, helper){
        var setup = component.get('v.setup');
        var queryMap = {};
        for(var objectName in setup){
            var objectSetup = setup[objectName];
            if(helper.isArray(objectSetup.fieldNames) &&  (objectSetup.adhoc_data == null ||  objectSetup.adhoc_data == undefined) ){
                var whereCondition = '';
                if(objectSetup.whereCondition != null && objectSetup.whereCondition != undefined)
                    for(var key in objectSetup.whereCondition){
                        if(whereCondition != '') whereCondition += ' and ';
                        whereCondition += key+"='"+objectSetup.whereCondition[key]+"'";
                    }
                
                queryMap[objectName] = 'select ' + objectSetup.fieldNames.join(',') + ' from ' + objectName +(whereCondition != '' ? ' where '+ whereCondition : '');
            }
        }
        return queryMap;
    },
    describeAndLoad: function( component, event, helper){   
        if(component.get('v.setup') != null){
           
            helper.describeObjectsAndQueryData(component, event, helper, function(rawResults, component, event, helper){
                console.log('loading describes and initial data at the same time');
                if(helper.isAcceptableQueryMapResults(rawResults, 'describe')) {               
                	//update describe data
               		helper.updateDescribeData(rawResults['describe'], component, event, helper);
                
                	//then notify the subscriber that the describe has been completed.
                	helper.fireObjectDescribed(rawResults['describe'], component, event, helper);
                }
                
                if(helper.isAcceptableQueryMapResults(rawResults, 'query')) {   
                    var results = rawResults['query'];
                    
                	component.set('v.dataCache', results);
            
                    //then notify the subscriber that the describe has been completed.
                    helper.fireDataLoaded(results, component, event, helper);
                    
                    var relatedRecordQueryRun = helper.queryRelatedRecords(component, event, helper, function(relatedResults, component, event, helper){
                        
                        console.log('loading related data..');
                        
                        if(helper.isObject(relatedResults)){
                            var cacheData = component.get('v.dataCache');
                            for(var key in relatedResults) cacheData[key] = relatedResults[key];
                            component.set('v.dataCache', cacheData);
                        }
                        
                        //then notify the subscriber that the related data load has been completed.
                        helper.fireDataLoaded(relatedResults, component, event, helper);
                        
                        //hide the loader
                        helper.hideLoader(component);
                    });
                    
                   
                    
                    //if we are not loading related data then just hide the loader
                    if(relatedRecordQueryRun != true) helper.hideLoader(component);
                }
                
                
            });
        }
        
    },
    
    //generic to call the server
    callServer:function(serverFunction, params,component, evevnt, helper, callback){
        var action = component.get(serverFunction);
        action.setParams(params);
        
        // Create a callback that is executed after 
        // the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            console.log('call returned from the server ');
            if (state === "SUCCESS") {
                //if you only want to invoke action when success
                
            }
            else if (state === "INCOMPLETE") {
                // do something
                console.log('weird error, incomplete??? ');
            }  else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                    errors[0].message);
                    }
                } else {
                    //component.set('v.loadingDataError', errors[0].message);
                    console.log("Unknown error");
                }
                
            }
            if(typeof(callback) =='function') callback(response.getReturnValue(), component, event, helper);
        });
        
        $A.enqueueAction(action);
    },
    
    //to load the data based on what we had in the setup
    loadData:function(component, event, helper){
        helper.queryRecords(component, event, helper, function(results, component, event, helper){
            
            component.set('v.dataCache', results);
            
            var relatedRecordQueryRun = helper.queryRelatedRecords(component, event, helper, function(relatedResults, component, event, helper){
                
                if(helper.isObject(relatedResults)){
                    var cacheData = component.get('v.dataCache');
                    for(var key in relatedResults) cacheData[key] = relatedResults[key];
                    component.set('v.dataCache', cacheData);
                }
                
                //then notify the subscriber that the related data load has been completed.
                helper.fireDataLoaded(relatedResults, component, event, helper);
                
                helper.hideLoader(component);
            });
            
            //then notify the subscriber that the describe has been completed.
            helper.fireDataLoaded(results, component, event, helper);
            
            //if we are not loading related data then just hide the loader
            if(relatedRecordQueryRun != true) helper.hideLoader(component);
       
            
        });  
    },
    //generic to run queries
    runQuery:function(query,component, event, helper, callback){
        helper.callServer("c.query",{q:query},component, event, helper, callback); 
        
    },
    
    //generic to run multiple queries in a single call
    runQueryMap:function(qmap, component, event, helper, callback){
        helper.callServer("c.queryMap",{mapOfQueries:qmap},component, event, helper, callback); 
    },
    
    parseSingleRecordResults:function(sobjects,component, event, helper){
        var result = null;
        
        if(sobjects != null && sobjects != undefined){
            if(helper.isArray(sobjects) && sobjects.length ==1){
                result = sobjects[0];
                
            }
        } 
        
        return result;
    },
    isArray:function(obj){
        return Object.prototype.toString.call(obj) === '[object Array]';  
    },
    isAcceptableQueryMapResults: function(obj, aProperty){
        return obj != null && obj != undefined && typeof(obj.hasOwnProperty) == 'function' && obj.hasOwnProperty(aProperty);
    },
    isObject: function(obj){
        return obj != null && obj != undefined && typeof(obj.hasOwnProperty) == 'function';
    },
    save:function(arrayOfData, component, event, helper, callback){
        console.log('saving data ');
        helper.callServer("c.save",{toSave:arrayOfData, updateOnly:true}, component, event, helper, callback); 
    },
    saveAndQuery:function(arrayOfData,mapOfQ, component, event, helper, callback){
      console.log('saving and querying ');
        helper.callServer('c.saveAndQuery',{toSave:arrayOfData, updateOnly:true, mapOfQueries:mapOfQ}, component, event, helper, callback); 
    },
    updateDescribeData:function(data, component, event, helper){
        if(helper.isObject(data)) component.set('v.describeData', data);
    },
    
    //generic to execute the app event to communicate with subscribers
    fireAppEvent:function(eType, data, eTag){
        var objectDescribedEvent = $A.get("e.c:customRecordFormApplicationEvent");
        objectDescribedEvent.setParams({"args":{
            eventType:eType, eventData: data, tag:eTag
        }});
        objectDescribedEvent.fire();
    },
    
    //notify subscribers the metadata has been loaded
    fireObjectDescribed:function(data, component, event, helper){
        helper.fireAppEvent("describeComplete", data );
    },
    
    //notify subscribers the data has been loaded
    fireDataLoaded:function(data, component, event, helper){
        helper.fireAppEvent("dataComplete", data );
    },
    
    //notify subscribers the result of the data save attempt
    fireDataSaved:function(data, eTag,component, event, helper){
        helper.fireAppEvent('saveCallback', data, eTag);
    },
    refreshRecordPage:function(component, event, helper){
        var fevent = $A.get('e.force:refreshView');
        if(fevent != null) fevent.fire();
    },
    showLoader:function(component){
        component.set('v.showLoader', true);
    },
    hideLoader:function(component){
        component.set('v.showLoader', false);
    },
    mergeJson:function(arg1, arg2){
        for(var key in arg2){
            arg1[key] = arg2[key];
        }
        return arg1;
    }
    
})