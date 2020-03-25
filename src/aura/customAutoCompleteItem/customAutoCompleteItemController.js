({
	onselected : function(component, event, helper) {
		var onSelectedEvent = component.getEvent('itemSelectedEvent');
        onSelectedEvent.setParams({"args":{"value":component.get('v.value'), componentName:component.get('v.name')}});
        onSelectedEvent.fire();
	}
})