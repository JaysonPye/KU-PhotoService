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
      }));
  } catch (error) {
      console.error('Error:', error);
      throw error; // re-throw the error to handle it in the calling function
  }
}


// fetch pictures in a folder
async function getPictures(req, res){
  console.log("called");
  const folderId = req.query.folder_id;
  try{
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='image/jpeg'`,
      fields: 'files(id, name, mimeType)'
  });
  const files = response.data.files;
  if (!files || files.length === 0) {
    return res.status(404).json({ success: false, message: 'No pictures found' });
}
        // create a list of file information
        const fileList = files.map(file => {
          return {
              name: file.name,
              id: file.id,
              mimeType: file.mimeType,
              thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}`,
              imageUrl: `https://drive.google.com/uc?id=${file.id}`
          };
      });

      // return a JSON response with the list of files
      res.json({ files: fileList });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'An error occurred' });
  }
}
// seasonal-pictures handler
async function getSeasonalPictures(req, res) {
  try {
    const data = req.body;
    const activities = data.activities || [];
    
    // Create an array to store successful activities
    const successfulActivities = [];

    // uses a list of JS promises to gather picture information
    const fetchPromises = activities.map(async (activity) => {
      const folderId = activity.folder_id;
      if (folderId) {
        try {
          const files = await fetchPicturesInFolder(folderId);
          activity.files = files;
          console.log(folderId);
          // If the promise succeeded, add the activity to the successfulActivities array
          successfulActivities.push(activity);
        } catch (error) {
          // Log the error, but don't re-throw it
          console.error('Error fetching pictures for folder:', error);
        }
      }
    });

    // wait for promises
    await Promise.all(fetchPromises);
    console.log("done");

    // Check if no successful activities were found
    if (successfulActivities.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid activities found' });
    }

    // Return only the successful activities
    res.status(200).json(successfulActivities);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}



module.exports = { getSeasonalPictures, getPictures };
