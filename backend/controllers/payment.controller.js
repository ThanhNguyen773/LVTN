import Coupon from "../models/coupon.model.js"; // Assuming you have a Coupon model defined
import { stripe } from "../lib/stripe.js";  // Assuming you have a Stripe instance set up
import Order from "../models/order.model.js";


export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode} = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Products are required for checkout" });
        }
        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amout = Math.round(product.price * 100)
            totalAmount += amout * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amout,
                },
                quantity: product.quantity,
            }
        });
        let coupon = null;
        if (couponCode) {
           coupon = await Coupon.findOne({ code: couponCode,
                                           userId: req.user._id,
                                           isActive: true });
            if (coupon) {
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);// Assuming discountAmount is in dollars
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon ? [{
                coupon: await createStripeCoupon(coupon.discountPercentage),
            },
        ] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    })),
                ),

            },
        });

        if(totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.error("Error processing checkout", error);
        res.status(500).json({ error: "Error processing checkout" });

    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
            
            if(session.metadata.couponCode) {
                // Here you can handle the coupon logic, e.g., mark it as used
                await Coupon.findOneAndUpdate(
                    { 
                    code: session.metadata.couponCode, userId: session.metadata.userId
                    }, 
                    { 
                        isActive: false 
                    }
                );
            }
           //create a new order in the database
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                userId: session.metadata.userId,
                products: products.map(products => ({
                    product: products.id,
                    quantity: products.quantity,
                    price: products.price,
                })),
                totalAmount: session.amount_total / 100, // Convert cents to dollars
                stripeSessionId: sessionId,
            });

            await newOrder.save();
            res.status(200).json({
                success: true,
                message: "Order created successfully",
                orderId: newOrder._id,
            });
        }

    } catch (error) {
        console.error("Error in create-success route:", error);
        res.status(500).json({
            message: "Error processing successful checkout",
            error: error.message,
        });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}

async function createNewCoupon(userId) {
    const newCoupon = new Coupon({
        code:"GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate a random coupon code
        discountPercentage: 10, // Example discount percentage
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId: userId,
    });
    await newCoupon.save();

    return newCoupon;
}