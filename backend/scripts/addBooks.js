  // scripts/addBooks.js
const mongoose = require("mongoose");
const Book = require("../src/models/bookmodel");

// MongoDB connection
const mongoURI = "mongodb+srv://kashifraza:kashifraza1234@cluster0.3mgx5r4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // apna actual MongoDB URI yahan dalein

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Book data
const books = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    price: 300,
    condition: "New",
    description: "A journey of self-discovery",
    websiteUrl: "http://example.com/alchemist",
    year: "1988",
    imageFileName: "book1.jpg"
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    price: 500,
    condition: "New",
    description: "A brief history of humankind",
    websiteUrl: "http://example.com/sapiens",
    year: "2011",
    imageFileName: "book2.avif"
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Fiction",
    price: 250,
    condition: "Used",
    description: "Dystopian novel",
    websiteUrl: "http://example.com/1984",
    year: "1949",
    imageFileName: "book3.jpeg"
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Biography",
    price: 400,
    condition: "New",
    description: "Memoir of the former First Lady",
    websiteUrl: "http://example.com/educated",
    year: "2018",
    imageFileName: "book4.jpeg"
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Mystery",
    price: 350,
    condition: "New",
    description: "Psychological thriller",
    websiteUrl: "http://example.com/silentpatient",
    year: "2019",
    imageFileName: "book5.jpeg"
  },
  {
    title: "Brief History of Time",
    author: "Stephen Hawking",
    genre: "Science",
    price: 450,
    condition: "New",
    description: "Cosmology explained",
    websiteUrl: "http://example.com/briefhistory",
    year: "1988",
    imageFileName:" book1.jpg"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    price: 300,
    condition: "Used",
    description: "Classic novel of racial injustice",
    websiteUrl: "http://example.com/mockingbird",
    year: "1960",
    imageFileName: "book2.avif"
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    genre: "Biography",
    price: 500,
    condition: "New",
    description: "Memoir of the former First Lady",
    websiteUrl: "http://example.com/becoming",
    year: "2018",
    imageFileName: "book3.jpeg"
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    genre: "Non-Fiction",
    price: 350,
    condition: "New",
    description: "A counterintuitive approach to living a good life",
    websiteUrl: "http://example.com/subtleart",
    year: "2016",
    imageFileName: "book4.jpeg"
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    genre: "Mystery",
    price: 400,
    condition: "Used",
    description: "Thriller novel about a missing wife",
    websiteUrl: "http://example.com/gonegirl",
    year: "2012",
    imageFileName: "book5.jpeg"
  },
  {
    title: "The Martian",
    author: "Andy Weir",
    genre: "Science",
    price: 450,
    condition: "New",
    description: "Survival on Mars",
    websiteUrl: "http://example.com/martian",
    year: "2014",
    imageFileName: "book1.jpg"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Fiction",
    price: 250,
    condition: "Used",
    description: "Classic romance novel",
    websiteUrl: "http://example.com/prideprejudice",
    year: "1813",
    imageFileName: "book2.avif"
  },
  {
    title: "The Power of Habit",
    author: "Charles Duhigg",
    genre: "Non-Fiction",
    price: 350,
    condition: "New",
    description: "Why we do what we do in life and business",
    websiteUrl: "http://example.com/powerhabit",
    year: "2012",
    imageFileName: "book3.jpeg"
  },
  {
    title: "Sherlock Holmes",
    author: "Arthur Conan Doyle",
    genre: "Mystery",
    price: 400,
    condition: "Used",
    description: "Detective stories",
    websiteUrl: "http://example.com/sherlock",
    year: "1892",
    imageFileName: "book4.jpeg"
  },
  {
    title: "A Brief History of Nearly Everything",
    author: "Bill Bryson",
    genre: "Science",
    price: 450,
    condition: "New",
    description: "Exploring science in an easy way",
    websiteUrl: "http://example.com/briefnearlyeverything",
    year: "2003",
    imageFileName: "book5.jpeg"
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    genre: "Biography",
    price: 500,
    condition: "New",
    description: "Life of Steve Jobs",
    websiteUrl: "http://example.com/stevejobs",
    year: "2011",
    imageFileName: "book1.jpg"
  }
];

// Add books function
const addBooks = async () => {
  try {
    await Book.insertMany(books);
    console.log("Books added successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error adding books:", err);
  }
};

// Run function
addBooks();
