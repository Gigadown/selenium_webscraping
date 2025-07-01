//Import the Builder class from selenium-webdriver
const{Builder, error} = require('selenium-webdriver');

//Function to open Google in Chrome
async function openGoogleInChrome(){
    //Create a new Chrome browser instance
    let driver = await new Builder().forBrowser('chrome').build();

    //Navigate to Google's homepage
    await driver.get('https://www.google.com');

    //Make the browser window full screen
    await driver.manage().window().maximize();

    //wait for 3 seconds
    await driver.sleep(3000);

    //Find the click button using Button Id
    try{
        const agreeButton = await driver.findElement({ CSS: 'cvSVBe'});
        await agreeButton.click();
        console.log('Successfully clicked the "I agree" button');
    }catch(error){
        console.error('Failed to find or click the "I agree" button:', error.message);
    }
    
    //Find the click Button using XPath
    const Button = await driver.findElement({xpath: '//*[@id="stUuGf"]/div/div[2]/div/div/div/div[2]/div/promo-button-text[2]'});
    await Button.click();

    await driver.sleep(2000);


    //close the driver
   // await driver.quit();
}

openGoogleInChrome();
