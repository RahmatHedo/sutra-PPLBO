import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarPetani from '../../components/layout/SidebarPetani';
import Topbar from '../../components/layout/Topbar';

export default function Notifikasi() {
  const [notifData, setNotifData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifikasi = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const res = await fetch('http://localhost:3000/api/harvests/petani', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          const formatted = (data.data || []).map(h => {
            const idStr = 'AGC-' + String(h.id).padStart(4, '0');
            const tgl = new Date(h.updated_at || h.created_at);
            const now = new Date();
            const diff = Math.floor((now - tgl) / (1000 * 60 * 60));
            let timeStr;
            if (diff < 1) timeStr = 'Baru saja';
            else if (diff < 24) timeStr = diff + ' jam lalu';
            else if (diff < 48) timeStr = 'Kemarin';
            else timeStr = Math.floor(diff / 24) + ' hari lalu';

            if (h.status === 'verified') {
              return { icon:'ti ti-circle-check', bg:'rgba(61,139,94,0.1)', color:'var(--leaf)', title:`Panen ${h.komoditas} Disetujui`, desc:`Pengajuan ${idStr} (${h.jumlah} ${h.satuan} ${h.komoditas}) telah disetujui oleh Ketua.`, time:timeStr, unread: diff < 72 };
            } else if (h.status === 'rejected') {
              return { icon:'ti ti-circle-x', bg:'var(--rose-light)', color:'var(--rose)', title:`Panen Ditolak — Perlu Revisi`, desc:`${idStr} ${h.komoditas} ${h.jumlah} ${h.satuan} ditolak. ${h.catatan ? 'Alasan: ' + h.catatan : 'Silakan periksa data Anda.'}`, time:timeStr, unread: diff < 72 };
            } else {
              return { icon:'ti ti-clock', bg:'var(--amber-light)', color:'var(--amber)', title:`Menunggu Verifikasi`, desc:`Pengajuan ${idStr} (${h.jumlah} ${h.satuan} ${h.komoditas}) sedang menunggu verifikasi ketua.`, time:timeStr, unread: true };
            }
          });
          setNotifData(formatted);
        }
      } catch (e) {
        console.error('Error load notifikasi:', e);
      } finally {
        setLoading(false);
      }
    };
    loadNotifikasi();
  }, [navigate]);

  const readNotif = (index) => {
    const newData = [...notifData];
    newData[index].unread = false;
    setNotifData(newData);
  };

  const markAllRead = () => {
    const newData = notifData.map(n => ({ ...n, unread: false }));
    setNotifData(newData);
    // Ideal: Show toast here
  };

  const unreadCount = notifData.filter(n => n.unread).length;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarPetani />
      <div className="main">
        <Topbar title="Notifikasi" breadcrumb="Sutra › Notifikasi" profileLink="/petani/profile" />
        <main className="content">
          <div className="page-header">
            <div className="page-header-text">
              <h1><i className="ti ti-bell"></i> Notifikasi</h1>
              <p>{unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}</p>
            </div>
            <button className="btn btn-secondary" onClick={markAllRead}>
              <i className="ti ti-checks"></i> Tandai Semua Dibaca
            </button>
          </div>

          <div className="notif-list">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>Memuat notifikasi...</div>
            ) : notifData.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>
                <i className="ti ti-bell-off" style={{ fontSize: '36px' }}></i>
                <h3>Belum ada notifikasi</h3>
              </div>
            ) : (
              notifData.map((n, i) => (
                <div key={i} className={`notif-item ${n.unread ? 'unread' : ''}`} onClick={() => readNotif(i)} style={{ cursor: 'pointer' }}>
                  <div className="notif-icon-wrap" style={{ background: n.bg }}>
                    <i className={n.icon} style={{ color: n.color }}></i>
                  </div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-desc">{n.desc}</div>
                    <div className="notif-time"><i className="ti ti-clock" style={{ fontSize: '11px', marginRight: '3px' }}></i>{n.time}</div>
                  </div>
                  <div className="notif-right">
                    {n.unread && <div className="unread-dot"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
