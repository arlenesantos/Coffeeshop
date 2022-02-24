//file system
const fs = require("fs");

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

//express-fileupload
const expressFileUpload = require("express-fileupload");


//classes
const { Category } = require("./classes/category");
const { Brand } = require("./classes/brand");
const { Product } = require("./classes/product");
const { Store } = require("./classes/store");
const { Customer } = require("./classes/customer");
const { Recipe } = require("./classes/recipe");


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

app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
}));
app.use(flash({ sessionKeyName: 'flashMessage' }));

//express-fileupload
app.use(
    expressFileUpload({
        limits: { fileSize: 5000000 },
        abortOnLimit: true,
        responseOnLimit: "The weight of the file you are trying to upload exceeds the allowed limit",
    })
);

//public directories
app.use(express.static(__dirname + "/assets"));
app.use('/css', express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use('/js', express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use('/icons', express.static(__dirname + "/node_modules/bootstrap-icons/font"));
app.use('/ckeditor', express.static(__dirname + "/node_modules/@ckeditor/ckeditor5-build-classic/build"));

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
});

//Customer
app.get("/admin/customers", async (req, res) => {
    try {
        let customers = await Customer.all();
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');
        res.render("admin-customers", {customers: customers, success: successMsg, error: errorMsg});
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/customers");        
    }
});

app.post("/api/admin/customers", async (req, res) => {
    try {
        let { name, address, city, state, zip_code, phone, email, password } = req.body;
        let customer = new Customer( null, name, address, city, state, zip_code, phone, email, password);        
        await customer.save();
        await req.flash('success', 'Customer registered successfully!');
        res.redirect("/admin/customers");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/customers");        
    }
});

app.put("/api/admin/customers", async (req, res) => {
    try {
        let { id, name, address, city, state, zip_code, phone, email, password } = req.body;
        let customer = await Customer.find(id);        
        customer.setName(name);
        customer.setAddress(address);
        customer.setCity(city);
        customer.setState(state);
        customer.setZipCode(zip_code);
        customer.setPhone(phone);
        customer.setEmail(email);        
        customer.setPassword(password);        
        await customer.update();
        await req.flash('success', 'Customer updated successfully!');
        res.redirect("/admin/customers");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/customers");         
    }
});

app.delete("/api/admin/customers", async(req, res) => {
    try {
        let { id } = req.body;
        let customer = await Customer.find(id);
        await customer.delete();
        await req.flash('success', 'Customer deleted successfully!');
        res.redirect("/admin/customers");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/customers");        
    }
});

//Recipe
app.get("/admin/recipes", async (req, res) => {
    try {        
        let recipes = await Recipe.all();             
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');
        //let user = await getSessionUser();
        //enviar dados {user: user}
        res.render("admin-recipes", {recipes: recipes, success: successMsg, error: errorMsg});
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/recipes");        
    }
});

app.post("/api/admin/recipes", async (req, res) => {
    try {
        let { title, content, customer_id } = req.body;
        let customer = await Customer.find(customer_id);
        let recipe = new Recipe( null, title, content, false, customer);
        await recipe.save();
        
        if (req.files === null) {
            fs.copyFile(`${__dirname}/assets/images/recipe-std.jpg`, `${__dirname}/assets/images/recipes/${recipe.id}.jpeg`, (error) => console.log(error));
                       
        } else {
            let { photo } = req.files;
            photo.mv(`${__dirname}/assets/images/recipes/${recipe.id}.jpeg`, (error) => {
                if (error) {
                    console.log(error);
                    return error
                }
            });
        };                
        await req.flash('success', 'Recipe registered successfully!');
        res.redirect("/admin/recipes");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/recipes");        
    }
});

app.put("/api/admin/recipes", async (req, res) => {
    try {
        let { id, title, content } = req.body;
        let recipe = await Recipe.find(id);        
        recipe.setTitle(title);
        recipe.setContent(content); 
        await recipe.update();

        if (req.files === null) {
            console.log("No changes to photos");          
                       
        } else {
            let { photo }  = req.files;
            photo.mv(`${__dirname}/assets/images/recipes/${recipe.id}.jpeg`, (error) => {
                if (error) {
                    console.log(error);
                    return error
                }
            });
        };    

        await req.flash('success', 'Recipe updated successfully!');
        res.redirect("/admin/recipes");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/recipes");         
    }
});

app.delete("/api/admin/recipes", async(req, res) => {
    try {
        let { id } = req.body;
        let recipe = await Recipe.find(id);
        await recipe.delete();
        await req.flash('success', 'Recipe deleted successfully!');
        res.redirect("/admin/recipes");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/recipes");        
    }
});

app.get("/admin/recipes/review", async (req, res) => {
    try {    
        let { id } = req.query;            
        let recipe = await Recipe.find(id);                  
        let successMsg = await req.consumeFlash('success');
        let errorMsg = await req.consumeFlash('error');
        //let user = await getSessionUser();
        //enviar dados {user: user}
        res.render("recipes-review", {recipe: recipe, success: successMsg, error: errorMsg});
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/admin/recipes");        
    }
});

app.put("/api/admin/recipes/approve", async (req, res) => {
    try {
        let { id, approved } = req.body;
        let recipe = await Recipe.find(id);
        recipe.setApproved(approved);
        await recipe.update();
        await req.flash('success', 'Recipe updated successfully!');
        res.redirect("/admin/recipes");
        
    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong');
        res.redirect("/admin/recipes");         
    }
});



