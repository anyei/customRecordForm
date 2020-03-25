/*
 * Created By: Angel Robles
 * Created Date: 01-24-2019
 * asana Task Link : https://app.asana.com/0/856298601928122/997089124564719/f
 * Test Class: TestModalWizardController
 * */
@IsTest
public class TestCustomAutoCompleteController {

    @IsTest static void filter(){
        List<User> users = new List<User>();
        test.starttest();
        users = (List<User>) CustomAutoCompleteController.filter('select id from user limit 1');
        test.stoptest();
        system.assert(users.size()  > 0);
    }
}