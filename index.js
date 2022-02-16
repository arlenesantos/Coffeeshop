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
const path = require('path');
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
const { Brand } = require("./classes/brand");
const { Product } = require("./classes/product");
const { Store } = require("./classes/store");
const { type } = require("express/lib/response");
const { add } = require("nodemon/lib/rules");



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

app.post("/api/admin/categories", async (req, res) => {
    try {
        //token
        let { name } = req.body;
        let category = new Category(null, name);
        await category.save();
        await req.flash('success', 'Category created successfully!');
        res.redirect("/admin/categories");
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/categories");

    }
});

app.put("/api/admin/categories", async (req, res) => {
    try {
        //token
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

app.delete("/api/admin/categories", async (req, res) => {
    try {
        //token
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

//Brand
app.get("/admin/brands", async (req, res) => {
    try {
        //check session login
        let brands = await Brand.all();
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');               
        res.render("admin-brands", {brands: brands , success: successMsg , error: errorMsg});
        
    } catch (error) {
        console.log(error);               
    }
});

app.post("/api/admin/brands", async (req, res) => {
    try {
        //check
        let { name } = req.body;
        let brand = new Brand(null, name);
        await brand.save();
        await req.flash('sucess', 'Brand created successfully!');
        res.redirect("/admin/brands");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Somenthing went wrong.');
        res.redirect("/admin/brands");        
    }
});

app.put("/api/admin/brands", async (req, res) => {
    try {
        let { id, name } = req.body;
        let brand = await Brand.find(id);
        await brand.setName(name);
        await brand.update();
        await req.flash('success' , 'Brand updated successfully!');
        res.redirect("/admin/brands");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/brands");        
    }
});

app.delete("/api/admin/brands" , async (req, res) => {
    try {
        let { id } = req.body;
        let brand = await Brand.find(id);        
        await brand.delete();
        await req.flash('success', 'Brand deleted successfully!');
        res.redirect("/admin/brands");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/brands");        
    }

});

//Product
app.get("/admin/products", async (req, res) => {
    try {
        let products = await Product.all();
        let categories = await Category.all();
        let brands = await Brand.all();        
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');
        res.render("admin-products", {products: products, categories: categories, brands: brands, success: successMsg, error: errorMsg });        
        
    } catch (error) {
        console.log(error);        
    }

});

app.post("/api/admin/products", async (req, res) => {
    try {
        let { name, price, category_id, brand_id } = req.body;
        let category = await Category.find(category_id);
        let brand = await Brand.find(brand_id);
        let product = new Product(null, name, price, category, brand);              
        await product.save();
        await req.flash('success' , 'Product created successfully!');
        res.redirect("/admin/products");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/products");        
    }

});

app.put("/api/admin/products", async (req, res) => {
    try {
        let { id, name, price, category_id, brand_id } = req.body;
        let category = await Category.find(category_id);
        let brand = await Brand.find(brand_id);
        let product = await Product.find(id);
        product.setName(name);
        product.setPrice(price);
        product.setCategory(category);
        product.setBrand(brand);
        await product.update();
        await req.flash('success', 'Product updated successfully!');
        res.redirect("/admin/products"); 
        
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong.');
        res.redirect("/admin/products");
        
    }
});

app.delete("/api/admin/products", async(req, res) => {
    try {
        let { id } = req.body;        
        let product = await Product.find(id);
        await product.delete();
        await req.flash('success', 'Product deleted successfully!');
        res.redirect("/admin/products");  
        
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong.');
        res.redirect("/admin/products");        
    }

});

//Stores
app.get("/admin/stores", async (req, res) => {
    try {
        let stores = await Store.all();
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');
        res.render("admin-stores", {stores: stores, success: successMsg, error: errorMsg});
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/stores");        
    }
});

app.post("/api/admin/stores", async (req, res) => {
    try {
        let { name, address, city, state, zip_code, phone, email } = req.body;
        let store = new Store( null, name, address, city, state, zip_code, phone, email);
        await store.save();
        await req.flash('success', 'Store created successfully!');
        res.redirect("/admin/stores");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/stores");        
    }
});

app.put("/api/admin/stores", async (req, res) => {
    try {
        let { id, name, address, city, state, zip_code, phone, email } = req.body;
        let store = await Store.find(id);        
        store.setName(name);
        store.setAddress(address);
        store.setCity(city);
        store.setState(state);
        store.setZipCode(zip_code);
        store.setPhone(phone);
        store.setEmail(email);        
        await store.update();
        await req.flash('success', 'Store updated successfully!');
        res.redirect("/admin/stores");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/stores");         
    }
});

app.delete("/api/admin/stores", async(req, res) => {
    try {
        let { id } = req.body;
        let store = await Store.find(id);
        await store.delete();
        await req.flash('success', 'Store deleted successfully!');
        res.redirect("/admin/stores");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/stores");        
    }
})

