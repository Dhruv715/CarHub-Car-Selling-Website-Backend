const User = require('../model/User');
const CarData = require('../model/CarData');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Inquiry = require('../model/Inquiry');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "codewithdhruv715@gmail.com",
      pass: "rnbi ceco btbm txwh"
    }
  });
  
  // Function to generate a random OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // Signup User
  exports.RegisterUser = async (req, res) => {
    console.log(req.body);
    try {
      const {username, email, password, mobileNumber } = req.body;
      const CheckEmail = await User.findOne({ email });
      if (CheckEmail) {
        throw new Error('Email Already Exists');
      } else {
        if (req.file) {
          req.body.profileImage = req.file.originalname;
        }
        req.body.password = await bcrypt.hash(password, 12);
  
        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP expiry set to 15 minutes
  
        // Send OTP email
        const mailOptions = {
          from: 'codewithdhruv715@gmail.com',
          to: email,
          subject: 'CarHub: Your OTP Code for Registration',
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #000000; color: #ffffff;">
             
                <h1 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">CarHub</h1>
                <h2 style="background-color: #4CAF50; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">Your OTP</h2>
                <p style="font-size: 16px; color: #cccccc;">
                  Dear User,
                  <br/><br/>
                  Thank you for registering with CarHub. To complete your registration, please use the following One Time Password (OTP):
                </p>
                <div style="text-align: center; margin: 20px 0;">
                  <strong style="font-size: 24px; color: #4CAF50;">${otp}</strong>
                </div>
                <p style="font-size: 16px; color: #cccccc;">
                  This OTP is valid for 15 minutes. For security reasons, please do not share this OTP with anyone.
                  <br/><br/>
                  Welcome aboard!
                  <br/><br/>
                  Regards,
                  <br/>
                  The CarHub Team
                </p>
              </div>
          `
      };
      
  
        await transporter.sendMail(mailOptions);
  
        // Create user with OTP details
        const user = new User({
          username,
          email,
          password: req.body.password,
          mobileNumber,
          profileImage: req.body.profileImage,
          emailOTP: {
            code: otp,
            expiry: otpExpiry
          }
        });
  
        await user.save();
        res.status(200).json({
          status: 'Success',
          message: 'New User Registered Successfully. OTP has been sent to your email.',
          data: user
        });
      } 
    } catch (error) {
      res.status(401).json({
        status: 'Failed',
        message: error.message
      });
    }
  };
  
// Verify OTP
exports.verifyOTP =  async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      if (user.emailOTP.code !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      if (user.emailOTP.expiry < Date.now()) {
        return res.status(400).json({ message: 'OTP has expired' });
      }
  
      user.emailOTP.verified = true;
      user.emailOTP.code = null; // Clear OTP after verification
      user.emailOTP.expiry = null;
  
      await user.save();
  
      res.status(200).json({
        status: 'Success',
        message: 'OTP verified successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'Failed',
        message: 'Error occurred',
        error: error.message
      });
    }
};
  


// Login User
exports.LoginUser = async (req,res) =>{
    try {
        const { email, password }  = req.body;
        const UserData = await User.findOne({ email });
        console.log(UserData);
        if(!UserData){
            return res.status(400).json({ msg: 'Email Does Not Exist' });
        }

        const isMatch = await bcrypt.compare(password, UserData.password);
        if (!isMatch) {
          return res.status(400).json({ msg: 'Invalid Password' });
        }
        var token = await jwt.sign(UserData.id,'token');
        res.status(201).json({
            status : 'Success',
            message : 'User Login Successfully',
            token,
            
        }); 
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: 'Error Occurred',
            error: error.message
        });
    }
}

// Verify Token

exports.getData = async (req,res)=>{
    const token = req.headers.auth;
        if (!token) {
            return res.status(401).json({
                status: 'Failed',
                message: 'Authorization token not provided',
            });
        }

    const decoded = jwt.verify(token, 'token'); 
    console.log(decoded)
    const userId = decoded; 
    var Data = await User.findById(userId)
    res.status(200).json({
        status : 'Success',
        message : 'Fetch Data Successfully',
        Data
    })
}

// Add Car By Users
exports.AddCarByUsers = async (req, res) => {
  try {
      const token = req.headers.auth;
      if (!token) {
          return res.status(401).json({
              status: 'Failed',
              message: 'Authorization token not provided',
          });
      }

      const decoded = jwt.verify(token, 'token');
      const userId = decoded;

      // Find the user based on the decoded ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              status: 'Failed',
              message: 'User not found',
          });
      }

      // Set addedByUser field with user's ID
      req.body.addedByUser = userId;

      // Add image names to the request body
      if (req.files) {
          req.body.images = req.files.map(file => file.originalname);
      }

      // Create a new car with the updated request body
      const newCar = await CarData.create(req.body);

      res.status(200).json({
          status: 'Success',
          message: 'New Car Added Successfully',
          data: newCar
      });
  } catch (error) {
      res.status(500).json({
          status: 'Failed',
          message: 'Error Occurred',
          error: error.message
      });
  }
};

// Update User Data
exports.modifyCarDataByUser = async (req, res) => {
  try {
      const token = req.headers.auth;
      if (!token) {
          return res.status(401).json({
              status: 'Failed',
              message: 'Authorization token not provided',
          });
      }

      const decoded = jwt.verify(token, 'token');
      const userId = decoded;

      // Find the user based on the decoded ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              status: 'Failed',
              message: 'User not found',
          });
      }

      const id = req.params.id;
      let car = await CarData.findById(id);

      if (!car) {
          return res.status(404).json({
              status: 'Failed',
              message: 'Car Data not found'
          });
      }

      // Check if the car was added by the user
      if (car.addedByUser.toString() !== userId) {
          return res.status(403).json({
              status: 'Failed',
              message: 'You do not have permission to update this car'
          });
      }

      if (req.files) {
          req.body.images = req.files.map(file => file.originalname);
      }

      const updatedCar = await CarData.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json({
          status: 'Success',
          message: 'Car Data Updated Successfully',
          data: updatedCar
      });
  } catch (error) {
      res.status(500).json({
          status: 'Failed',
          message: 'Error Occurred',
          error: error.message
      });
  }
};


// Delete User Own Car
exports.DeleteCarByUser = async (req, res) => {
  try {
      const token = req.headers.auth;
      if (!token) {
          return res.status(401).json({
              status: 'Failed',
              message: 'Authorization token not provided',
          });
      }

      const decoded = jwt.verify(token, 'token');
      const userId = decoded;

      // Find the user based on the decoded ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              status: 'Failed',
              message: 'User not found',
          });
      }

      const id = req.params.id;
      let car = await CarData.findById(id);

      if (!car) {
          return res.status(404).json({
              status: 'Failed',
              message: 'Car Data not found'
          });
      }

      // Check if the car was added by the user
      if (car.addedByUser.toString() !== userId) {
          return res.status(403).json({
              status: 'Failed',
              message: 'You do not have permission to delete this car'
          });
      }

      await CarData.deleteOne({ _id: id });
      res.status(200).json({
          status: 'Success',
          message: 'Car Data Deleted Successfully'
      });
  } catch (error) {
      res.status(500).json({
          status: 'Failed',
          message: 'Error Occurred',
          error: error.message
      });
  }
};

// Fetch All Car Data
// Fetch All Approved Car Data
exports.fetchAllApprovedCarsByUsers = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // const decoded = jwt.verify(token, 'token');
    // const userId = decoded;

    // // Find the user based on the decoded ID
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'User not found',
    //   });
    // }

    const cars = await CarData.find({ status: 'approved' });
    res.status(200).json({
      status: 'Success',
      message: 'Fetch Approved Car Data Successfully',
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Error Occurred',
      error: error.message
    });
  }
};

// Show Specific Car Details By Car IDs
exports.fetchCarById = async (req, res) => {
  try {
    // const token = req.headers.auth;
    // if (!token) {
    //   return res.status(401).json({
    //     status: 'Failed',
    //     message: 'Authorization token not provided',
    //   });
    // }

    // const decoded = jwt.verify(token, 'token');
    // const userId = decoded;

    // // Find the user based on the decoded ID
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     status: 'Failed',
    //     message: 'User not found',
    //   });
    // }

    const id = req.params.id;
    const car = await CarData.findById(id);

    if (!car) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Car Data not found'
      });
    }

    if (car.status !== 'approved') {
      return res.status(403).json({
        status: 'Failed',
        message: 'You do not have permission to view this car'
      });
    }

    res.status(200).json({
      status: 'Success',
      message: 'Fetch Car Data Successfully',
      data: car
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Error Occurred',
      error: error.message
    });
  }
};

// Show User Listed Own Cars
exports.fetchAllCarsByUser = async (req, res) => {
  try {
    const token = req.headers.auth;
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Authorization token not provided',
      });
    }

    const decoded = jwt.verify(token, 'token');
    const userId = decoded;

    // Find the user based on the decoded ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'User not found',
      });
    }

    // Find all cars added by the logged-in user, regardless of status
    const cars = await CarData.find({ addedByUser: userId });
    res.status(200).json({
      status: 'Success',
      message: 'Fetch User\'s Car Data Successfully',
      data: cars
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: 'Error Occurred',
      error: error.message
    });
  }
};


// Create a Inquiry
exports.addInquiry = async (req, res) => {
  try {
    const { name, email, phone, carModel, location, message } = req.body;
    const newInquiry = new Inquiry({
      name,
      email,
      phone,
      carModel,
      location,
      message
    });
    await newInquiry.save();
    res.status(201).json({ status: 'Success', message: 'Inquiry added successfully' });
  } catch (error) {
    console.error('Error adding inquiry:', error.message);
    res.status(500).json({ status: 'Error', message: 'Failed to add inquiry' });
  }
};