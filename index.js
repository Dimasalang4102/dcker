const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const redis = require('redis')
const cors = require('cors')
const app = express()
const {
	MONGO_USER,
	MONGO_PASSWORD,
	MONGO_IP,
	MONGO_PORT,
	REDIS_URL,
	REDIS_PORT,
	SESSION_SECRET
} = require("./config/config")

let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
	host: REDIS_URL,
	port: REDIS_PORT
})



const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`


const connectWithRetry = () => {
	mongoose
		.connect(mongoURL)
		.then(() => console.log("successfully connected to DB"))
		.catch((e) => {
			console.log(e)
			setTimeout(connectWithRetry, 5000)
		})
}
connectWithRetry()

app.enable("trust proxy")
app.use(cors({}))

app.get('/api/v1', (req, res) => {
	res.send("<h2>Hi There!!!</h2>")
	console.log("yeah it ran.")
})

app.use(session({
	store: new RedisStore({ client: redisClient }),
	secret: SESSION_SECRET,
	cookie: {
		secure: false,
		resave: false,
		saveUninitialized: false,
		httpOnly: true,
		maxAge: 30000
	}
}))
app.use(express.json())
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}...`))
