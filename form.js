//Import the Builder class from selenium-webdriver
const {Builder} = require('selenium-webdriver');

//Function to open Google in Chrome
async function openGoogleInChrome(){
    //create a new Chrome browser instance
    let driver = await new Builder().forBrowser('chrome').build();

    //Navigate to Google's homepage
    await driver.get('https://the-internet.herokuapp.com/login');

    //Make the browser window full screen
    await driver.manage().window().maximize();

    //wait for 3 seconds
    await driver.sleep(3000);
    
    //Find the username input field using XPath and enter 'tomsmith'
    const usernameField = await driver.findElement({ xpath: '//*[@id="username"]'});
    await usernameField.sendKeys('tomsmith');


     //Find the username input field using XPath and enter 'SuperSecretPassword!'
    const passwordField = await driver.findElement({ xpath: '//*[@id="password"]'});
    await passwordField.sendKeys('SuperSecretPassword!');


    //Find the login button using XPath and click it
    const loginButton = await driver.findElement({ xpath: '//*[@id="login"]/button'});
    await loginButton.click();


    //Check if login is successful
    try{
        const succcessMessage = await driver.findElement({ css: '.flash.success'});
        console.log('Successfully Logged in');
        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('login_success.png', image, 'base64');
            }
        );
    }catch(error){
        console.error('Login Failed');
        await driver.takeScreenshot().then(
        function(image) {
                require('fs').writeFileSync('login_failure.png', image, 'base64');
            }
        );
    }


    //Find the logout button using XPath and click it
    // const logoutButton = await driver.findElement({ xpath: '//*[@id="content"]/div/a'});
    // await logoutButton.click();

    //wait for a moment after clicking to slow the page to respond
    await driver.sleep(3000);

    //close the driver
    await driver.quit();

}
openGoogleInChrome();
