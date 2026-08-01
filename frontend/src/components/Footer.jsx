function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-10 mt-16">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h2 className="text-2xl font-bold">CampusConnect</h2>

        <p className="mt-4 text-gray-400">
          Making college events simple, organized, and accessible.
        </p>

        <div className="mt-6 flex justify-center gap-6">
          <a href="#" className="hover:text-blue-400">
            Home
          </a>
          <a href="#" className="hover:text-blue-400">
            Events
          </a>
          <a href="#" className="hover:text-blue-400">
            Contact
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          © 2026 CampusConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;