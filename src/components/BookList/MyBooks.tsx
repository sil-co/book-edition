import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { FiExternalLink } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import { useState, useEffect } from 'react';

import { useGlobalState } from '../../context/GlobalStateProvider';
import SelectModal from '../Modal/SelectModal';
import { API_ENDPOINTS } from "../../api/urls";
import * as BT from '../../types/BookTypes';

const MyBooks = () => {
    const navigate = useNavigate();
    const { setSuccessMessage, setLoadingTxt, setErrorMessage } = useGlobalState();
    const [books, setBooks] = useState<BT.BookDataRequiredId[]>([]);
    const [bookData, setBookData] = useState<BT.BookDataRequiredId | null>(null);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const { t } = useTranslation();

    useEffect(() => {
        try {
            setLoadingTxt(t('fetchData'));
            const token = localStorage.getItem('token');
            if (!token) {
                navigate("/login?error=unauthorized&source=mybook");
                return;
            }
            axios.get<BT.BookDataRequiredId[]>(API_ENDPOINTS.getBooksInit(), {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => {
                const data = res.data;
                console.log({ data });
                setBooks(data);
            });
        } catch (e) {
            setErrorMessage(t('fetchFailed'));
        } finally {
            setLoadingTxt('');
        }
    }, []);

    const handleOpenInNewTab = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer'); // 別タブで開く
    };

    const handleDelete = async (book: BT.BookDataType) => {
        try {
            const confirmMessage = t('deleteConfirm', { title: book.title });
            if (!window.confirm(confirmMessage)) { return; }
            if (!book.id) { return; }

            const res: AxiosResponse<BT.BookDataType> = await axios.delete<BT.BookDataType>(API_ENDPOINTS.deleteBook(book.id));
            setSuccessMessage(t('deleteSuccess', { title: res.data.title }));
            setBooks((prev) => prev.filter(prevBook => prevBook.id !== book.id));
        } catch (e) {
            setErrorMessage(t('deleteFailed'));
        } finally {
        }
    }

    const toggleSelectModal = async (bookId: string) => {
        if (selectedBookId === bookId) {
            setBookData(null);
            setSelectedBookId('');
        } else {
            const token = localStorage.getItem('token');
            const res = await axios.get<BT.BookDataRequiredId>(API_ENDPOINTS.getBookAll(bookId), {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBookData(res.data);
            setSelectedBookId(bookId);
        }
    }

    return (
        <div className="container mx-auto p-0 sm:p-4 flex flex-col items-end mt-12">
            <div className="container flex justify-center mx-auto p-0 sm:p-4">
                <div className="bg-white shadow-md rounded-lg p-2 sm:p-6 max-w-5xl w-full flex flex-col items-end">
                    <div className="w-full flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">Book List</h1>
                        <Link to="/create" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">{t('new')}</Link>
                    </div>
                    <ul className="w-full space-y-4 mb-6">
                        {books.map((book) => (
                            <li
                                key={book.id}
                                className="bg-white w-full shadow-md hover:shadow-lg p-4 rounded-lg transition-shadow flex justify-between items-center relative"
                            >
                                <div className="flex-grow mr-4">
                                    <h3 className="font-semibold text-lg text-gray-800 truncate">{book.title}</h3>
                                    <p className="text-sm text-gray-600">{t('byAuthor', { author: book.author })}

                                        {book.isPublished && (
                                            <span className="inline-block text-sm px-2 text-green-600 font-semibold mt-2">{t('published')}</span>
                                        )}
                                    </p>
                                </div>
                                {book.kindle && (
                                    <button
                                        onClick={() => handleOpenInNewTab(book.kindle ? book.kindle : '')}
                                        className="cursor-pointer text-black px-2 py-2 rounded-md transition-colors text-sm font-medium bg-slate-100 hover:bg-slate-200"
                                    >
                                        <FiExternalLink />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={`text-white bg-lime-500  select-none ml-2
                                        font-medium rounded-lg text-sm px-3 py-2 text-center
                                        ${book.isGptRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-lime-500 hover:bg-lime-600'}
                                    `}
                                    disabled={book.isGptRunning}
                                    onClick={() => toggleSelectModal(book.id)}
                                >
                                    {book.isGptRunning ? (
                                        <FaSpinner className="animate-spin inline-block " />
                                    ) : (
                                        'DL-zip'
                                    )}
                                </button>
                                <Link
                                    to={book.isGptRunning ? "#" : `/edit/${book.id}`}
                                    onClick={(e) => book.isGptRunning && e.preventDefault()}
                                    className={`cursor-pointer  text-white ml-2 px-4 py-2 rounded-md  transition-colors text-sm font-medium 
                                        ${book.isGptRunning ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`
                                    }
                                >
                                    {t('edit')}
                                </Link>
                                <button
                                    onClick={() => handleDelete(book)}
                                    className={`cursor-pointer  text-white ml-2 px-2 py-2 rounded-md transition-colors text-sm font-medium
                                        ${book.isGptRunning ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`
                                    }
                                    disabled={book.isGptRunning}
                                >
                                    {t('delete')}
                                </button>
                                {book.isGptRunning && (
                                    <div className="absolute inset-0 bg-emerald-700	bg-opacity-60 text-white flex p-1 sm:p-2 items-center justify-center rounded-lg">
                                        <span className="text-2xl font-semibold">{t('gptCanotEdit', { gptProgress: book.gptProgress })}</span>
                                        <span></span>
                                    </div>
                                )}
                                {selectedBookId === book.id && bookData && (
                                    <SelectModal
                                        isOpen={selectedBookId === book.id}
                                        onClose={() => toggleSelectModal(book.id)}
                                        bookData={bookData}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default MyBooks
