import { Member } from '../models/Member.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { MemberTransaction } from '../models/member-transactions.js';
import { goldenseats } from '../models/golden-seats.js';


export const createMember = async (request, response) => {
    try {
        // Authentication check
        const token = request.cookies.token;
        if (!token) {
            return response.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Function to format current date
        function formatCurrentDate() {
            const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0'); 
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
            const year = currentDate.getFullYear();
            return `${day}/${month}/${year}`;
        }
        const formattedDate = formatCurrentDate();
        
        // Destructure and set default values from request body
        const {
            memberID = decoded.userId,
            referralCode,
            memberType,
            addressNo,
            province,
            city,
            barangay,
            region,
            country,
            userType = "Member",
            role = "sower",
            memberStatus = "Active",
            paymentType,
            referredBy,
            memberDate,
            productImage = "",
            paymentMethod = "",
            transactionDate = new Date()
        } = request.body;

        // Validate required fields
        const requiredFields = { 
            referralCode, 
            memberID, 
            memberType, 
            addressNo, 
            province, 
            city, 
            barangay, 
            paymentType, 
            memberDate 
        };
        
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return response.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Create new member instance
        const member = new Member({
            memberID,
            referralCode,
            memberType,
            addressNo,
            province,
            region,
            city,
            barangay,
            userType,
            role,
            memberStatus,
            paymentType,
            referredBy,
            memberDate
        });

        // Calculate referral earnings
        const calculateReferralEarnings = (memberType) => {
            const earningsMap = {
                'X1': 500,
                'X2': 1000,
                'X3': 3000,
                'X5': 5000
            };
            return (earningsMap[memberType] || 0) * 0.05;
        };

        // Calculate golden seats commission rates
        const commissionRates = {
            'X1': 10, 
            'X2': 20, 
            'X3': 60,
            'X5': 100 
        };

        const commission = commissionRates[memberType] || 0;

        // Create hierarchical structure for golden seats
        const goldenSeatsHierarchy = {
            captain: barangay,      // Barangay Captain
            mayor: city,            // City Mayor
            governor: province,     // Provincial Governor
            senator: region,      // Senator (same as province for now)
            vicePresident: country,// VP (same as province for now)
            President: country     // President (same as province for now)
        };

        // Create golden seats entry
        const goldenSeats = new goldenseats({
            ...goldenSeatsHierarchy,
            commission: commission
        });

        // Handle referral transactions
        if (referredBy) {
            const referrer = await Member.findOne({ referralCode: referredBy });

            if (!referrer) {
                return response.status(400).json({
                    success: false,
                    message: "Invalid referral code"
                });
            }

            const referralEarnings = calculateReferralEarnings(memberType);
            const referralTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // Create referral transaction
            const referralTransaction = new MemberTransaction({
                memberId: referrer.memberID,
                transactionId: referralTransactionId,
                productName: `${memberType} Referral Bonus`,
                productImage,
                quantity: 1,
                price: referralEarnings,
                total: referralEarnings,
                paymentMethod,
                transactionDate: formattedDate
            });

            await referralTransaction.save();
        }

        // Calculate base amount for golden seats commission
                // Save all records
        await Promise.all([
            member.save(),
            goldenSeats.save(),
            Member.findByIdAndUpdate(
                memberID,
                { $set: { goldenSeatsId: goldenSeats._id } },
                { new: true }
            )
        ]);

        return response.status(201).json({
            success: true,
            message: "Member created and golden seats assigned successfully",
            data: {
                member,
                goldenSeats,
                commission: `${commission * 100}%`
            }
        });

    } catch (error) {
        console.error('Error in member creation and golden seats assignment:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return response.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === 'ValidationError') {
            return response.status(400).json({
                success: false,
                message: error.message
            });
        }

        return response.status(500).json({
            success: false,
            message: "An error occurred during member creation and golden seats assignment"
        });
    }
};


export const getAllMembers = async (request, response) => {
    try {
        const members = await Member.find();
        response.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        console.error(`Error fetching members: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching members"
        });
    }
};

export const getMemberById = async (request, response) => {
    try {
        const member = await Member.findOne({ memberID: request.params.id });

        if (!member) {
            return response.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        response.status(200).json({
            success: true,
            member
        });
    } catch (error) {
        console.error(`Error fetching member: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching member"
        });
    }
};

export const updateMember = async (request, response) => {
    try {
        // Extract the token from cookies
        const token = request.cookies.token;
        if (!token) {
            return response.status(401).json({
                success: false,
                message: "Authentication token is missing.",
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const memberGoldenSeater = decoded.userId; // Extract userId from the token
        const { position } = request.body; // Extract position as a string

        // Find member by memberID and update memberType
        const member = await Member.findOneAndUpdate(
            { memberID: memberGoldenSeater }, // Find by memberID
            { $set: { memberType: position } }, // Ensure memberType is a string
            { new: true } // Return updated document
        );
        

        // If no member was found, return 404
        if (!member) {
            return response.status(404).json({
                success: false,
                message: "Member not found or unauthorized",
            });
        }

        // Success response
        return response.status(200).json({
            success: true,
            message: "Member updated successfully",
            member,
        });

    } catch (error) {
        console.error(`Error updating member: ${error.message}`);
        return res.status(500).json({  // Change response to res
            success: false,
            message: "An error occurred while updating the member",
        });
        
    }
};

export const deleteMember = async (request, response) => {
    try {
        // Check if user exists and is authenticated
        const user = await User.findById(request.userId);
        if (!user) {
            return response.status(401).json({
                success: false,
                message: "User not found or unauthorized"
            });
        }

        const member = await Member.findOneAndDelete({ 
            memberID: request.params.memberID,
            userId: request.userId 
        });

        if (!member) {
            return response.status(404).json({
                success: false,
                message: "Member not found or unauthorized"
            });
        }

        response.status(200).json({
            success: true,
            message: "Member deleted successfully"
        });
    } catch (error) {
        console.error(`Error deleting member: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while deleting member"
        });
    }
};

export const getMembersByType = async (request, response) => {
    try {
        const members = await Member.find({ 
            memberType: request.params.memberType,
            userId: request.userId 
        });

        response.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        console.error(`Error fetching members by type: ${error.message}`);
        response.status(500).json({
            success: false,
            message: "An error occurred while fetching members"
        });
    }
};

// export const searchMembers = async (request, response) => {
//     try {
//         const { query } = request.query;
        
//         const members = await Member.find({
//             userId: request.userId,
//             $or: [
//                 { memberID: { $regex: query, $options: 'i' } },
//                 { province: { $regex: query, $options: 'i' } },
//                 { city: { $regex: query, $options: 'i' } },
//                 { barangay: { $regex: query, $options: 'i' } }
//             ]
//         });

//         response.status(200).json({
//             success: true,
//             members
//         });
//     } catch (error) {
//         console.error(`Error searching members: ${error.message}`);
//         response.status(500).json({
//             success: false,
//             message: "An error occurred while searching members"
//         });
//     }
// };
