import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
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

function DeepLinkHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        CapacitorApp.addListener('appUrlOpen', (event: any) => {
            // Example URL: martinee://product/123
            const url = new URL(event.url);
            const path = url.pathname || ""; // For scheme like martinee://home, path might be empty and host is 'home'
            const host = url.host;

            console.log('Deep Link URL:', event.url);
            console.log('Host:', host, 'Path:', path);

            // Mapping: martinee://[host]/[path]
            if (host === 'home') {
                navigate('/');
            } else if (host === 'login') {
                navigate('/login');
            } else if (host === 'mypage') {
                navigate('/mypage');
            } else if (host === 'product') {
                const id = path.split('/')[1];
                if (id) navigate(`/product/${id}`);
            } else if (host === 'category') {
                const id = path.split('/')[1];
                if (id) navigate(`/categories/${id}`);
            } else if (host === 'brand') {
                const id = path.split('/')[1];
                if (id) navigate(`/brands/${id}`);
            }
        });

        return () => {
            CapacitorApp.removeAllListeners();
        };
    }, [navigate]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <DeepLinkHandler />
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
