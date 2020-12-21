const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // it get 'm..-s..-c'.Cloundinary

cloudinary.config({
    cloud_name: "austin-secondhand",
    api_key: "515623826453572",
    api_secret: "FBErRSQbPjY-TXcpi4lQGbMhuhY"
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Austin-Secondhand',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}