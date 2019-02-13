/*
* Created By : Angel Robles
* Created Date: 02-02-2019
* Test Class : TestCustomRecordFormController
*/ 
public class customRecordFormController {
    
    @AuraEnabled
    public static map<string, ObjectDescribeResult > describeIt(Map<string, list<object>> toDescribe) {
        Map<String, ObjectDescribeResult> result = new map<string, ObjectDescribeResult>();
        list<string> objectNameList = new List<String>( toDescribe.keyset() );
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(objectNameList);
        for(Schema.DescribeSobjectResult res : results) {
            
            ObjectDescribeResult describedObject = new ObjectDescribeResult();
            describedObject.apiName = res.getName();
            describedObject.label = res.getLabel();
            describedObject.isAccessible = res.isAccessible();
            describedObject.isCreateable = res.isCreateable();
            describedObject.isUpdateable = res.isUpdateable();
            describedObject.isDeletable = res.isDeletable();
            describedObject.fields = new map<string, FieldDescribeResult>();
            
            list<string> fieldNameList = new List<string>();
            for(object o : toDescribe.get(describedObject.apiName)){
                fieldNameList.add(o.toString());
                system.debug(fieldNameList);
            }
            Map<String, Schema.SObjectField> fieldMap =  res.fields.getMap();
            
            for(string field_name : fieldNameList){                
                
                if(fieldMap.containsKey(field_name)){
                    Schema.DescribeFieldResult fieldResult = fieldMap.get(field_name).getDescribe();
                    Schema.DisplayType fType = fieldResult.getType();
                    List<Schema.SObjectType> targetObjectLookup = fieldResult.getReferenceTo();
                    FieldDescribeResult fd = new FieldDescribeResult();
                    fd.isAccessible = fieldResult.isAccessible();
                    fd.isUpdateable = fieldResult.isUpdateable();
                    fd.isCalculated = fieldResult.isCalculated();
                    fd.isAutoNumber = fieldResult.isAutoNumber();
                    fd.isRequired = fieldResult.isNillable();
                    fd.isDependant = fieldResult.isDependentPicklist();
                    fd.inlineHelpText = fieldResult.getInlineHelpText();
                    fd.apiName = fieldResult.getName();
                    fd.label = fieldResult.getLabel();
                    fd.data_type = ftype.name().tolowercase();
                    if(fd.data_type == 'picklist' || fd.data_type=='multipicklist'){
                        map<string, string> picklistValues = new map<string, string>();
                        for (Schema.PicklistEntry entry : fieldResult.getPicklistValues()) {
                            if (entry.isActive()) {                            
                                picklistValues.put(entry.getValue(),entry.getLabel());
                            }
                        }
                        fd.picklistValues=picklistValues;
                        system.debug('something here '+fd.apiName);
                        Schema.SObjectField cField = fieldResult.getController();
                        fd.childDependantsPicklistValues = getDependentOptionsImpl(fieldMap.get(field_name), cField);
                        fd.controllingFieldApiName = cField != null ? cField.getDescribe().getName() : null;
                    }
                    if(targetObjectLookup != null && targetObjectLookup.size() > 0){
                        ObjectDescribeResult targetObject = new ObjectDescribeResult();
                        Schema.DescribeSobjectResult toResult= targetObjectLookup[0].getDescribe();
                        targetObject.apiName = toResult.getName();
                        targetObject.label = toResult.getLabel();
                        targetObject.isAccessible = toResult.isAccessible();
                        targetObject.isCreateable = toResult.isCreateable();
                        targetObject.isUpdateable = toResult.isUpdateable();
                        targetObject.isDeletable = toResult.isDeletable();
                        targetObject.fields = new map<string, FieldDescribeResult>();
                        fd.targetObject = targetObject;
                    }
                    if(fd.apiName =='Expected_Term__c'){
                        system.debug('DATA TYPE == '+fd.data_type + ' field == '+fd.apiName);
                    }
                    
                    describedObject.fields.put(field_name, fd);
                    
                }  
            }
            
            result.put(describedObject.apiName, describedObject);
        }
        
        system.debug(result);
        return result;
    }
    
    @AuraEnabled
    public static map<string, object> describeItAndQuery(map<string, list<object> > toDescribe, map<string, string> mapOfQueries){
        map<string, ObjectDescribeResult> describeResult = describeIt(toDescribe);
        map<string, list<sobject> > queryResult = queryMap(mapOfQueries);
        return new map<string, object> {'describe'=>describeResult, 'query'=>queryResult};
    }
    
    @AuraEnabled
    public static map<string, list<sobject>> queryMap(map<string, string> mapOfQueries){
        map<string, list<sobject> > result = new map<string, list<sobject>>();
        if(mapOfQueries.size() <= 100){
            for(string objType : mapOfQueries.keySet()){
                result.put(objType, database.query(mapOfQueries.get(objType)) );
            }
            
        }
        return result;
    }
    
     @AuraEnabled
    public static map<string, object> saveAndQuery(list<sobject> toSave, boolean updateOnly,map<string, string>  mapOfQueries){
        string result = '';
             
        try{
            if(updateOnly) database.update(toSave);
            if(!updateOnly) database.upsert(toSave);
            result = 'ok';
        }catch(Exception err){
            result = err.getMessage();
        }
        
        map<string, list<sobject> > queryResult = new map<string, list<sobject> >();
        try{
           if(result == 'ok') queryResult = queryMap(mapOfQueries);
        }catch(exception err){queryResult = new map<string, list<sobject> >();  }
        return new map<string, object>{ 'save' => result, 'query'=> queryResult} ;
    }
    
    
    @AuraEnabled
    public static string save(list<sobject> toSave, boolean updateOnly){
        string result = '';
             
        try{
            if(updateOnly) database.update(toSave);
            if(!updateOnly) database.upsert(toSave);
            result = 'ok';
        }catch(Exception err){
            result = err.getMessage();
        }
        
        return result;
    }
    
    
    public class FieldDescribeResult{
        @auraEnabled public string data_type {get;set;}
        @auraEnabled public boolean isAccessible {get;set;}
        @auraEnabled public boolean isCalculated {get;set;}
        @auraEnabled public boolean isUpdateable {get;set;}
        @auraEnabled public boolean isAutoNumber {get;set;}
        @auraEnabled public boolean isRequired {get;set;}
        @auraEnabled public boolean isDependant {get;set;}
        @auraEnabled public string inlineHelpText {get;set;}
        @auraEnabled public string label {get;set;}
        @auraEnabled public string apiName {get;set;}
        @auraEnabled public string controllingFieldApiName {get;set;}
        @auraEnabled public ObjectDescribeResult targetObject {get;set;}
        @auraEnabled public map<string,string> picklistValues {get;set;}
        @auraEnabled public map<string, list<string>> childDependantsPicklistValues {get;set;}
        
        
    }
    
    
    public class ObjectDescribeResult {
        @auraEnabled public string apiName {get;set;}
        @auraEnabled public string label {get;set;}
        @auraEnabled public boolean isAccessible {get;set;}
        @auraEnabled public boolean isCreateable {get;set;}
        @auraEnabled public boolean isDeletable {get;set;}
        @auraEnabled public boolean isUpdateable {get;set;}
        @auraEnabled public map<string, FieldDescribeResult> fields {get;set;}
    }
    

	public static Map<String, List<String>> getDependentOptionsImpl(Schema.SObjectField theField, Schema.SObjectField ctrlField) {
        if(ctrlField == null) return null;
		// validFor property cannot be accessed via a method or a property,
		// so we need to serialize the PicklistEntry object and then deserialize into a wrapper.
		List<Schema.PicklistEntry> contrEntries = ctrlField.getDescribe().getPicklistValues();
		List<PicklistEntryWrapper> depEntries =
				wrapPicklistEntries(theField.getDescribe().getPicklistValues());

		// Set up the return container - Map<ControllingValue, List<DependentValues>>
		Map<String, List<String>> objResults = new Map<String, List<String>>();
		List<String> controllingValues = new List<String>();

		for (Schema.PicklistEntry ple : contrEntries) {
			String label = ple.getLabel();
			objResults.put(label, new List<String>());
			controllingValues.add(label);
		}

		for (PicklistEntryWrapper plew : depEntries) {
			String label = plew.label;
			String validForBits = base64ToBits(plew.validFor);
			for (Integer i = 0; i < validForBits.length(); i++) {
				// For each bit, in order: if it's a 1, add this label to the dependent list for the corresponding controlling value
				String bit = validForBits.mid(i, 1);
				if (bit == '1') {
					objResults.get(controllingValues.get(i)).add(label);
				}
			}
		}

		return objResults;
	}

	// Convert decimal to binary representation (alas, Apex has no native method :-(
	//    eg. 4 => '100', 19 => '10011', etc.
	// Method: Divide by 2 repeatedly until 0. At each step note the remainder (0 or 1).
	// These, in reverse order, are the binary.
	public static String decimalToBinary(Integer val) {
		String bits = '';
		while (val > 0) {
			Integer remainder = Math.mod(val, 2);
			val = Integer.valueOf(Math.floor(val / 2));
			bits = String.valueOf(remainder) + bits;
		}
		return bits;
	}

	// Convert a base64 token into a binary/bits representation
	// e.g. 'gAAA' => '100000000000000000000'
	public static String base64ToBits(String validFor) {
		if (String.isEmpty(validFor)) return '';

		String validForBits = '';

		for (Integer i = 0; i < validFor.length(); i++) {
			String thisChar = validFor.mid(i, 1);
			Integer val = base64Chars.indexOf(thisChar);
			String bits = decimalToBinary(val).leftPad(6, '0');
			validForBits += bits;
		}

		return validForBits;
	}


	private static final String base64Chars = '' +
			'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
			'abcdefghijklmnopqrstuvwxyz' +
			'0123456789+/';


	private static List<PicklistEntryWrapper> wrapPicklistEntries(List<Schema.PicklistEntry> PLEs) {
		return (List<PicklistEntryWrapper>)
			JSON.deserialize(JSON.serialize(PLEs), List<PicklistEntryWrapper>.class);
	}

	public class PicklistEntryWrapper {
		@auraEnabled public String active {get; set;}
		@auraEnabled public String defaultValue {get; set;}
		@auraEnabled public String label {get; set;}
		@auraEnabled public String value {get; set;}
		@auraEnabled public String validFor {get; set;}
	}


    
}