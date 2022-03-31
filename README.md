# 1. Project

Coffee Shop : a website that allows Coffee Shop's customers to buy online.

# 2. Prerequisites

* npm >= 6
* node >= 14
* postgresql >= 10


# 3. Packages installation 

```
npm install
```

# 4. Database creation

Open a terminal and run the following code to load the database with the preset data:

```
psql -U <your-user> -f data/coffee_shop.sql
```

Open the `data/pooldb.js` file and change the dummy credentials accordingly.

# 5. Run the application

```
node index.js
```

Open a browser and visit `localhost:3000`

# 6. User credentials

Admin:
```
email: admin@coffeeshop.com
password: 12345678
```

Customer:
```
email: janedoe@email.com
password: jane1234
```


# 7. Author

Arlene Santos

[![Linkedin Badge](https://img.shields.io/badge/-Arlene-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/arlenesantos89/)](https://www.linkedin.com/in/arlenesantos89/) 
[![Gmail Badge](https://img.shields.io/badge/-arlenesantos89@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:arlenesantos89@gmail.com)](mailto:arlenesantos89@gmail.com)
