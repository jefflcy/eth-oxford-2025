import Link from 'next/link';

export function NavBar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link href="/">FlareGate</Link>
        </div>
        <div className="flex space-x-4">
          <Link href="/dashboard" className="text-white hover:text-gray-400">
            Dashboard
          </Link>
          <Link href="/about" className="text-white hover:text-gray-400">
            About
          </Link>
          <Link href="/contact" className="text-white hover:text-gray-400">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
} 