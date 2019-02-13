/*
* Created By : Angel Robles
* Created Date: 02-02-2019
* Test Class : CustomRecordFormController
*/ 
@IsTest
public class TestCustomRecordFormController {
    @testsetup
    static void setup(){
        
    }
    
    @istest
    static void describeIt(){
        
        map<string, CustomRecordFormController.ObjectDescribeResult > result = new map<string, CustomRecordFormController.ObjectDescribeResult >();
        test.startTest();
        result = CustomRecordFormController.describeIt(new map<string, list<object>>{ 'Opportunity'=> new list<object>{'Type','Id','Stage','Reason_Lost__c', 'OwnerId'} });
        test.stoptest();
        system.assert(result.size() > 0);
    }
    @istest
    static void save(){
        List<Account> toUpsert = new List<Account> {
            new Account(Name='a'),
                new Account(Name='a')  
                };
                    test.startTest();
        string result= CustomRecordFormController.save(toUpsert, false);
        test.stopTest();
        system.assert(result == 'ok');
    }
    
    @istest
    static void saveAndQuery(){
         Map<string,object> result = new map<string, object>();
        List<Account> toUpsertFOrQUery = new List<Account> {
            new Account(Name='a')  
                };
                    upsert toUpsertFOrQUery;
        
        List<Account> toUpsert = new List<Account> {
            new Account(Name='a'),
                new Account(Name='a')  
                };
        test.startTest();
       result= CustomRecordFormController.saveAndQuery(toUpsert, false, new map<string,string> { 'Account' => 'select id from account limit 1'});
        test.stopTest();
        system.assert(result.get('save') == 'ok' &&  ((map<string, list<sobject>>)result.get('query')).size() > 0);
    }    
    @istest
    static void queryMap(){
        List<Account> toUpsert = new List<Account> {
            new Account(Name='a')  
                };
                    upsert toUpsert;
        test.startTest();
        map<string, list<sobject> > result= CustomRecordFormController.queryMap(new map<string,string> { 'Account' => 'select id from account limit 1'});
        test.stopTest();
        system.assert(result.size() > 0);
    }
    
    @istest
    static void saveFail(){
        List<Account> toUpsert = new List<Account> {
            new Account(Name='aa;sdlfkja;lskdjf;laksjdf;lkajsd;klfja;slkdjf;klasjdf;lkajsdf;klajsd;lfkaj;sldfja;lskdfj;alksdjf;lkasdjf;lkajsd;flkajs;dlkfja;lskdfja;lksdfj;alksjdf;lakjsdf;lakjsdf;lkajsdf;lkajsd;lkfajs;lkdfja;slkdfj',
                        BillingCountry='alksdjf;laksjdf;laksjd;flkajsdl;kfajsdkf') ,
                new Account(Name='a')  
                };
                    test.startTest();
        string result= CustomRecordFormController.save(toUpsert, false);
        test.stopTest();
        system.assert(result != 'ok');
    }
     @istest
    static void saveAndQueryFail1(){
         Map<string,object> result = new map<string, object>();
        List<Account> toUpsertFOrQUery = new List<Account> {
            new Account(Name='a')  
                };
                    upsert toUpsertFOrQUery;
        
        List<Account> toUpsert = new List<Account> {
            new Account(Name='aa;sdlfkja;lskdjf;laksjdf;lkajsd;klfja;slkdjf;klasjdf;lkajsdf;klajsd;lfkaj;sldfja;lskdfj;alksdjf;lkasdjf;lkajsd;flkajs;dlkfja;lskdfja;lksdfj;alksjdf;lakjsdf;lakjsdf;lkajsdf;lkajsd;lkfajs;lkdfja;slkdfj',
                        BillingCountry='alksdjf;laksjdf;laksjd;flkajsdl;kfajsdkf'),
                new Account(Name='a')  
                };
        test.startTest();
       result= CustomRecordFormController.saveAndQuery(toUpsert, false, new map<string,string> { 'Account' => 'select id from account limit 1'});
        test.stopTest();
        system.assert(result.get('save') != 'ok' &&  ((map<string, list<sobject>>)result.get('query')).size() == 0);
    } 
    
     @istest
    static void saveAndQueryFail2(){
         Map<string,object> result = new map<string, object>();
        List<Account> toUpsertFOrQUery = new List<Account> {
            new Account(Name='a')  
                };
                    upsert toUpsertFOrQUery;
        
        List<Account> toUpsert = new List<Account> {
            new Account(Name='dd'),
                new Account(Name='a')  
                };
        test.startTest();
       result= CustomRecordFormController.saveAndQuery(toUpsert, false, new map<string,string> { 'Account' => 'select id,xxaazz from account limit 1'});
        test.stopTest();
        system.assert(result.get('save') == 'ok' &&  ((map<string, list<sobject>>)result.get('query')).size() == 0);
    } 
}