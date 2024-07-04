const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CarData = require('../model/CarData');
const User = require('../model/User');
const Inquiry = require('../model/Inquiry');

exports.newAdmin = async (req,res) =>{
    try {
        const CheckEmail = await Admin.findOne({email  : req.body.email});
        if(CheckEmail){
            throw new Error('Email Already Exist');
        }
        else {
            if (req.file) {
                req.body.profileImage = req.file.originalname;
            }
            req.body.password = await bcrypt.hash(req.body.password,12);
            var Data = await Admin.create(req.body)
            res.status(200).json({
                status : 'Success',
                message : ' New Admin Add Successfully',
                Data
            })
        }
    } catch (error) {
            res.status(401).json({
                status : 'Failed',
                message : error.message
            })
    }
}

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the admin exists
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Password' });
      }
      var token = await jwt.sign(admin.id,'token');
      res.status(201).json({
          status : 'Success',
          message : 'Admin Login Successfully',
          token
      });
    } catch (err) {
      res.status(401).json({
          status: 'Failed',
          message: 'Error Occured',
          error : err.message
      });
    }
  };

exports.addnewCar = async (req, res) => {
    try {
        const token = req.headers.auth;
        if (!token) {
            return res.status(401).json({
                status: 'Failed',
                message: 'Authorization token not provided',
            });
        }

        const decoded = jwt.verify(token, 'token'); 
        const adminId = decoded;

        // Find the admin based on the decoded ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Admin not found',
            });
        }

        // Set addedByAdmin field with admin's ID
        req.body.addedByAdmin = adminId;

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

exports.modifyCarData = async (req, res) => {
    try {
        const token = req.headers.auth;
        if (!token) {
            return res.status(401).json({
                status: 'Failed',
                message: 'Authorization token not provided',
            });
        }

        const decoded = jwt.verify(token, 'token');
        const adminId = decoded;

        // Find the admin based on the decoded ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Admin not found',
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

        if (req.files) {
            req.body.images = req.files.map(file => file.originalname);
        }

        const updatedCar = await CarData.findByIdAndUpdate(id, req.body);
        res.status(200).json({
            status: 'Success',
            message: 'Car Data Updated Successfully',
            data: updatedCar
        });
    } catch (error) {
        res.status(401).json({
            status: 'Failed',
            message: 'Error Occurred',
            error: error.message
        });
    }
};

exports.DeleteCar = async (req, res) => {
    try {
        const token = req.headers.auth;
        if (!token) {
            return res.status(401).json({
                status: 'Failed',
                message: 'Authorization token not provided',
            });
        }

        const decoded = jwt.verify(token, 'token');
        const adminId = decoded;

        // Find the admin based on the decoded ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Admin not found',
            });
        }

        const id = req.params.id;
        const deletedCar = await CarData.deleteOne({ _id: id });
        res.status(200).json({
            status: 'Success',
            message: 'Car Data Deleted Successfully'
        });
    } catch (error) {
        res.status(401).json({
            status: 'Failed',
            message: 'Error Occurred',
            error: error.message
        });
    }
};

// Fetch All Car Data
exports.fetchAllCarsAdmin = async (req, res) => {
    try {
        const token = req.headers.auth;
        if (!token) {
            return res.status(401).json({
            status: 'Failed',
            message: 'Authorization token not provided',
            });
        }
    
        const decoded = jwt.verify(token, 'token'); 
        const adminId = decoded;
    
        // Find the admin based on the decoded ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
            status: 'Failed',
            message: 'Admin not found',
            });
        }
    
      // Find all cars without any status restriction
      const cars = await CarData.find({});
      res.status(200).json({
        status: 'Success',
        message: 'Fetched All Car Data Successfully',
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
  

  
exports.getDataAdmin = async (req,res)=>{
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
    var Data = await Admin.findById(userId)
    res.status(200).json({
        status : 'Success',
        message : 'Fetch Data Successfully',
        Data
    })
}


exports.countCars = async (req, res) => {
    try {
        const carCount = await CarData.countDocuments({});
        res.status(200).json({ count: carCount });
    } catch (error) {
        res.status(500).json({ error: 'Error counting cars' });
    }
};


exports.countUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({});
        res.status(200).json({ count: userCount });
    } catch (error) {
        res.status(500).json({ error: 'Error counting users' });
    }
};

exports.countInquiry = async (req, res) => {
    try {
        const userCount = await Inquiry.countDocuments({});
        res.status(200).json({ count: userCount });
    } catch (error) {
        res.status(500).json({ error: 'Error counting users' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user data' });
    }
};


exports.getAllInquiry = async (req, res) => {
    try {
        const data = await Inquiry.find({});
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user data' });
    }
};


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
    var Data = await Admin.findById(userId)
    res.status(200).json({
        status : 'Success',
        message : 'Fetch Data Successfully',
        Data
    })
}