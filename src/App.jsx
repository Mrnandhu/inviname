// src/App.jsx — every page of the site. Checkout and My Orders need the customer to be logged in.
import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Checkout from './pages/Checkout.jsx'
import MyOrders from './pages/MyOrders.jsx'
import CustomOrders from './pages/CustomOrders.jsx'
import Wholesale from './pages/Wholesale.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Policy from './pages/Policy.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'
import JoinAdmin from './pages/JoinAdmin.jsx'
import DeleteAccount from './pages/DeleteAccount.jsx'
import Order from './pages/Order.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
        <Route path="/order/:id" element={<RequireAuth><Order /></RequireAuth>} />
        <Route path="/custom-orders" element={<CustomOrders />} />
        <Route path="/wholesale" element={<Wholesale />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping-policy" element={<Policy kind="shipping" />} />
        <Route path="/returns-and-replacement" element={<Policy kind="returns" />} />
        <Route path="/privacy-policy" element={<Policy kind="privacy" />} />
        <Route path="/terms" element={<Policy kind="terms" />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/join-admin/:code" element={<RequireAuth><JoinAdmin /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
