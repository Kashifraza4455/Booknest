import React, { useState } from "react";
import { books } from "./Books";

export default function Book() {
  const [filter, setFilter] = useState("all");

  const filteredBooks = books.filter((book) => {
    if (filter === "all") return true;
    return book.category.toLowerCase() === filter.toLowerCase();
  });

  // ✅ Categories for buttons
  const categories = ["All", "Web Design", "Islamic", "Education", "Technology", "Programming"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">All Books</h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter.toLowerCase() === cat.toLowerCase() ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map((book, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition"
          >
            <img src={book.img} alt={book.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600">Writer: {book.writer}</p>
              <p className="text-sm text-gray-600">Uploader: {book.uploader}</p>
              <p className="text-sm text-gray-500">{book.location}</p>
              <p className="text-sm text-gray-500">{book.pages}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{book.description}</p>
              <div className="flex justify-between items-center mt-3">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    book.status.toLowerCase() === "new" ? "bg-emerald-500" : "bg-orange-500"
                  } text-white`}
                >
                  {book.status}
                </span>
                <span className="font-semibold">{book.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
