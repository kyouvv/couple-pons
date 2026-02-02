import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, doc } from "firebase/firestore";
import { addCoupon, deleteCoupon, claimCoupon, markAsSeen } from '../services/couponService';
import Navbar from "./Navbar";
import CouponCard from '../components/CouponCard';

const Dashboard = () => {
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [receivedCoupons, setReceivedCoupons] = useState([]);
  const [sentCoupons, setSentCoupons] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [formData, setFormData] = useState({ name: '', expiration: '', description: '', image: '' });

  // 1. Fetch User Data
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => setUserData(snap.data()));
    return () => unsubscribe();
  }, [user]);

  // 2. Query: Coupons Received (Coupons sent to me)
  useEffect(() => {
    if (!user || !userData?.linkedWith) return;
    const q = query(
      collection(db, "coupons"), 
      where("createdBy", "==", userData.linkedWith), 
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => setReceivedCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user, userData?.linkedWith]);

  // 3. Query: Coupons Sent (Coupons I created)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "coupons"), 
      where("createdBy", "==", user.uid), 
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => setSentCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  // Calculate notifications for the 'Sent' tab
  const unreadCount = sentCoupons.filter(c => c.status === 'claimed' && c.seenByCreator === false).length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // If clicking into Sent tab, clear notifications
    if (tab === 'sent') {
      sentCoupons.forEach(c => {
        if (c.status === 'claimed' && !c.seenByCreator) {
          markAsSeen(c.id);
        }
      });
    }
  };

  const handleClaim = async (coupon) => {
    try {
      await claimCoupon(coupon.id);
      alert("🎉 Reward Redeemed!");
    } catch (err) {
      alert("Failed to redeem coupon.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCoupon(user.uid, userData.linkedWith, formData);
      setFormData({ name: '', expiration: '', description: '', image: '' });
      document.getElementById('add_coupon_modal').close(); 
    } catch (err) {
      alert("Error saving coupon");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this coupon?")) {
      await deleteCoupon(id);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-20">
      <Navbar />
      
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Welcome Stat */}
        <div className="stats shadow w-full mb-8 bg-base-200">
          <div className="stat">
            <div className="stat-title">Hello,</div>
            <div className="stat-value text-primary text-2xl md:text-3xl">{user?.displayName}</div>
            <div className="stat-desc">{userData?.linkedWith ? "💖 Partner Linked" : "⚠️ Not Linked"}</div>
            <div className="stat-desc">You have sent {sentCoupons.length} gifts</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div role="tablist" className="tabs tabs-boxed mb-8 bg-base-300 p-1">
          <button 
            role="tab" 
            className={`tab ${activeTab === 'received' ? 'tab-active !bg-primary !text-white' : ''}`}
            onClick={() => handleTabChange('received')}
          >
            🎁 Received ({receivedCoupons.length})
          </button>
          <button 
            role="tab" 
            className={`tab relative ${activeTab === 'sent' ? 'tab-active !bg-primary !text-white' : ''}`}
            onClick={() => handleTabChange('sent')}
          >
            📤 Sent ({sentCoupons.length})
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
              </span>
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold opacity-70">
            {activeTab === 'received' ? "Your Rewards" : "Coupons You Gifted"}
          </h2>
          <button 
            className="btn btn-primary btn-sm hidden md:flex"
            onClick={() => document.getElementById('add_coupon_modal').showModal()}
            disabled={!userData?.linkedWith}
          >
            + New Gift
          </button>
        </div>

        {/* The Coupons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'received' ? (
            receivedCoupons.map(c => (
              <CouponCard 
                key={c.id} 
                {...c} 
                onUse={() => handleClaim(c)} 
              />
            ))
          ) : (
            sentCoupons.map(c => (
              <div key={c.id} className="relative group">
                <CouponCard {...c} />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`badge badge-sm ${c.status === 'claimed' ? 'badge-success' : 'badge-ghost'} bg-base-100/80`}>
                    {c.status || 'active'}
                  </span>
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="btn btn-circle btn-xs btn-error"
                  >✕</button>
                </div>
                {c.status === 'claimed' && !c.seenByCreator && (
                  <div className="absolute top-2 left-2 badge badge-error badge-sm">NEW CLAIM</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Floating Button for Mobile */}
        <button 
          className="btn btn-primary btn-circle btn-lg fixed bottom-6 right-6 md:hidden shadow-2xl z-50"
          onClick={() => document.getElementById('add_coupon_modal').showModal()}
          disabled={!userData?.linkedWith}
        >
          +
        </button>

        {/* --- THE MODAL --- */}
        <dialog id="add_coupon_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create a Gift</h3>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <input 
                type="text" placeholder="Coupon Name" className="input input-bordered w-full" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="date" className="input input-bordered w-full" required
                value={formData.expiration} onChange={e => setFormData({...formData, expiration: e.target.value})}
              />
              <textarea 
                placeholder="Description" className="textarea textarea-bordered w-full"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <input 
                type="url" placeholder="Image URL (Optional)" className="input input-bordered w-full"
                value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
              />
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => document.getElementById('add_coupon_modal').close()}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Gift</button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </main>
    </div>
  );
};

export default Dashboard;