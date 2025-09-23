import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { User } from "lucide-react";
import { getGlobalBooks } from "../api";

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

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
    <div className="min-h-screen">
      {/* ===== Navbar ===== */}
      <div className="bg-gradient-to-r from-blue-50 to-pink-100">
        <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-purple-700">BookStore</h1>

          {/* Nav Links */}
          <ul className="hidden md:flex space-x-8 font-medium text-purple-700">
            <li>
              <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            </li>
            <li>
              <Link to="/allbooks" className="hover:text-blue-600 transition">Shop</Link>
            </li>
            <li>
              <Link to="/allbooks" className="hover:text-blue-600 transition">Messages</Link>
            </li>
            <li>
              <Link to="/allbooks" className="hover:text-blue-600 transition">BookS</Link>
            </li>
          </ul>

          {/* User Icon */}
          <User className="w-6 h-6 text-purple-700 cursor-pointer" />
        </nav>

        {/* ===== Hero Section ===== */}
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center">
          {/* Left Side */}
          <div className="lg:w-1/2 mb-10 lg:mb-0 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              <span className="text-blue-700">Selection</span> of the
              <br />
              World's <span className="text-purple-700">Best Sellers</span>
            </h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto lg:mx-0">
              Dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
            </p>
            <button className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:scale-105 transform transition">
              Shop Now
            </button>
          </div>

          {/* Right Side */}
          <div className="lg:w-1/2 flex justify-center relative">
            {/* Background Doodles */}
            <div className="absolute -z-10 w-full h-full hidden md:block">
              <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-20 right-20 w-4 h-4 bg-pink-500 rounded-full"></div>
              <div className="absolute bottom-20 left-32 w-5 h-5 bg-purple-400 rounded-full"></div>
            </div>

            {/* Books Image */}
            <img
              src="https://book-store-five-nu.vercel.app/assets/book-hero-section-C-Nd6fDR.webp"
              alt="Books"
              className="w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* ===== Slider Section ===== */}
      <div className="bg-gray-50 w-full px-6 py-10">
        {books.length > 0 && (
          <Swiper
            slidesPerView={1}
            spaceBetween={15}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            navigation={true}
            modules={[Navigation]}
            className="mySwiper mb-6"
          >
            {books.map((book, idx) => (
              <SwiperSlide key={idx}>
                <div className="bg-white rounded-2xl shadow-md p-4 relative transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    {book.category}
                  </span>
                  <span className="absolute top-3 right-3 bg-gray-100 text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Rs {book.price}
                  </span>
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/images/${book.imageFileName}`}
                    alt={book.title}
                    className="w-full h-48 sm:h-60 object-contain rounded-xl mb-3"
                  />
                  <h2 className="font-bold text-lg truncate">{book.title}</h2>
                  <p className="text-gray-600 text-sm mb-1">Writer {book.writer}</p>
                  <p className="text-gray-500 text-xs mb-2">Upload by {book.uploader}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* View All Books Button */}
        {books.length > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/allbooks")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View All Books
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
