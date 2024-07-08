const port = 4000; // Define the port number for the server
const express = require("express"); // Import express framework
const app = express(); // Create an express application
const mongoose = require("mongoose"); // Import mongoose for MongoDB interaction
const jwt = require("jsonwebtoken"); // Import JSON Web Token for authentication
const multer = require("multer"); // Import multer for file upload handling
const path = require("path"); // Import path for handling file paths
const cors = require("cors"); // Import CORS for cross-origin resource sharing
const { response } = require("express"); // Import response from express for handling responses

app.use(express.json()); // Use express JSON middleware to parse JSON request bodies
app.use(cors()); // Use CORS middleware to allow cross-origin requests

// Database connection with MongoDB
mongoose.connect("mongodb+srv://jktungno:jktungno1@cluster0.ksnqxqr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/ecommerce");

// API Creation
app.get("/", (req, res) => {
    res.send("Express App is running"); // Define a route that sends a simple message
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images', // Set the destination directory for uploaded images
    filename: (req, file, cb) => {
        return cb(null, `${file.filename}_${Date.now()}${path.extname(file.originalname)}`); // Set the filename with a timestamp
    }
});

const upload = multer({ storage: storage }); // Configure multer with the storage engine

// Creating Upload Endpoint for images
app.use('/images', express.static('upload/images')); // Serve images statically

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}` // Respond with the image URL
    });
});

// Schema for creating products
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

// Endpoint to add a product
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({}); // Get all products
    let id;
    if (products.length > 0) {
        let last_product_array = products.slice(-1); // Get the last product
        let last_product = last_product_array[0];
        id = last_product.id + 1; // Set the new product ID
    } else {
        id = 1; // If no products, set ID to 1
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save(); // Save the product to the database
    console.log("Saved");
    res.json({
        success: true,
        name: req.body.name,
    });
});

// Endpoint to delete a product
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id }); // Find and delete the product by ID
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    });
});

// Endpoint to get all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({}); // Get all products from the database
    console.log("All products fetched");
    res.send(products);
});

// Schema for creating users
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Endpoint to register a user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email }); // Check if user already exists
    if (check) {
        return res.status(400).json({ success: false, errors: "existing user found with the same email address" });
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0; // Initialize cart with 300 items set to 0
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save(); // Save the user to the database

    const data = {
        user: {
            id: user.id
        }
    };

    const token = jwt.sign(data, 'secret_ecom'); // Create a JWT token
    res.json({ success: true, token });
});

// Endpoint to login a user
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email }); // Find user by email
    if (user) {
        const passCompare = req.body.password === user.password; // Compare passwords
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, 'secret_ecom'); // Create a JWT token
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
});

// Endpoint to get new collection data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({}); // Get all products
    let newcollection = products.slice(1).slice(-8); // Get the latest 8 products excluding the first one
    console.log("NewCollection Fetch");
    res.send(newcollection);
});

// Endpoint to get popular products in women's section
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" }); // Find products in women's category
    let popular_in_women = products.slice(0, 4); // Get the first 4 products
    console.log("Popular in women fetched");
    res.send(popular_in_women);
});

// Middleware to fetch user based on JWT token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token'); // Get the token from the header
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom'); // Verify the token
            req.user = data.user; // Attach user data to the request
            next();
        } catch (error) {
            res.status(401).send({ errors: "Please authenticate using a valid token" });
        }
    }
};

// Endpoint to add product to user's cart
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log("Added", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id }); // Find the user
    userData.cartData[req.body.itemId] += 1; // Increment the product quantity in the cart
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData }); // Update the user's cart
    res.send("Added");
});

// Endpoint to remove product from user's cart
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id }); // Find the user
    if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1; // Decrement the product quantity if greater than 0
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData }); // Update the user's cart
    res.send("Removed");
});

// Endpoint to get user's cart data
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("GetCart");
    let userData = await Users.findOne({ _id: req.user.id }); // Find the user
    res.json(userData.cartData); // Respond with the cart data
});

// Start the server and listen on the defined port
app.listen(port, (error) => {
    if (!error) {
        console.log("Server running on port " + port); // Log server start
    } else {
        console.log("Error : " + error); // Log any errors
    }
});
