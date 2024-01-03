const { google } = require('googleapis');
const path = require('path');
const credentialsPath = path.join(__dirname, '..', 'credentials.json');
const credentials = require(credentialsPath);
const auth = new google.auth.GoogleAuth({credentials, scopes: ['https://www.googleapis.com/auth/drive']
});
const drive = google.drive({ version: 'v3', auth });




async function fetchPicturesInFolder(folderId) {
  try {
      const response = await drive.files.list({
          q: `'${folderId}' in parents and mimeType='image/jpeg'`,
          fields: 'files(id, name, mimeType)'
      });

      const files = response.data.files;
      if (!files || files.length === 0) {
          return [];
      }

      return files.map(file => ({
          name: file.name,
          id: file.id,
          mimeType: file.mimeType,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}`,
          imageUrl: `https://drive.google.com/uc?id=${file.id}`
      }));
  } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw the error to handle it in the calling function
  }
}


// Function to fetch pictures in a folder
async function getPictures(req, res){
  console.log("called");
  const folderId = req.query.folder_id;
  try{
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='image/jpeg'`,
      fields: 'files(id, name, mimeType)'
  });
  console.log("called await drivefileslist");
  const files = response.data.files;
  console.log("response data files set");
  if (!files || files.length === 0) {
    return res.status(404).json({ success: false, message: 'No pictures found' });
}
        // Create a list of file information
        const fileList = files.map(file => {
          return {
              name: file.name,
              id: file.id,
              mimeType: file.mimeType,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}`,
              imageUrl: `https://drive.google.com/uc?id=${file.id}`
          };
      });

      // Return a JSON response with the list of files
      res.json({ files: fileList });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'An error occurred' });
  }
}


// Route handler for /seasonal-pictures
async function getSeasonalPictures(req, res) {
  try {
    const data = req.body;
    console.log("called getseasonalpictures");
    const activities = data.activities || [];
    const updatedActivities = [];

    for (const activity of activities) {
      const folderId = activity.folder_id;
      if (folderId) {
        const files = await fetchPicturesInFolder(folderId);
        activity.files = files;
        updatedActivities.push(activity);
      }
    }

    res.status(200).json(updatedActivities);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}



module.exports = { getSeasonalPictures, getPictures };
