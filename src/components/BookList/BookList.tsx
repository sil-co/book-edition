import axios from 'axios';
import { Link } from "react-router-dom";
import { FiExternalLink } from 'react-icons/fi'; // 別タブアイコンをimport

import { useState, useEffect } from 'react';

import { BookDataType } from '../../types/BookTypes';

const BookList = () => {
    const [books, setBooks] = useState<BookDataType[]>([]);
    const [newBook, setNewBook] = useState<Partial<BookDataType>>({});
    const [selectedBook, setSelectedBook] = useState<Partial<BookDataType> | null>(null);
    const [bookHtml, setBookHtml] = useState<string>('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false); // 編集モード管理
    const [isCreating, setIsCreating] = useState(false); // 作成モード管理

    useEffect(() => {
        axios.get<BookDataType[]>('http://localhost:5000/books/init')
            .then((res) => {
                console.log({ res: res.data });
                setBooks(res.data);
            });
    }, []);

    const handleOpenInNewTab = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer'); // 別タブで開く
    };

    const handleEditClick = (book: BookDataType) => {
        setSelectedBook(book);
        setIsEditing(true);
        console.log('edit button is clicked.');
    };

    const handleDeleteClick = (book: BookDataType) => {
        console.log('delete button is clicked.');
    }

    const handleCreateClick = () => {
        setIsCreating(true);
    };

    const toggleEditor = async () => {
        // setIsEditorOpen(!isEditorOpen);
        if (!isEditorOpen) {
            setLoading(true);
            try {
                // 空の場合データを取得するAPI呼び出す
                if (bookHtml === '') {
                    const data = await new Promise<string>((resolve) =>
                        setTimeout(() => resolve('<p>Fetched HTML content</p>'), 2000)
                    );
                    setBookHtml(data);
                }
            } catch (error) {
                console.error('Failed to fetch HTML content', error);
            } finally {
                setLoading(false);
                setIsEditorOpen(true);
            }
        } else {
            setIsEditorOpen(false);
        }
    };

    const handleContentChange = (newContent: string) => {
        setBookHtml(newContent);
    };

    const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedBook) {
            setSelectedBook({
                ...selectedBook,
                isPublished: e.target.checked,
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (selectedBook) {
            setSelectedBook({
                ...selectedBook,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        console.log('handleSubmit is called');

        e.preventDefault();
        axios.post('http://localhost:5000/books', newBook)
            .then((res) => {
                setBooks([...books, res.data]);
                setNewBook({});
            });
    };

    const handleBookSelect = (book: BookDataType) => {
        setSelectedBook(book);
    };

    const handleUpdate = (e: React.FormEvent) => {
        console.log('handleUpdate is called.');

        e.preventDefault();
        if (selectedBook && selectedBook.id) {
            console.log('handleUpdate is called2');

            axios.put(`http://localhost:5000/books/${selectedBook.id}`, selectedBook)
                .then((response) => {
                    setBooks(books.map(book => book.id === selectedBook.id ? response.data : book));
                    setSelectedBook(null);
                });
        }
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
                                    onClick={() => handleDeleteClick(book)}
                                    className="cursor-pointer bg-red-500 text-white ml-2 px-2 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            
            {loading && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="text-white">Loading...</div>
                </div>
            )}
        </div>
    );
}

export default BookList
