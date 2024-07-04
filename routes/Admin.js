var express = require('express');
const { newAdmin, loginAdmin, addnewCar, modifyCarData, DeleteCar, fetchAllCarsAdmin, getDataAdmin, countCars, countUsers, getAllUsers, getAllInquiry, countInquiry } = require('../controller/Admin');
var router = express.Router();

var multer = require('multer');
const { fetchAllApprovedCarsByUsers } = require('../controller/User');
const { uploadImage } = require('../controller/uploadController');

const storage = multer.diskStorage({
  destination : function(req,res,cd){
          cd(null , './public/images');
  },
  filename : function (req,file,cd){
      cd(null ,file.originalname);
  }
})

const upload = multer({storage : storage});

// Add Admin
router.post('/AddAdmin',upload.single('profileImage'),newAdmin);

// Login Admin
router.post('/Login',loginAdmin);

// ADD Car
router.post('/AddCar',upload.array('images',10),addnewCar);

// Verify Admin
router.get('/getDataAdmin',getDataAdmin);

// Count Total car and Users
router.get('/countCars',countCars);
router.get('/countUsers',countUsers);

// Update Car Data
router.patch('/modifyCarData/:id',upload.array('images',10),modifyCarData);

// Delete Car Data
router.delete('/DeleteCar/:id',DeleteCar);

// Fetch Car Data
router.get('/AllCars',fetchAllCarsAdmin);

router.post('/UploadImage', upload.single('image'), uploadImage);

// Get All User Data
router.get('/GetAllUsers',getAllUsers);

// GET ALL INQUIRY
router.get('/getAllInquiry',getAllInquiry);

// Count Inquiry
router.get('/countInquiry',countInquiry);
module.exports = router;
