({
    doInit : function(component, event, helper) {
        helper.showLoader(component);        
        helper.describeAndLoad(component, event, helper);        
    },
    setupChange:function(component, event, helper){        
        helper.describeAndLoad(component, event, helper);
    },
    applicationEventHandler:function(component, event, helper){
        var pArgs = event.getParam('args');
        if(pArgs != null){
            
            //forms trying to save
            if(pArgs.eventType == 'save'){
                console.log('saving, form unique id = '+pArgs.tag);
                helper.showLoader(component);
                var eTag = pArgs.tag;
                if(pArgs.eventData.saveAndQuery != undefined && pArgs.eventData.saveAndQuery == true){
                    var mapOfQueries = helper.generateMapOfQueries(component, event, helper);
                    var relatedMapOfQueries = helper.generateRelatedMapOfQueries(component, event,helper);
                    var finalMapOfQueries = helper.mergeJson(mapOfQueries, relatedMapOfQueries);
                    
                    helper.saveAndQuery(pArgs.eventData.toSave,finalMapOfQueries, component, event, helper, function(results, component, event, helper){
                        helper.hideLoader(component);
                        helper.fireDataSaved(results,eTag, component, event, helper);
                    });
                }else{
                    helper.save(pArgs.eventData.toSave, component, event, helper, function(results, component, event, helper){
                        helper.hideLoader(component);
                        helper.fireDataSaved(results,eTag, component, event, helper);
                    });
                }
                
            }
            
            //forms trying to load
            if(pArgs.eventType == 'load'){
                console.log('loading data, form unique id = '+pArgs.tag);
                helper.showLoader(component);
                var eTag = pArgs.tag;
                helper.loadData(component, event, helper);
            }
            
            
        }
    }
})