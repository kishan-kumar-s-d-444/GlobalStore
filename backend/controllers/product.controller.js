import Product from '../models/product.model.js';
import {Room} from '../models/room.model.js';
import { v2 as cloudinary } from 'cloudinary';

// Add a new product
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, type, roomId } = req.body;
        
        // Check if room exists and user is a member
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (!room.members.includes(req.userId)) {
            return res.status(403).json({ message: 'You are not a member of this room' });
        }

        // Create new product
        const product = new Product({
            name,
            description,
            price,
            type,
            fileUrl: req.file.path,
            roomId,
            userId: req.userId
        });

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all products for a room
export const getProductsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const products = await Product.find({ roomId });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, type } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the owner
        if (!req.userId || product.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (type) product.type = type;

        // Handle file update if new file was uploaded
        if (req.file) {
            // Delete old file from Cloudinary if exists
            if (product.fileUrl) {
                try {
                    await cloudinary.uploader.destroy(product.fileUrl.split('/').pop().split('.')[0]);
                } catch (cloudinaryError) {
                    console.error('Error deleting file from Cloudinary:', cloudinaryError);
                }
            }
            product.fileUrl = req.file.path;
        }

        await product.save();

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user is the owner
        if (!req.userId || product.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        // Delete file from Cloudinary
        if (product.fileUrl) {
            try {
                await cloudinary.uploader.destroy(product.fileUrl.split('/').pop().split('.')[0]);
            } catch (cloudinaryError) {
                console.error('Error deleting file from Cloudinary:', cloudinaryError);
                // Continue with product deletion even if Cloudinary deletion fails
            }
        }

        // Use findByIdAndDelete instead of remove()
        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};