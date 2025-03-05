import { goldenseats } from "../models/golden-seats.js";
import { MemberTransaction } from "../models/member-transactions.js";
import { Member } from "../models/Member.js";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";

export const GetAllTransaction = async (request, response) => {
  try {
    // Validate token
    const token = request.cookies.token;
    if (!token) {
      return response
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return response
        .status(403)
        .json({ success: false, message: "Invalid token" });
    }

    // Fetch transactions for the authenticated user
    const transactions = await MemberTransaction.find({
      memberId: decoded.userId,
    });

    // Fetch user data
    const user = await User.findById(decoded.userId).select(
      "firstName lastName"
    );

    if (!user) {
      return response
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Attach user details to transactions
    const transactionsWithUser = transactions.map((txn) => ({
      ...txn.toObject(), // Convert Mongoose document to plain object
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }));

    // Return transactions with user data
    response
      .status(200)
      .json({ success: true, transactions: transactionsWithUser });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    response.status(500).json({ success: false, message: "Server error" });
  }
};

export const GoldenSeatsCommissions = async (request, response) => {
  try {
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
    const existingMember = await Member.findOne({
      memberID: memberGoldenSeater,
    });
    if (existingMember) {
      const position = existingMember.memberType;
      if (position === "e-Captain") {
        console.log(existingMember.barangay);
        const spot = existingMember.barangay;

        const goldenSeatersSpot = await goldenseats.find({
          captain: spot,
        });

        // Summing up all commissions
        const totalCommission = goldenSeatersSpot.reduce(
          (sum, seat) => sum + (seat.commission || 0),
          0
        );
        response
          .status(200)
          .json({
            success: true,
            totalCommission: totalCommission,
            spot: spot,
            position: position,
          });
      }
      if (position === "e-Mayor") {
        console.log(existingMember.city);
        const spot = existingMember.city;

        const goldenSeatersSpot = await goldenseats.find({
          mayor: spot,
        });
        console.log(goldenSeatersSpot.commission);
        // Summing up all commissions
        const totalCommission = goldenSeatersSpot.reduce(
          (sum, seat) => sum + (seat.commission || 0),
          0
        );
        response
          .status(200)
          .json({
            success: true,
            totalCommission: totalCommission,
            spot: spot,
            position: position,
          });
      }
      if (position === "e-Governor") {
        console.log(existingMember.province);
        const spot = existingMember.province;
  
        const goldenSeatersSpot = await goldenseats.find({
          governor: spot,
        });
        console.log(goldenSeatersSpot.commission);
        // Summing up all commissions
        const totalCommission = goldenSeatersSpot.reduce(
          (sum, seat) => sum + (seat.commission || 0),
          0
        );
        response
          .status(200)
          .json({
            success: true,
            totalCommission: totalCommission,
            spot: spot,
            position: position,
          });
      }
      if (position === "e-Senator") {
        console.log(existingMember.region);
        const spot = existingMember.region;
  
        const goldenSeatersSpot = await goldenseats.find({
          senator: spot,
        });
        console.log(goldenSeatersSpot.commission);
        // Summing up all commissions
        const totalCommission = goldenSeatersSpot.reduce(
          (sum, seat) => sum + (seat.commission || 0),
          0
        );
        response
          .status(200)
          .json({
            success: true,
            totalCommission: totalCommission,
            spot: spot,
            position: position,
          });
      }
      if (position === "e-Vice President") {
        const spot = "Philippines";
  
        const goldenSeatersSpot = await goldenseats.find({
            vicePresident: spot,
        });
        // Summing up all commissions
        const totalCommission = goldenSeatersSpot.reduce(
          (sum, seat) => sum + (seat.commission || 0),
          0
        );
        response
          .status(200)
          .json({
            success: true,
            totalCommission: totalCommission,
            spot: spot,
            position: position,
          });
      }
      if (position === "e-President") {
        const spot = "Philippines";
  
        const goldenSeatersSpot = await goldenseats.find({
            President: spot,
        });
        // Summing up all commissions
        const totalCommission = goldenSeatersSpot.reduce(
          (sum, seat) => sum + (seat.commission || 0),
          0
        );
        response
          .status(200)
          .json({
            success: true,
            totalCommission: totalCommission,
            spot: spot,
            position: position,
          });
      }
    }
  } catch (error) {}
};
