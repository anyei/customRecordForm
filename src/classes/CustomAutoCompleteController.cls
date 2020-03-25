/*
 * Created By: Angel Robles
 * Created Date: 01-22-2019
 * asana Task Link : https://app.asana.com/0/856298601928122/997089124564719/f
 * Test Class: TestCustomAutoCompleteController
 * */
public without sharing class CustomAutoCompleteController  {

     @AuraEnabled
    public static list<sobject> filter(string q) {
       return database.query(q);
    }
}