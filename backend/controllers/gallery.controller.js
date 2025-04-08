import Gallery from '../models/gallery.model.js';

// Add purchased product to user's gallery
export const addToGallery = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        // Check if gallery already exists for this user
        let gallery = await Gallery.findOne({ userId });

        if (!gallery) {
            // Create new gallery for user if it doesn't exist
            gallery = new Gallery({
                userId,
                products: [{ productId, quantity, purchasedAt: new Date() }]
            });
            await gallery.save();
        } else {
            // Check if product already exists in the gallery
            const productExists = gallery.products.some(
                item => item.productId.toString() === productId.toString()
            );
            
            if (productExists) {
                // Update quantity if product already exists
                gallery.products = gallery.products.map(item => {
                    if (item.productId.toString() === productId.toString()) {
                        return {
                            ...item,
                            quantity: item.quantity + quantity
                        };
                    }
                    return item;
                });
            } else {
                // Add new product to existing gallery
                gallery.products.push({ productId, quantity, purchasedAt: new Date() });
            }
            
            await gallery.save();
        }

        res.status(200).json({ 
            success: true,
            message: 'Product added to gallery successfully', 
            gallery 
        });
    } catch (err) {
        console.error('Error adding to gallery:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to add to gallery',
            details: err.message 
        });
    }
};

// Get all purchased products of a user
export const getGalleryByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const gallery = await Gallery.findOne({ userId }).populate('products.productId');

        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found for this user' });
        }

        res.status(200).json({ gallery });
    } catch (err) {
        console.error('Error fetching gallery:', err);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
};
