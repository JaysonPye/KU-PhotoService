const { google } = require('googleapis');
const sheets = google.sheets('v4');
const path = require('path');
const credentialsPath = path.join(__dirname, '..', 'credentials.json');
const credentials = require(credentialsPath);

//ID of the sheet to be used
const sheetID = '14QuDBA2DdxCvtiOMN3seLttzPqiUAeXbgNsfTjD9FL0';

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


// Function to handle login logic
async function handleLogin(req, res) {
    const { code } = req.body;
  
    if (code.length <= 8) {
      const partyData = await partyLogin(code);
      if (partyData) {
        res.json(partyData);
      } else {
        res.status(401).json({ success: false, message: 'Invalid login code' });
      }
    } else {
      const seasonalData = await seasonalLogin(code);
      if (seasonalData) {
        res.json(seasonalData);
      } else {
        res.status(401).json({ success: false, message: 'Invalid login code' });
      }
    }
  }

// Updated partyLogin function
async function partyLogin(code) {
  try {
    // Fetch data from 'displayVariables' sheet
    const displayVariablesData = await fetchSheetData('displayVariables');
    const displayVariables = displayVariablesData[0].slice(1);
    console.log('got displayvariables data');
    // Get all tab names in the spreadsheet
    const tabNames = await getAllTabNames(sheetID);

    // Compare displayVariables with tab names and get matching tabs
    const matchingTabs = displayVariables.filter(tabName => tabNames.includes(tabName));

    if (matchingTabs.length > 0) {
      for (const tabName of matchingTabs) {
        // Fetch data from the current matching tab
        const tabData = await fetchSheetData(sheetID, tabName);

        // Iterate through all rows and columns to find the matching code
        for (let rowIndex = 0; rowIndex < tabData.length; rowIndex++) {
          const row = tabData[rowIndex];

          // Check if the code exists in the row
          const columnIndex = row.indexOf(code);
          if (columnIndex !== -1) {
            // Get the school name from the leftmost column (column A)
            const schoolName = tabData[rowIndex][0].trim();

            // Get the party name from the header of the current column
            const partyName = tabData[0][columnIndex].trim();

            // Print the school name and party name to the console
            console.log(`School Name: ${schoolName}, Party Name: ${partyName}`);
            return { success: true, schoolName, partyName };
          }
        }
      }
    }

    res.status(401).json({ success: false, message: 'No matching code found' });
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'An error occurred' };
  }
}

  // Function to get activity names and dates
  async function getActivityNameDates() {
    try {
      const gc = await gspread.authorize(credentials);
      const spreadsheet = await gc.open('photositeupdated');
      const seasonalNamesSheet = await spreadsheet.worksheet('seasonalNames');
      const values = await seasonalNamesSheet.getRows();
  
      const activityNamesDates = [];
      for (const row of values) {
        // Split the row into date and name
        if (row[0] && row[1]) {
          const date = row[0].trim();
          const name = row[1].trim();
          activityNamesDates.push({ date, name });
        }
      }
  
      return { success: true, activity_names_dates: activityNamesDates };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: 'An error occurred' };
    }
  }
//Get data from a specified sheet
  async function fetchSheetData(sheetName) {
    try {
      const authClient = await auth.getClient();
      const response = await sheets.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId: sheetID, // Use spreadsheetId here
        range: sheetName,
      });
  
      const values = response.data.values;
      console.log('GOOD');
      return values;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Handle the error as needed
    }
  }
//Get a list of tabs in the sheet
  async function getAllTabNames() {
    try {
      const authClient = await auth.getClient();
      const response = await sheets.spreadsheets.get({
        auth: authClient,
        spreadsheetId: sheetID,
      });
  
      const sheetsInfo = response.data.sheets;
      const tabNames = sheetsInfo.map((sheet) => sheet.properties.title);
      return tabNames;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Handle the error as needed
    }
  }
  module.exports = {handleLogin};