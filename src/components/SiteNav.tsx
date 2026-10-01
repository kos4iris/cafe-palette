import { NavLink } from 'react-router-dom';

export function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Pages">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
        Create
      </NavLink>
      <NavLink
        to="/saved"
        className={({ isActive }) => (isActive ? 'is-active' : undefined)}
      >
        Saved
      </NavLink>
      <NavLink
        to="/flavor-profile"
        className={({ isActive }) => (isActive ? 'is-active' : undefined)}
      >
        Flavor Profile
      </NavLink>
    </nav>
  );
}
