import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
    const [scrollPosition, setScrollPosition] = useState(0);

    // Handle scroll position for parallax effects
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full top-0 z-40 transition-all duration-300 ${scrollPosition > 50 ? 'bg-white bg-opacity-90 backdrop-blur-md shadow-md' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <span className={`text-2xl font-bold ${scrollPosition > 50 ? 'text-gradient-primary' : 'text-white text-shadow-lg'}`}> 109Cops </span>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}

export default Header