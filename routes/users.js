var express = require('express');
const { RegisterUser, verifyOTP, LoginUser, AddCarByUsers, modifyCarDataByUser, DeleteCarByUser, fetchAllApprovedCarsByUsers, fetchCarById, fetchAllCarsByUser, getData, addInquiry } = require('../controller/User');
var router = express.Router();

var multer = require('multer');
const { modifyCarData } = require('../controller/Admin');
const { createTestDrive } = require('../controller/TestDrive');
const storage = multer.diskStorage({
  destination : function(req,res,cd){
          cd(null , './public/images');
  },
  filename : function (req,file,cd){
      cd(null ,file.originalname);
  }
})

const upload = multer({storage : storage});

// Signup User
router.post('/Signup',upload.single('profileImage'),RegisterUser);

// Verify OTP
router.post('/VerifyOTP',verifyOTP);

// Login User
router.post('/Login',LoginUser);

router.get('/getData',getData);

// User Add Car
router.post('/AddCar',upload.array('images',10),AddCarByUsers);

// Update Car Information Of Own Listing
router.patch('/modifyCarData/:id',modifyCarDataByUser);

// Delete Car Information Of Own Listing Cars
router.delete('/DeleteCarByUser/:id',DeleteCarByUser); 

// Show All Cars 
router.get('/AllCars',fetchAllApprovedCarsByUsers);

// Show Onle Car By Params Id
router.get('/Cars/:id',fetchCarById);

// User Show Own Listing Car List
router.get('/MyAllCar',fetchAllCarsByUser);

// Inquiry Form
router.post('/Inquiry',addInquiry);

// Test Drive
router.post('/TestDrive',createTestDrive);


// Change Pwd
exports.ChangePwdUser = async (req, res) => {
  try {
    const token = req.headers.auth;
    const { currentPassword, newPassword } = req.body;

    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token'); 
    const user = await User.findById(decoded);

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Current password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: 'Success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = router;
