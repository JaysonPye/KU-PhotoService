const { google } = require('googleapis');
const credentials = require('./credentials.json');

// Function to fetch pictures in a folder
async function fetchPicturesInFolder(folderId) {
  try {
    const drive = google.drive({
      version: 'v3',
      auth: credentials,
    });

    const results = await drive.files.list({
      q: `'${folderId}' in parents`,
    });

    const files = results.data.files;
    const pictureData = [];

    for (const file of files) {
      const fileInfo = {
        name: file.name,
        id: file.id,
        mimeType: file.mimeType,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}`,
        imageUrl: `https://drive.google.com/uc?id=${file.id}`,
      };
      pictureData.push(fileInfo);
    }

    return pictureData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Route handler for /seasonal-pictures
async function getSeasonalPictures(req, res) {
  try {
    const data = req.body;
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

// Route handler for /pictures
async function getPictures(req, res) {
  try {
    const folderId = req.query.folder_id;

    const drive = google.drive({
      version: 'v3',
      auth: credentials,
    });

    const results = await drive.files.list({
      q: `'${folderId}' in parents`,
    });

    const files = results.data.files;
    const fileList = [];

    for (const file of files) {
      const fileInfo = {
        name: file.name,
        id: file.id,
        mimeType: file.mimeType,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.id}`,
        imageUrl: `https://drive.google.com/uc?id=${file.id}`,
      };
      fileList.push(fileInfo);
    }

    res.json({ files: fileList });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
}

module.exports = { getSeasonalPictures, getPictures };
