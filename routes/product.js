const router = require('express').Router();

let validator = require('validator');

const { sql, dbConnPoolPromise } = require('../database/db.js');

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed

// for json path - Tell MS SQL to return results as JSON 
const SQL_SELECT_ALL = 'SELECT * FROM dbo.Product for json path;';

// without_array_wrapper - use for single result
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.Product WHERE ProductId = @id for json path, without_array_wrapper;';

// Second statement (Select...) returns inserted record identified by ProductId = SCOPE_IDENTITY()
const SQL_INSERT = 'INSERT INTO dbo.Product (CategoryId, ProductName, ProductDescription, ProductStock, ProductPrice) VALUES (@categoryId, @productName, @productDescription, @ProductStock, @ProductPrice); SELECT * from dbo.Product WHERE ProductId = SCOPE_IDENTITY();';

const SQL_UPDATE = 'UPDATE dbo.Product SET CategoryId = @categoryId, ProductName = @productName, ProductDescription = @productDescription, ProductStock = @ProductStock, ProductPrice = @ProductPrice WHERE ProductId = @id; SELECT * FROM dbo.Product WHERE ProductId = @id;';

const SQL_DELETE = 'DELETE FROM dbo.Product WHERE ProductId = @id;';

//SELECT ALL
router.get('/', async (req, res) => {
    try {
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            .query(SQL_SELECT_ALL);
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500)
        res.send(err.message)
    }
});

//SELECT A SPECIFIC PRODUCT
router.get('/:id', async (req, res) => {
    const productId = req.params.id;

    if (!validator.isNumeric(productId, { no_symbols : true })) {
        res.json({"error":"invalid id parameter"});
        return false;
    }

    try {
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .query(SQL_SELECT_BY_ID);
        
        res.json(result.recordset);

    } catch (err) {
        res.status(500)
        res.send(err.message)
    }
})

module.exports = router;

//INSERT A PRODUCT - use post, not get
router.post('/', async (req, res) => {

    // Validate - this string, inially empty, will store any errors
    let errors = "";
    let body = JSON.parse(req.body);
    // Make sure that category id is just a number - note that values are read from request body
    const categoryId = body.categoryId;
    // if (!validator.isNumeric(categoryId, {no_symbols: true})) {
    //     errors+= "invalid category id; ";
    // }
    // // Escape text and potentially bad characters
    //const productName = validator.escape(req.body.productName);
    
    const productName = body.productName; 
    // if (productName === "") {
    //     errors+= "invalid productName; ";
    // }
    //const productDescription = validator.escape(req.body.productDescription);
    const productDescription = body.productDescription;
    // if (productDescription === "") {
    //     errors+= "invalid productDescription; ";
    // }
    // // Make sure that category id is just a number
    const productStock = body.productStock;
    // if (!validator.isNumeric(productStock, {no_symbols: true})) {
    //     errors+= "invalid productStock; ";
    // }
    // // Validate currency
    const productPrice = body.productPrice;
    // if (!validator.isCurrency(productPrice, {allow_negatives: false})) {
    //     errors+= "invalid productPrice; ";
    // }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }

    // If no errors, insert
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name parameter(s) in query
            .input('categoryId', sql.Int, categoryId)    
            .input('productName', sql.NVarChar, productName)
            .input('productDescription', sql.NVarChar, productDescription)
            .input('productStock', sql.Int,  productStock)
            .input('productPrice', sql.Decimal, productPrice)
            // Execute Query
            .query(SQL_INSERT);      
    
        // If successful, return inserted product via HTTP   
        res.json(result.recordset[0]);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
    
});

//UPDATE A PRODUCT - use post, not get
router.put('/:id', async (req, res) => {

    // Validate - this string, inially empty, will store any errors
    let errors = "";

    // Make sure that category id is just a number - note that values are read from request body
    const categoryId = req.body.categoryId;
    if (!validator.isNumeric(categoryId, {no_symbols: true})) {
        errors+= "invalid category id; ";
    }
    // Escape text and potentially bad characters
    const productName = validator.escape(req.body.productName);
    if (productName === "") {
        errors+= "invalid productName; ";
    }
    const productDescription = validator.escape(req.body.productDescription);
    if (productDescription === "") {
        errors+= "invalid productDescription; ";
    }
    // Make sure that category id is just a number
    const productStock = req.body.productStock;
    if (!validator.isNumeric(productStock, {no_symbols: true})) {
        errors+= "invalid productStock; ";
    }
    // Validate currency
    const productPrice = req.body.productPrice;
    if (!validator.isCurrency(productPrice, {allow_negatives: false})) {
        errors+= "invalid productPrice; ";
    }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }

    // If no errors, insert
    try {
        const productId = req.params.id;
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name parameter(s) in query
            .input('categoryId', sql.Int, categoryId)    
            .input('productName', sql.NVarChar, productName)
            .input('productDescription', sql.NVarChar, productDescription)
            .input('productStock', sql.Int,  productStock)
            .input('productPrice', sql.Decimal, productPrice)
            .input('id', sql.Int, productId)
            .input('id', sql.Int, productId)
            // Execute Query
            .query(SQL_UPDATE);      
    
        // If successful, return inserted product via HTTP   
        res.json(result.recordset[0]);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
    
});

//DELETE A PRODUCT - use http Delete
router.delete('/:id', async (req, res) => {

    const productId = req.params.id;

    //only checks if it's a number, not if the product exists
    if (!router.get(productId)) {
        res.json({"error":"invalid id parameter"});
        return false;
    }
    // If no errors, delete
    try {
        const productId = req.params.id;
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        
        //checks if the product exists
        const result1 = await pool.request()
            // set name parameter(s) in query
            .input('id', sql.Int, productId)
            // Execute Query
            .query(SQL_SELECT_BY_ID);


        console.log(result1.recordset[0])
        if (result1.recordset[0] === null) {
            res.json({"error":"product doesn't exist on the database"});

        }

        const result = await pool.request()
        .input('id', sql.Int, productId)
        // Execute Query
        .query(SQL_DELETE);
        // If successful, delete de product
        res.json({"success":"the product was deleted"});

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});