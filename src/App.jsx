import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import { useLocation } from 'react-router-dom';

// Layout wrapper to conditionally show header/footer
const Layout = () => {
  const location = useLocation();
  const noLayoutPages = ['/login', '/register'];
  const showLayout = !noLayoutPages.includes(location.pathname);

  return (
    <>
      {showLayout && <Header />}
      <AppRoutes />
      {showLayout && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Layout />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
