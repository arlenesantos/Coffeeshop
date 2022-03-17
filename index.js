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
const { Login } = require("./classes/login");



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
        helpers: {
            eachRow: function (data, numColumns, options) {
                let result = "";
                for (var i = 0; i < data.length; i += numColumns) {
                    result += options.fn({
                        columns: data.slice(i, i + numColumns),
                        first: i == 0 ? true : false,
                    });
                }
                return result
            },
            inc: (value) => {
                return parseInt(value) + 1;
            },
            dec: (value) => {
                return parseInt(value) - 1;
            },
        },
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

//PUBLIC PAGES:

app.get("/", async (req, res) => {
    try {
        let categories = await Category.all();
        res.render("index", { layout: "home", categories: categories });

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});

app.get("/products/category", async (req, res) => {
    try {
        let { id } = req.query;
        let stores = await Store.all();
        let categories = await Category.all();
        let category = await Category.find(id);
        let products = await category.getProducts();
        res.render("categories", { stores: stores, categories: categories, category: category, products: products });

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});

app.get("/products/product", async (req, res) => {
    try {
        let { id } = req.query;
        let product = await Product.find(id);
        let similarProducts = await product.category.getProducts();
        let productStock = await product.checkStock();
        res.render("product", { product: product, similarProducts: similarProducts, productStock: productStock });

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});

app.get("/recipes", async (req, res) => {
    try {
        let recipes = await Recipe.all();
        let approvedRecipes = recipes.filter((r) => r.approved);
        res.render("recipes", { approvedRecipes: approvedRecipes });

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});

app.get("/recipes/recipe", async (req, res) => {
    try {
        let { id } = req.query;
        let recipe = await Recipe.find(id);
        res.render("recipe", { recipe: recipe });

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});


//login:
app.get("/login", async (req, res) => {
    try {
        if (req.session.logged_in && req.session.customer) {
            res.redirect("/customer");

        } else {
            let warningMsg = await req.consumeFlash('warning');
            let errorMsg = await req.consumeFlash('error');
            res.render("login", { warning: warningMsg, error: errorMsg });
        }

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});

app.post("/login", async (req, res) => {
    try {
        let { login, register, email, password } = req.body;

        if (login) {
            let admin = await Login.isAdmin(email, password);
            let customer = await Login.isCustomer(email, password);

            if (admin) {
                req.session.logged_in = true;
                req.session.admin = admin;
                req.session.save();
                res.redirect("/admin/categories");

            } else if (customer) {
                req.session.logged_in = true;
                req.session.customer = customer;
                req.session.save();
                res.redirect("/customer");

            } else {
                await req.flash('warning', 'Invalid Login - Your email address and/or password could not be validated. Please check them and try again.');
                res.redirect("/login");
            }
        } else if (register) {
            let { firstName, lastName, address, city, state, zip_code, phone, email, password, confirmPassword } = req.body;
            let name = `${firstName} ${lastName}`;

            if (password === confirmPassword) {
                let customer = new Customer(null, name, address, city, state, zip_code, phone, email, password);
                await customer.save();

                req.session.logged_in = true;
                req.session.customer = customer;
                req.session.save();
                res.redirect("/customer");

            } else {
                await req.flash('warning', 'Password does not match. Try again.');
                res.redirect("/login");
            }
        }

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/login");
    }
});

//logout:
app.get("/logout", async (req, res) => {
    try {
        req.session.logged_in = false;
        req.session.admin = false;
        req.session.customer = false;
        req.session.save();
        res.redirect("/");

    } catch (error) {
        console.log(error);
        await req.flash('error', 'Something went wrong.');
        res.redirect("/error");
    }
});

//PRIVATE PAGES:

// customer personal area
app.get("/customer", async (req, res) => {
    if (req.session.logged_in) {
        try {
            let id = req.session.customer.id;
            let successMsg = await req.consumeFlash('success');
            res.render("customer", { id: id, success: successMsg });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    }
});

app.get("/customer/recipe", async (req, res) => {
    if (req.session.logged_in) {
        try {
            let id = req.session.customer.id;
            let successMsg = await req.consumeFlash('success');
            let warningMsg = await req.consumeFlash('warning');
            let errorMsg = await req.consumeFlash('error');
            res.render("recipe-form", { id: id, success: successMsg, warning: warningMsg, error: errorMsg });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/customer/recipe", async (req, res) => {
    if (req.session.logged_in) {
        try {
            let { customer_id, title, content } = req.body;
            if (content === null || content === "") {
                await req.flash('warning', 'It was not possible to save your recipe. Please fill the recipe content.');
                res.redirect("/customer/recipe");

            } else {
                let customer = await Customer.find(customer_id);
                let recipe = new Recipe(null, title, content, false, customer);
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
                }
                await req.flash('success', 'Recipe send successfully!');
                res.redirect("/customer");
            }

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong');
            res.redirect("/recipes");
        }

    } else {
        res.redirect("/login");
    }
});

//ADMIN:

// Category 
app.get("/admin/categories", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let categories = await Category.all();
            let successMsg = await req.consumeFlash('success');
            let warningMsg = await req.consumeFlash('warning');
            let errorMsg = await req.consumeFlash('error');
            res.render("admin-categories", { layout: "admin", categories: categories, success: successMsg, warning: warningMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/api/admin/categories", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
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
    } else {
        res.redirect("/login");
    }
});

app.put("/api/admin/categories", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

app.delete("/api/admin/categories", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

//Brand
app.get("/admin/brands", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let brands = await Brand.all();
            let successMsg = await req.consumeFlash('success');
            let warningMsg = await req.consumeFlash('warning');
            let errorMsg = await req.consumeFlash('error');
            res.render("admin-brands", { layout: "admin", brands: brands, success: successMsg, warning: warningMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/api/admin/brands", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
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
    } else {
        res.redirect("/login");
    }
});

app.put("/api/admin/brands", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { id, name } = req.body;
            let brand = await Brand.find(id);
            await brand.setName(name);
            await brand.update();
            await req.flash('success', 'Brand updated successfully!');
            res.redirect("/admin/brands");

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/admin/brands");
        }
    } else {
        res.redirect("/login");
    }
});

app.delete("/api/admin/brands", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

//Product
app.get("/admin/products", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let products = await Product.all();
            let categories = await Category.all();
            let brands = await Brand.all();
            let successMsg = await req.consumeFlash('success');
            let warningMsg = await req.consumeFlash('warning');
            let errorMsg = await req.consumeFlash('error');
            res.render("admin-products", { layout: "admin", products: products, categories: categories, brands: brands, success: successMsg, warning: warningMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/api/admin/products", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { name, price, category_id, brand_id } = req.body;
            let category = await Category.find(category_id);
            let brand = await Brand.find(brand_id);
            let product = new Product(null, name, price, category, brand);
            await product.save();
            await req.flash('success', 'Product created successfully!');
            res.redirect("/admin/products");

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/admin/products");
        }
    } else {
        res.redirect("/login");
    }
});

app.put("/api/admin/products", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

app.delete("/api/admin/products", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

//Stores
app.get("/admin/stores", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let stores = await Store.all();
            let successMsg = await req.consumeFlash('success');
            let errorMsg = await req.consumeFlash('error');
            res.render("admin-stores", { layout: "admin", stores: stores, success: successMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/api/admin/stores", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { name, address, city, state, zip_code, phone, email } = req.body;
            let store = new Store(null, name, address, city, state, zip_code, phone, email);
            await store.save();
            await req.flash('success', 'Store created successfully!');
            res.redirect("/admin/stores");

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong');
            res.redirect("/admin/stores");
        }
    } else {
        res.redirect("/login");
    }

});

app.put("/api/admin/stores", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

app.delete("/api/admin/stores", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

//Customer
app.get("/admin/customers", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let customers = await Customer.all();
            let successMsg = await req.consumeFlash('success');
            let errorMsg = await req.consumeFlash('error');
            res.render("admin-customers", { layout: "admin", customers: customers, success: successMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/api/admin/customers", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { name, address, city, state, zip_code, phone, email, password } = req.body;
            let customer = new Customer(null, name, address, city, state, zip_code, phone, email, password);
            await customer.save();
            await req.flash('success', 'Customer registered successfully!');
            res.redirect("/admin/customers");

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong');
            res.redirect("/admin/customers");
        }
    } else {
        res.redirect("/login");
    }
});

app.put("/api/admin/customers", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }

});

app.delete("/api/admin/customers", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

//Recipe
app.get("/admin/recipes", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let recipes = await Recipe.all();
            let successMsg = await req.consumeFlash('success');
            let errorMsg = await req.consumeFlash('error');
            res.render("admin-recipes", { layout: "admin", recipes: recipes, success: successMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/api/admin/recipes", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { title, content, customer_id } = req.body;
            let customer = await Customer.find(customer_id);
            let recipe = new Recipe(null, title, content, false, customer);
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
    } else {
        res.redirect("/login");
    }
});

app.put("/api/admin/recipes", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { id, title, content } = req.body;
            let recipe = await Recipe.find(id);
            recipe.setTitle(title);
            recipe.setContent(content);
            await recipe.update();

            if (req.files === null) {
                console.log("No changes to photos");

            } else {
                let { photo } = req.files;
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
    } else {
        res.redirect("/login");
    }
});

app.delete("/api/admin/recipes", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

app.get("/admin/recipes/review", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
        try {
            let { id } = req.query;
            let recipe = await Recipe.find(id);
            let successMsg = await req.consumeFlash('success');
            let errorMsg = await req.consumeFlash('error');
            res.render("recipes-review", { layout: "admin", recipe: recipe, success: successMsg, error: errorMsg, admin: req.session.admin });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/admin/recipes");
        }
    } else {
        res.redirect("/login");
    }
});

app.put("/api/admin/recipes/approve", async (req, res) => {
    if (req.session.logged_in && req.session.admin) {
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
    } else {
        res.redirect("/login");
    }
});

//cart

app.get("/cart", async (req, res) => {
    if (req.session.logged_in && req.session.customer) {
        try {

            let successMsg = await req.consumeFlash('success');
            let errorMsg = await req.consumeFlash('error');
            res.render("cart", { success: successMsg, error: errorMsg, customer: req.session.customer });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/cart", async (req, res) => {
    if (req.session.logged_in && req.session.customer) {
        try {
            let { product_id } = req.body;
            let product = await Product.find(product_id);
            res.render("cart", { product: product });

        } catch (error) {
            console.log(error);
            await req.flash('error', 'Something went wrong.');
            res.redirect("/error");
        }

    } else {
        res.redirect("/login");
    }
})









app.get("/error", async (req, res) => {
    try {
        let errorMsg = await req.consumeFlash('error');
        res.render("error", { error: errorMsg });

    } catch (error) {
        console.log(error);
    }
});



