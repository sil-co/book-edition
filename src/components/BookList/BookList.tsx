import axios, { AxiosResponse } from 'axios';
import { Link } from "react-router-dom";
import { FiExternalLink } from 'react-icons/fi'; // 別タブアイコンをimport

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from "../../api/urls";
import { BookDataType } from '../../types/BookTypes';

const BookList = () => {
    const [books, setBooks] = useState<BookDataType[]>([]);
    const [selectedBook, setSelectedBook] = useState<Partial<BookDataType> | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        axios.get<BookDataType[]>(API_ENDPOINTS.getBooksInit())
            .then((res) => {
                console.log({ res: res.data });
                setBooks(res.data);
            });
    }, []);

    // 一定時間後にメッセージを消すためのuseEffect
    useEffect(() => {
        if (successMessage || errorMessage || warningMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setWarningMessage(null);
            }, 4000);

            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [successMessage, errorMessage, warningMessage]);

    const handleOpenInNewTab = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer'); // 別タブで開く
    };

    const handleDelete = async (book: BookDataType) => {
        try {
            const confirmMessage = `Delete 「${book.title}」 ?`;
            if (!window.confirm(confirmMessage)) { return; }
    
            const res: AxiosResponse<BookDataType> = await axios.delete<BookDataType>(API_ENDPOINTS.deleteBook(book.id));
            setSuccessMessage(`「${res.data.title}」 is Deleted. `);
            setBooks((prev) => prev.filter(prevBook => prevBook.id !== book.id));
        } catch (e) {
            setErrorMessage("Failed to Delete");
        } finally {
        }
    }

    const handleBookSelect = (book: BookDataType) => {
        setSelectedBook(book);
    };

    return (
        <div className="container mx-auto p-4 flex flex-col items-end">
            <div className="container flex justify-center mx-auto p-4">
                <div className="bg-white shadow-md rounded-lg p-6 mt-8 max-w-5xl w-full flex flex-col items-end">
                    <div className="w-full flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">Book List</h1>
                        <Link to="/create" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">New</Link>
                    </div>

                    <ul className="w-full space-y-4 mb-6">
                        {books.map((book) => (
                            <li
                                key={book.id}
                                onClick={() => handleBookSelect(book)}
                                className="bg-white w-full shadow-md hover:shadow-lg p-4 rounded-lg transition-shadow flex justify-between items-center"
                            >
                                <div className="flex-grow mr-4">
                                    <h3 className="font-semibold text-lg text-gray-800 truncate">{book.title}</h3>
                                    <p className="text-sm text-gray-600">by {book.author}

                                        {book.isPublished && (
                                            <span className="inline-block text-sm px-2 text-green-600 font-semibold mt-2">Published</span>
                                        )}
                                    </p>
                                </div>
                                {book.kindle && (
                                    <button
                                        onClick={() => handleOpenInNewTab(book.kindle ? book.kindle : '')}
                                        className="cursor-pointer text-black px-2 py-2 rounded-md transition-colors text-sm font-medium bg-slate-100 hover:bg-slate-200"
                                    >
                                        <FiExternalLink /> {/* アイコン表示 */}
                                    </button>
                                )}
                                <Link
                                    to={`/edit/${book.id}`}
                                    className="cursor-pointer bg-orange-500 text-white ml-2 px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(book)}
                                    className="cursor-pointer bg-red-500 text-white ml-2 px-2 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 成功メッセージ */}
            {successMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p
                            dangerouslySetInnerHTML={{ __html: successMessage }}
                        />
                    </div>
                </div>
            )}

            {/* Warning Message */}
            {warningMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p>{warningMessage}</p>
                    </div>
                </div>
            )}

            {/* エラーメッセージ */}
            {errorMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="text-white">Loading...</div>
                </div>
            )}
        </div>
    );
}

export default BookList
