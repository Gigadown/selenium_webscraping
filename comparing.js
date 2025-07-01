// const fs = require('fs');
// const csv = require('csv-parser');
// const { Builder, By } = require('selenium-webdriver');

// let savedData = [];

// // Read data from CSV file
// fs.createReadStream('books.csv')
//     .pipe(csv())
//     .on('data', (row) => {
//         savedData.push(row);
//     })
//     .on('end', () => {
//         console.log('CSV file successfully processed');
//         // Proceed with the testing after reading the CSV
//         runPriceVerificationTest();
//     });

// async function runPriceVerificationTest() {
//     let driver = await new Builder().forBrowser('chrome').build();

//     try {
//         let currentData = [];

//         //
//         for (let page = 1; page <= 2; page++) {
//             if (page === 1) {
//                 await driver.get('https://books.toscrape.com/');
//             } else {
//                 await driver.get(`https://books.toscrape.com/catalogue/page-${page}.html`);
//             }
//             //Wait for the page to load
//             await driver.sleep(2000);

//             //Find all the book elements
//             let books = await driver.findElements(By.css('article.product_pod'));

//             //Extract title and price for each book
//             for (let book of books) {
//                 let titleElement = await book.findElement(By.css('h3 > a'));
//                 let title = await titleElement.getAttribute('title');

//                 let priceElement = await book.findElement(By.css('p.price_color'));
//                 let price = await priceElement.getText();

//                 currentData.push({ Title: title, Price: price });
//             }
//         }

//         // Compare current data with saved data
//         let discrepancies = [];

//         for (let i = 0; i < savedData.length; i++) {
//             let savedBook = savedData[i];
//             let currentBook = currentData.find((book) => book.Title === savedBook.Title);

//             if (currentBook) {
//                 if (currentBook.Price !== savedBook.Price) {
//                     discrepancies.push({
//                         Title: savedBook.Title,
//                         SavedPrice: savedBook.Price,
//                         CurrentPrice: currentBook.Price,
//                     });
//                     console.log(
//                         `Price discrepancy found for "${savedBook.Title}": Saved Price = ${savedBook.Price}, Current Price = ${currentBook.Price}`
//                     );
//                 } else {
//                     console.log(`Price verified for "${savedBook.Title}": ${savedBook.Price}`);
//                 }
//             } else {
//                 console.log(`Book not found on the website: "${savedBook.Title}"`);
//             }
//         }

//         // Optionally, Write discrepancies to CSV
//         if (discrepancies.length > 0) {
//             let discrepancyContent = 'Title,SavedPrice,CurrentPrice\n';
//             for (let item of discrepancies) {
//                 discrepancyContent += `"${item.Title}","${item.SavedPrice}","${item.CurrentPrice}"\n`;
//             }
//             fs.writeFileSync('price_discrepancies.csv', discrepancyContent);
//             console.log('Discrepancies saved to price_discrepancies.csv');
//         } else {
//             console.log('No price discrepancies found.');
//         }

//     } catch (error) {
//         console.error('Error during test:', error);
//     } finally {
//         await driver.quit();
//     }
// }





const fs = require('fs');
const csv = require('csv-parser');
const { Builder, By } = require('selenium-webdriver');

// Utility: Normalize strings for comparison
const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();

let savedData = [];

// Read CSV and store saved book data
fs.createReadStream('books.csv')
  .pipe(csv())
  .on('data', (row) => {
    savedData.push({
      Title: row.Title,
      NormalizedTitle: normalize(row.Title),
      Price: row.Price.replace(/[^\d.]/g, '') // Remove currency symbol
    });
  })
  .on('end', () => {
    console.log('✅ CSV file successfully processed');
    runPriceVerificationTest();
  });

async function runPriceVerificationTest() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    let currentData = [];

    // Loop through pages
    for (let page = 1; page <= 2; page++) {
      const url =
        page === 1
          ? 'https://books.toscrape.com/'
          : `https://books.toscrape.com/catalogue/page-${page}.html`;

      await driver.get(url);
      await driver.sleep(2000);

      const books = await driver.findElements(By.css('article.product_pod'));

      for (let book of books) {
        let titleElement = await book.findElement(By.css('h3 > a'));
        let title = await titleElement.getAttribute('title');
        let priceElement = await book.findElement(By.css('p.price_color'));
        let price = await priceElement.getText();

        currentData.push({
          Title: title,
          NormalizedTitle: normalize(title),
          Price: price.replace(/[^\d.]/g, '')
        });
      }
    }

    // Compare saved and current data
    let discrepancies = [];

    for (let savedBook of savedData) {
      let currentBook = currentData.find(
        (book) => book.NormalizedTitle === savedBook.NormalizedTitle
      );

      if (currentBook) {
        if (currentBook.Price !== savedBook.Price) {
          discrepancies.push({
            Title: savedBook.Title,
            SavedPrice: savedBook.Price,
            CurrentPrice: currentBook.Price
          });
          console.log(
            `⚠️ Price mismatch for "${savedBook.Title}": Saved = £${savedBook.Price}, Current = £${currentBook.Price}`
          );
        } else {
          console.log(`✅ Price verified for "${savedBook.Title}": £${savedBook.Price}`);
        }
      } else {
        console.log(`❌ Book not found online: "${savedBook.Title}"`);
      }
    }

    // Write discrepancies to CSV
    if (discrepancies.length > 0) {
      let csvOutput = 'Title,SavedPrice,CurrentPrice\n';
      discrepancies.forEach((item) => {
        csvOutput += `"${item.Title}","${item.SavedPrice}","${item.CurrentPrice}"\n`;
      });
      fs.writeFileSync('price_discrepancies.csv', csvOutput);
      console.log('📁 Discrepancies saved to price_discrepancies.csv');
    } else {
      console.log('✅ No price discrepancies found.');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await driver.quit();
  }
}

