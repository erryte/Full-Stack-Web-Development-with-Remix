import { Outlet, NavLink as RemixNavLink } from '@remix-run/react';
import { Container } from '~/components/containers';
import { NavLink } from '~/components/links';

export default function Layout() {
  return (
    <>
      <header>
        <Container className="p-4 mb-10">
          <nav>
            <ul className="w-full flex flex-row gap-5 font-bold text-lg lg:text-2xl">
              <li>
                <RemixNavLink to="/">BeeRich</RemixNavLink>
              </li>
              <li className="ml-auto">
                <RemixNavLink to="/404">Log out</RemixNavLink>
              </li>
            </ul>
            <ul className="mt-10 w-full flex flex-row gap-5">
              <li className="ml-auto">
                <NavLink to="/dashboard/income">Income</NavLink>
              </li>
              <li className="mr-auto">
                <NavLink to="/dashboard/expenses">Expenses</NavLink>
              </li>
            </ul>
          </nav>
        </Container>
      </header>
      <main className="p-4 w-full flex justify-center items-center">
        <Outlet />
      </main>
    </>
  );
}
