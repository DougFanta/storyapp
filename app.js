const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const passport = require('passport')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const sesion = require('express-session')
const MongoStore = require('connect-mongo')(sesion)
const session = require('express-session')


//Load config

dotenv.config({ path: './config/config.env' })

//Passport config

require('./config/passport')(passport)

connectDB()

const app = express()

//Body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

//Method override
app.use(methodOverride((req, res) => {
    if(req.body && typeof req.body ==='object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

// Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')


//Handlebars
app.engine('.hbs', exphbs({ helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select 
}, 
defaultLayout: 'main', extname:'.hbs' }))

app.set('view engine', '.hbs')

//Sessions 
app.use(session({
    secret:  'olho de agamoto',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
   
}))

//Passport midlleware
app.use(passport.initialize())
app.use(passport.session())

//Set Global var
app.use(function(req, res, next){
    res.locals.user = req.user || null
    next()
})

//Static folderconst 
app.use(express.static(path.join(__dirname, 'public')))


//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`))