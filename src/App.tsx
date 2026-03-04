import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { MainPage } from './pages/MainPage';
import { LoginPage } from './pages/LoginPage';
import { SignupSuccessPage } from './pages/SignupSuccessPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductListPage } from './pages/ProductListPage';
import { CategoryIndexPage, BrandIndexPage } from './pages/CategoryIndexPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderCompletePage } from './pages/OrderCompletePage';
import { AdminPage } from './pages/AdminPage';
import { SearchPage } from './pages/SearchPage';
import { MyPage } from './pages/MyPage';
import { CouponsPage } from './pages/CouponsPage';
import { CustomerCenterPage } from './pages/CustomerCenterPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<MainPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="signup-success" element={<SignupSuccessPage />} />

                    <Route path="categories" element={<CategoryIndexPage />} />
                    <Route path="categories/:id" element={<ProductListPage type="category" />} />

                    <Route path="brands" element={<BrandIndexPage />} />
                    <Route path="brands/:id" element={<ProductListPage type="brand" />} />

                    <Route path="product/:id" element={<ProductDetailPage />} />

                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="order-complete/:orderId" element={<OrderCompletePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="mypage" element={<MyPage />} />
                    <Route path="mypage/coupons" element={<CouponsPage />} />
                    <Route path="mypage/customer-center" element={<CustomerCenterPage />} />
                </Route>

                {/* Admin route outside Main Layout */}
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
