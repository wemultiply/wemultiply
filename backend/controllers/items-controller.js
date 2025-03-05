import { Item } from "../models/item.js";
import multer from "multer";
import path from "path";
import jwt from 'jsonwebtoken'

// Set up multer to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./backend/uploads/"); // Folder where images will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
});

const upload = multer({ storage });

// Create a new item
export const CreateItem = async (req, res) => {
    // Use multer to handle the uploaded image
    const uploadSingleImage = upload.single("image"); // "image" is the field name in the form

    uploadSingleImage(req, res, async (err) => {
        if (err) {
            console.log("Error during image upload:", err); // Log the error to the console
            return res.status(400).json({ message: "Error uploading image: " + err.message });
        }

        const { name, price, description, category, inStock, memberId } = req.body;

        // Ensure the image is uploaded and file exists
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save image URL if file exists

        // Check if all required fields are present
        if (!name || !price || !description || !category || !inStock || !memberId || !imageUrl) {
            console.log("All fields are required");
            return res.status(400).json({ message: 'All fields are required' });
        }

        try {
            // Prepare the item object, including the image URL
            const item = new Item({
                name,
                price,
                description,
                category,
                inStock,
                memberId,
                imageUrl, // Save image URL
            });

            // Save the item to the database
            const newItem = await item.save();
            res.status(201).json(newItem); // Return the newly created item

        } catch (err) {
            console.log("Error saving item:", err); // Log the error to the console
            res.status(400).json({ message: err.message });
        }
    });
};



// // Get all items
export const fetchItems = async (req, res) => {
    try {
        // Retrieve the token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing.',
            });
        }

        // Verify the token to decode the user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch items that belong to the decoded memberId
        const items = await Item.find({ memberId: decoded.userId });

        res.json({
            success: true,
            data: items,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// // Get a single item by ID
// router.get('/:id', getItem, (req, res) => {
//     res.json(res.item);
// });

// // Update an item by ID

export const updateItems = async (req, res) => {
    try {
        // Find the item by ID
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update fields
        if (req.body.name != null) {
            item.name = req.body.name;
        }
        if (req.body.description != null) {
            item.description = req.body.description;
        }

        // If an image is uploaded, handle that too
        if (req.files && req.files.image) {
            item.image = req.files.image.name; // assuming you're saving the filename in the database
        }

        // Save the updated item
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// // Delete an item by ID
// router.delete('/:id', getItem, async (req, res) => {
//     try {
//         await res.item.remove();
//         res.json({ message: 'Deleted Item' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // Middleware to get item by ID
// async function getItem(req, res, next) {
//     let item;
//     try {
//         item = await Item.findById(req.params.id);
//         if (item == null) {
//             return res.status(404).json({ message: 'Cannot find item' });
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
//     res.item = item;
//     next();
// }

