import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface NavbarProps {
    changeLanguage: (languageCode: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ changeLanguage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const { t } = useTranslation();

    const languages = [
        { code: "en", label: "English" },
        { code: "zh", label: "中文" },
        { code: "hi", label: "हिन्दी" },
        { code: "es", label: "Español" },
        { code: "bn", label: "বাংলা" },
        { code: "fr", label: "Français" },
        { code: "ru", label: "Русский" },
        { code: "pt", label: "Português" },
        { code: "id", label: "Bahasa Indonesia" },
        { code: "de", label: "Deutsch" },
        { code: "ja", label: "日本語" },
        { code: "ko", label: "한국어" },
    ];

    return (
        <nav className="bg-gray-900 p-4 text-white shadow-lg fixed w-full top-0 z-20">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-lg font-bold">
                    <Link to="/">Auto Writing</Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="text-white block lg:hidden focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                        ></path>
                    </svg>
                </button>

                {/* Navigation Links */}
                <ul className={`flex space-x-6 lg:flex ${isOpen ? 'block' : 'hidden'} lg:block`}>
                    <li>
                        <Link
                            to="/"
                            className="hover:text-gray-300 transition-colors duration-200"
                        >
                            {t('home')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/register"
                            className="hover:text-gray-300 transition-colors duration-200"
                        >
                            {t('register')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/login"
                            className="hover:text-gray-300 transition-colors duration-200"
                        >
                            {t('login')}
                        </Link>
                    </li>
                    <li className="relative">
                        {/* Language Dropdown */}
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="hover:text-gray-300 transition-colors duration-200"
                        >
                            {t('language')}
                        </button>
                        {isLangOpen && (
                            <ul className="absolute right-0 mt-2 w-40 bg-gray-800 shadow-lg rounded-lg">
                                {languages.map(({ code, label }) => (
                                    <li key={code}>
                                        <button
                                            onClick={() => {
                                                changeLanguage(code);
                                                setIsLangOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
