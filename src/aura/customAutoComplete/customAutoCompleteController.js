({
    doInit:function(component, event, helper){
        var byId = component.get('v.loadById');
        var to = component.get('v.targetObject');
        if(byId != null){
            component.set('v.searchInProgress',true);
            var query =  helper.generateRecordByIdQuery(byId, component, event, helper);
            helper.runQuery(query,component, event, helper, function(rawResults, component,event, helper){
                var results = helper.transformSObjectToResults(rawResults,component, event, helper);
                component.set('v.results',results);
                component.set('v.searchInProgress',false);
                if(results.length != undefined && results.length == 1)
                    component.set('v.value', results[0]);                
               
                if(helper.hasClass("trigger-container","slds-is-open",component, event, helper)) 
                    helper.toggleContainersVisualMode("trigger-container","slds-is-open",component, event, helper);
                
                 helper.validateThisComponent(component, event, helper);
            });
        }
    },
    validateThisComponent:function(component, event, helper){
        helper.validateThisComponent(component, event, helper);
    },
    clearValue : function(component, event, helper) {
        var selectedRecord = component.get('v.value');
        var onRemovedEvent = component.getEvent('itemRemovedEvent');
        onRemovedEvent.setParams({"args":{"value":selectedRecord, componentName:component.get('v.name')}});        
        
        component.set('v.value',null);
        onRemovedEvent.fire();
    },
    doSearch:function(component, event, helper){ 
        if(!helper.hasClass("trigger-container","slds-is-open",component, event, helper)) 
            helper.toggleContainersVisualMode("trigger-container","slds-is-open",component, event, helper);
        
        component.set('v.searchInProgress',true);
        var query = helper.generateQuery(event.target.value,component, event, helper);
        helper.runQuery(query,component, event, helper, function(rawResults, component,event, helper){
            var results = helper.transformSObjectToResults(rawResults,component, event, helper);
            component.set('v.results',results);
            component.set('v.searchInProgress',false);
        });
        
    },
    itemSelected:function(component, event, helper){        
        var selectedValue = event.getParam('args').value;
        var onItemSelected = component.get('v.onItemSelected');     
        component.set('v.value', selectedValue);
        console.log('item selected !!!');
        if(helper.hasClass("trigger-container","slds-is-open",component, event, helper)) 
            helper.toggleContainersVisualMode("trigger-container","slds-is-open",component, event, helper);
        
        helper.validateThisComponent(component, event, helper);
    },
    closeList:function(component,event,helper){
        
        if(helper.hasClass("trigger-container","slds-is-open",component, event, helper) && !component.get('v.insideItemList')) 
        {
            helper.toggleContainersVisualMode("trigger-container","slds-is-open",component, event, helper); 
            component.set('v.value',null);
        }
        
        helper.validateThisComponent(component, event, helper);
    },
    insideItemList:function(component, event, helper){
        component.set('v.insideItemList', true);
    },
    leavedItemList:function(component, event, helper){
        component.set('v.insideItemList',false);
    },
    onItemSelectedDummy:function(component, event, helper){
        
    }
})