import { User } from '../models/user.js';
import { Member } from '../models/Member.js';

export const allUsers = async (request, response) => {
    try {
        // Find all users
        const users = await User.find();

        if (!users.length) {
            console.log('No users found');
            return response.status(404).json({ success: false, message: 'No users found' });
        }

        // Map each user to its corresponding member details
        const usersWithMembers = await Promise.all(users.map(async (user) => {
            // Find the member that matches the user based on a common field (e.g., memberId)
            const memberDetails = await Member.find({ memberID: user._id }); // Assuming 'memberId' is the field in Member model

            return {
                ...user.toObject(), // Convert user to a plain object to avoid Mongoose document methods
                memberDetails
            };
        }));

        return response.status(200).json({
            success: true,
            users: usersWithMembers,
        });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return response.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
