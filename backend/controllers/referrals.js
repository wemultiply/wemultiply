import { Member } from '../models/Member.js';
import jwt, { decode } from 'jsonwebtoken';
import { MemberTransaction } from '../models/member-transactions.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';

export const referrals = async (request, response) => {
    try {
        // Get and verify token
        const token = request.cookies.token;
        if (!token) {
            return response.status(401).json({
                success: false,
                message: "Unauthorized: Token is missing"
            });
        }

        // Verify token and extract memberId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const memberId = decoded?.userId;

        if (!memberId) {
            return response.status(400).json({
                success: false,
                message: "Invalid token: Missing user ID"
            });
        }

        // Find the current member
        const currentMember = await Member.findOne({ memberID: memberId });
        if (!currentMember) {
            return response.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Find all members referred by the current member
        const referredMembers = await Member.find({
            referredBy: currentMember.referralCode
        });

        if (!referredMembers.length) {
            return response.status(200).json({
                success: true,
                message: "No referrals found",
                data: [],
                referralCounts: {
                    X1: 0,
                    X2: 0,
                    X3: 0,
                    X5: 0
                }
            });
        }

        // Initialize counters for referral types
        const referralCounts = {
            X1: 0,
            X2: 0,
            X3: 0,
            X5: 0
        };

        // Get all member IDs from referred members
        const memberIDs = referredMembers.map(member => member.memberID);

        // Fetch user details for all referred members
        const userDetails = await User.find({
            _id: { $in: memberIDs }
        }).select('firstName lastName email dateJoined');

        // Fetch transactions for all referred members
        const transactions = await MemberTransaction.find({
            memberId: { $in: memberIDs }
        });

        // Process referral data and count member types
        const referralData = referredMembers.map(member => {
            const user = userDetails.find(u => u._id.toString() === member.memberID.toString());
            const memberTransactions = transactions.filter(t =>
                t.memberId.toString() === member.memberID.toString()
            );

            // Count the number of each member type
            if (member.memberType && referralCounts.hasOwnProperty(member.memberType)) {
                referralCounts[member.memberType]++;
            }

            // Calculate total earnings from transactions
            const totalEarnings = memberTransactions.reduce((sum, transaction) =>
                sum + (transaction.amount || 0), 0
            );

            // Calculate commission (assuming 10% commission rate - adjust as needed)
            const commission = totalEarnings * 0.10;

            return {
                memberId: member.memberID,
                referralCode: member.referralCode,
                memberType: member.memberType,
                status: member.status,
                memberDate: member.memberDate,
                dateJoined: user?.dateJoined,
                userDetails: {
                    firstName: user?.firstName || 'Unknown',
                    lastName: user?.lastName || 'User',
                    email: user?.email
                },
                statistics: {
                    totalEarnings,
                    commission,
                    transactionCount: memberTransactions.length,
                    lastTransaction: memberTransactions.length > 0
                        ? memberTransactions[memberTransactions.length - 1].createdAt
                        : null
                }
            };
        });

        return response.status(200).json({
            success: true,
            message: "Referral data retrieved successfully",
            data: referralData,
            referralCounts, // Added referral counts here
            summary: {
                totalReferrals: referralData.length,
                totalCommissions: referralData.reduce((sum, ref) =>
                    sum + ref.statistics.commission, 0
                ),
                activeReferrals: referralData.filter(ref =>
                    ref.status === 'active'
                ).length
            }
        });

    } catch (error) {
        console.error("Error retrieving referral data:", error);

        if (error.name === "JsonWebTokenError") {
            return response.status(401).json({
                success: false,
                message: "Unauthorized: Invalid token"
            });
        }

        return response.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// const MAX_LEVEL = 7;

// export const getReferralTree = async (request, response) => {
//     try {
//         const token = request.cookies.token;
//         if (!token) {
//             return response.status(401).json({
//                 success: false,
//                 message: "Unauthorized: Token is missing"
//             });
//         }
//         // Verify token and extract memberId
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const id = decoded?.userId;
//         const refCode = await Member.findOne({ memberID: id });
//         // Find the requested member using either ObjectId or referralCode
//         let member;
//         if (mongoose.Types.ObjectId.isValid(refCode)) {
//             member = await Member.findById(refCode);
//         } else {
//             member = await Member.findOne({ referralCode: refCode.referralCode });
//         }

//         if (!member) {
//             return response.status(404).json({
//                 success: false,
//                 message: "Member not found"
//             });
//         }

//         const calculateReferralEarnings = (memberType) => {
//             let earnings = 0;
//             switch (memberType) {
//                 case 'X1':
//                     earnings = 500;
//                     break;
//                 case 'X2':
//                     earnings = 1000;
//                     break;
//                 case 'X3':
//                     earnings = 3000;
//                     break;
//                 case 'X5':
//                     earnings = 5000;
//                     break;
//                 default:
//                     earnings = 0; // Default value for unknown types
//             }
//             // Return only 5% of the direct referral earnings
//             return earnings * 0.05;
//         };

//         const buildTree = async (referralCode, level = 1, processed = new Set()) => {
//             if (level > MAX_LEVEL || processed.has(referralCode)) {
//                 return [];
//             }

//             processed.add(referralCode);

//             // Find members referred by this referral code
//             const members = await Member.find({ referredBy: referralCode });
//             if (!members.length) return [];

//             const memberIds = members.map(m => m.memberID);

//             // Get user details and transactions
//             const users = await User.find({ _id: { $in: memberIds } });
//             const transactions = await MemberTransaction.find({ memberId: { $in: memberIds } });

//             const referrals = await Promise.all(members.map(async (member) => {
//                 const user = users.find(u => u._id.toString() === member.memberID.toString());
//                 const memberTransactions = transactions.filter(t =>
//                     t.memberId.toString() === member.memberID.toString()
//                 );

//                 const totalEarnings = memberTransactions.reduce((sum, t) =>
//                     sum + (t.amount || 0), 0
//                 );

//                 // Calculate 5% of direct referral earnings
//                 const directReferralEarnings = calculateReferralEarnings(member.memberType);

//                 const children = await buildTree(member.referralCode, level + 1, processed);

//                 return {
//                     _id: member._id,
//                     memberId: member.memberID,
//                     referralCode: member.referralCode,
//                     level,
//                     memberType: member.memberType,
//                     status: member.memberStatus,
//                     memberDate: member.memberDate,
//                     role: member.role,
//                     location: {
//                         addressNo: member.addressNo,
//                         province: member.province,
//                         city: member.city,
//                         barangay: member.barangay
//                     },
//                     userDetails: {
//                         firstName: user?.firstName || 'Unknown',
//                         lastName: user?.lastName || 'User',
//                         email: user?.email
//                     },
//                     statistics: {
//                         totalEarnings,
//                         commission: totalEarnings * 0.10,
//                         directReferralEarnings, // Display 5% of direct referral earnings
//                         transactionCount: memberTransactions.length,
//                         lastTransaction: memberTransactions.length > 0
//                             ? memberTransactions[memberTransactions.length - 1].createdAt
//                             : null
//                     },
//                     children
//                 };
//             }));

//             return referrals;
//         };

//         const tree = await buildTree(member.referralCode);

//         // Calculate tree statistics
//         const calculateTreeStats = (referrals) => {
//             let stats = {
//                 totalMembers: 0,
//                 totalEarnings: 0,
//                 totalCommissions: 0,
//                 totalDirectReferralEarnings: 0, // Track direct referral earnings here
//                 totalEarningsWithCommissionAndDirectReferral: 0, // Combined earnings
//                 activeMembers: 0,
//                 memberTypes: {},
//                 levelCounts: {}
//             };

//             const processNode = (node) => {
//                 stats.totalMembers++;
//                 stats.totalEarnings += node.statistics.totalEarnings;
//                 stats.totalCommissions += node.statistics.commission;
//                 stats.totalDirectReferralEarnings += node.statistics.directReferralEarnings; // Sum direct referral earnings

//                 // Calculate total combined earnings
//                 stats.totalEarningsWithCommissionAndDirectReferral += node.statistics.totalEarnings + node.statistics.commission + node.statistics.directReferralEarnings;

//                 if (node.status === 'Active') stats.activeMembers++;

//                 // Count member types
//                 stats.memberTypes[node.memberType] = (stats.memberTypes[node.memberType] || 0) + 1;

//                 // Count members per level
//                 stats.levelCounts[node.level] = (stats.levelCounts[node.level] || 0) + 1;

//                 if (node.children) {
//                     node.children.forEach(processNode);
//                 }
//             };

//             referrals.forEach(processNode);
//             return stats;
//         };

//         const treeStats = calculateTreeStats(tree);

//         return response.status(200).json({
//             success: true,
//             message: "Referral tree retrieved successfully",
//             data: {
//                 memberInfo: {
//                     _id: member._id,
//                     memberId: member.memberID,
//                     referralCode: member.referralCode,
//                     memberType: member.memberType,
//                     status: member.memberStatus,
//                     memberDate: member.memberDate,
//                     role: member.role,
//                     location: {
//                         addressNo: member.addressNo,
//                         province: member.province,
//                         city: member.city,
//                         barangay: member.barangay
//                     }
//                 },
//                 referralTree: tree,
//                 statistics: treeStats
//             }
//         });

//     } catch (error) {
//         console.error("Error retrieving referral tree:", error);
//         return response.status(500).json({
//             success: false,
//             message: "Error retrieving referral tree",
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

    const MAX_LEVEL = 7;

    export const getReferralTree = async (request, response) => {
        try {
            const token = request.cookies.token;
            if (!token) {
                return response.status(401).json({
                    success: false,
                    message: "Unauthorized: Token is missing"
                });
            }
            // Verify token and extract memberId
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const id = decoded?.userId;
            const refCode = await Member.findOne({ memberID: id });

            // Find the requested member using either ObjectId or referralCode
            let member;
            if (mongoose.Types.ObjectId.isValid(refCode)) {
                member = await Member.findById(refCode);
            } else {
                member = await Member.findOne({ referralCode: refCode.referralCode });
            }

            if (!member) {
                return response.status(404).json({
                    success: false,
                    message: "Member not found"
                });
            }

            const calculateReferralEarnings = (memberType, level) => {
                // Only calculate earnings for level 1 (direct referrals)
                if (level !== 1) return 0;

                let earnings = 0;
                switch (memberType) {
                    case 'X1':
                        earnings = 500;
                        break;
                    case 'X2':
                        earnings = 1000;
                        break;
                    case 'X3':
                        earnings = 3000;
                        break;
                    case 'X5':
                        earnings = 5000;
                        break;
                    default:
                        earnings = 0;
                }
                return earnings * 0.05;
            };

            const buildTree = async (referralCode, level = 1, processed = new Set()) => {
                if (level > MAX_LEVEL || processed.has(referralCode)) {
                    return [];
                }

                processed.add(referralCode);

                const members = await Member.find({ referredBy: referralCode });
                if (!members.length) return [];

                const memberIds = members.map(m => m.memberID);

                const users = await User.find({ _id: { $in: memberIds } });
                const transactions = await MemberTransaction.find({ memberId: { $in: memberIds } });

                const referrals = await Promise.all(members.map(async (member) => {
                    const user = users.find(u => u._id.toString() === member.memberID.toString());
                    const memberTransactions = transactions.filter(t =>
                        t.memberId.toString() === member.memberID.toString()
                    );

                    const totalEarnings = memberTransactions.reduce((sum, t) =>
                        sum + (t.amount || 0), 0
                    );

                    // Pass the level to calculateReferralEarnings
                    const directReferralEarnings = calculateReferralEarnings(member.memberType, level);

                    const children = await buildTree(member.referralCode, level + 1, processed);

                    return {
                        _id: member._id,
                        memberId: member.memberID,
                        referralCode: member.referralCode,
                        level,
                        memberType: member.memberType,
                        status: member.memberStatus,
                        memberDate: member.memberDate,
                        role: member.role,
                        location: {
                            addressNo: member.addressNo,
                            province: member.province,
                            city: member.city,
                            barangay: member.barangay
                        },
                        userDetails: {
                            firstName: user?.firstName || 'Unknown',
                            lastName: user?.lastName || 'User',
                            email: user?.email
                        },
                        statistics: {
                            totalEarnings,
                            commission: totalEarnings * 0.10,
                            directReferralEarnings,
                            transactionCount: memberTransactions.length,
                            lastTransaction: memberTransactions.length > 0
                                ? memberTransactions[memberTransactions.length - 1].createdAt
                                : null
                        },
                        children
                    };
                }));

                return referrals;
            };

            const tree = await buildTree(member.referralCode);

            const calculateTreeStats = (referrals) => {
                let stats = {
                    totalMembers: 0,
                    totalEarnings: 0,
                    totalCommissions: 0,
                    totalDirectReferralEarnings: 0,
                    totalEarningsWithCommissionAndDirectReferral: 0,
                    activeMembers: 0,
                    memberTypes: {},
                    levelCounts: {}
                };

                const processNode = (node) => {
                    stats.totalMembers++;
                    stats.totalEarnings += node.statistics.totalEarnings;
                    stats.totalCommissions += node.statistics.commission;
                    stats.totalDirectReferralEarnings += node.statistics.directReferralEarnings;
                    stats.totalEarningsWithCommissionAndDirectReferral +=
                        node.statistics.totalEarnings +
                        node.statistics.commission +
                        node.statistics.directReferralEarnings;

                    if (node.status === 'Active') stats.activeMembers++;
                    stats.memberTypes[node.memberType] = (stats.memberTypes[node.memberType] || 0) + 1;
                    stats.levelCounts[node.level] = (stats.levelCounts[node.level] || 0) + 1;

                    if (node.children) {
                        node.children.forEach(processNode);
                    }
                };

                referrals.forEach(processNode);
                return stats;
            };

            const treeStats = calculateTreeStats(tree);

            return response.status(200).json({
                success: true,
                message: "Referral tree retrieved successfully",
                data: {
                    memberInfo: {
                        _id: member._id,
                        memberId: member.memberID,
                        referralCode: member.referralCode,
                        memberType: member.memberType,
                        status: member.memberStatus,
                        memberDate: member.memberDate,
                        role: member.role,
                        location: {
                            addressNo: member.addressNo,
                            province: member.province,
                            city: member.city,
                            barangay: member.barangay
                        }
                    },
                    referralTree: tree,
                    statistics: treeStats
                }
            });

        } catch (error) {
            console.error("Error retrieving referral tree:", error);
            return response.status(500).json({
                success: false,
                message: "Error retrieving referral tree",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
