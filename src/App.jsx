import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
// Added 'getCountFromServer' to imports
import { getFirestore, collection, addDoc, serverTimestamp, getCountFromServer } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Utensils, ArrowRight, Check, Loader2, Star, MapPin, Heart, Settings, Flame, AlertTriangle, Users } from 'lucide-react';

// --- FIREBASE CONFIG ---
// PASTE YOUR KEYS HERE AGAIN IF YOU COPY-PASTE THIS FILE
const firebaseConfig = {
  apiKey: "AIzaSyAVQx-T3C_DwjZeKwmc1Kr1-i0qhH-TR5w",
  authDomain: "crave-swipe.firebaseapp.com",
  projectId: "crave-swipe",
  storageBucket: "crave-swipe.firebasestorage.app",
  messagingSenderId: "388424370214",
  appId: "1:388424370214:web:ab0ecf632ae83c8bd17ee7",
  measurementId: "G-6ZLRTPXWFE"
};

let app, auth, db;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyD...") {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase initialization error:", e);
}

// ... (MOCK DATA & PriceLevel component remain the same) ...
const DEMO_CARDS = [
  { id: 1, name: "Burger & Barrel", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", cuisine: "American", price: 2, rating: 4.5, address: "42 Industrial Pkwy" },
  { id: 2, name: "Sushi Zen", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80", cuisine: "Japanese", price: 3, rating: 4.8, address: "88 Koi Garden Ln" },
  { id: 3, name: "Mamak Maju", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80", cuisine: "Mamak", price: 1, rating: 4.2, address: "15 Jalan SS2" },
];

const PriceLevel = ({ level }) => (
  <div className="flex text-emerald-600 text-xs font-bold">
    {[...Array(4)].map((_, i) => (
      <span key={i} className={i < level ? "opacity-100" : "opacity-30"}>$</span>
    ))}
  </div>
);

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [activeCard, setActiveCard] = useState(0);
  const [isMisconfigured, setIsMisconfigured] = useState(false);
  
  // NEW: State for the Waitlist Count
  const [waitlistCount, setWaitlistCount] = useState(0);

  // 1. Auth & Data Fetching
  useEffect(() => {
    if (firebaseConfig.apiKey === "AIzaSyD...") {
        setIsMisconfigured(true);
        return;
    }

    if(auth) {
        signInAnonymously(auth).then(() => {
            // FETCH THE COUNT ON LOAD
            if (db) {
                const coll = collection(db, "waitlist");
                getCountFromServer(coll).then(snapshot => {
                    setWaitlistCount(snapshot.data().count);
                }).catch(err => console.log("Count error:", err));
            }
        }).catch((err) => {
            console.error("Auth failed:", err);
            if (err.code === 'auth/api-key-not-valid') setIsMisconfigured(true);
        });
    }
  }, []);

  // 2. Phone Animation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % DEMO_CARDS.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  // 3. Handle Email Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    if (isMisconfigured || !db) {
        alert("Cannot submit: Firebase is not configured yet.");
        return;
    }

    setStatus('loading');

    try {
      const user = auth?.currentUser;
      if (!user) await signInAnonymously(auth);

      await addDoc(collection(db, 'waitlist'), {
        email: email,
        timestamp: serverTimestamp(),
        source: 'landing_page'
      });

      setStatus('success');
      setEmail('');
      // Update count locally immediately so user sees +1
      setWaitlistCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans text-slate-800 selection:bg-rose-200 overflow-x-hidden flex flex-col">
      
      {/* Warning Banner */}
      {isMisconfigured && (
        <div className="bg-red-600 text-white px-6 py-4 shadow-xl z-50 fixed top-0 left-0 right-0 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
                <h3 className="font-bold text-lg">Firebase Setup Required</h3>
                <p className="text-red-100 text-sm mt-1">Replace the API Key in <code>src/App.jsx</code> with your real key.</p>
            </div>
        </div>
      )}

      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className={`relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex-1 flex flex-col ${isMisconfigured ? 'mt-32' : ''}`}>
        
        {/* Nav */}
        <nav className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-rose-500 p-2 rounded-xl shadow-lg shadow-rose-200/50">
               <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Crave<span className="text-rose-500">Swipe</span></span>
          </div>
          <div className="hidden sm:block text-sm font-medium text-slate-400">
            Coming to iOS & Android
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 flex-1">
          
          {/* Left: Copy & Form */}
          <div className="flex-1 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Beta Access Open
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Stop fighting over <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">dinner.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              The "Tinder for Food" that actually works. Swipe through real local spots—Mamaks, Cafes, Mixed Rice & Mookata. Match with your partner and eat.
            </p>

            {/* Email Form */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-rose-100/50 border border-white/50 max-w-md mx-auto lg:mx-0 transform transition-all hover:scale-[1.01]">
              {status === 'success' ? (
                <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 font-bold bg-emerald-50 rounded-xl animate-in fade-in zoom-in">
                  <Check className="w-5 h-5" /> You're on the list!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 px-4 py-3 rounded-xl bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isMisconfigured}
                  />
                  <button 
                    disabled={status === 'loading' || isMisconfigured}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
                  >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Beta'}
                  </button>
                </form>
              )}
            </div>
            
            {/* DYNAMIC COUNTER */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-6 text-slate-400 text-sm">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                  ))}
               </div>
               <p>
                 Join <span className="font-bold text-slate-800">{waitlistCount > 0 ? waitlistCount : '...'}</span> foodies waiting.
               </p>
            </div>

          </div>

          {/* Right: Phone Demo */}
          <div className="relative flex-1 flex justify-center items-center w-full max-w-[320px] lg:max-w-none">
            {/* Phone Frame */}
            <div className="relative w-[300px] h-[600px] bg-white rounded-[3rem] border-8 border-slate-900 shadow-2xl shadow-rose-300/50 overflow-hidden z-10 flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
              {/* App Header */}
              <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/90 backdrop-blur-sm z-20 border-b border-slate-100">
                 <div className="flex items-center gap-2">
                    <div className="bg-rose-500 p-1.5 rounded-lg shadow-lg shadow-rose-200">
                        <Utensils className="w-3 h-3 text-white" />
                    </div>
                    <h2 className="font-bold text-slate-800 text-sm">Crave<span className="text-rose-500">Swipe</span></h2>
                 </div>
                 <div className="p-2 bg-slate-100 rounded-full"><Settings className="w-3 h-3 text-slate-600" /></div>
              </div>
              {/* Cards Container */}
              <div className="relative flex-1 w-full px-4 flex items-center justify-center bg-slate-50">
                {DEMO_CARDS.map((card, index) => {
                  let style = {};
                  const isActive = index === activeCard;
                  const isNext = index === (activeCard + 1) % DEMO_CARDS.length;
                  if (isActive) {
                    style = { transform: 'translateX(200%) rotate(20deg)', opacity: 0, transition: 'all 0.8s ease-in' };
                  } else if (isNext) {
                    style = { transform: 'scale(1) translateY(0)', opacity: 1, zIndex: 10, transition: 'all 0.5s ease-out 0.2s' };
                  } else {
                    style = { transform: 'scale(0.9) translateY(20px)', opacity: 0, zIndex: 0 };
                  }
                  return (
                    <div key={card.id} className="absolute w-[88%] h-[400px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col" style={style}>
                      <div className="h-[55%] relative">
                        <img src={card.image} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"; }} />
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      <div className="h-[45%] p-5 flex flex-col justify-between bg-white">
                         <div>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xl font-bold text-slate-800 leading-tight">{card.name}</h3>
                                <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-slate-700">{card.rating}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                                <MapPin className="w-3 h-3" />
                                <span>{card.address}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cuisine</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-700 font-medium text-xs">{card.cuisine}</span>
                                    <span className="text-slate-300 text-xs">|</span>
                                    <PriceLevel level={card.price} />
                                </div>
                            </div>
                         </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 rounded-lg px-2 py-1 text-2xl font-extrabold -rotate-12 animate-in fade-in zoom-in duration-300 bg-white/20 backdrop-blur-sm z-30">YUM</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Bottom Nav Bar */}
              <div className="bg-white border-t border-slate-100 p-3 flex justify-around items-center z-30 pb-6">
                 <div className="flex flex-col items-center gap-1 text-rose-500"><Flame className="w-5 h-5 fill-rose-500" /><span className="text-[9px] font-bold">Discover</span></div>
                 <div className="flex flex-col items-center gap-1 text-slate-300"><Heart className="w-5 h-5" /><span className="text-[9px] font-bold">Matches</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}