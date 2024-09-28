import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import { GlobalStateProvider } from './context/GlobalStateProvider';
import { useGlobalState } from './context/GlobalStateProvider';
import React, { useEffect } from 'react';
// コンポーネントを遅延読み込み
import { Suspense, lazy } from 'react';
const MyBooks = lazy(() => import('./components/BookList/MyBooks'));
const CreateBook = lazy(() => import('./components/CreateBook/CreateBook'));
const EditBook = lazy(() => import('./components/EditBook/EditBook'));

// import MyBooks from './components/BookList/MyBooks';
// import CreateBook from './components/CreateBook/CreateBook';
// import EditBook from './components/EditBook/EditBook';
import BookList from './components/BookList/BookList';
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from './components/Auth/ProtectRoute';
import ErrorModal from './components/Modal/ErrorModal';
import SuccessModal from './components/Modal/SuccessModal';
import ImageModal from './components/Modal/ImageModal';
import WarningModal from './components/Modal/WarningModal';
import Loading from './components/Modal/Loading';

const AppContent = () => {
    const {
        loadingTxt,
        errorMessage,
        warningMessage,
        imageModalSrc,
        successMessage,
        setErrorMessage,
        setSuccessMessage,
        setWarningMessage,
        setImageModalSrc,
    } = useGlobalState();

    const closeImageModal = () => { setImageModalSrc(''); };

    useEffect(() => {
        if (successMessage || errorMessage || warningMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setWarningMessage(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage, warningMessage]);

    return (
        <>
            <Suspense fallback={<Loading loadingTxt={'Loading...'} />}>
                <Routes>
                    <Route path="/" element={<BookList />} />
                    <Route path="/books" element={<ProtectedRoute><MyBooks /></ProtectedRoute>} />
                    <Route path="/edit/:id" element={<ProtectedRoute><EditBook /></ProtectedRoute>} />
                    <Route path="/create" element={<ProtectedRoute><CreateBook /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </Suspense>

            {successMessage && <SuccessModal successMessage={successMessage} />}
            {warningMessage && <WarningModal warningMessage={warningMessage} />}
            {errorMessage && <ErrorModal errorMessage={errorMessage} />}
            {imageModalSrc && <ImageModal closeModal={closeImageModal} imageModalSrc={imageModalSrc} />}
            {loadingTxt && <Loading loadingTxt={loadingTxt} />}
        </>
    );
};


const App = () => {
    return (
        <GlobalStateProvider>
            <Router>
                <nav className="bg-gray-900 p-4 text-white shadow-lg fixed w-full top-0 z-20">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="text-lg font-bold">
                            <Link to="/">Auto Writing</Link>
                        </div>
                        <ul className="flex space-x-6">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-gray-300 transition-colors duration-200">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="hover:text-gray-300 transition-colors duration-200">
                                    Register
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className="hover:text-gray-300 transition-colors duration-200">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div className="">
                    <AppContent />
                </div>
            </Router>
        </GlobalStateProvider>
    );
}

export default App
