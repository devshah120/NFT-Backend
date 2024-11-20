import bodyParser from "body-parser";
import dotenv from "dotenv"; 
import userrouter from './routes/user.js';  
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import connectDB from "./db/index.js";
import { app, server } from "./socket/index.js";

dotenv.config({ path: './config/.env' });

const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(bodyParser.json());

// Connect to Database
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nft_uploads", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Allowed file formats
    public_id: (req, file) => `${Date.now()}-${file.originalname}` // Unique file name
  },
});

const upload = multer({ storage });

// User Routes
app.use('/api/user', userrouter);

// NFT Upload Route
app.post("/api/nft/upload", upload.single("Image"), (req, res) => {
  console.log(req.file);
  res.json({ imageUrl: req.file.path }); // Cloudinary URL of the uploaded file
});
