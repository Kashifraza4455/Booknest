const mongoose = require("mongoose");
const Book = require("./src/models/bookmodel");

mongoose
  .connect(
    "mongodb+srv://kashifraza:kashifraza1234@cluster0.3mgx5r4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(async () => {
    console.log("MongoDB connected");

    const books = await Book.find();
    console.log(`Books found: ${books.length}`);

    // Ye aapki 5 images ka array
    const images = ["book1.jpg", "book2.avif", "book3.jpeg", "book4.jpeg", "book5.jpeg"];

    for (let i = 0; i < books.length; i++) {
      const imageFileName = images[i % images.length]; // cyclic assignment
      books[i].imageFileName = imageFileName;
      await books[i].save();
      console.log(`Updated: ${books[i].title} -> ${imageFileName}`);
    }

    console.log("✅ All books updated with repeated images!");
    process.exit();
  })
  .catch((err) => console.log(err));
