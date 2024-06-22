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
router.post('/Admin/AddAdmin',upload.single('profileImage'),newAdmin);

// Login Admin
router.post('/Admin/Login',loginAdmin);

// ADD Car
router.post('/Admin/AddCar',upload.array('images',10),addnewCar);

// Verify Admin
router.get('/Admin/getDataAdmin',getDataAdmin);

// Count Total car and Users
router.get('/Admin/countCars',countCars);
router.get('/Admin/countUsers',countUsers);

// Update Car Data
router.patch('/Admin/modifyCarData/:id',upload.array('images',10),modifyCarData);

// Delete Car Data
router.delete('/Admin/DeleteCar/:id',DeleteCar);

// Fetch Car Data
router.get('/Admin/AllCars',fetchAllCarsAdmin);

router.post('/Admin/UploadImage', upload.single('image'), uploadImage);

// Get All User Data
router.get('/Admin/GetAllUsers',getAllUsers);

// GET ALL INQUIRY
router.get('/Admin/getAllInquiry',getAllInquiry);

// Count Inquiry
router.get('/Admin/countInquiry',countInquiry);
module.exports = router;
