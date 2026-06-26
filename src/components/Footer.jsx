import { Link } from 'react-router-dom';
import { FiMail, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';
import logo from '../assets/logo.svg';

const footerLinks = {
  product: [
    { to: '/scan', label: 'Free Scan' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/dashboard', label: 'Dashboard' },
  ],
  resources: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/contact', label: 'Contact' },
  ],
  company: [
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/careers', label: 'Careers' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand column */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="DPDPready" className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered privacy compliance for India’s DPDP Act. Scan websites, generate reports, and stay compliant.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><FiTwitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><FiGithub className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><FiLinkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Stay updated
            </h3>
            <p className="text-sm mb-4">
              Get compliance tips and product updates.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                <FiMail className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Legal bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DPDPready. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
