import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rexett';

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  const admin = {
    employeeId: 'ADMIN001',
    password: adminPassword,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@rexett.com',
    phone: '1234567890',
    department: 'IT',
    position: 'Administrator',
    status: 'Active',
    role: 'admin',
    hireDate: new Date(),
    salary: 100000,
    address: {
      street: 'Admin St',
      city: 'Admin City',
      state: 'Admin State',
      zipCode: '00000',
      country: 'Adminland'
    },
    skills: ['Management'],
    notes: 'Seeded admin user.'
  };

  const employee = {
    employeeId: 'EMP001',
    password: employeePassword,
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@rexett.com',
    phone: '9876543210',
    department: 'IT',
    position: 'Developer',
    status: 'Active',
    role: 'employee',
    hireDate: new Date(),
    salary: 50000,
    address: {
      street: 'Employee St',
      city: 'Employee City',
      state: 'Employee State',
      zipCode: '11111',
      country: 'Employeeland'
    },
    skills: ['Coding'],
    notes: 'Seeded employee user.'
  };

  await User.deleteMany({ email: { $in: [admin.email, employee.email] } });
  await User.create([admin, employee]);
  console.log('Seeded admin and employee users.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
}); 