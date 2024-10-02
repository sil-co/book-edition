import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { useState, useEffect } from 'react';

import { API_ENDPOINTS } from '../../api/urls';
import * as BT from '../../types/BookTypes';
import { useGlobalState } from '../../context/GlobalStateProvider';

const BookList = () => {
    const [books, setBooks] = useState<BT.BookDataType[]>([]);
    const { setSuccessMessage, setErrorMessage } = useGlobalState();
    const { t } = useTranslation();

    useEffect(() => {
        axios.get<BT.BookDataType[]>(API_ENDPOINTS.getBooks())
            .then((res) => { setBooks(res.data); })
            .catch((e) => setErrorMessage(t('fetchFailed')));
    }, []);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {books.map((book, index) => (
                <div
                    key={index}
                    className="border rounded-lg shadow-lg p-4 flex flex-col justify-between"
                >
                    <img
                        src={book.coverImageId}
                        alt={book.title}
                        className="h-48 w-full object-cover mb-4 rounded"
                    />
                    <div className="flex-grow">
                        <h2 className="text-lg font-bold mb-2">{book.title}</h2>
                        <p className="text-gray-500 mb-1">{t('author')}: {book.author}</p>
                        <p className="text-gray-500 mb-1">{t('genre')}: {book.genre}</p>
                        <p className="text-gray-700 mb-4">{book.summary}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        {/* <p className="text-lg font-bold">{book.price}円</p> */}
                        <a
                            href={book.kindle}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {t('more')}
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookList;
