const TestDrive = require('../model/TestDrive');

exports.createTestDrive = async (req, res) => {
    const { name, email, phone, carModel, message } = req.body;
  
    try {
      const newTestDrive = new TestDrive({
        name,
        email,
        phone,
        carModel,
        message
      });
  
      await newTestDrive.save();
  
      res.status(201).json({ message: 'Test Drive request submitted successfully' });
    } catch (error) {
      console.error('Error submitting test drive request:', error);
      res.status(500).json({ error: 'Failed to submit test drive request. Please try again later.' });
    }
  };

  // Handle GET request to fetch all TestDrive entries
exports.getAllTestDrives = async (req, res) => {
    try {
      const testDrives = await TestDrive.find();
      res.status(200).json(testDrives);
    } catch (error) {
      console.error('Error fetching test drives:', error);
      res.status(500).json({ error: 'Failed to fetch test drives. Please try again later.' });
    }
  };


// Handle GET request to fetch a single TestDrive entry by ID
exports.getTestDriveById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const testDrive = await TestDrive.findById(id);
      if (!testDrive) {
        return res.status(404).json({ error: 'Test Drive entry not found' });
      }
      res.status(200).json(testDrive);
    } catch (error) {
      console.error('Error fetching test drive by ID:', error);
      res.status(500).json({ error: 'Failed to fetch test drive. Please try again later.' });
    }
  };

// Handle DELETE request to delete a TestDrive entry by ID
exports.deleteTestDriveById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedTestDrive = await TestDrive.findByIdAndDelete(id);
      if (!deletedTestDrive) {
        return res.status(404).json({ error: 'Test Drive entry not found' });
      }
      res.status(200).json({ message: 'Test Drive entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting test drive by ID:', error);
      res.status(500).json({ error: 'Failed to delete test drive. Please try again later.' });
    }
};

exports.countTestDrives = async (req, res) => {
    try {
      const testDriveCount = await TestDrive.countDocuments({});
      res.status(200).json({ count: testDriveCount });
    } catch (error) {
      console.error('Error counting test drives:', error);
      res.status(500).json({ error: 'Failed to count test drives. Please try again later.' });
    }
  };