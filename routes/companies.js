const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const Router = new express.Router();



// Gets All Companies
Router.get("/", async (req,res,next) => {
    results = await db.query(`SELECT * FROM Companies`)
    
    return res.json({"companies":results.rows})
  })
//Gets Company Based on Code
Router.get("/:code", async (req,res,next) =>{
    
    try{
       
        
       const results = await db.query(`SELECT * FROM Companies WHERE code=$1`, [req.params.code])
       const invoiceResults = await db.query(`
            SELECT * 
            FROM invoices 
            WHERE comp_code = $1
       `, [req.params.code])

        
       if (results.rows.length === 0 )
            throw new ExpressError("Query is Empty", 404);
        return res.json({"company": results.rows[0],
                         "invoice": invoiceResults.rows             })
    }     
    catch(err){
        return next(err)
    }
});
// This Creates New Company AND Adds to Database
Router.post("/", async (req,res,next) =>{
    try{
        const {code,name,description} = req.body;
        console.log(req.body);
        const result = await db.query(
            `INSERT INTO companies (code,name,description)
            VALUES($1,$2,$3)
            RETURNING code,name,description`,
            [code,name,description]
        );
        return res.status(201).json(result.rows[0])
    }
    catch(err){
        return next(err)
    }
})
// Allows you to edit 
Router.patch("/:code", async (req,res,next) => {
    try{
        const {code,name,description} = req.body;
        const result = await db.query(
            `UPDATE companies 
            SET code=$1, name=$2, description=$3
            WHERE code=$4
            RETURNING code,name,description`,
            [code,name,description,req.params.code]
        )
        return res.json(result.rows[0])
    }
    catch(e){
        return next(e)
    }
})

// deletes from database 
Router.delete("/:code",async(req,res,next) =>{
    try {
        const result = await db.query(`
            DELETE FROM companies WHERE code=$1
        `, [req.params.code])
        return res.send({message:"Deleted"})
    }
    catch(e){
        return next(e);
    }
})
  module.exports = Router;