require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seeder cannot run in production mode!')
  process.exit(1)
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Test = require('../models/Test');
const connectDB = require('../config/db');

const sampleTests = [
  {
    name: 'Complete Blood Count (CBC)',
    price: 299,
    description: 'A complete blood count (CBC) is a blood test used to evaluate your overall health and detect a wide range of disorders including anemia, infection and leukemia.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '6 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Lipid Profile',
    price: 499,
    description: 'A lipid panel measures cholesterol and triglycerides to assess cardiovascular risk. Includes total cholesterol, HDL, LDL, and VLDL.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '12 hours',
    preparationRequired: 'Fasting for 9-12 hours required',
  },
  {
    name: 'Blood Sugar - Fasting',
    price: 149,
    description: 'Measures blood glucose levels after fasting to help diagnose diabetes and prediabetes.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '4 hours',
    preparationRequired: 'Fasting for 8-10 hours required',
  },
  {
    name: 'HbA1c (Glycated Hemoglobin)',
    price: 599,
    description: 'Measures average blood glucose over the past 2-3 months. Essential for diabetes monitoring and management.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '24 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Thyroid Profile (TSH, T3, T4)',
    price: 799,
    description: 'Comprehensive thyroid function test including TSH, Free T3 and Free T4 to evaluate thyroid health.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '24 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Liver Function Test (LFT)',
    price: 699,
    description: 'A panel of blood tests that provide information about the state of a patient\'s liver including SGOT, SGPT, alkaline phosphatase, bilirubin and albumin.',
    category: 'Biochemistry',
    popular: true,
    turnaroundTime: '12 hours',
    preparationRequired: 'Fasting for 6-8 hours recommended',
  },
  {
    name: 'Kidney Function Test (KFT)',
    price: 699,
    description: 'Evaluates how well kidneys are working. Includes creatinine, urea, uric acid, and electrolytes.',
    category: 'Biochemistry',
    popular: false,
    turnaroundTime: '12 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Urine Routine & Microscopy',
    price: 199,
    description: 'Routine urine examination to detect infection, kidney disease and other urinary tract disorders.',
    category: 'Urine Test',
    popular: false,
    turnaroundTime: '4 hours',
    preparationRequired: 'Collect midstream urine sample in the morning',
  },
  {
    name: 'Vitamin D (25-OH)',
    price: 999,
    description: 'Measures the level of Vitamin D in blood to diagnose Vitamin D deficiency which can cause bone disorders and immune dysfunction.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '24 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Vitamin B12',
    price: 699,
    description: 'Measures Vitamin B12 levels to identify deficiency which can cause anemia, nerve damage and fatigue.',
    category: 'Blood Test',
    popular: false,
    turnaroundTime: '24 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'ECG (Electrocardiogram)',
    price: 399,
    description: 'Records the electrical activity of the heart to detect heart conditions, arrhythmias, and heart attacks.',
    category: 'Cardiology',
    popular: false,
    turnaroundTime: 'Same day',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Chest X-Ray (PA View)',
    price: 499,
    description: 'X-ray imaging of the chest used to diagnose conditions affecting chest, lungs, heart, large arteries and ribs.',
    category: 'Radiology',
    popular: false,
    turnaroundTime: 'Same day',
    preparationRequired: 'Remove metal objects and jewelry',
  },
  {
    name: 'COVID-19 RT-PCR Test',
    price: 999,
    description: 'Molecular diagnostic test to detect active SARS-CoV-2 infection using nasopharyngeal swab.',
    category: 'Microbiology',
    popular: false,
    turnaroundTime: '24-48 hours',
    preparationRequired: 'No eating or drinking 30 minutes before sample collection',
  },
  {
    name: 'Dengue NS1 Antigen + IgM/IgG',
    price: 899,
    description: 'Comprehensive dengue panel to detect dengue fever at different stages of the infection.',
    category: 'Immunology',
    popular: false,
    turnaroundTime: '12 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Iron Studies (Serum Iron, TIBC, Ferritin)',
    price: 849,
    description: 'Evaluates iron stores in the body and helps diagnose iron deficiency anemia or iron overload conditions.',
    category: 'Blood Test',
    popular: false,
    turnaroundTime: '24 hours',
    preparationRequired: 'Fasting for 8 hours recommended',
  },
  {
    name: 'C-Reactive Protein (CRP)',
    price: 449,
    description: 'Measures CRP protein which rises in response to inflammation, helping detect infections and inflammatory conditions.',
    category: 'Immunology',
    popular: false,
    turnaroundTime: '12 hours',
    preparationRequired: 'No special preparation required',
  },
  {
    name: 'Urine Culture & Sensitivity',
    price: 599,
    description: 'Identifies bacteria causing urinary tract infection and determines which antibiotics will be effective.',
    category: 'Microbiology',
    popular: false,
    turnaroundTime: '48-72 hours',
    preparationRequired: 'Collect midstream urine in sterile container',
  },
  {
    name: 'Full Body Health Checkup',
    price: 2499,
    description: 'Comprehensive health package covering CBC, LFT, KFT, lipid profile, thyroid, diabetes markers, urine, and vitamins.',
    category: 'Blood Test',
    popular: true,
    turnaroundTime: '24 hours',
    preparationRequired: 'Fasting for 10-12 hours required',
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Test.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@pathlab.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample patient
    await User.create({
      name: 'John Doe',
      email: 'patient@pathlab.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '9876543210',
      age: 30,
      gender: 'male',
    });
    console.log('✅ Sample patient created: patient@pathlab.com');

    // Seed tests
    await Test.insertMany(sampleTests);
    console.log(`✅ ${sampleTests.length} tests seeded`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin credentials:');
    console.log(`  Email: ${process.env.ADMIN_EMAIL || 'admin@pathlab.com'}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\nPatient credentials:');
    console.log('  Email: patient@pathlab.com');
    console.log('  Password: Patient@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
