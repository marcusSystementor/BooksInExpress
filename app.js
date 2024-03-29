const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const fs = require("fs/promises");

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

const booksPath = path.join(__dirname, "books.json");

const readBooks = async () => {

    try {
        const data = await fs.readFile(booksPath);
        return JSON.parse(data);
    } catch(error) {
        return [];
    }
};

const writeBooks = async (data) => {

    try {
        await fs.writeFile(booksPath, JSON.stringify(data, null, 2));
        console.log("Allt gick bra");
    } catch(error) {
        console.log("Fel", error);
    }
}

app.post("/books", async(req, res) => {

    const newBook = {id: Date.now(), name: req.body.name};
    const books = await readBooks();
    books.push(newBook);
    await writeBooks(books);
    res.status(201).json(newBook);
});

app.get("/books", async(req, res) => {
    const books = await readBooks();
    res.status(200).json(books);
});

app.get("/books/:id", async(req,res) => {

    const id = parseInt(req.params.id);

    const books = await readBooks();

    const bookWithId = books.find(book => book.id === id);
    if (!bookWithId) {
        res.status(404).json({message: "Book not found"});
    } else {
        res.status(200).json(bookWithId);
    }

});

app.delete("/books/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    let books = await readBooks();
    const initialLength = books.length;
    books = books.filter(book => book.id !== id);
    if (books.length === initialLength) {
        res.status(404).json({message: "Book not found"});
    } else {
        await writeBooks(books);
        res.status(200).json({message: "Book deleted"});
    }


});

app.put("/books/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const books = await readBooks();
    const bookIndex = books.findIndex(book => book.id === id);
    if (bookIndex === -1) {
        res.status(404).json({message: "Book not found"});
    } else {
        books[bookIndex].name = req.body.name;
        await writeBooks(books);
        res.status(200).json(books[bookIndex]);
    }
})

app.get("/currentdate", (req, res) => {
    const currentDate = new Date();

        const response = {
        date: currentDate.toLocaleString(),
        
    }
    res.json(response);
});





const server = http.createServer(app);
server.listen(3000);