import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { 
  ProtectedRoute, 
  CustomerRoute,
  ManagerRoute,
  DispatchRoute,
  DriverRoute,
  InventoryRoute,
  SupplierRoute,
  FinanceRoute
} from './auth/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AdminLayout from './components/admin/AdminLayout';
import NetworkStatusBanner from './components/common/NetworkStatusBanner';
import DeepLinkHandler from './components/common/DeepLinkHandler';
import { Toaster } from 'react-hot-toast';

/* global __BUILD_COMMIT__, __BUILD_TIMESTAMP__ */

// Retry dynamic imports that fail transiently (dev-server HMR/module-graph
// refresh, stale chunk URLs). Falls through to the error boundary if it persists.
const retryableLazy = (importer, retries = 2) =>
  lazy(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await importer();
      } catch (err) {
        if (attempt >= retries) throw err;
        await new Promise(r => setTimeout(r, 400));
      }
    }
  });

// Lazy load pages for code splitting
const HomePage = retryableLazy(() => import('./pages/public/HomePage'));
const ProductListingPage = retryableLazy(() => import('./pages/public/ProductListingPage'));
const ProductDetailsPage = retryableLazy(() => import('./pages/public/ProductDetailsPage'));
const AboutPage = retryableLazy(() => import('./pages/public/AboutPage'));
const ContactPage = retryableLazy(() => import('./pages/public/ContactPage'));
const LoginPage = retryableLazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = retryableLazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = retryableLazy(() => import('./pages/auth/ForgotPasswordPage'));
// Customer Dashboard (replaces ProfilePage)
const CustomerDashboard  = retryableLazy(() => import('./pages/customer/CustomerDashboard'));
const AccountSection     = retryableLazy(() => import('./pages/customer/sections/AccountSection'));
const OrdersSection      = retryableLazy(() => import('./pages/customer/sections/OrdersSection'));
const WishlistSection    = retryableLazy(() => import('./pages/customer/sections/WishlistSection'));
const AssetsSection      = retryableLazy(() => import('./pages/customer/sections/AssetsSection'));
const BusinessSection    = retryableLazy(() => import('./pages/customer/sections/BusinessSection'));
const MessagesSection    = retryableLazy(() => import('./pages/customer/sections/MessagesSection'));
const ChatsSection       = retryableLazy(() => import('./pages/customer/sections/ChatsSection'));
const SettingsSection    = retryableLazy(() => import('./pages/customer/sections/SettingsSection'));

const CartPage = retryableLazy(() => import('./pages/ecommerce/CartPage'));
const WishlistPage = retryableLazy(() => import('./pages/ecommerce/WishlistPage'));
const CheckoutPage = retryableLazy(() => import('./pages/ecommerce/CheckoutPage'));
const OrdersPage = retryableLazy(() => import('./pages/ecommerce/OrdersPage'));
const OrderDetailsPage = retryableLazy(() => import('./pages/ecommerce/OrderDetailsPage'));

const AdminDashboardPage = retryableLazy(() => import('./pages/admin/DashboardPage'));
const AdminProductsPage = retryableLazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = retryableLazy(() => import('./pages/admin/ProductFormPage'));
const AdminOrdersPage = retryableLazy(() => import('./pages/admin/OrdersPage'));
const AdminCustomersPage = retryableLazy(() => import('./pages/admin/CustomersPage'));
const AdminReportsPage = retryableLazy(() => import('./pages/admin/ReportsPage'));
const AdminInvoicesPage = retryableLazy(() => import('./pages/admin/InvoicesPage'));
const AdminInventoryPage = retryableLazy(() => import('./pages/admin/InventoryPage'));
const AdminSettingsPage = retryableLazy(() => import('./pages/admin/SettingsPage'));
const AdminReviewsPage = retryableLazy(() => import('./pages/admin/ReviewsPage'));
const AdminTicketsPage = retryableLazy(() => import('./pages/admin/TicketsPage'));
const AdminPaymentsDashboard = retryableLazy(() => import('./pages/admin/PaymentsDashboard'));
const ManualPaymentsPage = retryableLazy(() => import('./pages/admin/ManualPaymentsPage'));
const AdminRefundsPage = retryableLazy(() => import('./pages/admin/AdminRefundsPage'));
// ERP Modules
const AdminDispatchPage = retryableLazy(() => import('./pages/admin/DispatchPage'));
const AdminDriversPage  = retryableLazy(() => import('./pages/admin/DriversPage'));
const AdminSuppliersPage = retryableLazy(() => import('./pages/admin/SuppliersPage'));
const AdminUsersPage = retryableLazy(() => import('./pages/admin/UsersPage'));
const AdminSystemMonitorPage = retryableLazy(() => import('./pages/admin/SystemMonitorPage'));

// New ERP Portals
import PortalLayout from './components/portal/PortalLayout';
import FinanceLayout from './components/finance/FinanceLayout';
const UnauthorizedPage = retryableLazy(() => import('./pages/portal/UnauthorizedPage'));

// Finance Portal
const FinanceDashboard = retryableLazy(() => import('./pages/finance/FinanceDashboard'));
const FinanceApprovals = retryableLazy(() => import('./pages/finance/ApprovalsPage'));
const FinanceInvoices = retryableLazy(() => import('./pages/finance/InvoicesPage'));
const FinancePayments = retryableLazy(() => import('./pages/finance/PaymentsPage'));
const FinanceExpenses = retryableLazy(() => import('./pages/finance/ExpensesPage'));
const FinanceReports = retryableLazy(() => import('./pages/finance/ReportsPage'));
const FinanceSettings = retryableLazy(() => import('./pages/finance/SettingsPage'));

// Dispatch Portal
const DispatchLoginPage = retryableLazy(() => import('./pages/dispatch/DispatchLoginPage'));
const DispatchDashboard = retryableLazy(() => import('./pages/dispatch/DispatchDashboard'));

// Driver Portal
const DriverLoginPage = retryableLazy(() => import('./pages/driver/DriverLoginPage'));
const DriverDashboard = retryableLazy(() => import('./pages/driver/DriverDashboard'));
const DriverMyDeliveries = retryableLazy(() => import('./pages/driver/pages/MyDeliveriesPage'));
const DriverDeliveryStatus = retryableLazy(() => import('./pages/driver/pages/DeliveryStatusPage'));

// Inventory Portal
const InventoryLoginPage = retryableLazy(() => import('./pages/inventory/InventoryLoginPage'));
const InventoryDashboard = retryableLazy(() => import('./pages/inventory/InventoryDashboard'));
const InventoryProductsPage = retryableLazy(() => import('./pages/inventory/InventoryProductsPage'));
const StockMovementsPage = retryableLazy(() => import('./pages/inventory/StockMovementsPage'));
const GoodsReceivedPage = retryableLazy(() => import('./pages/inventory/GoodsReceivedPage'));
const PurchaseOrdersPage = retryableLazy(() => import('./pages/inventory/PurchaseOrdersPage'));
const InventorySuppliersPage = retryableLazy(() => import('./pages/inventory/InventorySuppliersPage'));
const StockTransfersPage = retryableLazy(() => import('./pages/inventory/StockTransfersPage'));
const InventoryReturnsPage = retryableLazy(() => import('./pages/inventory/InventoryReturnsPage'));
const DamagedStockPage = retryableLazy(() => import('./pages/inventory/DamagedStockPage'));
const WarehouseLocationsPage = retryableLazy(() => import('./pages/inventory/WarehouseLocationsPage'));
const InventoryReportsPage = retryableLazy(() => import('./pages/inventory/InventoryReportsPage'));
const InventoryNotificationsPage = retryableLazy(() => import('./pages/inventory/InventoryNotificationsPage'));
const InventorySettingsPage = retryableLazy(() => import('./pages/inventory/InventorySettingsPage'));
const InventoryProfilePage = retryableLazy(() => import('./pages/inventory/InventoryProfilePage'));
const InventoryApprovalsPage = retryableLazy(() => import('./pages/inventory/InventoryApprovalsPage'));
const OrderProcessingPage = retryableLazy(() => import('./pages/inventory/OrderProcessingPage'));

// Supplier Portal
const SupplierLoginPage = retryableLazy(() => import('./pages/supplier/SupplierLoginPage'));
const SupplierDashboard = retryableLazy(() => import('./pages/supplier/SupplierDashboard'));
const SupplierProductsPage = retryableLazy(() => import('./pages/supplier/SupplierProductsPage'));

import { Truck, MapPin, Warehouse, Building2, Package, Search, ListTodo, Box, ClipboardCheck, ShoppingCart, Users, ArrowLeftRight, Undo2, AlertTriangle, BarChart2, Bell, Settings, User, PieChart, FileText, CreditCard, Receipt } from 'lucide-react';

const PaymentLoaderPage = retryableLazy(() => import('./pages/payment/PaymentLoaderPage'));
const PaymentSuccessPage = retryableLazy(() => import('./pages/payment/PaymentSuccessPage'));
const PaymentFailedPage = retryableLazy(() => import('./pages/payment/PaymentFailedPage'));
const PaymentStatusPage = retryableLazy(() => import('./pages/payment/PaymentStatusPage'));
const ReceiptPage = retryableLazy(() => import('./pages/payment/ReceiptPage'));
const MockPaymentPage = retryableLazy(() => import('./pages/payment/MockPaymentPage'));
const InvoicePage = retryableLazy(() => import('./pages/payment/InvoicePage'));
const HelpPage = retryableLazy(() => import('./pages/public/HelpPage'));
const NotificationsPage = retryableLazy(() => import('./pages/portal/NotificationsPage'));
const ReportsDashboardPage = retryableLazy(() => import('./pages/portal/ReportsDashboardPage'));
const FailureMonitorPage = retryableLazy(() => import('./pages/admin/FailureMonitorPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-nexus-surface dark:bg-nexus-bg">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Web deployments support clean, refresh-safe URLs through the configured SPA rewrite.
// Capacitor loads from file://, where hash routing remains necessary.
const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;

const BuildDiagnostics = () => {
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const layout = location.pathname.startsWith('/profile') ? 'CustomerDashboard'
        : location.pathname.startsWith('/admin') ? 'AdminLayout' : 'PublicLayout';
    console.info('[NexusTech build]', {
      commit: __BUILD_COMMIT__,
      builtAt: __BUILD_TIMESTAMP__,
      route: location.pathname,
      role: user?.role || 'anonymous',
      layout,
    });
  }, [location.pathname, user?.role]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <DeepLinkHandler />
            <BuildDiagnostics />
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
                    <Route path="profile" element={
                      <CustomerRoute>
                        <CustomerDashboard />
                      </CustomerRoute>
                    }>
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
                    <Route path="payment/mock/:orderId" element={<MockPaymentPage />} />
                    <Route path="payment/invoice/:orderId" element={<InvoicePage />} />
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
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="analytics" element={<ReportsDashboardPage />} />
                  <Route path="failures" element={<FailureMonitorPage />} />
                  <Route path="monitor" element={<AdminSystemMonitorPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="finance">
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<FinanceDashboard />} />
                    <Route path="approvals" element={<FinanceApprovals />} />
                    <Route path="invoices" element={<FinanceInvoices />} />
                    <Route path="payments" element={<FinancePayments />} />
                    <Route path="expenses" element={<FinanceExpenses />} />
                    <Route path="reports" element={<FinanceReports />} />
                  </Route>
                </Route>

                {/* Catch-all 404 Route and Portals */}
                <Route path="/403" element={<UnauthorizedPage />} />
                
                {/* â”€â”€ Dispatch Portal â”€â”€ */}
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
                  <Route path="pending" element={<AdminDispatchPage defaultStatus="pending" />} />
                  <Route path="completed" element={<AdminDispatchPage defaultStatus="delivered" />} />
                  <Route path="drivers" element={<AdminDriversPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="analytics" element={<ReportsDashboardPage />} />
                </Route>

                {/* â”€â”€ Driver Portal â”€â”€ */}
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
                  <Route path="deliveries/:id" element={<DriverDeliveryStatus />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="analytics" element={<ReportsDashboardPage />} />
                </Route>

                {/* â”€â”€ Inventory Portal â”€â”€ */}
                <Route path="/inventory/login" element={<InventoryLoginPage />} />
                <Route path="/inventory" element={
                  <InventoryRoute>
                    <PortalLayout config={{
                      name: 'Inventory', accentHex: '#FF6B57', homeRoute: '/inventory/dashboard', icon: Warehouse,
                      nav: [
                        { name: 'Dashboard', path: '/inventory/dashboard', icon: Warehouse },
                        { name: 'Order Approvals', path: '/inventory/order-approvals', icon: ClipboardCheck },
                        { name: 'Order Processing', path: '/inventory/order-processing', icon: Package },
                        { name: 'Products', path: '/inventory/products', icon: Box },
                        { name: 'Stock Movement', path: '/inventory/movements', icon: Package },
                        { name: 'Goods Received', path: '/inventory/goods-received', icon: ClipboardCheck },
                        { name: 'Purchase Orders', path: '/inventory/purchase-orders', icon: ShoppingCart },
                        { name: 'Suppliers', path: '/inventory/suppliers', icon: Users },
                        { name: 'Transfers', path: '/inventory/transfers', icon: ArrowLeftRight },
                        { name: 'Returns', path: '/inventory/returns', icon: Undo2 },
                        { name: 'Damaged Stock', path: '/inventory/damaged-stock', icon: AlertTriangle },
                        { name: 'Warehouse Locations', path: '/inventory/locations', icon: MapPin },
                        { name: 'Reports', path: '/inventory/reports', icon: BarChart2 },
                        { name: 'Notifications', path: '/inventory/notifications', icon: Bell },
                        { name: 'Settings', path: '/inventory/settings', icon: Settings },
                        { name: 'Profile', path: '/inventory/profile', icon: User }
                      ]
                    }} />
                  </InventoryRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<InventoryDashboard />} />
                  <Route path="order-approvals" element={<InventoryApprovalsPage />} />
                  <Route path="order-processing" element={<OrderProcessingPage />} />
                  <Route path="products" element={<InventoryProductsPage />} />
                  <Route path="movements" element={<StockMovementsPage />} />
                  <Route path="goods-received" element={<GoodsReceivedPage />} />
                  <Route path="suppliers" element={<InventorySuppliersPage />} />
                  <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="transfers" element={<StockTransfersPage />} />
                  <Route path="returns" element={<InventoryReturnsPage />} />
                  <Route path="damaged-stock" element={<DamagedStockPage />} />
                  <Route path="locations" element={<WarehouseLocationsPage />} />
                  <Route path="reports" element={<InventoryReportsPage />} />
                  <Route path="notifications" element={<InventoryNotificationsPage />} />
                  <Route path="settings" element={<InventorySettingsPage />} />
                  <Route path="profile" element={<InventoryProfilePage />} />
                </Route>

                {/* ── Supplier Portal ── */}
                <Route path="/supplier/login" element={<SupplierLoginPage />} />
                <Route path="/supplier" element={
                  <SupplierRoute>
                    <PortalLayout config={{
                      name: 'Supplier', accentHex: '#14b8a6', homeRoute: '/supplier/dashboard', icon: Building2,
                      nav: [
                        { name: 'Dashboard', path: '/supplier/dashboard', icon: Building2 },
                        { name: 'Products', path: '/supplier/products', icon: Package },
                        { name: 'Purchase Orders', path: '/supplier/orders', icon: FileText }
                      ]
                    }} />
                  </SupplierRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<SupplierDashboard />} />
                  <Route path="products" element={<SupplierProductsPage />} />
                  <Route path="orders" element={<AdminSuppliersPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="analytics" element={<ReportsDashboardPage />} />
                </Route>

                {/* ── Finance Portal ── */}
                <Route path="/finance" element={
                  <FinanceRoute>
                    <FinanceLayout />
                  </FinanceRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<FinanceDashboard />} />
                  <Route path="approvals" element={<FinanceApprovals />} />
                  <Route path="invoices" element={<FinanceInvoices />} />
                  <Route path="payments" element={<FinancePayments />} />
                  <Route path="expenses" element={<FinanceExpenses />} />
                  <Route path="reports" element={<FinanceReports />} />
                  <Route path="settings" element={<FinanceSettings />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="analytics" element={<ReportsDashboardPage />} />
                </Route>

                {/* Catch-all 404 Route */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col items-center justify-center bg-nexus-surface dark:bg-nexus-bg text-nexus-heading text-center px-4">
                    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                    <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
                    <p className="text-nexus-textSecondary mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
                    <a href="/" className="bg-primary hover:bg-nexus-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-colors">Go back home</a>
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


