import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { StoreLayout } from '../layouts/StoreLayout'
import { useAuth } from '../shared/hooks/useAuth'
import { storage } from '../shared/utils/storage'

function lazyNamed(importer, exportName) {
  return lazy(() => importer().then((module) => ({ default: module[exportName] })))
}

const StoreHomePage = lazyNamed(() => import('../features/storefront/pages/StoreHomePage'), 'StoreHomePage')
const ProductListPage = lazyNamed(() => import('../features/storefront/pages/ProductListPage'), 'ProductListPage')
const ProductDetailPage = lazyNamed(() => import('../features/storefront/pages/ProductDetailPage'), 'ProductDetailPage')
const CartPage = lazyNamed(() => import('../features/cart/pages/CartPage'), 'CartPage')
const BakongPaymentPage = lazyNamed(() => import('../features/cart/pages/BakongPaymentPage'), 'BakongPaymentPage')
const CustomerOrdersPage = lazyNamed(() => import('../features/storefront/pages/CustomerOrdersPage'), 'CustomerOrdersPage')
const ProfilePage = lazyNamed(() => import('../features/profile/pages/ProfilePage'), 'ProfilePage')

const LoginPage = lazyNamed(() => import('../features/auth/pages/LoginPage'), 'LoginPage')
const AdminLoginPage = lazyNamed(() => import('../features/auth/pages/AdminLoginPage'), 'AdminLoginPage')
const VerifyEmailPage = lazyNamed(() => import('../features/auth/pages/VerifyEmailPage'), 'VerifyEmailPage')
const ForgotPasswordPage = lazyNamed(() => import('../features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyNamed(() => import('../features/auth/pages/ResetPasswordPage'), 'ResetPasswordPage')
const RegisterPage = lazyNamed(() => import('../features/auth/pages/RegisterPage'), 'RegisterPage')

const AdminHomePage = lazyNamed(() => import('../features/admin/pages/AdminHomePage'), 'AdminHomePage')
const AdminProfilePage = lazyNamed(() => import('../features/admin/pages/AdminProfilePage'), 'AdminProfilePage')
const AdminUserCreatePage = lazyNamed(() => import('../features/users/pages/UserCreatePage'), 'UserCreatePage')
const AdminUserDetailPage = lazyNamed(() => import('../features/users/pages/UserDetailPage'), 'UserDetailPage')
const AdminUserEditPage = lazyNamed(() => import('../features/users/pages/UserEditPage'), 'UserEditPage')
const AdminUserListPage = lazyNamed(() => import('../features/users/pages/UserListPage'), 'UserListPage')
const AdminProductCreatePage = lazyNamed(() => import('../features/products/pages/ProductCreatePage'), 'ProductCreatePage')
const AdminProductDetailPage = lazyNamed(() => import('../features/products/pages/ProductDetailPage'), 'ProductDetailPage')
const AdminProductEditPage = lazyNamed(() => import('../features/products/pages/ProductEditPage'), 'ProductEditPage')
const AdminProductListPage = lazyNamed(() => import('../features/products/pages/ProductListPage'), 'ProductListPage')
const AdminVariantTypeListPage = lazyNamed(() => import('../features/products/pages/VariantTypeListPage'), 'VariantTypeListPage')
const AdminCategoryCreatePage = lazyNamed(() => import('../features/categories/pages/CategoryCreatePage'), 'CategoryCreatePage')
const AdminCategoryDetailPage = lazyNamed(() => import('../features/categories/pages/CategoryDetailPage'), 'CategoryDetailPage')
const AdminCategoryEditPage = lazyNamed(() => import('../features/categories/pages/CategoryEditPage'), 'CategoryEditPage')
const AdminCategoryListPage = lazyNamed(() => import('../features/categories/pages/CategoryListPage'), 'CategoryListPage')
const AdminBrandCreatePage = lazyNamed(() => import('../features/brands/pages/BrandCreatePage'), 'BrandCreatePage')
const AdminBrandDetailPage = lazyNamed(() => import('../features/brands/pages/BrandDetailPage'), 'BrandDetailPage')
const AdminBrandEditPage = lazyNamed(() => import('../features/brands/pages/BrandEditPage'), 'BrandEditPage')
const AdminBrandListPage = lazyNamed(() => import('../features/brands/pages/BrandListPage'), 'BrandListPage')
const AdminBannerCreatePage = lazyNamed(() => import('../features/banners/pages/BannerCreatePage'), 'BannerCreatePage')
const AdminBannerListPage = lazyNamed(() => import('../features/banners/pages/BannerListPage'), 'BannerListPage')
const AdminBannerDetailPage = lazyNamed(() => import('../features/banners/pages/BannerDetailPage'), 'BannerDetailPage')
const AdminBannerEditPage = lazyNamed(() => import('../features/banners/pages/BannerEditPage'), 'BannerEditPage')
const AdminLogoCreatePage = lazyNamed(() => import('../features/logos/pages/LogoCreatePage'), 'LogoCreatePage')
const AdminLogoDetailPage = lazyNamed(() => import('../features/logos/pages/LogoDetailPage'), 'LogoDetailPage')
const AdminLogoEditPage = lazyNamed(() => import('../features/logos/pages/LogoEditPage'), 'LogoEditPage')
const AdminLogoListPage = lazyNamed(() => import('../features/logos/pages/LogoListPage'), 'LogoListPage')
const AdminOrderListPage = lazyNamed(() => import('../features/orders/pages/OrderListPage'), 'OrderListPage')
const AdminOrderDetailPage = lazyNamed(() => import('../features/orders/pages/OrderDetailPage'), 'OrderDetailPage')

function RouteLoading() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return <AuthPageSkeleton />
    }

    return <AdminPageSkeleton />
  }

  if (isAuthPath(pathname)) {
    return <AuthPageSkeleton />
  }

  return <StorePageSkeleton />
}

function isAuthPath(pathname) {
  return ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(pathname)
}

function StorePageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-teal-900/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-md" />
            <div className="skeleton-shimmer h-6 w-28 rounded" />
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <div className="skeleton-shimmer h-4 w-14 rounded" />
            <div className="skeleton-shimmer h-4 w-16 rounded" />
            <div className="skeleton-shimmer h-4 w-20 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-md" />
            <div className="skeleton-shimmer h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
      <main>
        <section className="border-b border-teal-900/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <div className="skeleton-shimmer h-4 w-36 rounded" />
              <div className="space-y-3">
                <div className="skeleton-shimmer h-12 w-full max-w-xl rounded" />
                <div className="skeleton-shimmer h-12 w-4/5 max-w-lg rounded" />
                <div className="skeleton-shimmer h-12 w-3/5 max-w-md rounded" />
              </div>
              <div className="skeleton-shimmer h-5 w-full max-w-lg rounded" />
              <div className="flex gap-3">
                <div className="skeleton-shimmer h-12 w-36 rounded-md" />
                <div className="skeleton-shimmer h-12 w-36 rounded-md" />
              </div>
            </div>
            <div className="skeleton-shimmer h-64 rounded-lg" />
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="skeleton-shimmer h-8 w-56 rounded" />
              <div className="skeleton-shimmer h-4 w-72 rounded" />
            </div>
            <div className="hidden gap-2 sm:flex">
              <div className="skeleton-shimmer h-10 w-14 rounded-md" />
              <div className="skeleton-shimmer h-10 w-24 rounded-md" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-lg border border-teal-900/15 bg-white p-3" key={index}>
                <div className="skeleton-shimmer h-44 rounded-md" />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="skeleton-shimmer h-5 w-2/3 rounded" />
                  <div className="skeleton-shimmer h-7 w-20 rounded-md" />
                </div>
                <div className="mt-3 skeleton-shimmer h-4 w-full rounded" />
                <div className="mt-2 skeleton-shimmer h-4 w-4/5 rounded" />
                <div className="mt-5 flex justify-between">
                  <div className="skeleton-shimmer h-6 w-24 rounded" />
                  <div className="skeleton-shimmer h-4 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function AuthPageSkeleton() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-white p-5 text-teal-950">
      <div className="absolute left-5 top-5 skeleton-shimmer h-10 w-32 rounded-md" />
      <div className="w-full">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="skeleton-shimmer h-12 w-12 rounded-md" />
            <div className="skeleton-shimmer h-8 w-32 rounded" />
          </div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-lg border border-teal-900/15 bg-white p-6 shadow-sm">
          <div className="skeleton-shimmer h-4 w-24 rounded" />
          <div className="mt-4 skeleton-shimmer h-8 w-44 rounded" />
          <div className="mt-3 skeleton-shimmer h-4 w-64 rounded" />
          <div className="mt-8 grid gap-4">
            <div className="skeleton-shimmer h-11 rounded-md" />
            <div className="skeleton-shimmer h-11 rounded-md" />
            <div className="skeleton-shimmer h-11 rounded-md" />
          </div>
          <div className="mt-6 skeleton-shimmer h-11 rounded-md" />
        </div>
      </div>
    </main>
  )
}

function AdminPageSkeleton() {
  return (
    <div className="min-h-screen max-w-[100vw] overflow-hidden bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 hidden w-72 border-r border-slate-200 bg-white p-5 md:block">
        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-11 w-11 rounded-lg" />
          <div className="min-w-0 space-y-2">
            <div className="skeleton-shimmer h-6 w-28 rounded" />
            <div className="skeleton-shimmer h-4 w-36 rounded" />
          </div>
        </div>
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="skeleton-shimmer h-11 rounded-md" key={index} />
          ))}
        </div>
      </aside>
      <main className="md:ml-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="skeleton-shimmer h-4 w-36 rounded" />
              <div className="skeleton-shimmer h-3 w-56 rounded" />
            </div>
            <div className="skeleton-shimmer h-12 w-32 rounded-md" />
          </div>
        </header>
        <div className="grid gap-5 p-5">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="skeleton-shimmer h-4 w-28 rounded" />
            <div className="mt-4 skeleton-shimmer h-9 w-52 rounded" />
            <div className="mt-3 skeleton-shimmer h-4 w-96 max-w-full rounded" />
          </section>
          <section className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={index}>
                <div className="skeleton-shimmer h-4 w-24 rounded" />
                <div className="mt-4 skeleton-shimmer h-8 w-16 rounded" />
                <div className="mt-4 skeleton-shimmer h-4 w-32 rounded" />
              </div>
            ))}
          </section>
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="skeleton-shimmer h-6 w-40 rounded" />
            </div>
            <div className="grid gap-3 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="skeleton-shimmer h-12 rounded-md" key={index} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <AuthPageSkeleton />
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  return children
}

function AdminGuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <AuthPageSkeleton />
  }

  if (isAuthenticated && user?.is_admin && storage.isAdminSession()) {
    return <Navigate replace to="/admin" />
  }

  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <AdminPageSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/admin/login" />
  }

  if (!user?.is_admin || !storage.isAdminSession()) {
    return <Navigate replace to="/" />
  }

  return children
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route
            path="/"
            element={
              <StoreLayout>
                <StoreHomePage />
              </StoreLayout>
            }
          />
          <Route
            path="/products"
            element={
              <StoreLayout>
                <ProductListPage />
              </StoreLayout>
            }
          />
          <Route
            path="/products/:slug"
            element={
              <StoreLayout>
                <ProductDetailPage />
              </StoreLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <StoreLayout>
                <CartPage />
              </StoreLayout>
            }
          />
          <Route
            path="/payments/bakong/:orderId"
            element={
              <StoreLayout>
                <BakongPaymentPage />
              </StoreLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <StoreLayout>
                <CustomerOrdersPage />
              </StoreLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <StoreLayout>
                <ProfilePage />
              </StoreLayout>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <AdminGuestRoute>
                <AuthLayout>
                  <AdminLoginPage />
                </AuthLayout>
              </AdminGuestRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <GuestRoute>
                <AuthLayout>
                  <VerifyEmailPage />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ForgotPasswordPage />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <AuthLayout>
                  <ResetPasswordPage />
                </AuthLayout>
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              </GuestRoute>
            }
          />

        <Route
          path="/admin/users/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUserCreatePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUserEditPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUserDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUserListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProductCreatePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:slug/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProductEditPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:slug"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProductDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProductListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/variant-types"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminVariantTypeListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCategoryCreatePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories/:slug/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCategoryEditPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories/:slug"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCategoryDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCategoryListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/brands/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBrandCreatePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/brands/:slug/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBrandEditPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/brands/:slug"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBrandDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBrandListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banners/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBannerCreatePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banners/:id/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBannerEditPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBannerListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banners/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBannerDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/logos/create"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminLogoCreatePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/logos/:id/edit"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminLogoEditPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/logos/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminLogoDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/logos"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminLogoListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrderListPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrderDetailPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProfilePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminHomePage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
