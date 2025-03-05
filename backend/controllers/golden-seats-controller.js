import { goldenseats } from "../models/golden-seats.js";

export const getAllGoldenSeaters = async (request, response) => {
    try {
        const members = await goldenseats.find();
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
