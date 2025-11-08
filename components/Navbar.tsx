import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link href='/' className="flex items-center space-x-2 font-bold text-xl text-gray-900">
                    <Image src="/icons/logo.png" alt="logo" width={32} height={32} />
                    <span>DevEvent</span>
                </Link>

                <ul className="flex space-x-6">
                    <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/events" className="text-gray-700 hover:text-blue-600 transition-colors">
                        Browse Events
                    </Link>
                    <Link href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Create Event
                    </Link>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar