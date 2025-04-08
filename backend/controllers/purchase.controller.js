import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    const { product, quantity, userId, roomId } = req.body;
    
    console.log('Received checkout request:', { 
        productId: product._id, 
        productName: product.name, 
        price: product.price, 
        quantity, 
        userId, 
        roomId 
    });

    // Validate required fields
    if (!product || !product._id || !product.name || !product.price || !quantity || !userId || !roomId) {
        console.error('Missing required fields:', { product, quantity, userId, roomId });
        return res.status(400).json({ 
            error: 'Missing required fields', 
            details: 'Product, quantity, userId, and roomId are required' 
        });
    }

    // Ensure price is a valid number
    const price = parseFloat(product.price);
    if (isNaN(price) || price <= 0) {
        console.error('Invalid price:', product.price);
        return res.status(400).json({ 
            error: 'Invalid price', 
            details: 'Product price must be a positive number' 
        });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: product.name,
                },
                unit_amount: Math.round(price * 100), // Ensure price is in cents and is an integer
              },
              quantity: quantity,
            }],
            mode: 'payment',
            success_url: `http://localhost:3000/purchase-success?productId=${product._id}&userId=${userId}&quantity=${quantity}`,
            cancel_url: `http://localhost:3000/home/store/${roomId}`,
          });
          
        console.log('Stripe session created successfully:', session.id);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe session creation failed:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to create Stripe session', details: error.message });
    }
};
