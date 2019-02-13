({
    doInit:function(component, event, helper){
        helper.generateUniqueId(component, event, helper);  
    },
    applicationEventHandler : function(component, event, helper) {        
        helper.handleAppEventHandler(component, event, helper);
    },
    switchToEdit:function(component, event, helper){
        component.set('v.mode', 'edit');
        helper.buildAllDependancyBetweenPicklist(component, event, helper);
    },
    switchToView:function(component, event, helper){
        helper.cleanChanges(component, event, helper);
        helper.showErrorMessage('', component, event, helper);
        component.set('v.mode', 'view');
        
    },
    picklistChange:function(component, event, helper){
        var picklistChanging= event.getSource();
        
        
        helper.buildDependancyBetweenPicklist(picklistChanging.get('v.class'), picklistChanging.get('v.value'),component, event, helper);
        helper.persistData(picklistChanging.get('v.class'), picklistChanging.get('v.value'), component, event, helper);
    },
    lookupItemSelected:function(component, event, helper){
        var pArgs = event.getParam('args');
        if(pArgs != null) helper.persistData(pArgs.componentName, (pArgs.value != null ? pArgs.value.value : null), component, event, helper);
    },
    lookupItemRemoved:function(component, event, helper){
        var pArgs = event.getParam('args');
        if(pArgs != null) helper.persistData(pArgs.componentName, null, component, event, helper);
	},
    saveThis:function(component, event, helper){
        helper.saveData(component, event, helper);
    }
})