import React, { useEffect, useState } from "react";
// import axios from "axios";
import { MapPin, BookOpen } from "lucide-react";
import { getGlobalBooks } from "./api";

export default function AllBooksPage() {
const [books, setBooks] = useState([]);

  useEffect(() => {
  const fetchBooks = async () => {
    try {
      const data = await getGlobalBooks();
      console.log("Books API Response:", data);

      if (Array.isArray(data)) {
        setBooks(data);
      } else if (Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]); // fallback
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    }
  };

  fetchBooks();
}, []);

  return (
    <div className="w-full px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">All Books</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {books.map((book, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-md p-4 relative transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              {book.category}
            </span>
            <span className="absolute top-3 right-3 bg-gray-100 text-black text-xs font-semibold px-3 py-1 rounded-full">
              Rs {book.price}
            </span>
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/images/${book.imageFileName}`}
              alt={book.title}
              className="w-full h-60 object-contain rounded-xl mb-3"
            />
            <h2 className="font-bold text-lg truncate">{book.title}</h2>
            <p className="text-gray-600 text-sm mb-1">Writer {book.writer}</p>
            <p className="text-gray-500 text-xs mb-2">Upload by {book.uploader}</p>
            <div className="flex items-center gap-3 text-gray-500 text-xs mb-2">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {book.location}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={14} /> {book.pages} pages
              </span>
            </div>
            <p className="text-gray-600 text-xs line-clamp-2 mb-3">{book.description}</p>
            <div className="flex items-center justify-between">
              <button className="bg-orange-500 text-white text-xs px-4 py-1 rounded-full">
                {book.condition}
              </button>
              <button className="bg-blue-600 text-white text-xs px-4 py-1 rounded-full">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
