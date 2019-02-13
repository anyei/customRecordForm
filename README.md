# customRecordForm
sfdc lightning component, customRecordForm to edit standard/custom object records.
### demo

![demo](https://github.com/anyei/customAutoComplete/raw/master/customRecordForm-Demo.gif)


### Install

##### Deploy to Salesforce Button

<a href="https://githubsfdeploy.herokuapp.com?owner=anyei&repo=customRecordForm">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png">
</a>

##### Manual Install

You may manually create the class within your org and copy paste the content of customRecordForm's src folder.


### Usage
The simplest way to use this component is to put the markup anywhere within your lightninig component or lightning app, then set the properties and that's it. Here a simple examples, there are more if you scroll down:



### simple example 1
We use the customRecordForm component to generate the form for several fields. We need to use the customDataManager, this is use to connect to the server will explain more about it later.

##### markup
```html
<aura:application  extends="force:slds" >
  
    <aura:attribute name="recordId" type="String" default="006S000000C1QgyIAF" />
    
    <aura:attribute name="opptyFields" type="List" default="['Id','Owner_1__c', 'Position__c', 'Type', 'Business_Phone__c']"/>
  
   <aura:handler value="{!this}" name="init" action="{!c.doInit}" />

    <c:customFormDataManager aura:id="customDataManager" />
    
    <c:customRecordForm sObjectType="Opportunity" fields="{!v.opptyFields}" />

</aura:application>
```
In this sample markup, we are using additional attributes such as the recordId nad the opptyFields, these are needed in order to setup the components.

##### js controller
```javascript
({
    doInit:function(component, event, helper){

        var opptyFields = component.get('v.opptyFields');
       var opptyId = component.get('v.recordId');
       

        component.find('customDataManager').set('v.setup',{ 
            Opportunity:{fieldNames :opptyFields, whereCondition:{Id:opptyId} }
        });
    }
})
```


