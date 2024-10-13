import { FaStar } from "react-icons/fa";

const BookList = () => {
    return (
        <>
            <div className="min-h-screen">
                <LandingPage />
                <CustomerReviews />
                <PricingTable />
                <FAQ />
                <ContactForm />
            </div>
            <footer className="bg-gray-900 text-white py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; 2024 Book Management System. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
};

const LandingPage: React.FC = () => {
    return (
        <div className="bg-gray-100 flex flex-col">
            {/* Hero Section */}
            <header className="bg-cyan-200 shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl font-bold text-gray-900">Book Management System</h1>
                    <p className="mt-2 text-gray-600">
                        Easily manage your personal or professional book collections.
                    </p>
                    <div className="mt-4">
                        <a
                            href="/register"
                            className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
                        >
                            Get Started
                        </a>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="flex-1 bg-white py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
                        Key Features
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="text-2xl font-semibold text-gray-700">Manage Books</h3>
                            <p className="mt-2 text-gray-600">
                                Keep track of all your books in one place with powerful search
                                and filtering options.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="text-2xl font-semibold text-gray-700">Track Borrowing</h3>
                            <p className="mt-2 text-gray-600">
                                Never lose track of who borrowed which book with our simple
                                borrowing system.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="text-2xl font-semibold text-gray-700">Analytics</h3>
                            <p className="mt-2 text-gray-600">
                                Get insights into your reading habits with detailed analytics
                                and reports.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ContactForm: React.FC = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Contact Us</h2>
                <form className="max-w-lg mx-auto bg-gray-50 p-6 rounded-lg shadow-lg">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            id="name"
                            type="text"
                            placeholder="Your name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            id="email"
                            type="email"
                            placeholder="Your email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                            Message
                        </label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            id="message"
                            rows={4}
                            placeholder="Your message"
                        />
                    </div>
                    <button
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        type="submit"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
};

const PricingTable: React.FC = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Pricing Plans</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Basic Plan */}
                    <div className="bg-gray-50 shadow-lg p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-gray-800">Basic</h3>
                        <p className="mt-4 text-gray-600">Perfect for individual use</p>
                        <p className="mt-2 text-4xl font-bold text-gray-900">$9.99</p>
                        <ul className="mt-4 space-y-2">
                            <li className="text-gray-600">Manage up to 100 books</li>
                            <li className="text-gray-600">Track borrowing</li>
                            <li className="text-gray-600">Basic analytics</li>
                        </ul>
                        <a
                            href="/signup"
                            className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
                        >
                            Choose Plan
                        </a>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-blue-500 text-white shadow-lg p-6 rounded-lg">
                        <h3 className="text-2xl font-bold">Pro</h3>
                        <p className="mt-4">Best for small teams</p>
                        <p className="mt-2 text-4xl font-bold">$29.99</p>
                        <ul className="mt-4 space-y-2">
                            <li>Manage up to 1000 books</li>
                            <li>Advanced tracking and analytics</li>
                            <li>Team collaboration</li>
                        </ul>
                        <a
                            href="/signup"
                            className="mt-6 inline-block bg-white text-blue-500 py-2 px-4 rounded-md shadow hover:bg-gray-100 transition-colors"
                        >
                            Choose Plan
                        </a>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-gray-50 shadow-lg p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-gray-800">Enterprise</h3>
                        <p className="mt-4 text-gray-600">For large organizations</p>
                        <p className="mt-2 text-4xl font-bold text-gray-900">$99.99</p>
                        <ul className="mt-4 space-y-2">
                            <li className="text-gray-600">Unlimited books</li>
                            <li className="text-gray-600">Priority support</li>
                            <li className="text-gray-600">Custom solutions</li>
                        </ul>
                        <a
                            href="/signup"
                            className="mt-6 inline-block bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition-colors"
                        >
                            Choose Plan
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

const FAQ: React.FC = () => {
    const faqs = [
        {
            question: "Can I track borrowed books?",
            answer: "Yes, you can easily track borrowed books and see who has them and when they are due to be returned.",
        },
        {
            question: "Is there a free trial?",
            answer: "Yes, we offer a 14-day free trial on all our plans so you can explore all the features before committing.",
        },
        {
            question: "How secure is my data?",
            answer: "We use industry-standard security practices to ensure your data is safe and protected.",
        },
    ];

    return (
        <section className="py-12 bg-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white shadow-lg p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-700">{faq.question}</h3>
                            <p className="mt-2 text-gray-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CustomerReviews: React.FC = () => {
    const reviews = [
        {
            name: "John Doe",
            rating: 5,
            text: "This book management system has transformed the way I organize my personal library. Highly recommend it!",
        },
        {
            name: "Jane Smith",
            rating: 4,
            text: "Great system with easy-to-use features. The analytics tool is particularly helpful.",
        },
        {
            name: "Robert Johnson",
            rating: 5,
            text: "I love the borrowing feature! I no longer lose track of who borrowed my books.",
        },
    ];

    return (
        <section className="bg-gray-100 py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Customer Reviews</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-white shadow-lg p-6 rounded-lg">
                            <div className="flex items-center mb-2">
                                {[...Array(review.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-yellow-400" />
                                ))}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700">{review.name}</h3>
                            <p className="mt-2 text-gray-600">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};



export default BookList;
