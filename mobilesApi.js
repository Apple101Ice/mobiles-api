const { Client } = require('pg');
const format = require("pg-format");

let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
const port = process.env.PORT || 2410;

app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const client = new Client({
    user: "root",
    password: "xAZjZm0YI1ATiLGZwabXsZYF2jqGMWuz",
    database: "testdb_ncdn",
    port: 5432,
    host: "dpg-cfidrokgqg40klnee660-a.singapore-postgres.render.com",
    ssl: { rejectUnauthorized: false }
});

let { mobilesData } = require("./mobilesData");

client.connect(err => {
    if (err) console.log("Connection Error");
    else console.log("Connected");
});

app.get("/svr/mobiles/resetData", function (req, response) {
    let sql = "DELETE FROM mobiles";
    client.query(sql, function (err, resQuery) {
        if (err) response.status(404).send(err.message);
        else {
            let arr = mobilesData.map(e1 => [e1.name, e1.price, e1.brand, e1.RAM, e1.ROM, e1.OS]);
            let sql1 = format("INSERT INTO mobiles (name,price,brand,RAM,ROM,OS) VALUES %L RETURNING *", arr);
            client.query(sql1, function (err, resQuery) {
                if (err) response.status(404).send(err.message);
                else response.send("Data Reset");
            });
        }
    });
});

app.get("/svr/mobiles", function (req, response) {
    let sql = "SELECT * FROM mobiles";
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else {
            response.send(res.rows);
        }
    });
});

app.get("/svr/mobiles/filter", function (req, res) {
    const brand = req.query.brand;
    const ram = req.query.ram;
    const rom = req.query.rom;
    const os = req.query.os;
    const sortby = req.query.sortby;

    let sql = "SELECT * FROM mobiles";
    let condParams = "";

    if (brand) {
        condParams += condParams ? " AND" : "";
        condParams += format(" brand = %L", brand);
    }
    if (ram) {
        condParams += condParams ? " AND" : "";
        condParams += format(" ram = %L", ram);
    }
    if (rom) {
        condParams += condParams ? " AND" : "";
        condParams += format(" rom = %L", rom);
    }
    if (os) {
        condParams += condParams ? " AND" : "";
        condParams += format(" os = %L", os);
    }

    sql += (condParams ? " WHERE" : "") + condParams;

    if (sortby)
        sql += " ORDER BY " + sortby + " ASC";

    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err.message);
        else
            res.send(result.rows);
    });
});

app.get("/svr/mobiles/:name", function (req, response) {
    let name = req.params.name;
    let sql = format("SELECT * FROM mobiles WHERE name = %L", name);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows[0]);
    });
});

app.get("/svr/mobiles/brand/:brand", function (req, response) {
    let brand = req.params.brand;
    let sql = format("SELECT * FROM mobiles WHERE brand = %L", brand);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.get("/svr/mobiles/RAM/:RAM", function (req, response) {
    let RAM = req.params.RAM;
    let sql = format("SELECT * FROM mobiles WHERE RAM = %L", RAM);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.get("/svr/mobiles/ROM/:ROM", function (req, response) {
    let ROM = req.params.ROM;
    let sql = format("SELECT * FROM mobiles WHERE ROM = %L", ROM);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.get("/svr/mobiles/OS/:OS", function (req, response) {
    let OS = req.params.OS;
    let sql = format("SELECT * FROM mobiles WHERE OS = %L", OS);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else response.send(res.rows);
    });
});

app.post("/svr/mobiles", function (req, res) {
    let e1 = req.body;
    let params = [e1.name, e1.price, e1.brand, e1.ram, e1.rom, e1.os];
    let sql = format("INSERT INTO mobiles (name,price,brand,RAM,ROM,OS) VALUES (%L)", params);
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err.message);
        else
            res.send(result.rows);
    });
});

app.put("/svr/mobiles/:name", function (req, response) {
    let body = req.body;
    let name = req.params.name;
    let sql = format("SELECT * FROM mobiles WHERE name = %L", name);
    client.query(sql, function (err, res) {
        if (err) response.status(404).send(err);
        else {
            let updatedmobile = { ...res.rows[0], ...body };
            let { name, price, brand, ram, rom, os } = updatedmobile;
            let sql1 = format(
                "UPDATE mobiles SET price = %L, brand = %L, ram = %L, rom = %L, os = %L WHERE name = %L",
                price, brand, ram, rom, os, name
            );
            client.query(sql1, function (err, res) {
                if (err) response.status(404).send(err);
                else response.send(res.rows[0]);
            });
        }
    });
});

app.delete("/svr/mobiles/:name", function (req, res) {
    let name = req.params.name;
    let sql = format("DELETE FROM mobiles WHERE name = %L", name);
    client.query(sql, function (err, result) {
        if (err) res.status(404).send(err.message);
        else
            res.send("Successfully Deleted " + name);
    });
});

