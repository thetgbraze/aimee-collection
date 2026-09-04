import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  AlertTriangle, ArrowLeft, LogOut, Archive,
  Loader2, RefreshCw, Shield, Store, AlertCircle,
  Plus, Trash2, Edit3, X, Check, Search, Filter,
  Eye, CheckCircle2, UserPlus, Info, Tag, DollarSign,
  ChevronRight, ExternalLink, Megaphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, createIsolatedClient } from '../lib/supabase';

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

// ─── Helper Functions ─────────────────────
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

const getAvatarInitial = (user) => {
  return (
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?'
  );
};

// ─── Main Dashboard ────────────────────────
const AdminDashboard = () => {
  const { profile, signOut, isAdmin, isStoreManager } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Data State
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
    variants: [],
    announcements: [],
  });

  // Filter & Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalTab, setProductModalTab] = useState('details'); // 'details' | 'variants'
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Form Submitting States
  const [submitting, setSubmitting] = useState(false);

  // Toast Helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  // ─── Data Fetching ───────────────────────
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [
        productsRes,
        categoriesRes,
        variantsRes,
        ordersRes,
        lowStockRes,
        announcementsRes,
      ] = await Promise.all([
        supabase.from('products').select('*, categories(name, slug)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('product_variants').select('*, products(title)').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('product_variants').select('*, products(title)').lte('stock_quantity', 5).eq('is_active', true).order('stock_quantity'),
        supabase.from('announcements').select('*').order('sort_order', { ascending: true }),
      ]);

      const errors = [productsRes, categoriesRes, variantsRes, ordersRes, lowStockRes, announcementsRes]
        .filter(r => r.error)
        .map(r => r.error.message);

      if (errors.length > 0) {
        console.error('[AdminDashboard] Query errors:', errors);
        setFetchError(`Some data could not be loaded: ${errors[0]}`);
      }

      // Users query for admins
      let usersData = [];
      if (isAdmin) {
        const usersRes = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (usersRes.error) {
          console.error('[AdminDashboard] Users query error:', usersRes.error.message);
        } else {
          usersData = usersRes.data || [];
        }
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
        variants: variantsRes.data || [],
        announcements: announcementsRes.data || [],
      });
    } catch (err) {
      console.error('[AdminDashboard] Unexpected error:', err);
      setFetchError('Failed to load dashboard data. Please try again.');
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── Product Stock Helper ────────────────
  const getProductStockInfo = useCallback((productId) => {
    const pVariants = stats.variants.filter(v => v.product_id === productId);
    const totalStock = pVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
    return {
      variantCount: pVariants.length,
      totalStock,
      isLowStock: totalStock <= 5 && totalStock > 0,
      isOutOfStock: totalStock === 0,
    };
  }, [stats.variants]);

  // ─── Toggle Product Active State ─────────
  const handleToggleProductActive = async (productId, currentActive) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentActive })
        .eq('id', productId);

      if (error) throw error;

      showToast(`Product ${!currentActive ? 'activated' : 'deactivated / archived'}.`);
      setStats(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === productId ? { ...p, is_active: !currentActive } : p)
      }));
    } catch (err) {
      console.error('[AdminDashboard] Toggle active error:', err);
      showToast(err.message || 'Failed to update product status.', 'error');
    }
  };

  // ─── Product Deletion / Archival ─────────
  const handleArchiveProduct = async () => {
    if (!deletingProduct) return;
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', deletingProduct.id);

      if (error) throw error;

      showToast(`"${deletingProduct.title}" has been archived and hidden from storefront.`);
      setDeletingProduct(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('[AdminDashboard] Archive error:', err);
      showToast(err.message || 'Failed to archive product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermanentDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setSubmitting(true);
      // Attempt delete from products (cascade handles variants)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) {
        if (error.code === '23503' || error.message?.includes('violates foreign key')) {
          showToast(
            'Cannot permanently delete: this product has associated customer order history. Use "Deactivate / Archive" instead.',
            'error'
          );
          return;
        }
        throw error;
      }

      showToast(`"${deletingProduct.title}" permanently deleted.`);
      setDeletingProduct(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('[AdminDashboard] Delete error:', err);
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Quick Stock Update for Variant ──────
  const handleUpdateVariantStock = async (variantId, newQuantity) => {
    const qty = Math.max(0, parseInt(newQuantity, 10) || 0);
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: qty })
        .eq('id', variantId);

      if (error) throw error;

      setStats(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === variantId ? { ...v, stock_quantity: qty } : v)
      }));
      showToast('Stock quantity updated.');
    } catch (err) {
      console.error('[AdminDashboard] Stock update error:', err);
      showToast(err.message || 'Failed to update stock.', 'error');
    }
  };

  // ─── User Role Management ────────────────
  const handleRoleChange = async (userId, targetEmail, newRole) => {
    if (userId === profile?.id) {
      showToast('You cannot change your own role to prevent lockout.', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      showToast(`Updated ${targetEmail} privilege to ${newRole.replace(/_/g, ' ')}.`);
      setStats(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, role: newRole } : u)
      }));
    } catch (err) {
      console.error('[AdminDashboard] Role change error:', err);
      showToast(err.message || 'Failed to update user role.', 'error');
    }
  };

  // ─── Order Status Update ─────────────────
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      showToast(`Order status updated to "${newStatus}".`);
      setStats(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      }));
      if (viewingOrder?.id === orderId) {
        setViewingOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('[AdminDashboard] Order status update error:', err);
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  // ─── View Order Details ──────────────────
  const handleOpenOrderDetails = async (order) => {
    setViewingOrder(order);
    setLoadingOrderItems(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product_variants(sku, attributes)')
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (err) {
      console.error('[AdminDashboard] Fetch order items error:', err);
      showToast('Could not load order items.', 'error');
    } finally {
      setLoadingOrderItems(false);
    }
  };

  // ─── Announcement Ticker Management ────────
  const handleToggleAnnouncementActive = async (id, currentActive) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      showToast(`Top bar message ${!currentActive ? 'activated' : 'deactivated'}.`);
      setStats(prev => ({
        ...prev,
        announcements: prev.announcements.map(a => a.id === id ? { ...a, is_active: !currentActive } : a)
      }));
    } catch (err) {
      console.error('[AdminDashboard] Toggle announcement error:', err);
      showToast('Failed to update top bar message status.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to remove this top bar message?')) return;
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Top bar message deleted.');
      setStats(prev => ({
        ...prev,
        announcements: prev.announcements.filter(a => a.id !== id)
      }));
    } catch (err) {
      console.error('[AdminDashboard] Delete announcement error:', err);
      showToast('Failed to delete top bar message.', 'error');
    }
  };

  const handleSaveAnnouncement = async ({ id, message, highlight_text, link_url, sort_order, is_active }) => {
    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from('announcements')
          .update({
            message: message.trim(),
            highlight_text: highlight_text?.trim() || null,
            link_url: link_url?.trim() || null,
            sort_order: parseInt(sort_order, 10) || 0,
            is_active: is_active,
          })
          .eq('id', id);

        if (error) throw error;
        showToast('Top bar message updated.');
      } else {
        // Insert
        const { error } = await supabase
          .from('announcements')
          .insert([{
            message: message.trim(),
            highlight_text: highlight_text?.trim() || null,
            link_url: link_url?.trim() || null,
            sort_order: parseInt(sort_order, 10) || 0,
            is_active: is_active,
          }]);

        if (error) throw error;
        showToast('Top bar message added.');
      }

      setIsAddAnnouncementOpen(false);
      setEditingAnnouncement(null);
      await fetchDashboardData();
    } catch (err) {
      console.error('[AdminDashboard] Save announcement error:', err);
      showToast(err.message || 'Failed to save announcement.', 'error');
    }
  };

  // ─── Filtered Data ───────────────────────
  const filteredProducts = useMemo(() => {
    return stats.products.filter(product => {
      // Category filter
      if (productCategoryFilter !== 'all' && product.category_id !== productCategoryFilter) {
        return false;
      }
      // Stock filter
      const stockInfo = getProductStockInfo(product.id);
      if (productStockFilter === 'in_stock' && stockInfo.totalStock === 0) return false;
      if (productStockFilter === 'low_stock' && !stockInfo.isLowStock) return false;
      if (productStockFilter === 'out_of_stock' && !stockInfo.isOutOfStock) return false;

      // Text search
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchTitle = product.title?.toLowerCase().includes(q);
        const matchCategory = product.categories?.name?.toLowerCase().includes(q);
        const matchBadge = product.badge?.toLowerCase().includes(q);
        const matchSlug = product.slug?.toLowerCase().includes(q);
        return matchTitle || matchCategory || matchBadge || matchSlug;
      }
      return true;
    });
  }, [stats.products, productCategoryFilter, productStockFilter, productSearch, getProductStockInfo]);

  const filteredUsers = useMemo(() => {
    return stats.users.filter(u => {
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q);
        return matchEmail || matchName;
      }
      return true;
    });
  }, [stats.users, userRoleFilter, userSearch]);

  const filteredOrders = useMemo(() => {
    return stats.orders.filter(order => {
      if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchId = order.id?.toLowerCase().includes(q);
        const matchNotes = order.notes?.toLowerCase().includes(q);
        return matchId || matchNotes;
      }
      return true;
    });
  }, [stats.orders, orderStatusFilter, orderSearch]);

  const roleBadge = isAdmin ? 'Admin' : 'Store Manager';
  const RoleIcon = isAdmin ? Shield : Store;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'announcements', label: 'Top Bar Messages', icon: Megaphone },
    ...(isAdmin ? [{ id: 'users', label: 'Users & Roles', icon: Users }] : []),
  ];

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
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type} show`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-back-link">
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <div className="admin-brand">
            <span className="logo-title" style={{ fontSize: '1.2rem', color: '#D4AF37' }}>AIMEE</span>
            <span className="logo-sub" style={{ fontSize: '0.5rem', color: '#D4AF37' }}>LUXURY DASHBOARD</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Dashboard navigation">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
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
              {getAvatarInitial(profile)}
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
              {activeTab === 'overview' && 'Overview of sales, catalog performance, and store activity'}
              {activeTab === 'products' && 'Create, edit product details, manage sizes/stock and catalog status'}
              {activeTab === 'orders' && 'Manage and process customer orders'}
              {activeTab === 'announcements' && 'Manage promo tickers, announcements, and coupon banners on the customer topbar'}
              {activeTab === 'users' && 'Manage team accounts, assign staff permissions, and invite users'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'products' && (
              <button
                className="admin-btn admin-btn-gold"
                onClick={() => setIsAddProductOpen(true)}
              >
                <Plus size={16} /> Add Product
              </button>
            )}
            {activeTab === 'announcements' && (
              <button
                className="admin-btn admin-btn-gold"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setIsAddAnnouncementOpen(true);
                }}
              >
                <Plus size={16} /> Add Top Bar Message
              </button>
            )}
            {activeTab === 'users' && isAdmin && (
              <button
                className="admin-btn admin-btn-gold"
                onClick={() => setIsAddUserOpen(true)}
              >
                <UserPlus size={16} /> Add User
              </button>
            )}
            <button className="admin-refresh-btn" onClick={fetchDashboardData} aria-label="Refresh dashboard data">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div className="admin-error-banner" role="alert" style={{ margin: '16px 32px 0' }}>
            <AlertCircle size={16} />
            <span>{fetchError}</span>
            <button onClick={() => setFetchError(null)} aria-label="Dismiss error">✕</button>
          </div>
        )}

        {/* ════════════════ OVERVIEW TAB ════════════════ */}
        {activeTab === 'overview' && (
          <div className="admin-content">
            <div className="admin-stats-grid">
              <StatCard icon={Package} label="Total Products" value={stats.totalProducts} subtitle={`${stats.totalVariants} variants registered`} color="linear-gradient(135deg, #D4AF37, #B59021)" />
              <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
              {isAdmin && <StatCard icon={Users} label="Total Users" value={stats.totalUsers} subtitle="Registered accounts" color="linear-gradient(135deg, #10b981, #059669)" />}
              <StatCard icon={Archive} label="Categories" value={stats.totalCategories} color="linear-gradient(135deg, #f59e0b, #d97706)" />
            </div>

            {/* Low Stock Alerts */}
            {stats.lowStockItems.length > 0 && (
              <div className="admin-section">
                <h3 className="admin-section-title">
                  <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Low Stock & Inventory Alerts
                </h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Variant (Size / Color)</th>
                        <th>Current Stock</th>
                        <th>Quick Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockItems.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.products?.title}</strong></td>
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
                              {item.stock_quantity === 0 ? 'Out of Stock' : `${item.stock_quantity} remaining`}
                            </span>
                          </td>
                          <td>
                            <div className="admin-variant-stock-control">
                              <button
                                className="admin-stock-spin-btn"
                                onClick={() => handleUpdateVariantStock(item.id, Math.max(0, item.stock_quantity - 1))}
                              >-</button>
                              <input
                                type="number"
                                className="admin-stock-spin-input"
                                value={item.stock_quantity}
                                onChange={(e) => handleUpdateVariantStock(item.id, e.target.value)}
                              />
                              <button
                                className="admin-stock-spin-btn"
                                onClick={() => handleUpdateVariantStock(item.id, item.stock_quantity + 1)}
                              >+</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Catalog Actions */}
            <div className="admin-section">
              <h3 className="admin-section-title">
                <TrendingUp size={18} /> Catalog Overview
              </h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Inventory</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.products.slice(0, 6).map(product => {
                      const stockInfo = getProductStockInfo(product.id);
                      return (
                        <tr key={product.id}>
                          <td>
                            <img src={product.image_url} alt={product.title} className="admin-product-thumb" loading="lazy" />
                          </td>
                          <td className="admin-product-title">{product.title}</td>
                          <td>{product.categories?.name || '—'}</td>
                          <td>{formatCurrency(product.price_usd)}</td>
                          <td>
                            <span className={`admin-stock-badge ${stockInfo.totalStock <= 5 ? 'warning' : ''}`}>
                              {stockInfo.totalStock} in stock ({stockInfo.variantCount} vars)
                            </span>
                          </td>
                          <td>
                            <span className={`admin-status-dot ${product.is_active ? 'active' : 'inactive'}`}></span>{' '}
                            {product.is_active ? 'Active' : 'Archived'}
                          </td>
                          <td>
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductModalTab('details');
                              }}
                            >
                              <Edit3 size={13} /> Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ PRODUCTS TAB ════════════════ */}
        {activeTab === 'products' && (
          <div className="admin-content">
            {/* Toolbar & Filters */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-search-box">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by title, badge, slug…"
                    className="admin-search-input"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}
                    >✕</button>
                  )}
                </div>

                <select
                  className="admin-filter-select"
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {stats.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <select
                  className="admin-filter-select"
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value)}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (&gt;0)</option>
                  <option value="low_stock">Low Stock (≤5)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              <div className="admin-toolbar-right">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Showing {filteredProducts.length} of {stats.products.length} items
                </span>
                <button
                  className="admin-btn admin-btn-gold"
                  onClick={() => setIsAddProductOpen(true)}
                >
                  <Plus size={16} /> Add New Product
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="admin-empty-state">
                <Package size={48} />
                <h3>No Products Matched</h3>
                <p>Try adjusting your search query or filters.</p>
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => { setProductSearch(''); setProductCategoryFilter('all'); setProductStockFilter('all'); }}
                  style={{ marginTop: '12px' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title & Slug</th>
                      <th>Category</th>
                      <th>Prices</th>
                      <th>Inventory</th>
                      <th>Badge</th>
                      <th>Active</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const stockInfo = getProductStockInfo(product.id);
                      return (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="admin-product-thumb"
                              loading="lazy"
                            />
                          </td>
                          <td>
                            <div className="admin-product-title">{product.title}</div>
                            <code style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>/{product.slug}</code>
                          </td>
                          <td>{product.categories?.name || '—'}</td>
                          <td>
                            <div>{formatCurrency(product.price_usd)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              RWF {Number(product.price_rwf).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span className={`admin-stock-badge ${stockInfo.totalStock === 0 ? 'critical' : stockInfo.isLowStock ? 'warning' : ''}`}>
                                {stockInfo.totalStock} in stock
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {stockInfo.variantCount} variant{stockInfo.variantCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td>
                            {product.badge ? (
                              <span className="admin-badge" data-badge={product.badge.toLowerCase()}>
                                {product.badge}
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            <label className="admin-switch-label" title={product.is_active ? 'Active in store' : 'Archived / Hidden'}>
                              <div
                                className={`admin-switch-track ${product.is_active ? 'on' : ''}`}
                                onClick={() => handleToggleProductActive(product.id, product.is_active)}
                              >
                                <div className="admin-switch-thumb"></div>
                              </div>
                            </label>
                          </td>
                          <td>
                            <div className="admin-action-cell" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                                title="Edit product details & stock"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setProductModalTab('details');
                                }}
                              >
                                <Edit3 size={13} /> Details
                              </button>
                              {isAdmin && (
                                <button
                                  className="admin-icon-btn danger"
                                  title="Delete or Archive product"
                                  onClick={() => setDeletingProduct(product)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ ORDERS TAB ════════════════ */}
        {activeTab === 'orders' && (
          <div className="admin-content">
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-search-box">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by order ID, notes…"
                    className="admin-search-input"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <select
                  className="admin-filter-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="admin-toolbar-right">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="admin-empty-state">
                <ShoppingCart size={48} />
                <h3>No Orders Found</h3>
                <p>Orders will appear here once customers place their purchases.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Info</th>
                      <th>Total</th>
                      <th>Status & Update</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <code>{order.id.slice(0, 8)}…</code>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                          {order.shipping_address?.full_name || order.shipping_address?.city ? (
                            <div>
                              <div>{order.shipping_address?.full_name || 'Customer'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {order.shipping_address?.city}, {order.shipping_address?.country || 'Rwanda'}
                              </div>
                            </div>
                          ) : 'Direct Checkout'}
                        </td>
                        <td>
                          <div><strong>{formatCurrency(order.total_usd)}</strong></div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            RWF {Number(order.total_rwf).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <select
                            className="admin-filter-select"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              borderColor: getStatusColor(order.status),
                              color: getStatusColor(order.status),
                              fontWeight: 600
                            }}
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => handleOpenOrderDetails(order)}
                          >
                            <Eye size={13} /> View Items
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ USERS & ROLES TAB (ADMIN ONLY) ════════════════ */}
        {activeTab === 'users' && isAdmin && (
          <div className="admin-content">
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-search-box">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, email…"
                    className="admin-search-input"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <select
                  className="admin-filter-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="store_manager">Store Managers</option>
                  <option value="user_buyer">Customers / Buyers</option>
                </select>
              </div>

              <div className="admin-toolbar-right">
                <button
                  className="admin-btn admin-btn-gold"
                  onClick={() => setIsAddUserOpen(true)}
                >
                  <UserPlus size={16} /> Add User / Staff
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Privilege / Role</th>
                    <th>Joined</th>
                    <th>Account Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const isSelf = u.id === profile?.id;
                    return (
                      <tr key={u.id}>
                        <td className="admin-product-title">
                          <div className="admin-user-avatar small">
                            {getAvatarInitial(u)}
                          </div>
                          <span>
                            {u.first_name ? `${u.first_name} ${u.last_name || ''}` : 'No Name'}
                            {isSelf && <strong style={{ color: 'var(--accent-gold)', marginLeft: '6px' }}>(You)</strong>}
                          </span>
                        </td>
                        <td>{u.email || '—'}</td>
                        <td>
                          <select
                            className={`admin-role-select ${u.role || 'user_buyer'}`}
                            value={u.role || 'user_buyer'}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                            title={isSelf ? 'You cannot change your own role' : 'Assign store privilege'}
                          >
                            <option value="admin">Admin (Full Control)</option>
                            <option value="store_manager">Store Manager (Products & Orders)</option>
                            <option value="user_buyer">Customer / Buyer (Store Only)</option>
                          </select>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {u.role === 'admin' && 'Full dashboard & user management'}
                            {u.role === 'store_manager' && 'Catalog & order processing'}
                            {u.role === 'user_buyer' && 'Store shopper account'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════ ANNOUNCEMENTS / TOP BAR MESSAGES TAB ════════════════ */}
        {activeTab === 'announcements' && (
          <div className="admin-content">
            {/* Live Preview */}
            <div className="admin-section">
              <h3 className="admin-section-title">
                <Eye size={18} /> Customer Storefront Topbar Live Preview
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Active messages scroll continuously across the very top banner of the website:
              </p>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.3)', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <div className="announcement-bar" style={{ margin: 0, padding: '10px 0' }}>
                  <div className="announcement-ticker">
                    {stats.announcements.filter(a => a.is_active).length > 0 ? (
                      (stats.announcements.filter(a => a.is_active).length < 4
                        ? [...stats.announcements.filter(a => a.is_active), ...stats.announcements.filter(a => a.is_active)]
                        : stats.announcements.filter(a => a.is_active)
                      ).map((a, i) => (
                        <span key={i}>
                          {a.highlight_text && a.message.includes(a.highlight_text) ? (
                            <>
                              {a.message.split(a.highlight_text)[0]}
                              <strong style={{ color: '#D4AF37' }}>{a.highlight_text}</strong>
                              {a.message.split(a.highlight_text)[1]}
                            </>
                          ) : a.message}
                        </span>
                      ))
                    ) : (
                      <span>✦ No active topbar messages currently published. Activate a message below to show it on your store ✦</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {stats.announcements.filter(a => a.is_active).length} of {stats.announcements.length} Messages Active on Customer Topbar
                </span>
              </div>
              <div className="admin-toolbar-right">
                <button
                  className="admin-btn admin-btn-gold"
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setIsAddAnnouncementOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Top Bar Message
                </button>
              </div>
            </div>

            {/* Table */}
            {stats.announcements.length === 0 ? (
              <div className="admin-empty-state">
                <Megaphone size={48} />
                <h3>No Top Bar Messages</h3>
                <p>Add announcements, promo codes, or shipping notices to display at the top of the storefront.</p>
                <button
                  className="admin-btn admin-btn-gold"
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setIsAddAnnouncementOpen(true);
                  }}
                  style={{ marginTop: '14px' }}
                >
                  <Plus size={16} /> Create First Message
                </button>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Order</th>
                      <th>Message Text & Preview</th>
                      <th>Gold Highlight</th>
                      <th>Link Target</th>
                      <th>Live on Store</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.announcements.map((a, idx) => (
                      <tr key={a.id}>
                        <td><strong>#{a.sort_order || idx + 1}</strong></td>
                        <td style={{ fontWeight: 500 }}>
                          {a.highlight_text && a.message.includes(a.highlight_text) ? (
                            <span>
                              {a.message.split(a.highlight_text)[0]}
                              <strong style={{ color: '#D4AF37', background: 'rgba(212, 175, 55, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {a.highlight_text}
                              </strong>
                              {a.message.split(a.highlight_text)[1]}
                            </span>
                          ) : a.message}
                        </td>
                        <td>
                          {a.highlight_text ? (
                            <code style={{ color: '#8C7853', fontWeight: 600 }}>{a.highlight_text}</code>
                          ) : '—'}
                        </td>
                        <td>
                          {a.link_url ? (
                            <code style={{ fontSize: '0.78rem' }}>{a.link_url}</code>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>None</span>
                          )}
                        </td>
                        <td>
                          <label className="admin-switch-label" title={a.is_active ? 'Displayed live' : 'Hidden from storefront'}>
                            <div
                              className={`admin-switch-track ${a.is_active ? 'on' : ''}`}
                              onClick={() => handleToggleAnnouncementActive(a.id, a.is_active)}
                            >
                              <div className="admin-switch-thumb"></div>
                            </div>
                          </label>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-action-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              onClick={() => {
                                setEditingAnnouncement(a);
                                setIsAddAnnouncementOpen(true);
                              }}
                            >
                              <Edit3 size={13} /> Edit
                            </button>
                            <button
                              className="admin-icon-btn danger"
                              title="Delete announcement"
                              onClick={() => handleDeleteAnnouncement(a.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════════════════ ADD PRODUCT MODAL ════════════════ */}
      {isAddProductOpen && (
        <AddProductModal
          categories={stats.categories}
          onClose={() => setIsAddProductOpen(false)}
          onSuccess={async () => {
            setIsAddProductOpen(false);
            showToast('Product added successfully!');
            await fetchDashboardData();
          }}
          showToast={showToast}
        />
      )}

      {/* ════════════════ EDIT / PRODUCT DETAILS MODAL ════════════════ */}
      {editingProduct && (
        <ProductDetailsModal
          product={editingProduct}
          categories={stats.categories}
          variants={stats.variants.filter(v => v.product_id === editingProduct.id)}
          activeTab={productModalTab}
          setActiveTab={setProductModalTab}
          onClose={() => setEditingProduct(null)}
          onUpdate={async () => {
            await fetchDashboardData();
          }}
          showToast={showToast}
        />
      )}

      {/* ════════════════ DELETE / ARCHIVE PRODUCT MODAL ════════════════ */}
      {deletingProduct && (
        <div className="admin-modal-overlay" onClick={() => !submitting && setDeletingProduct(null)}>
          <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <AlertTriangle size={20} style={{ color: '#dc2626' }} /> Remove Product
              </h3>
              <button
                className="admin-modal-close"
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
              >✕</button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <img
                  src={deletingProduct.image_url}
                  alt={deletingProduct.title}
                  className="admin-product-thumb"
                  style={{ width: '60px', height: '60px' }}
                />
                <div>
                  <h4 style={{ margin: 0 }}>{deletingProduct.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Category: {deletingProduct.categories?.name || 'Catalog'}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                Choose whether to <strong>Archive / Deactivate</strong> this product or <strong>Permanently Delete</strong> it:
              </p>

              <div style={{ background: '#fafaf9', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <p style={{ margin: 0 }}>
                  💡 <strong>Archiving (Recommended):</strong> Hides the item from the customer storefront immediately while preserving historical sales records, order receipts, and financial analytics.
                </p>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleArchiveProduct}
                disabled={submitting}
              >
                {submitting ? <Loader2 size={16} className="spin" /> : 'Archive Product'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handlePermanentDeleteProduct}
                disabled={submitting}
              >
                {submitting ? <Loader2 size={16} className="spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ ADD USER / STAFF MODAL ════════════════ */}
      {isAddUserOpen && (
        <AddUserModal
          onClose={() => setIsAddUserOpen(false)}
          onSuccess={async () => {
            setIsAddUserOpen(false);
            showToast('User account created successfully!');
            await fetchDashboardData();
          }}
          showToast={showToast}
        />
      )}

      {/* ════════════════ VIEW ORDER DETAILS MODAL ════════════════ */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          items={orderItems}
          loading={loadingOrderItems}
          onClose={() => setViewingOrder(null)}
          onStatusChange={handleUpdateOrderStatus}
        />
      )}

      {/* ════════════════ ADD / EDIT ANNOUNCEMENT MODAL ════════════════ */}
      {isAddAnnouncementOpen && (
        <AnnouncementModal
          isOpen={isAddAnnouncementOpen}
          announcement={editingAnnouncement}
          onClose={() => {
            setIsAddAnnouncementOpen(false);
            setEditingAnnouncement(null);
          }}
          onSave={handleSaveAnnouncement}
        />
      )}
    </div>
  );
};

// ─── Sub-Component: Add Product Modal ──────────────────────────────
const AddProductModal = ({ categories, onClose, onSuccess, showToast }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [priceUSD, setPriceUSD] = useState('');
  const [priceRWF, setPriceRWF] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [badge, setBadge] = useState('NONE');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Initial Variant
  const [size, setSize] = useState('M');
  const [colorName, setColorName] = useState('Noir Black');
  const [colorHex, setColorHex] = useState('#111111');
  const [stockQuantity, setStockQuantity] = useState(10);
  const [sku, setSku] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categoryId && categories?.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Auto-slug generator
  const handleTitleChange = (val) => {
    setTitle(val);
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
    if (!sku) {
      const code = val.slice(0, 3).toUpperCase() || 'AIM';
      setSku(`${code}-${size}-${colorName.slice(0, 3).toUpperCase()}`);
    }
  };

  // Auto-convert price
  const handleUSDChange = (val) => {
    setPriceUSD(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPriceRWF(Math.round(num * 1300).toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      showToast('Product title and slug are required.', 'error');
      return;
    }
    if (!priceUSD || isNaN(parseFloat(priceUSD))) {
      showToast('Please enter a valid USD price.', 'error');
      return;
    }
    if (!imageUrl.trim()) {
      showToast('Primary image URL is required.', 'error');
      return;
    }

    try {
      setSaving(true);
      // 1. Insert product
      const { data: newProduct, error: prodError } = await supabase
        .from('products')
        .insert([{
          title: title.trim(),
          slug: slug.trim(),
          category_id: categoryId || null,
          price_usd: parseFloat(priceUSD),
          price_rwf: parseFloat(priceRWF) || Math.round(parseFloat(priceUSD) * 1300),
          description: description.trim(),
          image_url: imageUrl.trim(),
          secondary_image_url: secondaryImageUrl.trim() || imageUrl.trim(),
          badge: badge === 'NONE' ? null : badge,
          is_best_seller: isBestSeller,
          is_active: isActive,
        }])
        .select()
        .single();

      if (prodError) throw prodError;

      // 2. Insert initial variant
      const variantSku = sku.trim() || `AIM-${newProduct.id.slice(0, 4).toUpperCase()}-${size}`;
      const { error: varError } = await supabase
        .from('product_variants')
        .insert([{
          product_id: newProduct.id,
          sku: variantSku,
          attributes: {
            size,
            color: colorHex,
            color_name: colorName,
          },
          stock_quantity: parseInt(stockQuantity, 10) || 0,
          is_active: true,
        }]);

      if (varError) throw varError;

      onSuccess();
    } catch (err) {
      console.error('[AddProductModal] Submit error:', err);
      showToast(err.message || 'Failed to create product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <Plus size={20} style={{ color: 'var(--accent-gold)' }} /> Add New Fashion Product
          </h3>
          <button className="admin-modal-close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="admin-modal-body">
            {/* Row 1: Title & Slug */}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">
                  Product Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Silk Organza Trench"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">
                  URL Slug <span className="required">*</span>
                  <span className="admin-label-hint">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="silk-organza-trench"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Category, USD Price, RWF Price */}
            <div className="admin-form-row three-col">
              <div className="admin-form-group">
                <label className="admin-label">Category</label>
                <select
                  className="admin-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Price (USD $)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="admin-input"
                  placeholder="120.00"
                  value={priceUSD}
                  onChange={(e) => handleUSDChange(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Price (RWF)</label>
                <input
                  type="number"
                  min="0"
                  className="admin-input"
                  placeholder="156000"
                  value={priceRWF}
                  onChange={(e) => setPriceRWF(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 3: Images */}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">
                  Primary Image URL <span className="required">*</span>
                </label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
                {imageUrl && (
                  <div className="admin-image-preview-container">
                    <img src={imageUrl} alt="Preview" className="admin-image-preview" onError={(e) => e.target.style.display='none'} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Primary cover image</span>
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Secondary Image URL (Hover)</label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://images.unsplash.com/..."
                  value={secondaryImageUrl}
                  onChange={(e) => setSecondaryImageUrl(e.target.value)}
                />
                {secondaryImageUrl && (
                  <div className="admin-image-preview-container">
                    <img src={secondaryImageUrl} alt="Hover Preview" className="admin-image-preview" onError={(e) => e.target.style.display='none'} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revealed on hover</span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="admin-form-group">
              <label className="admin-label">Product Description & Fashion Fit Notes</label>
              <textarea
                className="admin-textarea"
                placeholder="Describe silhouette, tailoring, fabric composition and styling tips…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Row 5: Badges & Toggles */}
            <div className="admin-form-row three-col" style={{ alignItems: 'center' }}>
              <div className="admin-form-group">
                <label className="admin-label">Catalog Badge</label>
                <select
                  className="admin-select"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                >
                  <option value="NONE">None</option>
                  <option value="NEW">NEW</option>
                  <option value="BESTSELLER">BESTSELLER</option>
                  <option value="SALE">SALE</option>
                  <option value="LIMITED">LIMITED</option>
                  <option value="EXCLUSIVE">EXCLUSIVE</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="admin-label">Featured Status</label>
                <label className="admin-checkbox-card">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.84rem' }}>⭐ Best Seller Spotlight</span>
                </label>
              </div>

              <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="admin-label">Catalog Visibility</label>
                <label className="admin-checkbox-card">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.84rem' }}>Publish Active Immediately</span>
                </label>
              </div>
            </div>

            {/* Initial Inventory & Variant Section */}
            <div className="admin-variants-box">
              <div className="admin-variants-box-title">
                <span>Initial Size & Inventory Setup</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                  (You can add more sizes and colors anytime in Details)
                </span>
              </div>

              <div className="admin-form-row four-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label">Size</label>
                  <select className="admin-select" value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="Free Size">Free Size</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label">Color Name</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                  />
                </div>

                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label">Color Swatch</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', padding: '2px' }}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>
                </div>

                <div className="admin-form-group" style={{ margin: 0 }}>
                  <label className="admin-label">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="admin-input"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-gold"
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="spin" /> : 'Save & Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Sub-Component: Product Details & Variant Manager Modal ────────
const ProductDetailsModal = ({
  product,
  categories,
  variants,
  activeTab,
  setActiveTab,
  onClose,
  onUpdate,
  showToast,
}) => {
  // Form State for Details Tab
  const [title, setTitle] = useState(product.title || '');
  const [slug, setSlug] = useState(product.slug || '');
  const [categoryId, setCategoryId] = useState(product.category_id || '');
  const [priceUSD, setPriceUSD] = useState(product.price_usd?.toString() || '');
  const [priceRWF, setPriceRWF] = useState(product.price_rwf?.toString() || '');
  const [description, setDescription] = useState(product.description || '');
  const [imageUrl, setImageUrl] = useState(product.image_url || '');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState(product.secondary_image_url || '');
  const [badge, setBadge] = useState(product.badge || 'NONE');
  const [isBestSeller, setIsBestSeller] = useState(product.is_best_seller || false);
  const [isActive, setIsActive] = useState(product.is_active || false);

  const [savingDetails, setSavingDetails] = useState(false);

  // Form State for Adding Variant
  const [newSize, setNewSize] = useState('M');
  const [newColorName, setNewColorName] = useState('Classic Noir');
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [newStock, setNewStock] = useState(5);
  const [newSku, setNewSku] = useState('');
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setSlug(product.slug || '');
      setCategoryId(product.category_id || (categories[0]?.id || ''));
      setPriceUSD(product.price_usd?.toString() || '');
      setPriceRWF(product.price_rwf?.toString() || '');
      setDescription(product.description || '');
      setImageUrl(product.image_url || '');
      setSecondaryImageUrl(product.secondary_image_url || '');
      setBadge(product.badge || 'NONE');
      setIsBestSeller(product.is_best_seller || false);
      setIsActive(product.is_active || false);
    }
  }, [product, categories]);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      setSavingDetails(true);
      const { error } = await supabase
        .from('products')
        .update({
          title: title.trim(),
          slug: slug.trim(),
          category_id: categoryId || null,
          price_usd: parseFloat(priceUSD),
          price_rwf: parseFloat(priceRWF) || Math.round(parseFloat(priceUSD) * 1300),
          description: description.trim(),
          image_url: imageUrl.trim(),
          secondary_image_url: secondaryImageUrl.trim() || imageUrl.trim(),
          badge: badge === 'NONE' ? null : badge,
          is_best_seller: isBestSeller,
          is_active: isActive,
        })
        .eq('id', product.id);

      if (error) throw error;

      showToast('Product details updated.');
      await onUpdate();
    } catch (err) {
      console.error('[ProductDetailsModal] Update error:', err);
      showToast(err.message || 'Failed to update product details.', 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try {
      setAddingVariant(true);
      const autoSku = newSku.trim() || `${product.title.slice(0, 3).toUpperCase()}-${newSize}-${newColorName.slice(0, 3).toUpperCase()}`;

      const { error } = await supabase
        .from('product_variants')
        .insert([{
          product_id: product.id,
          sku: autoSku,
          attributes: {
            size: newSize,
            color: newColorHex,
            color_name: newColorName,
          },
          stock_quantity: parseInt(newStock, 10) || 0,
          is_active: true,
        }]);

      if (error) throw error;

      showToast('New variant added.');
      setNewSku('');
      await onUpdate();
    } catch (err) {
      console.error('[ProductDetailsModal] Add variant error:', err);
      showToast(err.message || 'Failed to add variant.', 'error');
    } finally {
      setAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Delete this size/color variant?')) return;
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) {
        if (error.code === '23503') {
          showToast('Cannot delete variant: part of previous orders.', 'error');
          return;
        }
        throw error;
      }

      showToast('Variant removed.');
      await onUpdate();
    } catch (err) {
      console.error('[ProductDetailsModal] Delete variant error:', err);
      showToast(err.message || 'Failed to delete variant.', 'error');
    }
  };

  const handleUpdateStock = async (variantId, qty) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: Math.max(0, parseInt(qty, 10) || 0) })
        .eq('id', variantId);

      if (error) throw error;
      await onUpdate();
    } catch (err) {
      console.error('[ProductDetailsModal] Quick stock error:', err);
      showToast('Failed to update stock.', 'error');
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <Edit3 size={18} style={{ color: 'var(--accent-gold)' }} />
            Edit: {product.title}
          </h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Tabs */}
        <div className="admin-modal-nav">
          <button
            className={`admin-modal-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Product Information
          </button>
          <button
            className={`admin-modal-tab ${activeTab === 'variants' ? 'active' : ''}`}
            onClick={() => setActiveTab('variants')}
          >
            Sizes, Colors & Inventory ({variants.length})
          </button>
        </div>

        {/* TAB 1: PRODUCT DETAILS */}
        {activeTab === 'details' && (
          <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Product Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">URL Slug</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row three-col">
                <div className="admin-form-group">
                  <label className="admin-label">Category</label>
                  <select
                    className="admin-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Price (USD $)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-input"
                    value={priceUSD}
                    onChange={(e) => {
                      setPriceUSD(e.target.value);
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) setPriceRWF(Math.round(num * 1300).toString());
                    }}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Price (RWF)</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={priceRWF}
                    onChange={(e) => setPriceRWF(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Primary Image URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                  {imageUrl && (
                    <div className="admin-image-preview-container">
                      <img src={imageUrl} alt="Primary" className="admin-image-preview" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Primary cover</span>
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Secondary Image URL (Hover)</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={secondaryImageUrl}
                    onChange={(e) => setSecondaryImageUrl(e.target.value)}
                  />
                  {secondaryImageUrl && (
                    <div className="admin-image-preview-container">
                      <img src={secondaryImageUrl} alt="Hover" className="admin-image-preview" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hover perspective</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description & Luxury Story</label>
                <textarea
                  className="admin-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="admin-form-row three-col">
                <div className="admin-form-group">
                  <label className="admin-label">Badge</label>
                  <select
                    className="admin-select"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  >
                    <option value="NONE">None</option>
                    <option value="NEW">NEW</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="SALE">SALE</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="EXCLUSIVE">EXCLUSIVE</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="admin-label">Featured</label>
                  <label className="admin-checkbox-card">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.84rem' }}>Best Seller</span>
                  </label>
                </div>

                <div className="admin-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="admin-label">Status</label>
                  <label className="admin-checkbox-card">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.84rem' }}>Active in Store</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={savingDetails}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-gold" disabled={savingDetails}>
                {savingDetails ? <Loader2 size={16} className="spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SIZES, COLORS & VARIANTS INVENTORY */}
        {activeTab === 'variants' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="admin-modal-body">
              <div className="admin-variants-box">
                <div className="admin-variants-box-title">
                  <span>Current Variants & Stock Levels</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    Total: {variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)} units
                  </span>
                </div>

                {variants.length === 0 ? (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    No variants found for this product. Add one below to enable sizing and inventory tracking.
                  </p>
                ) : (
                  variants.map(v => (
                    <div key={v.id} className="admin-variant-item">
                      <div className="admin-variant-meta">
                        <span className="admin-variant-badge" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          {v.attributes?.size || 'OS'}
                        </span>
                        {v.attributes?.color && (
                          <span className="admin-variant-badge">
                            <span className="admin-color-dot" style={{ background: v.attributes.color }}></span>
                            {v.attributes?.color_name || v.attributes.color}
                          </span>
                        )}
                        <code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.sku}</code>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="admin-variant-stock-control">
                          <button
                            type="button"
                            className="admin-stock-spin-btn"
                            onClick={() => handleUpdateStock(v.id, Math.max(0, v.stock_quantity - 1))}
                          >-</button>
                          <input
                            type="number"
                            className="admin-stock-spin-input"
                            value={v.stock_quantity}
                            onChange={(e) => handleUpdateStock(v.id, e.target.value)}
                          />
                          <button
                            type="button"
                            className="admin-stock-spin-btn"
                            onClick={() => handleUpdateStock(v.id, v.stock_quantity + 1)}
                          >+</button>
                        </div>

                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          onClick={() => handleDeleteVariant(v.id)}
                          title="Delete variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Variant Sub-form */}
              <form onSubmit={handleAddVariant} style={{ background: '#fff', border: '1px solid #e5e3dd', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} style={{ color: 'var(--accent-gold)' }} /> Add Size or Color Option
                </div>

                <div className="admin-form-row four-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Size</label>
                    <select className="admin-select" value={newSize} onChange={(e) => setNewSize(e.target.value)}>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="Free Size">Free Size</option>
                    </select>
                  </div>

                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Color Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Ivory Gold"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Swatch Hex</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #ddd', padding: '2px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="admin-input"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        style={{ fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="admin-label">Units in Stock</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm" disabled={addingVariant}>
                    {addingVariant ? <Loader2 size={14} className="spin" /> : <><Plus size={14} /> Add Variant</>}
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-Component: Add User / Staff Modal ─────────────────────────
const AddUserModal = ({ onClose, onSuccess, showToast }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('store_manager');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Email is required.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    try {
      setSaving(true);
      // Use isolated client so current admin is NOT signed out
      const isolatedClient = createIsolatedClient();

      const { data: authData, error: authError } = await isolatedClient.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: role,
          }
        }
      });

      if (authError) throw authError;

      // Ensure profile role is set in public.profiles
      if (authData?.user) {
        await supabase
          .from('profiles')
          .update({
            role: role,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          })
          .eq('id', authData.user.id);
      }

      onSuccess();
    } catch (err) {
      console.error('[AddUserModal] Create user error:', err);
      showToast(err.message || 'Failed to create user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <UserPlus size={20} style={{ color: 'var(--accent-gold)' }} /> Add Store Staff or User
          </h3>
          <button className="admin-modal-close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">First Name</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Claire"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Last Name</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Umutoni"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Email Address <span className="required">*</span></label>
              <input
                type="email"
                className="admin-input"
                placeholder="staff@aimeecollection.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">
                Initial Password <span className="required">*</span>
                <span className="admin-label-hint">(min. 8 characters)</span>
              </label>
              <input
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Assigned Dashboard Privilege</label>
              <select
                className="admin-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="store_manager">Store Manager (Products & Orders Access)</option>
                <option value="admin">Administrator (Full Access & User Management)</option>
                <option value="user_buyer">Customer / Buyer (Storefront Shopper Only)</option>
              </select>

              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', background: '#fafaf9', padding: '10px', borderRadius: '8px' }}>
                {role === 'admin' && '🛡️ Administrator: Can create/delete products, manage team permissions, view all metrics, and delete items.'}
                {role === 'store_manager' && '🛍️ Store Manager: Can create/edit products, manage variant stocks, and update order statuses.'}
                {role === 'user_buyer' && '👤 Customer / Buyer: Regular shopper account without admin dashboard access.'}
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-gold"
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="spin" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Sub-Component: View Order Details Modal ───────────────────────
const OrderDetailsModal = ({ order, items, loading, onClose, onStatusChange }) => {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <ShoppingCart size={20} style={{ color: 'var(--accent-gold)' }} />
            Order #{order.id.slice(0, 8)}
          </h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {/* Order Meta */}
          <div className="admin-order-summary-box">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <span className="admin-label">Date Placed</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="admin-label">Total Amount</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 700 }}>
                  {formatCurrency(order.total_usd)}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                    (RWF {Number(order.total_rwf).toLocaleString()})
                  </span>
                </p>
              </div>

              <div>
                <span className="admin-label">Current Status</span>
                <select
                  className="admin-filter-select"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: getStatusColor(order.status),
                    borderColor: getStatusColor(order.status),
                    marginTop: '4px'
                  }}
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                <span className="admin-label">Delivery Destination</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                  <strong>{order.shipping_address?.full_name}</strong> • {order.shipping_address?.phone || 'No phone'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {order.shipping_address?.street}, {order.shipping_address?.city}, {order.shipping_address?.country || 'Rwanda'}
                </p>
              </div>
            )}
          </div>

          {/* Items List */}
          <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '8px' }}>
            Purchased Line Items
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <Loader2 size={24} className="spin" />
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Loading items…</p>
            </div>
          ) : items.length === 0 ? (
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>No item details recorded for this order.</p>
          ) : (
            <table className="admin-order-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.product_title}</strong></td>
                    <td>
                      {item.product_variants?.attributes?.size && (
                        <span className="admin-variant-badge">
                          {item.product_variants.attributes.size}
                        </span>
                      )}
                      {item.product_variants?.attributes?.color_name && (
                        <span className="admin-variant-badge">
                          <span className="admin-color-dot" style={{ background: item.product_variants.attributes.color }}></span>
                          {item.product_variants.attributes.color_name}
                        </span>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price_at_purchase_usd)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(item.price_at_purchase_usd * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-Component: Add / Edit Announcement Modal ───────────────────
const AnnouncementModal = ({
  isOpen,
  announcement,
  onClose,
  onSave,
}) => {
  const [message, setMessage] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (announcement) {
      setMessage(announcement.message || '');
      setHighlightText(announcement.highlight_text || '');
      setLinkUrl(announcement.link_url || '');
      setSortOrder(announcement.sort_order || 1);
      setIsActive(announcement.is_active ?? true);
    } else {
      setMessage('');
      setHighlightText('');
      setLinkUrl('');
      setSortOrder(1);
      setIsActive(true);
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSaving(true);
      await onSave({
        id: announcement?.id,
        message,
        highlight_text: highlightText,
        link_url: linkUrl,
        sort_order: sortOrder,
        is_active: isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <Megaphone size={18} style={{ color: 'var(--accent-gold)' }} />
            {announcement ? 'Edit Top Bar Message' : 'Add Top Bar Message'}
          </h3>
          <button className="admin-modal-close" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label className="admin-label">
                Announcement Message <span className="required">*</span>
              </label>
              <textarea
                className="admin-textarea"
                placeholder="e.g. ✦ COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $150 ✦"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
              />
              <span className="admin-label-hint" style={{ display: 'block', marginTop: '4px' }}>
                Tip: Use ✦ or • symbols to separate announcements for a luxury fashion aesthetic.
              </span>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-label">Gold Highlight Keyword</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. AIMEE10"
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                />
                <span className="admin-label-hint" style={{ display: 'block', marginTop: '2px' }}>
                  Words that will shine in gold
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Display Order</label>
                <input
                  type="number"
                  min="1"
                  className="admin-input"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Optional Target Link URL</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. /clothing or /new-arrivals"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Visibility</label>
              <label className="admin-checkbox-card">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span style={{ fontSize: '0.84rem' }}>Display live on customer storefront topbar</span>
              </label>
            </div>

            {/* Live Message Preview */}
            {message && (
              <div style={{ marginTop: '16px', background: '#111', padding: '12px 16px', borderRadius: '10px', color: '#fff', fontSize: '0.75rem', letterSpacing: '1px', textAlign: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '0.68rem', marginBottom: '4px' }}>STOREFRONT PREVIEW</span>
                {highlightText && message.includes(highlightText) ? (
                  <span>
                    {message.split(highlightText)[0]}
                    <strong style={{ color: '#D4AF37' }}>{highlightText}</strong>
                    {message.split(highlightText)[1]}
                  </span>
                ) : (
                  <span>{message}</span>
                )}
              </div>
            )}
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-gold" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : (announcement ? 'Save Changes' : 'Publish Message')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
