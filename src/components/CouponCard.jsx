  import React from 'react';

const CouponCard = ({ name, expiration, description, image, onUse, status }) => {
  const isClaimed = status === 'claimed';

  return (
    <div className={`card card-compact w-full bg-base-100 shadow-xl border ${isClaimed ? 'border-success opacity-75' : 'border-base-300'} transition-all`}>
      <figure className="h-40 relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">🎫</div>
        )}
        {isClaimed && (
          <div className="absolute inset-0 bg-base-300/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="badge badge-success badge-lg font-bold">REDEEMED</span>
          </div>
        )}
      </figure>

      <div className="card-body">
        <div className="flex justify-between items-start">
          <h2 className="card-title text-lg">{name}</h2>
          <div className="badge badge-secondary badge-outline text-[10px]">EXP: {expiration}</div>
        </div>
        <p className="text-sm opacity-70 line-clamp-2">{description || "No description provided."}</p>

        <div className="card-actions justify-end mt-4">
          <button 
            onClick={onUse} 
            disabled={isClaimed}
            className={`btn btn-sm w-full ${isClaimed ? 'btn-disabled' : 'btn-primary'}`}
          >
            {isClaimed ? 'Claimed' : 'Redeem Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
};

  export default CouponCard;