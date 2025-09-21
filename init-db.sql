-- Simple database initialization
USE alcobra_db;

-- Create admins table
CREATE TABLE admins (
    id VARCHAR(191) PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create services table  
CREATE TABLE services (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(191),
    imageUrl VARCHAR(191),
    isActive TINYINT(1) DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
    id VARCHAR(191) PRIMARY KEY,
    customerName VARCHAR(191) NOT NULL,
    customerPhone VARCHAR(191) NOT NULL,
    customerEmail VARCHAR(191),
    serviceId VARCHAR(191) NOT NULL,
    requestedDate DATE NOT NULL,
    requestedTime TIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'PENDING',
    notes TEXT,
    adminNotes TEXT,
    confirmedAt DATETIME NULL,
    completedAt DATETIME NULL,
    cancelledAt DATETIME NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE notifications (
    id VARCHAR(191) PRIMARY KEY,
    type ENUM('NEW_BOOKING', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_REMINDER') NOT NULL,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    bookingId VARCHAR(191),
    sent TINYINT(1) DEFAULT 0,
    sentAt DATETIME NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admins (id, email, password, name) VALUES 
('admin001', 'admin@alcobrasalon.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0kMJZr6.Gy', 'Alcobra Salon Admin');

-- Insert sample services
INSERT INTO services (id, name, description, duration, price, category) VALUES 
('srv001', 'Classic Haircut', 'Professional haircut with wash and basic styling', 45, 35.00, 'Hair'),
('srv002', 'Hair Color & Highlights', 'Full hair coloring service with highlights', 120, 85.00, 'Hair'),
('srv003', 'Deep Cleansing Facial', 'Relaxing facial with deep pore cleansing and moisturizing', 60, 65.00, 'Spa'),
('srv004', 'Swedish Massage', 'Full body relaxing Swedish massage', 90, 95.00, 'Spa'),
('srv005', 'Manicure & Pedicure', 'Complete nail care with polish application', 75, 45.00, 'Nails'),
('srv006', 'Eyebrow Shaping', 'Professional eyebrow shaping and trimming', 30, 25.00, 'Beauty');

