//express
const express  = require("express");
const app = express();

//handlebars
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");

//classes
const { Category } = require("./classes/category");

//integrations:
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.engine(
    "hbs",
    exphbs.engine({
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        defaultLayout: "main",
        layoutsDir:`${__dirname}/views/main`,
        extname: "hbs",
    })
);
app.set("view engine", "hbs");

//public directory
app.use(express.static(__dirname + "/assets"));
app.use('/css', express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use('/js', express.static(__dirname + "/node_modules/bootstrap/dist/js"));


app.listen(3000, () => console.log("server on"));

app.get("/", async (req, res) => {
    try {
        res.render("home", { layout: false });
        
    } catch (error) {
        res.status(500).send({error: error, code: 500});        
    }
});

app.get("/products", async (req, res) => {
    try {
        let category = await Category.all();
        res.render("products", {category: category});
        
    } catch (error) {  
        console.log("entrou index")      
        res.status(500).send({error: error, code: 500});        
    }
});

