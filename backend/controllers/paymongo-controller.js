import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_API_URL = "https://api.paymongo.com/v1";




export const createPayment = async (req, res) => {
    try {
        const { amount, description, name, email, phone } = req.body;

        if (!amount || !description) {
            return res.status(400).json({
                error: "Missing required fields: amount and description are required",
            });
        }

        if (!PAYMONGO_SECRET_KEY) {
            throw new Error("PayMongo secret key is not configured");
        }

        // Create a payment intent
        const paymentIntent = await axios.post(
            `${PAYMONGO_API_URL}/payment_intents`,
            {
                data: {
                    attributes: {
                        amount: Math.round(amount * 100), // Convert to centavos
                        currency: "PHP",
                        description,
                        payment_method_allowed: ["gcash"],
                        payment_method_options: {
                            card: {
                                request_three_d_secure: "any",
                            },
                        },
                        capture_type: "automatic",
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString("base64")}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        // Create a payment method
        const paymentMethod = await axios.post(
            `${PAYMONGO_API_URL}/payment_methods`,
            {
                data: {
                    attributes: {
                        type: "gcash",
                        billing: {
                            name: name || "Customer Name",
                            email: email || "customer@example.com",
                            phone: phone || "09123456789",
                        },
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString("base64")}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        // Attach payment method to payment intent
        const attachPayment = await axios.post(
            `${PAYMONGO_API_URL}/payment_intents/${paymentIntent.data.data.id}/attach`,
            {
                data: {
                    attributes: {
                        payment_method: paymentMethod.data.data.id,
                        return_url: process.env.PAYMENT_SUCCESS_URL || "http://localhost:5173/verify-payment",
                    },
                },
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString("base64")}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        // Return the checkout URL
        return res.json({
            success: true,
            checkoutUrl: attachPayment.data.data.attributes.next_action.redirect.url,
            paymentIntentId: paymentIntent.data.data.id,
        });
    } catch (error) {
        console.error("Payment creation error details:", {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
        });

        if (error.response?.data?.errors) {
            const paymongoError = error.response.data.errors[0];
            return res.status(error.response.status || 400).json({
                success: false,
                error: {
                    message: paymongoError.detail,
                    code: paymongoError.code,
                    status: paymongoError.status,
                },
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                message: "Payment processing failed. Please try again later.",
                details: error.message,
            },
        });
    }
};
