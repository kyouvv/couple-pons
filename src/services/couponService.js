import { db } from "../firebase";
import { 
  collection, addDoc, serverTimestamp, 
  doc, updateDoc, deleteDoc 
} from "firebase/firestore";

export const claimCoupon = async (couponId) => {
  const couponRef = doc(db, "coupons", couponId);
  return await updateDoc(couponRef, {
    status: "claimed",
    claimedAt: new Date(),
    seenByCreator: false // This triggers the notification for the sender
  });
};

// Add this to clear the notification badge
export const markAsSeen = async (couponId) => {
  const couponRef = doc(db, "coupons", couponId);
  return await updateDoc(couponRef, {
    seenByCreator: true
  });
};

export const deleteCoupon = async (couponId) => {
  await deleteDoc(doc(db, "coupons", couponId));
};

export const addCoupon = async (userId, partnerId, couponData) => {
  await addDoc(collection(db, "coupons"), {
    ...couponData,
    createdBy: userId,
    partnerId: partnerId,
    createdAt: serverTimestamp(),
    status: "active",
    seenByCreator: true // It's their own, they don't need a notification for creating it
  });
};