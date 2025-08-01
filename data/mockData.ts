export const mockProducts = [
  {
    id: '1',
    title: 'iPhone 13 Pro Max 256GB',
    description: 'Excellent condition iPhone 13 Pro Max with all accessories. Battery health 89%. Minor scratches on back.',
    price: 75000,
    originalPrice: 85000,
    condition: 4,
    hall: 'RADHAKRISHNAN',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'
    ],
    seller: {
      name: 'Arjun Sharma',
      email: 'arjun.sharma@iitkgp.ac.in'
    },
    category: 'Electronics',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Study Table with Chair',
    description: 'Wooden study table with comfortable chair. Perfect for hostel room. Used for 1 year.',
    price: 3500,
    condition: 3,
    hall: 'AZAD',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    ],
    seller: {
      name: 'Priya Patel',
      email: 'priya.patel@iitkgp.ac.in'
    },
    category: 'Furniture',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Engineering Textbooks Bundle',
    description: 'Complete set of 2nd year engineering books. All subjects included. Good condition with minimal highlighting.',
    price: 2500,
    originalPrice: 4000,
    condition: 4,
    hall: 'PATEL',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
    ],
    seller: {
      name: 'Rohit Kumar',
      email: 'rohit.kumar@iitkgp.ac.in'
    },
    category: 'Books',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'Gaming Laptop - ASUS ROG',
    description: 'High-performance gaming laptop. RTX 3070, 16GB RAM, 1TB SSD. Perfect for gaming and heavy software.',
    price: 85000,
    condition: 5,
    hall: 'NEHRU',
    images: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop'
    ],
    seller: {
      name: 'Vikash Singh',
      email: 'vikash.singh@iitkgp.ac.in'
    },
    category: 'Electronics',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Bicycle - Hero Ranger',
    description: 'Mountain bike in excellent condition. Used for campus commuting. Recently serviced.',
    price: 8500,
    originalPrice: 12000,
    condition: 4,
    hall: 'GOKHALE',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ],
    seller: {
      name: 'Ankit Agarwal',
      email: 'ankit.agarwal@iitkgp.ac.in'
    },
    category: 'Transport',
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    title: 'Mini Refrigerator',
    description: 'Compact refrigerator perfect for hostel room. 80L capacity. Energy efficient.',
    price: 6500,
    condition: 3,
    hall: 'BHARATI',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop'
    ],
    seller: {
      name: 'Sneha Jain',
      email: 'sneha.jain@iitkgp.ac.in'
    },
    category: 'Kitchen',
    createdAt: '2024-01-10'
  }
]

export const mockServices = [
  {
    id: '1',
    title: 'Mathematics Tutoring',
    description: 'Expert tutoring in Advanced Mathematics, Calculus, and Linear Algebra. 3+ years experience.',
    minPrice: 300,
    maxPrice: 500,
    provider: {
      name: 'Rahul Verma',
      email: 'rahul.verma@iitkgp.ac.in'
    },
    hall: 'RAJENDRA_PRASAD',
    rating: 4.8,
    experienceYears: 3,
    category: 'Academic'
  },
  {
    id: '2',
    title: 'Laptop Repair & Maintenance',
    description: 'Professional laptop repair services. Hardware and software issues. Quick turnaround time.',
    minPrice: 500,
    maxPrice: 3000,
    provider: {
      name: 'Tech Solutions',
      email: 'tech.solutions@iitkgp.ac.in'
    },
    hall: 'AZAD',
    rating: 4.6,
    experienceYears: 2,
    category: 'Technical'
  },
  {
    id: '3',
    title: 'Photography Services',
    description: 'Professional photography for events, portraits, and projects. High-quality equipment available.',
    minPrice: 1500,
    maxPrice: 5000,
    provider: {
      name: 'Aryan Photography',
      email: 'aryan.photo@iitkgp.ac.in'
    },
    hall: 'GOKHALE',
    rating: 4.9,
    experienceYears: 4,
    category: 'Creative'
  }
]

export const mockDemands = [
  {
    id: '1',
    title: 'Looking for Physics Lab Manual',
    description: 'Need Physics lab manual for 1st year B.Tech. Preferably latest edition.',
    user: {
      name: 'Amit Sharma',
      email: 'amit.sharma@iitkgp.ac.in'
    },
    category: 'Books',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Need a good quality headphones',
    description: 'Looking for noise-canceling headphones under ₹5000. Good condition preferred.',
    user: {
      name: 'Priya Singh',
      email: 'priya.singh@iitkgp.ac.in'
    },
    category: 'Electronics',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'Room sharing near Main Building',
    description: 'Looking for someone to share a room near Main Building. Budget ₹3000-4000 per month.',
    user: {
      name: 'Rohit Patel',
      email: 'rohit.patel@iitkgp.ac.in'
    },
    category: 'Accommodation',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'Guitar for learning',
    description: 'Want to buy an acoustic guitar for learning. Budget under ₹3000.',
    user: {
      name: 'Kavya Reddy',
      email: 'kavya.reddy@iitkgp.ac.in'
    },
    category: 'Music',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Chemistry project help needed',
    description: 'Need help with organic chemistry project. Willing to pay for tutoring sessions.',
    user: {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@iitkgp.ac.in'
    },
    category: 'Academic',
    createdAt: '2024-01-11'
  }
]

export const quickFilters = [
  { label: 'Free', price: 0, color: 'bg-green-500', count: 12 },
  { label: '<₹100', price: 100, color: 'bg-blue-500', count: 45 },
  { label: '<₹500', price: 500, color: 'bg-purple-500', count: 128 },
  { label: '<₹1000', price: 1000, color: 'bg-orange-500', count: 89 },
]
