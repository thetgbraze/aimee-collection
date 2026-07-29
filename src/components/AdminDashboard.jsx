import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  AlertTriangle, ArrowLeft, LogOut, ChevronDown, ChevronUp,
  DollarSign, BarChart3, UserPlus, Archive, Eye, Edit3,
  Loader2, RefreshCw, Shield, Store
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Stats Card ────────────────────────────
const StatCard = ({ icon: Icon, label, value, subtitle, color }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ background: color }}>
      <Icon size={22} />
    </div>
    <div className="admin-stat-info">
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
      {subtitle && <span className="admin-stat-subtitle">{subtitle}</span>}
    </div>
  </div>
);

// ─── Main Dashboard ────────────────────────
const AdminDashboard = () => {
  const { profile, signOut, isAdmin, isStoreManager } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalVariants: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockItems: [],
    products: [],
    orders: [],
    users: [],
    categories: [],
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        productsRes,
        categoriesRes,
        variantsRes,
        ordersRes,
        lowStockRes,
      ] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('product_variants').select('*, products(title)'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('product_variants').select('*, products(title)').lte('stock_quantity', 5).eq('is_active', true).order('stock_quantity'),
      ]);

      // Users query only for admins
      let usersData = [];
      if (isAdmin) {
        const usersRes = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        usersData = usersRes.data || [];
      }

      setStats({
        totalProducts: productsRes.data?.length || 0,
        totalCategories: categoriesRes.data?.length || 0,
        totalVariants: variantsRes.data?.length || 0,
        totalOrders: ordersRes.data?.length || 0,
        totalUsers: usersData.length,
        lowStockItems: lowStockRes.data || [],
        products: productsRes.data || [],
        orders: ordersRes.data || [],
        users: usersData,
        categories: categoriesRes.data || [],
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const roleBadge = isAdmin ? 'Admin' : 'Store Manager';
  const roleIcon = isAdmin ? Shield : Store;
  const RoleIcon = roleIcon;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: Users }] : []),
  ];

  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      paid: '#10b981',
      shipped: '#3b82f6',
      delivered: '#6366f1',
      cancelled: '#ef4444',
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={40} className="spin" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-back-link">
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <div className="admin-brand">
            <span className="logo-title" style={{ fontSize: '1.2rem', color: '#D4AF37' }}>AIMEE</span>
            <span className="logo-sub" style={{ fontSize: '0.5rem', color: '#D4AF37' }}>DASHBOARD</span>
          </div>
        </div>

        <nav className="admin-nav">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.email}
              </span>
              <span className="admin-user-role">
                <RoleIcon size={12} /> {roleBadge}
              </span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={signOut}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="admin-page-subtitle">
              {activeTab === 'overview' && 'Your store at a glance'}
              {activeTab === 'products' && 'Manage your product catalog'}
              {activeTab === 'orders' && 'Track and process orders'}
              {activeTab === 'users' && 'Manage user accounts'}
            </p>
          </div>
          <button className="admin-refresh-btn" onClick={fetchDashboardData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="admin-content">
            <div className="admin-stats-grid">
              <StatCard icon={Package} label="Total Products" value={stats.totalProducts} subtitle={`${stats.totalVariants} variants`} color="linear-gradient(135deg, #D4AF37, #B59021)" />
              <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
              {isAdmin && <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="linear-gradient(135deg, #10b981, #059669)" />}
              <StatCard icon={Archive} label="Categories" value={stats.totalCategories} color="linear-gradient(135deg, #f59e0b, #d97706)" />
            </div>

            {/* Low Stock Alerts */}
            {stats.lowStockItems.length > 0 && (
              <div className="admin-section">
                <h3 className="admin-section-title">
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Low Stock Alerts
                </h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Variant</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.products?.title}</td>
                          <td><code>{item.sku}</code></td>
                          <td>
                            {item.attributes?.color_name && (
                              <span className="admin-variant-badge">
                                <span className="admin-color-dot" style={{ background: item.attributes?.color }}></span>
                                {item.attributes.color_name}
                              </span>
                            )}
                            {item.attributes?.size && (
                              <span className="admin-variant-badge">{item.attributes.size}</span>
                            )}
                          </td>
                          <td>
                            <span className={`admin-stock-badge ${item.stock_quantity <= 2 ? 'critical' : 'warning'}`}>
                              {item.stock_quantity} left
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Products */}
            <div className="admin-section">
              <h3 className="admin-section-title">
                <TrendingUp size={18} /> Recent Products
              </h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price (USD)</th>
                      <th>Badge</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.products.slice(0, 8).map(product => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="admin-product-thumb"
                          />
                        </td>
                        <td className="admin-product-title">{product.title}</td>
                        <td>{product.categories?.name}</td>
                        <td>{formatCurrency(product.price_usd)}</td>
                        <td>
                          {product.badge && (
                            <span className="admin-badge" data-badge={product.badge.toLowerCase()}>
                              {product.badge}
                            </span>
                          )}
                        </td>
                        <td>⭐ {product.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="admin-content">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price (USD)</th>
                    <th>Price (RWF)</th>
                    <th>Badge</th>
                    <th>Rating</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.image_url} alt={product.title} className="admin-product-thumb" />
                      </td>
                      <td className="admin-product-title">{product.title}</td>
                      <td>{product.categories?.name || '—'}</td>
                      <td>{formatCurrency(product.price_usd)}</td>
                      <td>RWF {Number(product.price_rwf).toLocaleString()}</td>
                      <td>
                        {product.badge ? (
                          <span className="admin-badge" data-badge={product.badge.toLowerCase()}>{product.badge}</span>
                        ) : '—'}
                      </td>
                      <td>⭐ {product.rating}</td>
                      <td>
                        <span className={`admin-status-dot ${product.is_active ? 'active' : 'inactive'}`}></span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="admin-content">
            {stats.orders.length === 0 ? (
              <div className="admin-empty-state">
                <ShoppingCart size={48} />
                <h3>No Orders Yet</h3>
                <p>Orders will appear here once customers start purchasing.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total (USD)</th>
                      <th>Total (RWF)</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.orders.map(order => (
                      <tr key={order.id}>
                        <td><code>{order.id.slice(0, 8)}…</code></td>
                        <td>
                          <span className="admin-order-status" style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) }}>
                            {order.status}
                          </span>
                        </td>
                        <td>{formatCurrency(order.total_usd)}</td>
                        <td>RWF {Number(order.total_rwf).toLocaleString()}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USERS TAB (Admin Only) */}
        {activeTab === 'users' && isAdmin && (
          <div className="admin-content">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.map(user => (
                    <tr key={user.id}>
                      <td className="admin-product-title">
                        <div className="admin-user-avatar small">
                          {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        {user.first_name ? `${user.first_name} ${user.last_name || ''}` : '—'}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-role-badge ${user.role}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
