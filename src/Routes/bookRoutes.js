import express from 'express';
import cloudinary from '../lib/cloudinary.js'; 
import Book from '../models/Book.js'; // Assuming you have a Book model defined
import protectRoute from '../middleware/auth.middleware.js'; // Assuming you have an authentication middleware
import "dotenv/config"; // Ensure you have dotenv configured to load environment variables
const router = express.Router();

router.post("/",protectRoute, async (req, res) => {
    try{
        const { title,caption,image} = req.body;
        if(!title || !caption || !image){
            return res.status(400).json({message: "All fields are required"});
        }

        //upload the image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        //Save to database
        const newBook = new Book({
            title,
            caption,
            image: imageUrl,
            user: req.user._id // Assuming you have user authentication and req.user is set
        });
        await newBook.save();
        res.status(201).json({newBook});
    }
    catch(error){
        console.log("Error during book creation:", error);
        res.status(500).json({message: "Internal server error"});
    }
});



//pagination => infinite loading


router.get("/", protectRoute, async (req, res) => {

    //example call from react
    // const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
    try{

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profileImage'); // Assuming you want to populate user details
        const totalBooks= await Book.countDocuments();
        res.send({
            books,
            currentPage:page, 
            totalBooks,

        });
    }
    catch(error){
        console.log("Error fetching books:", error);
        res.status(500).json({message: "Internal server error"});
    }
});

router.get("/user",protectRoute, async (req, res) => {
    try{
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    }
    catch(error){
        console.error("Error fetching user books:", error.message);
        res.status(500).json({message: "Internal server error"});
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({message: "Book not found"});
        }
        //check if user is the creator of the book
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "You are not authorized to delete this book"});
        } 

        //delete the image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId = book.image.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId);
            }
            catch(deleteError){
                console.log("Error deleting image from cloudinary:", deleteError);
            }
        }

        await book.deleteOne();
        res.json({message: "Book deleted successfully"});
    }
    catch(error){
        console.log("Error deleting book:", error);
        res.status(500).json({message: "Internal server error"});
    }
});

export default router;