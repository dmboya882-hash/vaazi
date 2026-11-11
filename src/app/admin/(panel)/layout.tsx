import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "../login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b border-line bg-card md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5 md:block md:py-7">
          <Link href="/admin" className="block">
            <span className="display pl-[0.3em] text-2xl font-medium tracking-[0.3em]">{site.name}</span>
            <span className="eyebrow mt-1 block">Admin</span>
          </Link>
          {/* Phones: toggle sits next to the name */}
          <ThemeToggle className="md:hidden" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm md:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="px-3 py-2 hover:bg-soft">
              {n.label}
            </Link>
          ))}
          <Link href="/" className="whitespace-nowrap px-3 py-2 text-muted hover:bg-soft">
            View store ↗
          </Link>
          <form action={logout}>
            <button className="w-full whitespace-nowrap px-3 py-2 text-left text-muted hover:bg-soft">Sign out</button>
          </form>
        </nav>
        <div className="mt-auto hidden border-t border-line px-3 py-3 text-sm text-muted md:block">
          <ThemeToggle showLabel className="w-full px-3 hover:bg-soft" />
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
