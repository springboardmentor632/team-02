import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Allows any authenticated user. Redirects to /login if not logged in. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

/** Citizen/Researcher/Organization guard. Redirects to /unauthorized if wrong role. */
export const citizenGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  const role = auth.getCurrentUser()?.role;
  if (role === 'Citizen' || role === 'Researcher' || role === 'Organization') return true;
  router.navigate(['/unauthorized']);
  return false;
};

/** Government Official-only guard. Redirects to /unauthorized if wrong role. */
export const governmentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  const role = auth.getCurrentUser()?.role;
  if (role === 'Government Official') return true;
  router.navigate(['/unauthorized']);
  return false;
};

/** Administrator-only guard. Redirects to /unauthorized if wrong role. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  const role = auth.getCurrentUser()?.role;
  if (role === 'Administrator') return true;
  router.navigate(['/unauthorized']);
  return false;
};

/** Smart dashboard redirect — sends each role to their own dashboard. */
export const dashboardRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  auth.navigateByRole(auth.getCurrentUser()?.role);
  return false;
};
