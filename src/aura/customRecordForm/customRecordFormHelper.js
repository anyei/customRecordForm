({
    
    handleAppEventHandler:function(component, event, helper){
        var sObjectType = component.get('v.sObjectType');
        var fields = component.get('v.fields');
        var fieldsDescribed = [];
        var fieldsDescribedMap = {};
        if(sObjectType != null && fields != null){
            var pArgs = event.getParam('args');
            if(helper.isObject(pArgs)){
                if(pArgs.eventType == 'describeComplete'){
                    var typeDescribe = pArgs.eventData[sObjectType];
                    if(typeDescribe != null){
                        var fieldDescribes = typeDescribe.fields;
                        var targetFields = component.get('v.fields');
                        
                        if(fieldDescribes != null && targetFields != null && targetFields.length > 0){   
                            for(var i = 0;i<targetFields.length;i++){
                                
                                var fieldDescribe = fieldDescribes[targetFields[i]];
                                if(fieldDescribe != null){
                                    fieldDescribe = helper.addAdditionalFieldsToDescription(fieldDescribe);
                                    fieldsDescribed.push(fieldDescribe);
                                    fieldsDescribedMap[targetFields[i]] = fieldDescribe;
                                } 
                                
                            }
                            
                            
                        }
                        component.set('v.fieldsDescribed',fieldsDescribed);
                        component.set('v.fieldsDescribedMap',fieldsDescribedMap);
                    }
                    
                    
                }else if(pArgs.eventType =='dataComplete'){
                    helper.handleDataLoadComplete(pArgs, component, event, helper);
                    
                }else if(pArgs.eventType == 'saveCallback' && pArgs.tag == component.get('v.uniqueId')){
                    var result = helper.isAcceptableQueryMapResults(pArgs.eventData, "save") ? pArgs.eventData["save"] : pArgs.eventData;
                    if(result == 'ok'){                        
                        helper.refreshReadOnlyData(component, event, helper);
                        component.set('v.mode','view');
                        component.set('v.error', '');
                        if(component.get('v.autoReload') == true)helper.handleDataLoadComplete(pArgs, component, event, helper); //helper.reloadData(component, event, helper);
                        helper.refreshRecordPage(component, event, helper);
                    }else{
                        helper.showErrorMessage(result, component, event, helper);
                    }
                }
            }
            
        }        
    },
    handleDataLoadComplete:function(pArgs, component, event, helper){
        var sObjectType = component.get('v.sObjectType');
        var queryResult = helper.isAcceptableQueryMapResults(pArgs.eventData, "query") ? pArgs.eventData["query"] : pArgs.eventData;
        
        var dataResult = helper.isAcceptableQueryMapResults(queryResult, sObjectType) ? queryResult[sObjectType] : null;
        
        if(dataResult != null ){
            var fieldDescribed = component.get('v.fieldsDescribed');
            var fieldsDescribedMap ={};
            for(var i = 0;i<fieldDescribed.length;i++){
                var fieldD = fieldDescribed[i];
                fieldDescribed[i].value = dataResult[0][fieldD.apiName];
                if(fieldDescribed[i].data_type=='picklist' || fieldDescribed[i].data_type=='multipicklist') fieldDescribed[i].values = helper.transformPicklistValues(fieldDescribed[i].picklistValues, fieldDescribed[i].value);
                if(fieldDescribed[i].data_type=='multipicklist') { fieldDescribed[i].selectedValues = helper.transformMultipicklistData(fieldDescribed[i].value);}
                fieldDescribed[i].disabled = (fieldD.isAccessible != true || fieldD.isCalculated == true || fieldD.isUpdateable != true || fieldD.isAutoNumber == true);
                fieldsDescribedMap[fieldD.apiName] = fieldDescribed[i];
                
            }
            
            let readOnlyData = JSON.parse(JSON.stringify(fieldDescribed));
            component.set('v.fieldsDescribed',[]); 
            component.set('v.fieldsDescribed',fieldDescribed);
            component.set('v.fieldsDescribedMap',{});
            component.set('v.fieldsDescribedMap',fieldsDescribedMap);
            component.set('v.readOnlyData', readOnlyData);
            
        }  
    },
    refreshRecordPage:function(component, event, helper){
        var fevent = $A.get('e.force:refreshView');
        if(fevent != null) fevent.fire();
    },
    isAcceptableQueryMapResults: function(obj, aProperty){
        return obj != null && obj != undefined && typeof(obj.hasOwnProperty) == 'function' && obj.hasOwnProperty(aProperty);
    },
    addAdditionalFieldsToDescription:function(obj){
        obj.showHelp = (obj.inlineHelpText != null && obj.inlineHelpText != undefined);
        obj.isLookup = (obj.targetObject != null && obj.targetObject != undefined)
        return obj;
    },
    isObject:function(obj){
        return obj!= null && typeof(obj.hasOwnProperty) == 'function';
    },
    transformPicklistValues : function(vals, selectedValue) {
        var results = [];
        
        if(vals != null ){
            for(var key in vals){
                results.push({label : vals[key], value:key, selected : (vals[key] ==selectedValue) });
            }
            
        }
        
        return results;
    },
    transformMultipicklistData: function(picklistData){
        var results = (picklistData != null && picklistData != undefined) ? picklistData.split(';') : [];
        
        return results;
    },
    transformToMultipicklistData:function(arrayData){
        
        var results = (arrayData != null && arrayData != undefined ? arrayData.toString().split(',').join(';'):'');
        
        return results;
        
        
    },
    buildDependancyBetweenPicklist:function(possibleControllingFieldApiName, newValue, component, event, helper){
        var fieldDescribed = component.get('v.fieldsDescribed');
        var fieldsDescribedMap = component.get('v.fieldsDescribedMap');
        
        var rebuildList = false;
        for(var i = 0;i<fieldDescribed.length;i++){
            var fieldD = fieldDescribed[i];
            if(fieldD.apiName == possibleControllingFieldApiName){
                
                fieldD.values = helper.transformPicklistValues(fieldDescribed[i].picklistValues, newValue);
                fieldD.value = newValue;
            }
            if(fieldD.isDependant==true && fieldD.controllingFieldApiName == possibleControllingFieldApiName){
                
                var mapData = helper.transformListToPicklistValueMap(fieldD.childDependantsPicklistValues[newValue]);
                fieldD.values = helper.transformPicklistValues(mapData, fieldDescribed[i].value);
                if(fieldD.values.length <=0 ) fieldD.value = null;
                
                fieldD.disabled = fieldD.values != null && fieldD.values.length > 0  ? (fieldD.isAccessible != true || fieldD.isCalculated == true || fieldD.isUpdateable != true || fieldD.isAutoNumber == true) : true;
                
                rebuildList = true;
            }
            fieldDescribed[i] = fieldD;
            
        }
        if(rebuildList == true){
            component.set('v.fieldsDescribed',[]); 
            component.set('v.fieldsDescribed',fieldDescribed);
            component.set('v.fieldsDescribedMap',{});
            component.set('v.fieldsDescribedMap',fieldsDescribedMap);
        }
        
    },
    transformListToPicklistValueMap:function(data){
        var result = {};
        
        if(data != null && data.length != undefined)
            for(var i=0;i<data.length;i++){
                result[data[i]] = data[i];
            }
        return result;
        
    },
    buildAllDependancyBetweenPicklist:function(component, event, helper){
        var fieldDescribed = component.get('v.fieldsDescribed');
        var fieldsDescribedMap = component.get('v.fieldsDescribedMap');        
        var rebuildList = false;
        for(var i = 0;i<fieldDescribed.length;i++){
            var fieldD = fieldDescribed[i];
            if(fieldD.isDependant==true && fieldD.controllingFieldApiName != null){
                var controllingField = fieldsDescribedMap[fieldD.controllingFieldApiName];
                var mapData = helper.transformListToPicklistValueMap(fieldD.childDependantsPicklistValues[controllingField.value]);
                fieldD.values = (mapData == {} ? []: helper.transformPicklistValues(mapData, fieldDescribed[i].value));
                if(fieldD.values.length <=0 ) fieldD.value = null;
                fieldD.disabled = fieldD.values != null && fieldD.values.length > 0 ? (fieldD.isAccessible != true || fieldD.isCalculated == true || fieldD.isUpdateable != true || fieldD.isAutoNumber == true) : true;
                
                rebuildList = true;
            }
            
        }
        if(rebuildList == true){
            component.set('v.fieldsDescribed',[]); 
            component.set('v.fieldsDescribed',fieldDescribed);
            component.set('v.fieldsDescribedMap',{});
            component.set('v.fieldsDescribedMap',fieldsDescribedMap);
        }
    },
    cleanChanges:function(component, event, helper){
        var fieldsDescribedMap = {};
        var readOnlyData = component.get('v.readOnlyData');
        let cleanData = JSON.parse(JSON.stringify(readOnlyData));
        for(var i = 0;i<cleanData.length;i++){
            var fieldD = cleanData[i];            
            fieldsDescribedMap[fieldD.apiName] = fieldD;
        } 
        component.set('v.fieldsDescribed',[]);
        component.set('v.fieldsDescribed',cleanData);
        component.set('v.fieldsDescribedMap',{});
        component.set('v.fieldsDescribedMap',fieldsDescribedMap);
    },
    persistData:function(fieldApiName, newValue, component, event, helper){
        var fieldsDescribedMap = component.get('v.fieldsDescribedMap'); 
        var fieldDescribed = component.get('v.fieldsDescribed');
        console.log('value before '+fieldsDescribedMap[fieldApiName].value);
        for(var i = 0;i<fieldDescribed.length;i++){
            
            if(fieldDescribed[i].apiName == fieldApiName ){                
                fieldDescribed[i].value =  newValue;
            }
            
        }
        component.set('v.fieldsDescribed',fieldDescribed);
        component.set('v.fieldsDescribedMap',fieldsDescribedMap);
        
    },
    saveData:function(component, event, helper){
        var fieldDescribed = component.get('v.fieldsDescribed');
        var fieldsDescribedMap = {} 
        var objectToSave = {};
        for(var i = 0;i<fieldDescribed.length;i++){
            
            if(fieldDescribed[i].data_type=='multipicklist'){
                fieldDescribed[i].value =helper.transformToMultipicklistData(fieldDescribed[i].selectedValues);
            }
            
            fieldsDescribedMap[fieldDescribed[i].apiName] =  fieldDescribed[i];
            
        }
        var targetFields = component.get('v.fields');
        var copyDat =  JSON.parse(JSON.stringify(fieldsDescribedMap));
        for(var i =0 ;i<targetFields.length;i++){
            objectToSave[targetFields[i]] = copyDat[targetFields[i]].value;
        }
        objectToSave.sobjectType=component.get('v.sObjectType');
        //helper.refreshList(fieldDescribed, fieldsDescribedMap, component, event, helper);
        if(component.get('v.autoReload') != true) helper.fireAppEvent("save",{toSave:[objectToSave]}, component.get('v.uniqueId'));
        if(component.get('v.autoReload') == true)  helper.fireAppEvent("save",{toSave:[objectToSave],saveAndQuery:true}, component.get('v.uniqueId'));
        
        
    },
    reloadData:function(component, event, helper){
        helper.fireAppEvent("load",{}, component.get('v.uniqueId'));
    },
    fireAppEvent:function(eType, data, eTag){
        var objectDescribedEvent = $A.get("e.c:customRecordFormApplicationEvent");
        objectDescribedEvent.setParams({"args":{
            eventType:eType, eventData: data, tag:eTag
        }});
        objectDescribedEvent.fire();
    },
    generateUniqueId:function(component, event, helper){
        var uniqueId = new Date().getTime();
        component.set("v.uniqueId",uniqueId);
    },
    refreshReadOnlyData:function(component, event, helper){
        var fieldsDescribed =  component.get("v.fieldsDescribed");
        var fieldsDescribedMap = component.get('v.fieldsDescribedMap');
        var readOnlyData = JSON.parse(JSON.stringify(fieldsDescribed));     
        component.set('v.readOnlyData', readOnlyData);
        helper.refreshList(fieldsDescribed,fieldsDescribedMap, component, event, helper);
    },
    refreshList:function(fieldDescribed,fieldsDescribedMap, component, event, helper){
        component.set('v.fieldsDescribed',[]);
        component.set('v.fieldsDescribed',fieldDescribed);
        component.set('v.fieldsDescribedMap',{});
        component.set('v.fieldsDescribedMap',fieldsDescribedMap);
    },
    showErrorMessage:function(msg, component, event, helper){
        component.set('v.error', msg);
    }
    
})