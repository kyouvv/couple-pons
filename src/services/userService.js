import { db } from "../firebase"; // This should now work!
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
// Generate a random 6-character code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const initUser = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      inviteCode: generateCode(),
      linkedWith: null,
    });
  }
  return userSnap.data();
};

export const linkUsers = async (currentUser, targetCode) => {
  // 1. Find the user who owns the targetCode
  const q = query(collection(db, "users"), where("inviteCode", "==", targetCode));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) throw new Error("Invalid Code");

  const partnerDoc = querySnapshot.docs[0];
  const partnerId = partnerDoc.id;

  if (partnerId === currentUser.uid) throw new Error("You cannot link with yourself");

  // 2. Update both documents
  await updateDoc(doc(db, "users", currentUser.uid), { linkedWith: partnerId });
  await updateDoc(doc(db, "users", partnerId), { linkedWith: currentUser.uid });
};

export const unlinkUsers = async (currentUserUid, partnerId) => {
  await updateDoc(doc(db, "users", currentUserUid), { linkedWith: null });
  await updateDoc(doc(db, "users", partnerId), { linkedWith: null });
};