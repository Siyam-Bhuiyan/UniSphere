import React from 'react';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Header() {
  return (
    <header className="fixed w-full bg-yellow-50 dark:bg-[#18181b] backdrop-blur-sm py-4 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-200 hover:text-yellow-500 dark:hover:text-yellow-100 transition-colors duration-300">
            UniSphere
          </h1>
        </Link>

        {/* <nav className="hidden md:flex space-x-6">
          <Link to="/meals" className="text-yellow-600 dark:text-yellow-200 hover:text-yellow-500 dark:hover:text-yellow-100">
            Meals
          </Link>
          <Link to="/bus" className="text-yellow-600 dark:text-yellow-200 hover:text-yellow-500 dark:hover:text-yellow-100">
            Bus
          </Link>
          <Link to="/class" className="text-yellow-600 dark:text-yellow-200 hover:text-yellow-500 dark:hover:text-yellow-100">
            Class
          </Link>
          <Link to="/roadmap" className="text-yellow-600 dark:text-yellow-200 hover:text-yellow-500 dark:hover:text-yellow-100">
            Roadmap
          </Link>
        </nav> */}

        <div className="flex items-center space-x-4">
          <Link to="/Auth">
            <button className="bg-yellow-600 dark:bg-yellow-200 hover:bg-yellow-500 dark:hover:bg-yellow-100 text-[#f5f5f5] dark:text-black px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-200/20">
              SignIn
            </button>
          </Link>
          <Link to="/profile">
            <FaUser className="text-2xl text-yellow-600 dark:text-yellow-200 hover:text-yellow-500 dark:hover:text-yellow-100 cursor-pointer" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
