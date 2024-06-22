const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
    destination : function(req,res,cd){
            cd(null , './public/images');
    },
    filename : function (req,file,cd){
        cd(null ,file.originalname);
    }
  })
  
const upload = multer({ storage });

const uploadImage = (req, res) => {
  // Verify JWT token
  const token = req.headers.auth;
  if (!token) return res.status(401).json({ status: 'Failure', message: 'No token provided' });

  jwt.verify(token, 'token', (err, decoded) => {
    if (err) return res.status(401).json({ status: 'Failure', message: 'Failed to authenticate token' });

    if (!req.file) {
      return res.status(400).json({ status: 'Failure', message: 'No file uploaded' });
    }

    res.status(200).json({ status: 'Success', imageName: req.file.filename });
  });
};

module.exports = {
  upload,
  uploadImage,
};
