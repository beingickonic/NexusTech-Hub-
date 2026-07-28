import { Suspense, lazy, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { 
  ProtectedRoute, 
  AdminRoute, 
  ManagerRoute,
  DispatchRoute,
  DriverRoute,
  InventoryRoute,
  FinanceRoute,
  SupplierRoute
} from './auth/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AdminLayout from './components/admin/AdminLayout';
import NetworkStatusBanner from './components/common/NetworkStatusBanner';
import DeepLinkHandler from './components/common/DeepLinkHandler';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ProductListingPage = lazy(() => import('./pages/public/ProductListingPage'));
const ProductDetailsPage = lazy(() => import('./pages/public/ProductDetailsPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
// Customer Dashboard (replaces ProfilePage)
const CustomerDashboard  = lazy(() => import('./pages/customer/CustomerDashboard'));
const AccountSection     = lazy(() => import('./pages/customer/sections/AccountSection'));
const OrdersSection      = lazy(() => import('./pages/customer/sections/OrdersSection'));
const WishlistSection    = lazy(() => import('./pages/customer/sections/WishlistSection'));
const AssetsSection      = lazy(() => import('./pages/customer/sections/AssetsSection'));
const BusinessSection    = lazy(() => import('./pages/customer/sections/BusinessSection'));
const MessagesSection    = lazy(() => import('./pages/customer/sections/MessagesSection'));
const ChatsSection       = lazy(() => import('./pages/customer/sections/ChatsSection'));
const SettingsSection    = lazy(() => import('./pages/customer/sections/SettingsSection'));

const CartPage = lazy(() => import('./pages/ecommerce/CartPage'));
const WishlistPage = lazy(() => import('./pages/ecommerce/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/ecommerce/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/ecommerce/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/ecommerce/OrderDetailsPage'));

const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/CustomersPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const AdminInvoicesPage = lazy(() => import('./pages/admin/InvoicesPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/ReviewsPage'));
const AdminTicketsPage = lazy(() => import('./pages/admin/TicketsPage'));
const AdminPaymentsDashboard = lazy(() => import('./pages/admin/PaymentsDashboard'));
const AdminRefundsPage = lazy(() => import('./pages/admin/AdminRefundsPage'));
// ERP Modules
const AdminDispatchPage = lazy(() => import('./pages/admin/DispatchPage'));
const AdminDriversPage  = lazy(() => import('./pages/admin/DriversPage'));
const AdminFinancePage  = lazy(() => import('./pages/admin/FinancePage'));
const AdminSuppliersPage = lazy(() => import('./pages/admin/SuppliersPage'));

// New ERP Portals
import PortalLayout from './components/portal/PortalLayout';
import PortalLoginPage from './components/portal/PortalLoginPage';
const UnauthorizedPage = lazy(() => import('./pages/portal/UnauthorizedPage'));

// Dispatch Portal
const DispatchLoginPage = lazy(() => import('./pages/dispatch/DispatchLoginPage'));
const DispatchDashboard = lazy(() => import('./pages/dispatch/DispatchDashboard'));

// Driver Portal
const DriverLoginPage = lazy(() => import('./pages/driver/DriverLoginPage'));
const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard'));
const DriverMyDeliveries = lazy(() => import('./pages/driver/pages/MyDeliveriesPage'));

// Inventory Portal
const InventoryLoginPage = lazy(() => import('./pages/inventory/InventoryLoginPage'));
const InventoryDashboard = lazy(() => import('./pages/inventory/InventoryDashboard'));

// Finance Portal
const FinanceLoginPage = lazy(() => import('./pages/finance/FinanceLoginPage'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));

// Supplier Portal
const SupplierLoginPage = lazy(() => import('./pages/supplier/SupplierLoginPage'));
const SupplierDashboard = lazy(() => import('./pages/supplier/SupplierDashboard'));

import { Truck, MapPin, Warehouse, TrendingUp, Building2, Package, Search, ListTodo, ShieldAlert } from 'lucide-react';

const PaymentLoaderPage = lazy(() => import('./pages/payment/PaymentLoaderPage'));
const PaymentSuccessPage = lazy(() => import('./pages/payment/PaymentSuccessPage'));
const PaymentFailedPage = lazy(() => import('./pages/payment/PaymentFailedPage'));
const PaymentStatusPage = lazy(() => import('./pages/payment/PaymentStatusPage'));
const ReceiptPage = lazy(() => import('./pages/payment/ReceiptPage'));
const HelpPage = lazy(() => import('./pages/public/HelpPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F4F8] dark:bg-[#0F172A]">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <DeepLinkHandler />
            <NetworkStatusBanner />
            <Toaster position="bottom-right" />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductListingPage />} />
                  <Route path="products/:id" element={<ProductDetailsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="help" element={<HelpPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="profile" element={<CustomerDashboard />}>
                      <Route index element={<Navigate to="account" replace />} />
                      <Route path="account"  element={<AccountSection />} />
                      <Route path="orders"   element={<OrdersSection />} />
                      <Route path="wishlist" element={<WishlistSection />} />
                      <Route path="assets"   element={<AssetsSection />} />
                      <Route path="business" element={<BusinessSection />} />
                      <Route path="messages" element={<MessagesSection />} />
                      <Route path="chats"    element={<ChatsSection />} />
                      <Route path="settings" element={<SettingsSection />} />
                    </Route>
                    <Route path="cart" element={<CartPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="payment/processing/:checkoutRequestId" element={<PaymentLoaderPage />} />
                    <Route path="payment/success/:paymentId" element={<PaymentSuccessPage />} />
                    <Route path="payment/failed/:orderId" element={<PaymentFailedPage />} />
                    <Route path="payment/status" element={<PaymentStatusPage />} />
                    <Route path="payment/receipt/:receiptId" element={<ReceiptPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailsPage />} />
                  </Route>
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Manager & Admin Routes */}
                <Route path="/admin" element={<ManagerRoute><AdminLayout /></ManagerRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/add" element={<ProductFormPage />} />
                  <Route path="products/edit/:id" element={<ProductFormPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="refunds" element={<AdminRefundsPage />} />
                  {/* ERP Modules */}
                  <Route path="dispatch"  element={<AdminDispatchPage />} />
                  <Route path="drivers"   element={<AdminDriversPage />} />
                  <Route path="finance"   element={<AdminFinancePage />} />
                  <Route path="suppliers" element={<AdminSuppliersPage />} />
                  {/* Strict Admin-only Routes nested */}
                  <Route path="customers" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
                  <Route path="invoices" element={<AdminRoute><AdminInvoicesPage /></AdminRoute>} />
                  <Route path="payments" element={<AdminRoute><AdminPaymentsDashboard /></AdminRoute>} />
                  <Route path="reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
                  <Route path="tickets" element={<AdminRoute><AdminTicketsPage /></AdminRoute>} />
                  <Route path="settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
                </Route>

                {/* Catch-all 404 Route and Portals */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                {/* ── Dispatch Portal ── */}
                <Route path="/dispatch/login" element={<DispatchLoginPage />} />
                <Route path="/dispatch" element={
                  <DispatchRoute>
                    <PortalLayout config={{
                      name: 'Dispatch', accentHex: '#f59e0b', homeRoute: '/dispatch/dashboard', icon: Truck,
                      nav: [
                        { name: 'Dashboard', path: '/dispatch/dashboard', icon: Truck },
                        { name: 'All Dispatches', path: '/dispatch/all', icon: Package },
                        { name: 'Driver Roster', path: '/dispatch/drivers', icon: Search }
                      ]
                    }} />
                  </DispatchRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DispatchDashboard />} />
                  <Route path="all" element={<AdminDispatchPage />} />
                  <Route path="drivers" element={<AdminDriversPage />} />
                </Route>

                {/* ── Driver Portal ── */}
                <Route path="/driver/login" element={<DriverLoginPage />} />
                <Route path="/driver" element={
                  <DriverRoute>
                    <PortalLayout config={{
                      name: 'Driver', accentHex: '#10b981', homeRoute: '/driver/dashboard', icon: MapPin,
                      nav: [
                        { name: 'My Dashboard', path: '/driver/dashboard', icon: MapPin },
                        { name: 'My Deliveries', path: '/driver/deliveries', icon: ListTodo }
                      ]
                    }} />
                  </DriverRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DriverDashboard />} />
                  <Route path="deliveries" element={<DriverMyDeliveries />} />
                </Route>

                {/* ── Inventory Portal ── */}
                <Route path="/inventory/login" element={<InventoryLoginPage />} />
                <Route path="/inventory" element={
                  <InventoryRoute>
                    <PortalLayout config={{
                      name: 'Inventory', accentHex: '#8b5cf6', homeRoute: '/inventory/dashboard', icon: Warehouse,
                      nav: [
                        { name: 'Dashboard', path: '/inventory/dashboard', icon: Warehouse },
                        { name: 'Stock Levels', path: '/inventory/stock', icon: Package }
                      ]
                    }} />
                  </InventoryRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<InventoryDashboard />} />
                  <Route path="stock" element={<AdminInventoryPage />} />
                </Route>

                {/* ── Finance Portal ── */}
                <Route path="/finance/login" element={<FinanceLoginPage />} />
                <Route path="/finance" element={
                  <FinanceRoute>
                    <PortalLayout config={{
                      name: 'Finance', accentHex: '#3b82f6', homeRoute: '/finance/dashboard', icon: TrendingUp,
                      nav: [
                        { name: 'Dashboard', path: '/finance/dashboard', icon: TrendingUp },
                        { name: 'Transactions', path: '/finance/transactions', icon: ShieldAlert }
                      ]
                    }} />
                  </FinanceRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<FinanceDashboard />} />
                  <Route path="transactions" element={<AdminFinancePage />} />
                </Route>

                {/* ── Supplier Portal ── */}
                <Route path="/supplier/login" element={<SupplierLoginPage />} />
                <Route path="/supplier" element={
                  <SupplierRoute>
                    <PortalLayout config={{
                      name: 'Supplier', accentHex: '#14b8a6', homeRoute: '/supplier/dashboard', icon: Building2,
                      nav: [
                        { name: 'Dashboard', path: '/supplier/dashboard', icon: Building2 },
                        { name: 'Purchase Orders', path: '/supplier/orders', icon: Package }
                      ]
                    }} />
                  </SupplierRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<SupplierDashboard />} />
                  <Route path="orders" element={<AdminSuppliersPage />} />
                </Route>

                {/* Catch-all 404 Route */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F8] dark:bg-dark-bg text-slate-900 dark:text-white text-center px-4">
                    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                    <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                    <p className="text-slate-500 mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
                    <a href="/" className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">Go back home</a>
                  </div>
                } />
              </Routes>
            </Suspense>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
