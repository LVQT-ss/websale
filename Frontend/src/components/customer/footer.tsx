import Link from 'next/link';

const footerLinks = [
  { href: '/templates', label: 'Templates' },
  { href: '/account/customize/new', label: 'Custom Design' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
];

export default function CustomerFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold tracking-tight text-black">
            Flavor Template
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-500 transition-colors hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6 text-center">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Flavor Template. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
