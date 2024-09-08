const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  constructor(userDataFile, secretKey) {
    this.userDataFile = userDataFile;
    this.secretKey = secretKey;
  }

  loadUserData() {
    try {
      const data = fs.readFileSync(this.userDataFile, 'utf8');
      console.log('Dữ liệu người dùng đã đọc:', data);
      return JSON.parse(data);
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu:', error);
      return [];
    }
  }

  saveUserData(data) {
    fs.writeFileSync(this.userDataFile, JSON.stringify(data, null, 2), 'utf8');
  }

  async signUp(req, res) {
    const { Username, Email, Password } = req.body;
    console.log('Request body:', req.body);

    if (!Username || !Email || !Password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const users = this.loadUserData();
      const existingUser = users.find(user => user.Email === Email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(Password, 8);
      const newUser = { id: uuidv4(), Username, Email, Password: hashedPassword };
      users.push(newUser);
      this.saveUserData(users);

      res.json({ message: 'SignUp successful' });
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async signIn(req, res) {
    const { Email, Password } = req.body;
    const users = this.loadUserData();

    const user = users.find(user => user.Email === Email);
    if (!user || !(await bcrypt.compare(Password, user.Password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, Email: user.Email, Username: user.Username }, this.secretKey);
    res.json({ message: 'Signin successful', token, user: user });
  }

  async getCurrentUser(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      const users = this.loadUserData();
      const currentUser = users.find(user => user.Email === email);

      if (!currentUser) {
        return res.status(400).json({ message: 'Invalid Email' });
      }

      res.json({ user: currentUser, message: 'Success' });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateProfile(req, res) {
    const { Id, Username, Email, Password } = req.body;

    if (!Id || !Username || !Email || !Password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const users = this.loadUserData();
      const userIndex = users.findIndex(user => user.id === Id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const emailCount = users.filter(user => user.Email === Email && user.id !== Id).length;
      if (emailCount > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      users[userIndex] = { id: Id, Username, Email, Password };
      this.saveUserData(users);

      res.json({ user: users[userIndex], message: 'User updated successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async changePassword(req, res) {
    const { oldPassword, newPassword, Id } = req.body;

    if (!oldPassword || !newPassword || !Id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const users = this.loadUserData();
      const userIndex = users.findIndex(user => user.id === Id);

      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[userIndex];
      const isPasswordValid = await bcrypt.compare(oldPassword, user.Password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid old password' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 8);
      users[userIndex].Password = hashedPassword;
      this.saveUserData(users);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async forgetPass(req, res) {
    const { Email, newPassword } = req.body;
    const users = this.loadUserData();

    const userIndex = users.findIndex(user => user.Email === Email);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 8);
      users[userIndex].Password = hashedPassword;
      this.saveUserData(users);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
