import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_ANNOUNCEMENTS = [
  { id: 'def-1', message: '✦ COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $150 / 200,000 RWF ✦', highlight_text: 'COMPLIMENTARY EXPRESS SHIPPING' },
  { id: 'def-2', message: 'NEW AUTUMN/WINTER HAUTE COUTURE OUT NOW ✦', highlight_text: 'HAUTE COUTURE' },
  { id: 'def-3', message: 'USE CODE AIMEE10 FOR 10% OFF YOUR FIRST ORDER ✦', highlight_text: 'AIMEE10' },
  { id: 'def-4', message: 'EXCLUSIVELY HANDCRAFTED LUXURY FASHION ✦', highlight_text: 'LUXURY FASHION' },
];

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState(DEFAULT_ANNOUNCEMENTS);

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.warn('[AnnouncementBar] Using fallback announcements:', err);
      }
    };

    fetchAnnouncements();

    // Subscribe to realtime changes on announcements table
    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper to render message with optional gold highlight
  const renderMessageContent = (item) => {
    const text = item.message;
    const highlight = item.highlight_text;

    if (highlight && text.includes(highlight)) {
      const parts = text.split(highlight);
      return (
        <span>
          {parts[0]}
          <strong style={{ color: '#D4AF37' }}>{highlight}</strong>
          {parts[1]}
        </span>
      );
    }

    if (text.includes('AIMEE10')) {
      const parts = text.split('AIMEE10');
      return (
        <span>
          {parts[0]}
          <strong style={{ color: '#D4AF37' }}>AIMEE10</strong>
          {parts[1]}
        </span>
      );
    }

    return <span>{text}</span>;
  };

  // Duplicate list if less than 4 items to keep the infinite ticker smooth
  const displayItems = announcements.length > 0 && announcements.length < 4
    ? [...announcements, ...announcements]
    : announcements;

  return (
    <div className="announcement-bar" role="region" aria-label="Store Announcements">
      <div className="announcement-ticker">
        {displayItems.map((item, idx) => (
          <React.Fragment key={`${item.id}-${idx}`}>
            {renderMessageContent(item)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
