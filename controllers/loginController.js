const { google } = require('googleapis');
const sheets = google.sheets('v4');
const credentials = require('./credentials.json');
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
  // Function to fetch data from a specific sheet
async function fetchSheetData(spreadsheetId, sheetName) {
  try {
    const auth = await google.auth.getClient();
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: sheetName,
    });

    const values = response.data.values;
    return values;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Handle the error as needed
  }
}

// Updated partyLogin function
async function partyLogin(req, res) {
  const { code } = req.body;

  try {
    // Fetch data from 'displayVariables' sheet
    const displayVariablesData = await fetchSheetData('your-spreadsheet-id', 'displayVariables');
    const displayVariables = displayVariablesData[0].slice(1);

    const matchingTabs = [];
    for (const tabName of displayVariables) {
      if (spreadsheet.sheetsByTitle[tabName]) {
        matchingTabs.push(tabName);
      }
    }

    let foundSchool = null;
    let foundParty = null;

    for (const tabName of matchingTabs) {
      // Fetch data from the current sheet
      const sheetData = await fetchSheetData('your-spreadsheet-id', tabName);
      const values = sheetData.map(row => Object.values(row));

      for (const [rowIndex, row] of values.entries()) {
        if (row.includes(code)) {
          const cellIndex = row.indexOf(code);
          foundSchool = values[rowIndex][0].trim();
          foundParty = values[0][cellIndex].trim();
          break;
        }
      }

      if (foundSchool) break;
    }

    if (foundSchool) {
      // Fetch data from the school's sheet
      const schoolSheetData = await fetchSheetData('your-spreadsheet-id', foundSchool);
      const values = schoolSheetData.map(row => Object.values(row));
      const partyHeaderIndex = values[0].indexOf(foundParty);

      if (partyHeaderIndex !== -1) {
        const folderId = values[1][partyHeaderIndex].trim();
        res.json({ success: true, folder_id: folderId, school: foundSchool });
      } else {
        res.status(401).json({ success: false, message: 'Party not found in school' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid login code' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}
// Function to handle seasonal login
async function seasonalLogin(loginCode) {
    try {
      const gc = await gspread.authorize(credentials);
      const spreadsheet = await gc.open('photositeupdated');
  
      // Check if "SSData" tab exists in the spreadsheet
      const sheets = await spreadsheet.getSheets();
      const ssDataSheet = sheets.find((sheet) => sheet.title === 'SSData');
      if (!ssDataSheet) {
        return { success: false, message: 'SSData tab not found in the spreadsheet' };
      }
  
      // Read data from "SSData" tab
      const values = await ssDataSheet.getRows();
  
      // Iterate through all rows in the "SSData" tab
      let foundSchool = null;
      for (const row of values) {
        // Check if the login code is in the first column
        if (row[0] === loginCode) {
          // Get the school name from the second column
          foundSchool = row[2];
          break;
        }
      }
  
      // Check if a school name was found
      if (foundSchool) {
        const activitiesData = await getActivityNameDates();
        const activities = activitiesData.activity_names_dates;
        console.log('Activities list gotten');
  
        const schoolSheet = await spreadsheet.open(foundSchool);
        const schoolSheetValues = await schoolSheet.getRows();
        const folderIdRow = schoolSheetValues[1];
  
        // Iterate through activities and retrieve folder_id if available
        const filteredActivities = [];
        for (const activity of activities) {
          const date = activity.date;
          const activityName = activity.name;
  
          // Find the index of the date in the first row
          const dateIndex = schoolSheetValues[0].indexOf(date);
          if (dateIndex !== -1) {
            const folderId = folderIdRow[dateIndex];
            if (folderId) {
              activity.folder_id = folderId;
              filteredActivities.push(activity);
              console.log(`Date: ${date}, Name: ${activityName}, Folder ID: ${activity.folder_id}`);
            }
          }
        }
  
        return { success: true, school: foundSchool, activities: filteredActivities };
      } else {
        return { success: false, message: 'Incorrect Login Code' };
      }
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
  