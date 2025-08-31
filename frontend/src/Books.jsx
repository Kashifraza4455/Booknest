import React, { useState } from "react";

export default function Books() {
  const [books, setBooks] = useState([
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "1984", author: "George Orwell" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
    { title: "The Alchemist", author: "Paulo Coelho" }
  ]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddBook = () => {
    if (!title || !author) return alert("Both fields are required");

    if (editingIndex !== null) {
      const updatedBooks = [...books];
      updatedBooks[editingIndex] = { title, author };
      setBooks(updatedBooks);
      setEditingIndex(null);
    } else {
      setBooks([...books, { title, author }]);
    }
    setTitle("");
    setAuthor("");
  };

  const handleEdit = (index) => {
    setTitle(books[index].title);
    setAuthor(books[index].author);
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    const updatedBooks = books.filter((_, i) => i !== index);
    setBooks(updatedBooks);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#2c3e50" }}>📚 Books Library</h1>

      {/* Add Book Form */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          background: "#f5f6fa",
          padding: "1rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 2, padding: "0.5rem", borderRadius: "5px", border: "1px solid #bdc3c7" }}
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ flex: 2, padding: "0.5rem", borderRadius: "5px", border: "1px solid #bdc3c7" }}
        />
        <button
          onClick={handleAddBook}
          style={{
            flex: 1,
            padding: "0.5rem",
            background: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {editingIndex !== null ? "Update Book" : "Add Book"}
        </button>
      </div>

      {/* Books List */}
      {books.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>No books added yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1rem"
          }}
        >
          {books.map((book, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "1rem",
                borderRadius: "10px",
                boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div>
                <h3 style={{ marginBottom: "0.5rem", color: "#2c3e50" }}>{book.title}</h3>
                <p style={{ color: "#7f8c8d", marginBottom: "1rem" }}>by {book.author}</p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleEdit(index)}
                  style={{
                    flex: 1,
                    padding: "0.4rem",
                    background: "#f39c12",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    flex: 1,
                    padding: "0.4rem",
                    background: "#c0392b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
