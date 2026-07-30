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
const OfficeDashboardPage = lazy(() => import('./pages/admin/office/OfficeDashboardPage'));
const DailyTasksPage = lazy(() => import('./pages/admin/office/DailyTasksPage'));
const OfficeSupportPage = lazy(() => import('./pages/admin/office/OfficeSupportPage'));
const RecordKeepingPage = lazy(() => import('./pages/admin/office/RecordKeepingPage'));
const SuppliesManagementPage = lazy(() => import('./pages/admin/office/SuppliesManagementPage'));
const SchedulingPage = lazy(() => import('./pages/admin/office/SchedulingPage'));
const TeamCoordinationPage = lazy(() => import('./pages/admin/office/TeamCoordinationPage'));
const CommunicationPage = lazy(() => import('./pages/admin/office/CommunicationPage'));
const EmployeesPage = lazy(() => import('./pages/admin/office/EmployeesPage'));
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
const ManualPaymentsPage = lazy(() => import('./pages/admin/ManualPaymentsPage'));
const AdminRefundsPage = lazy(() => import('./pages/admin/AdminRefundsPage'));
// ERP Modules
const AdminDispatchPage = lazy(() => import('./pages/admin/DispatchPage'));
const AdminDriversPage  = lazy(() => import('./pages/admin/DriversPage'));
const AdminFinancePage  = lazy(() => import('./pages/admin/FinancePage'));
const AdminSuppliersPage = lazy(() => import('./pages/admin/SuppliersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'));

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
const InventoryProductsPage = lazy(() => import('./pages/inventory/InventoryProductsPage'));
const StockMovementsPage = lazy(() => import('./pages/inventory/StockMovementsPage'));
const GoodsReceivedPage = lazy(() => import('./pages/inventory/GoodsReceivedPage'));
const PurchaseOrdersPage = lazy(() => import('./pages/inventory/PurchaseOrdersPage'));
const InventorySuppliersPage = lazy(() => import('./pages/inventory/InventorySuppliersPage'));
const StockTransfersPage = lazy(() => import('./pages/inventory/StockTransfersPage'));
const InventoryReturnsPage = lazy(() => import('./pages/inventory/InventoryReturnsPage'));
const DamagedStockPage = lazy(() => import('./pages/inventory/DamagedStockPage'));
const WarehouseLocationsPage = lazy(() => import('./pages/inventory/WarehouseLocationsPage'));
const InventoryReportsPage = lazy(() => import('./pages/inventory/InventoryReportsPage'));
const InventoryNotificationsPage = lazy(() => import('./pages/inventory/InventoryNotificationsPage'));
const InventorySettingsPage = lazy(() => import('./pages/inventory/InventorySettingsPage'));
const InventoryProfilePage = lazy(() => import('./pages/inventory/InventoryProfilePage'));

// Finance Portal
const FinanceLoginPage = lazy(() => import('./pages/finance/FinanceLoginPage'));
const FinanceDashboard = lazy(() => import('./pages/finance/FinanceDashboard'));
const ChartOfAccountsPage = lazy(() => import('./pages/finance/ChartOfAccountsPage'));
const GeneralLedgerPage = lazy(() => import('./pages/finance/GeneralLedgerPage'));
const AccountsReceivablePage = lazy(() => import('./pages/finance/AccountsReceivablePage'));
const AccountsPayablePage = lazy(() => import('./pages/finance/AccountsPayablePage'));
const FinanceInvoicesPage = lazy(() => import('./pages/finance/FinanceInvoicesPage'));
const CustomerPaymentsPage = lazy(() => import('./pages/finance/CustomerPaymentsPage'));
const ExpensesPage = lazy(() => import('./pages/finance/ExpensesPage'));

// Supplier Portal
const SupplierLoginPage = lazy(() => import('./pages/supplier/SupplierLoginPage'));
const SupplierDashboard = lazy(() => import('./pages/supplier/SupplierDashboard'));

import { Truck, MapPin, Warehouse, TrendingUp, Building2, Package, Search, ListTodo, ShieldAlert, Box, ClipboardCheck, ShoppingCart, Users, ArrowLeftRight, Undo2, AlertTriangle, BarChart2, Bell, Settings, User, FileText, BookOpen, CreditCard, Wallet } from 'lucide-react';

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
                  <Route path="dashboard" element={<OfficeDashboardPage />} />
                  <Route path="tasks" element={<DailyTasksPage />} />
                  <Route path="support" element={<OfficeSupportPage />} />
                  <Route path="records" element={<RecordKeepingPage />} />
                  <Route path="supplies" element={<SuppliesManagementPage />} />
                  <Route path="scheduling" element={<SchedulingPage />} />
                  <Route path="coordination" element={<TeamCoordinationPage />} />
                  <Route path="communication" element={<CommunicationPage />} />
                  <Route path="employees" element={<EmployeesPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
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
                  <Route path="drivers" element={<AdminDriversPage />} />
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
                </Route>

                {/* â”€â”€ Inventory Portal â”€â”€ */}
                <Route path="/inventory/login" element={<InventoryLoginPage />} />
                <Route path="/inventory" element={
                  <InventoryRoute>
                    <PortalLayout config={{
                      name: 'Inventory', accentHex: '#FF6B57', homeRoute: '/inventory/dashboard', icon: Warehouse,
                      nav: [
                        { name: 'Dashboard', path: '/inventory/dashboard', icon: Warehouse },
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
                  <Route path="products" element={<InventoryProductsPage />} />
                  <Route path="movements" element={<StockMovementsPage />} />
                  <Route path="goods-received" element={<GoodsReceivedPage />} />
                  <Route path="suppliers" element={<SuppliersPage />} />
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

                {/* ── Finance Portal ── */}
                <Route path="/finance/login" element={<FinanceLoginPage />} />
                <Route path="/finance" element={
                  <FinanceRoute>
                    <PortalLayout config={{
                      name: 'Finance', accentHex: '#3b82f6', homeRoute: '/finance/dashboard', icon: TrendingUp,
                      nav: [
                        { name: 'Dashboard', path: '/finance/dashboard', icon: TrendingUp },
                        { name: 'Invoices', path: '/finance/invoices', icon: FileText },
                        { name: 'Customer Payments', path: '/finance/payments', icon: CreditCard },
                        { name: 'Expenses', path: '/finance/expenses', icon: Wallet },
                        { name: 'Chart of Accounts', path: '/finance/chart-of-accounts', icon: FileText },
                        { name: 'General Ledger', path: '/finance/general-ledger', icon: BookOpen },
                        { name: 'Accounts Receivable', path: '/finance/accounts-receivable', icon: CreditCard },
                        { name: 'Accounts Payable', path: '/finance/accounts-payable', icon: Wallet },
                        { name: 'Transactions', path: '/finance/transactions', icon: ShieldAlert }
                      ]
                    }} />
                  </FinanceRoute>
                }>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<FinanceDashboard />} />
                  <Route path="invoices" element={<FinanceInvoicesPage />} />
                  <Route path="payments" element={<CustomerPaymentsPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
                  <Route path="general-ledger" element={<GeneralLedgerPage />} />
                  <Route path="accounts-receivable" element={<AccountsReceivablePage />} />
                  <Route path="accounts-payable" element={<AccountsPayablePage />} />
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


