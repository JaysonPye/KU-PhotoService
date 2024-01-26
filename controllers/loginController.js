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


// function to handle login logic
async function handleLogin(req, res) {
    const { code } = req.body;
  
    if (code.length <= 8) {
      const partyData = await partyLogin(code);
      if (partyData.success) {
        res.json(partyData);
      } else {
        res.status(401).json({ success: false, message: partyData.message });
      }
    } else {
      const seasonalData = await seasonalLogin(code);
      if (seasonalData.success) {
        res.json(seasonalData);
      } else {
        res.status(401).json({ success: false, message: seasonalData.message });
      }
    }
}

  async function seasonalLogin(code){
try{
  const spreadsheetTabs = await getAllTabNames(sheetID);
  //check if SSData tab exists
  if(!spreadsheetTabs.includes('SSData')){
    return{success: false, message: 'SSData tab not found in the spreadsheet'};
  }
  //Get SSData values
  const ssdataValues = await fetchSheetData('SSData');
  let foundSchool = null;
  //Iterate rows in ssdata and check for login code in column one
  //If it exists get the school name from the next column
  for(const row of ssdataValues){
    if(row.includes(code)){
      
      foundSchool=row[2];
      break;
    }
  }
  if (foundSchool) {
    // Get names and dates of activities
    const activitiesData = await getActivityNameDates(foundSchool);
    const activities = activitiesData.activity_names_dates || [];
    const schoolSheetData = await fetchSheetData(foundSchool);
  
    if (schoolSheetData && schoolSheetData.length > 1) {
      const folderIdRow = schoolSheetData[3];
  
      // Iterate activities and get folder_id if available
      const filteredActivities = [];
      for (const activity of activities) {
        const dateIndex = schoolSheetData[0].indexOf(activity.date);
        if (dateIndex !== -1) {
          const folderId = folderIdRow[dateIndex];
          if (folderId) {
            activity.folder_id = folderId;
            filteredActivities.push(activity);
          }
        }
      }
  
      return { success: true, school: foundSchool, activities: filteredActivities };
    } else {
      return { success: false, message: 'School data format error or missing' };
    }
  } else {
    return { success: false, message: 'Incorrect Login Code' };
  }
} catch (error) {
  console.error('Error:', error);
  return { success: false, message: 'An error occurred' };
}
}
  async function partyLogin(code) {
  try {
    // Fetch data from 'displayVariables' sheet
    const displayVariablesData = await fetchSheetData('displayVariables');
    const displayVariables = [];
    for (const row of displayVariablesData) {
      if (row.length > 0 && typeof row[0] === 'string') {
        const tabName = row[0].trim();
        if (tabName.length > 0) {
          displayVariables.push(tabName);
        }
      }
    }
    const tabNames = await getAllTabNames(sheetID);
    // Compare displayVariables with tab names and get matching tabs
    const matchingTabs = displayVariables.filter(tabName => tabNames.includes(tabName));
    if (matchingTabs.length === 0) {
      return { success: false, message: 'No matching code found' };
    }
    for (const tabName of matchingTabs) {
      // Fetch data from the current matching tab
      const tabData = await fetchSheetData(tabName);
      for (let rowIndex = 0; rowIndex < tabData.length; rowIndex++) {
        const row = tabData[rowIndex];
        const columnIndex = row.indexOf(code);
        if (columnIndex !== -1) {
          const schoolName = tabData[rowIndex][0].trim();
          const partyName = tabData[0][columnIndex].trim();

          const schoolSheetData = await fetchSheetData(schoolName);

          if (schoolSheetData && schoolSheetData[0]) {
            const headers = schoolSheetData[0];
            const headerIndex = headers.indexOf(partyName);

            if (headerIndex !== -1) {
              const folder_id = schoolSheetData[1][headerIndex];

              if (folder_id) {
                return {
                  success: true,
                  folder_id,
                  school: schoolName,
                };
              }
            }
          }
          return { success: false, message: "No matching code found"};
        }
      }
    }

    return { success: false, message: 'No matching code found' };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, message: 'An error occurred' };
  }
}

async function getActivityNameDates(foundSchool) {
  try {
    // Fetch data from schools sheet
    const seasonalNamesData = await fetchSheetData(foundSchool);
    const activityNamesDates = [];

    // Assuming each column represents an event
    for (let columnIndex = 0; columnIndex < seasonalNamesData[0].length; columnIndex++) {
      const column = seasonalNamesData.map(row => row[columnIndex]);
      
      // Check if the column has at least 4 non-empty values (parties will have two)
      if (column.length >= 4 && column[1] && column[2] && column[3]) {
        const date = column[1].trim();
        const name = column[2].trim();
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
        spreadsheetId: sheetID,
        range: sheetName,
      });
  
      const values = response.data.values;
      return values;
    } catch (error) {
      console.error('Error:', error);
      throw error;
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
      throw error;
    }
  }
  module.exports = {handleLogin};