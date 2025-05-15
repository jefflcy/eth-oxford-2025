export default function NavBar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 fixed top-0 z-20 bg-white shadow">
      {/* Logo */}
      <div className="text-2xl font-bold text-[#FF69B4] flaregate-font cursor-pointer">
        FlareGate
      </div>
      {/* Right Section - Only contains the appkit button */}
      <div className="flex space-x-4">
        <appkit-button />
      </div>
    </nav>
  );
}
