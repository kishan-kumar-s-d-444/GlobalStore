import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            purchasedAt: {
                type: Date,
                default: Date.now
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, {
    timestamps: true
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
