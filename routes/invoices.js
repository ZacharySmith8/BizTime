const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");
const Router = new express.Router();


Router.get('/', async (req,res,next) =>{
    try{
        const results = await db.query(`
            SELECT *
            FROM invoices;
        `)
        return res.json(results.rows);
    }
    catch(e){
        return next(e);
    }
})

Router.get('/:id', async (req,res,next) => {
    try{
        const results = await db.query(`
        SELECT *
        FROM invoices
        WHERE id=$1
        `, [req.params.id])
        if(results.rows.length === 0){
            throw new ExpressError("Invoice Cant Be Found",404);
        }
        return res.json({"invoice": results.rows[0]})
    }
    catch(e){
        return next(e);
    }
})


Router.post('/', async (req,res,next) =>{
    let {id,comp_code,amt,paid,add_date,paid_date} = req.body;
    const results = await db.query(`
        INSERT INTO invoices (comp_code,amt,paid,add_date,paid_date)
        VALUES($1,$2,$3,$4,$5)
        RETURNING comp_code, amt,paid,add_date,paid_date

    `,[comp_code,amt,paid,add_date,paid_date])

    return res.json(results.rows[0])
})

Router.patch("/:id", async (req,res,next) => {
    try{
        let {id,comp_code,amt,paid,add_date,paid_date} = req.body;
        const result = await db.query(
            `UPDATE invoices 
            SET comp_code=$1, amt=$2,paid=$3,add_date=$4, paid_date=$5
            WHERE id=$6
            RETURNING comp_code, amt, paid, add_date, paid_date`,
            [comp_code,amt,paid,add_date,paid_date,req.params.id]
        )
        return res.json({"invoices": result.rows[0]})
    }
    catch(e){
        return next(e)
    }
})


Router.delete("/:id", async (req,res,next) => {
    try {
        const results = await db.query(` 
            DELETE FROM invoices
            WHERE id=$1
        `,[req.params.id])
        return res.send({"status": "Deleted"})
    } catch (error) {
        return next(error)
    }
})












module.exports = Router;