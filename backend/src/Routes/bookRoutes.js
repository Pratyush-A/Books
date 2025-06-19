import express from 'express';
import cloudinary from '../lib/cloudinary.js'; 
import Book from '../models/Book.js';
import protectRoute from '../middleware/auth.middleware.js';
import "dotenv/config";

const router = express.Router();

// ✅ CREATE Book (POST /api/books)
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;

    if (!title || !caption || !image || rating === undefined) {
      return res.status(400).json({ message: "All fields are required including rating" });
    }

    // ✅ Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image,{resource_type: "image"});
    const imageUrl = uploadResponse.secure_url;

    // ✅ Save book to DB
    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id
    });

    await newBook.save();
    res.status(201).json({ newBook });

  } catch (error) {
    console.log("Error during book creation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET Books (with pagination)
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalBooks,
      totalPages:Math.ceil(totalBooks/limit)
    });

  } catch (error) {
    console.log("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET Logged-in User's Books
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ DELETE Book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this book" });
    }

    // ✅ Delete image from Cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Cloudinary image delete error:", deleteError);
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });

  } catch (error) {
    console.log("Error deleting book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
