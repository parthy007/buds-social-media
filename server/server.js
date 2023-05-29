import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { register } from './controllers/auth.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js'; 
import postRoutes from "./routes/posts.js";
import { verifytoken } from './middleware/auth.js';
import { createPost } from './controllers/posts.js';
import User from './models/User.js';
import Post from './models/Post.js';
import { users, posts } from "./data/index.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();


/* CONFIGURATION */
app.use(express.json({limit: "50mb"}));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "50mb", extended : true, parameterLimit: 100000}));
app.use(bodyParser.urlencoded({ limit: "50mb", extended : true, parameterLimit: 100000}));
app.use(cors({
  origin: "http://localhost:3000",
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204); //  No Content response for the /favicon.ico route
});


/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets"); 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
});
const upload = multer({storage, limits: { fileSize: 50 * 1024 * 1024 }});

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", upload.single("picture"), verifytoken, createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/*MONGOOSE SETUP*/
const PORT = process.env.PORT || 6001;


mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    app.listen(PORT, ()=> console.log(`Server Port: ${PORT}`));
    
    // /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((error)=> console.log(`${error} did not connect`));





