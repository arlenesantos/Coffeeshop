//express
const express = require("express");
const app = express();

//override method
const methodOverride = require('method-override');

//handlebars
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");

//session
var session = require('express-session');

//flash
//const path = require('path');
const { flash } = require('express-flash-message');


app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
}));
app.use(flash({ sessionKeyName: 'flashMessage' }));

//classes
const { Category } = require("./classes/category");
const { type } = require("express/lib/response");

//integrations:
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(methodOverride('_method'));

app.engine(
    "hbs",
    exphbs.engine({
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/main`,
        extname: "hbs",        
    })
);
app.set("view engine", "hbs");

//public directory
app.use(express.static(__dirname + "/assets"));
app.use('/css', express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use('/js', express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use('/icons', express.static(__dirname + "/node_modules/bootstrap-icons/font"));

app.listen(3000, () => console.log("server on"));

app.get("/", async (req, res) => {
    try {
        res.render("home", { layout: false });

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

app.get("/products", async (req, res) => {
    try {
        res.render("products");

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});


//private pages

// Category 
app.get("/admin/categories", async (req, res) => {
    try {
        //check session login
        let categories = await Category.all();
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');
        res.render("admin-categories", { categories: categories, success: successMsg, error: errorMsg });

    } catch (error) {
        console.log(error);
    }
});

app.post("/admin/categories", async (req, res) => {
    try {
        //check session login
        let { name } = req.body;
        let category = new Category(null, name);
        await category.save();
        await req.flash('success', 'Category creted successfully!');
        res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/categories");

    }
});

app.put("/admin/categories", async (req, res) => {
    try {
        let { id, name } = req.body;
        let category = await Category.find(id);
        await category.setName(name);
        await category.update();
        await req.flash('success', 'Category updated successfully!');
        res.redirect("/admin/categories");

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/categories");
    }
});

app.delete("/admin/categories", async (req, res) => {
    try {
        let { id } = req.body;
        let category = await Category.find(id);
        await category.delete();
        await req.flash('success', 'Category deleted successfully!');
        res.redirect("/admin/categories");

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/categories");
    }
});


