const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const path = require('path')
const bcryptjs = require('bcryptjs')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const methodOverride = require('method-override')
const axios = require('axios')

const userModel = require('./models/userModel')
const productModel = require('./models/productModel')
const productRouter = require('./routes/productRoute')
const { isAuthenticated, authorizationAdmin } = require('./middleware/auth')

dotenv.config()

const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGO_URL

const app = express()

const ONE_HOUR = 60 * 60 * 1000
const expire = new Date(Date.now() + 24 * ONE_HOUR)

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.set("views", __dirname + "/views")
app.set("view engine", "ejs")

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: expire,
    },
    store: MongoStore.create({ mongoUrl })
}))

app.use('/api/products', productRouter)
app.use('/home', isAuthenticated)
app.use('/homeRu', isAuthenticated)
app.use('/products', isAuthenticated)
app.use('/productsRu', isAuthenticated)

app.get('/', (req, res) => {
    res.render('login', { user: 'User' })
})

app.post('/loginUser', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username });

        if (!user) {
            return res.render('login', { user: "User", error: 'Invalid username or password!' })
        }

        const validPassword = await bcryptjs.compare(password, user.password)
        if (!validPassword) {
            return res.render('login', { user: "User", error: 'Invalid username or password!' })
        }

        req.session.username = username
        res.redirect('/home')
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username });
        if (user) return res.status(400).json("User already exists...");

        user = new userModel({
            username,
            password,
            isAdmin: false
        });

        if (!username || !password)
            return res.status(400).json("All fields are required...");

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);

        await user.save();

        req.session.username = username
        res.redirect('/home')
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

app.get('/admin', (req, res) => {
    res.render("login", { user: 'Admin' })
})

app.post('/loginAdmin', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username: username });

        if (!user) {
            return res.render('login', { user: "Admin", error: 'Invalid username or password!' })
        }
        const validPassword = await bcryptjs.compare(password, user.password)
        if (!validPassword) {
            return res.render('login', { user: "Admin", error: 'Invalid username or password!' })
        } else if (!user.isAdmin) {
            return res.render('login', { user: "Admin", error: 'Not an admin!' })
        }

        req.session.username = username;
        res.redirect('/adminPanel');
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
})

app.get('/adminPanel', async (req, res) => {
    try {
        const user = req.session.username
        if (!user) {
            return res.redirect('/admin')
        }
        const products = await productModel.find();
        res.render('admin', { username: user, products: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.get('/home', async (req, res) => {
    const username = req.session.username
    res.render('index', { username: username})
})

app.get('/homeRu', async (req, res) => {
    const username = req.session.username
    res.render('indexRu', {username: username})
})

app.get('/products', async (req, res) => {
    const username = req.session.username
    const products = await productModel.find()
    res.render('products', { username: username, products: products })
})

app.get('/productsRu', async (req, res) => {
    const username = req.session.username
    let products = await productModel.find()
    let productsRu = []

    const options = {
        method: 'GET',
        url: 'https://currency-converter5.p.rapidapi.com/currency/convert',
        params: {
            format: 'json',
            from: 'USD',
            to: 'RUB',
            amount: 1
        },
        headers: {
            'X-RapidAPI-Key': 'c00a089dd5mshff0fa7579cd0999p162f59jsn3428c6ae7352',
            'X-RapidAPI-Host': 'currency-converter5.p.rapidapi.com'
        }
    }

    let currency = await axios.request(options)
    currency = currency.data.rates.RUB.rate_for_amount
    const translationPromises = products.map(async (p, index) => {
        try {
            let response = await axios.post(
                'https://translation.googleapis.com/language/translate/v2?key=AIzaSyAhXQ8SClcDvYZZz2-t98ze0TRvHFt0kdU',
                { q: `${p.name}; ${p.description}`, target: 'ru' }
            )

            let translation = response.data.data.translations[0].translatedText.split('; ')

            let prod = {
                name: translation[0],
                price: Math.round(p.price * currency),
                description: translation[1],
                image: p.image
            }

            return prod
        } catch (error) {
            console.error('Translation error:', error)
            throw error
        }
    })

    try {
        productsRu = await Promise.all(translationPromises)
        res.render('productsRu', { username: username, products: productsRu })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).send('Internal Server Error')
    }
})

app.listen(port, () => {
    console.log('server is running on port ' + port);
});

mongoose.connect(mongoUrl)
    .then(() => console.log("MongoDB connection established..."))
    .catch((error) => console.error("MongoDB connection failed:", error.message));

