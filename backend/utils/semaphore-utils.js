// semaphore-utils.js
import axios from 'axios';

const SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages';
const API_KEY = `31de9d6a9ecea2ae9cead90d15cae681`; // Move API key to environment variable
const DEFAULT_SENDER = 'UPAHANMOTO';

export const sendOtp = async (phoneNumber, otpMessage) => {
    try {
        // Format phone number - ensure it starts with 63 for Philippines
        const formattedNumber = phoneNumber.replace(/^\+?63|^0?/, '63');
        console.log('Formatted Phone Number:', formattedNumber); // Log the formatted number
        
        // Send OTP via Semaphore
        const response = await axios.post(SEMAPHORE_API_URL, {
            apikey: API_KEY,
            number: formattedNumber, // Use the formatted phone number
            message: otpMessage,
            sender_name: DEFAULT_SENDER,
        });
        
        console.log('Semaphore API Response:', response.data); // Log the response data

        return response.data;
    } catch (error) {
        // Log the full error for better debugging
        console.error('Error sending OTP:', error.response || error.message || error);

        // Throw an error with more context if needed
        throw new Error(`Failed to send OTP: ${error.response ? error.response.data.message : error.message}`);
    }
};
