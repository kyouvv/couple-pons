import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from "firebase/firestore";
import { linkUsers, unlinkUsers, initUser } from "../services/userService";

export default function Navbar() {
    const user = auth.currentUser;
    const [userData, setUserData] = useState(null);
    const [targetCode, setTargetCode] = useState("");

    useEffect(() => {
        if (!user) return;

        // Ensure user document exists in Firestore first
        initUser(user);

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setUserData(doc.data());
            }
        });
        return () => unsubscribe();
    }, [user]);

    const handleLink = async (e) => {
        e.preventDefault();
        try {
            await linkUsers(user, targetCode);
            setTargetCode("");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="navbar bg-base-200 shadow-lg px-2 md:px-4">
            <div className="flex-1">
                <a className="btn btn-ghost text-lg md:text-xl">Couple-pons</a>
            </div>

            <div className="flex-none flex items-center gap-2">
                {/* DESKTOP ONLY: Your Code & Link Form */}
                <div className="hidden md:flex items-center gap-4 mr-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] opacity-60 uppercase font-bold">Your Invite Code</span>
                        <span className="font-mono text-primary font-bold">{userData?.inviteCode || "Loading..."}</span>
                    </div>

                    {userData?.linkedWith ? (
                        <div className="badge badge-success gap-2 p-3">
                            <span className="text-xs font-bold">LINKED</span>
                            <button onClick={() => unlinkUsers(user.uid, userData.linkedWith)} className="hover:text-white">✕</button>
                        </div>
                    ) : (
                        <form onSubmit={handleLink} className="join">
                            <input 
                                className="input input-bordered input-sm join-item w-28" 
                                placeholder="Code"
                                value={targetCode}
                                onChange={(e) => setTargetCode(e.target.value)}
                            />
                            <button type="submit" className="btn btn-sm btn-primary join-item">Link</button>
                        </form>
                    )}
                </div>

                {/* AVATAR & MOBILE MENU */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-primary/20">
                        <div className="w-10 rounded-full">
                            <img src={user?.photoURL || "https://ui-avatars.com/api/?name=User"} alt="Profile" />
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-4 shadow-xl menu menu-md dropdown-content bg-base-100 rounded-box w-64 border border-base-300">
                        <li className="menu-title text-primary uppercase text-xs">{user?.displayName}</li>
                        
                        {/* MOBILE ONLY ITEMS (Visible only on small screens) */}
                        <div className="md:hidden">
                            <div className="divider my-1"></div>
                            <li className="px-2 py-1">
                                <span className="text-xs opacity-60">Your Code: <b className="text-base text-primary font-mono">{userData?.inviteCode}</b></span>
                            </li>
                            {userData?.linkedWith ? (
                                <li><a onClick={() => unlinkUsers(user.uid, userData.linkedWith)} className="text-error">Unlink Partner</a></li>
                            ) : (
                                <li className="mt-2">
                                    <form onSubmit={handleLink} className="flex gap-2">
                                        <input 
                                            className="input input-bordered input-sm flex-1" 
                                            placeholder="Partner Code"
                                            value={targetCode}
                                            onChange={(e) => setTargetCode(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-sm btn-primary">Link</button>
                                    </form>
                                </li>
                            )}
                            <div className="divider my-1"></div>
                        </div>

                        <li><a>Profile Settings</a></li>
                        <li><button onClick={() => signOut(auth)} className="text-error mt-2">Logout</button></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}