import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import BookList from './components/BookList/BookList';
import CreateBook from './components/CreateBook/CreateBook';
import EditBook from './components/EditBook/EditBook';

const App = () => {
    return (
        <div>
            <Router>
                <nav className="bg-gray-800 p-4 text-white">
                    <div className="container mx-auto flex items-center">
                        <ul className="flex space-x-4">
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="container mx-auto p-4">
                    <Routes>
                        <Route path="/" element={<BookList />} />
                        <Route path="/edit/:id" element={<EditBook />} />
                        <Route path="/create" element={<CreateBook />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App
