export const mockShops = [
  {
    id: '1',
    name: 'Green Garden Market',
    category: 'Grocery',
    size: 'Medium',
    owner: {
      name: 'John Smith',
      phone: '+1234567890',
    },
    location: {
      lat: 40.7128,
      lng: -74.0060,
    },
    image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg',
    salesmanId: 'salesman1',
    registeredAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Fresh Herbs Corner',
    category: 'Restaurant',
    size: 'Small',
    owner: {
      name: 'Maria Garcia',
      phone: '+1987654321',
    },
    location: {
      lat: 40.7589,
      lng: -73.9851,
    },
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    salesmanId: 'salesman2',
    registeredAt: new Date('2024-01-20').toISOString(),
  },
];

export const mockOrders = [
  {
    id: '1',
    shopId: '1',
    salesmanId: 'salesman1',
    items: [
      { name: 'Fresh Tomatoes', quantity: 5, price: 12.50 },
      { name: 'Organic Lettuce', quantity: 2, price: 8.00 },
    ],
    totalAmount: 20.50,
    status: 'pending',
    orderType: 'text',
    notes: 'Please pack carefully',
    createdAt: new Date('2024-01-25T10:30:00').toISOString(),
    location: {
      lat: 40.7128,
      lng: -74.0060,
    },
  },
  {
    id: '2',
    shopId: '2',
    salesmanId: 'salesman2',
    items: [
      { name: 'Fresh Basil', quantity: 3, price: 15.00 },
      { name: 'Cherry Tomatoes', quantity: 4, price: 18.00 },
    ],
    totalAmount: 33.00,
    status: 'ready',
    orderType: 'voice',
    notes: 'Voice order transcription',
    createdAt: new Date('2024-01-25T11:15:00').toISOString(),
    readyAt: new Date('2024-01-25T11:45:00').toISOString(),
    location: {
      lat: 40.7589,
      lng: -73.9851,
    },
  },
];

// Mock Users for Authentication
export const mockUsers = [
  // Salesmen
  {
    id: "salesman1",
    username: "waqar",        // login username
    password: "waqar",        // login password
    role: "salesman",
    name: "Waqar Rao",
    phone: "+1555123456",
    email: "waqar@example.com",
    location: { lat: 40.7128, lng: -74.0060 },
    isOnline: true,
    totalShops: 3,
    totalOrders: 15,
  },
  {
    id: "salesman2",
    username: "sarah",
    password: "salesman456",
    role: "salesman",
    name: "Sarah Wilson",
    phone: "+1555654321",
    email: "sarah@example.com",
    location: { lat: 40.7589, lng: -73.9851 },
    isOnline: true,
    totalShops: 2,
    totalOrders: 12,
  },

  // Dispatcher
  {
    id: "dispatcher1",
    username: "dispatch",
    password: "dispatch",
    role: "dispatcher",
    name: "Michael Scott",
    email: "dispatch@example.com",
  },

  // Admin
  {
    id: "admin1",
    username: "admin",
    password: "admin",
    role: "admin",
    name: "Admin User",
    email: "admin@example.com",
  },
];
