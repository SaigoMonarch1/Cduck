/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Milestone, 
  ShoppingBag, 
  MessageSquare, 
  Info, 
  ChevronRight, 
  ArrowRight,
  Leaf,
  Zap,
  ShieldCheck,
  Heart,
  Lock,
  LogOut,
  Trash2,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { cn } from './lib/utils';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// --- Types ---
type Page = 'home' | 'journey' | 'shop' | 'suggestion' | 'details' | 'admin';

interface Suggestion {
  id: string;
  name: string;
  idea: string;
  createdAt: any;
}

interface Prebooking {
  id: string;
  productName: string;
  userEmail: string;
  userName: string;
  createdAt: any;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  desc: string;
  createdAt: any;
}

// --- Components ---

const Navbar = ({ activePage, setPage, user }: { activePage: Page, setPage: (p: Page) => void, user: FirebaseUser | null }) => {
  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'journey', label: 'Journey', icon: <Milestone size={18} /> },
    { id: 'shop', label: 'Shop', icon: <ShoppingBag size={18} /> },
    { id: 'suggestion', label: 'Suggestion', icon: <MessageSquare size={18} /> },
    { id: 'details', label: 'Details', icon: <Info size={18} /> },
  ];

  const isAdmin = user?.email === 'saigomonarch0@gmail.com';

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl border border-stone-200 px-4 py-2 rounded-full shadow-2xl flex items-center gap-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium",
            activePage === item.id 
              ? "bg-stone-900 text-white shadow-lg" 
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          )}
        >
          {item.icon}
          <span className={cn("hidden md:block", activePage === item.id ? "block" : "hidden")}>
            {item.label}
          </span>
        </button>
      ))}
      {isAdmin && (
        <button
          onClick={() => setPage('admin')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium",
            activePage === 'admin' 
              ? "bg-amber-600 text-white shadow-lg" 
              : "text-amber-600 hover:bg-amber-50"
          )}
        >
          <Lock size={18} />
          <span className={cn("hidden md:block", activePage === 'admin' ? "block" : "hidden")}>
            Admin
          </span>
        </button>
      )}
    </nav>
  );
};

const HomePage = ({ onNext }: { onNext: () => void, key?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#f5f2ed]"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <span className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold">
        Established 2025
      </span>
    </motion.div>
    
    <h1 className="text-6xl md:text-8xl font-serif font-light text-stone-900 mb-6 leading-tight">
      Cduck <br/> <span className="italic font-medium">Food & Beverages</span>
    </h1>
    
    <p className="max-w-xl text-stone-600 text-lg md:text-xl font-light mb-10 leading-relaxed">
      Redefining the snack industry with a commitment to health without compromise. 
      Premium quality, natural ingredients, and a vision for a healthier future.
    </p>
    
    <div className="flex flex-col md:flex-row gap-4">
      <button 
        onClick={onNext}
        className="group flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl"
      >
        Explore Our Vision
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl">
      {[
        { icon: <Leaf className="text-stone-900" />, title: "100% Natural", desc: "No artificial preservatives or colors." },
        { icon: <Heart className="text-stone-900" />, title: "Health First", desc: "Snacks designed for your well-being." },
        { icon: <ShieldCheck className="text-stone-900" />, title: "Premium Quality", desc: "Sourced from the finest ingredients." }
      ].map((feature, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + (i * 0.1) }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border border-stone-100">
            {feature.icon}
          </div>
          <h3 className="font-serif text-xl mb-2 text-stone-900">{feature.title}</h3>
          <p className="text-stone-500 text-sm">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const JourneyPage = () => {
  const timeline = [
    { year: '2025', title: 'The Vision', desc: 'Planning and conceptualization of Cduck Food & Beverages Limited. Setting the foundation for a health-first snacks revolution.', icon: <Leaf className="text-stone-400" /> },
    { year: '2026', title: 'First Steps', desc: 'Taking the first physical steps. Lab testing and initial product development phases begin.', icon: <Zap className="text-stone-400" /> },
    { year: '2027', title: 'Awareness', desc: 'Starting the movement. Engaging with communities to spread the word about a new era of beverages.', icon: <MessageSquare className="text-stone-400" /> },
    { year: '2028', title: 'Pre-Launch', desc: 'Official registration of "Cduck Food and Beverages Limited". Exclusive product showcases for early adopters.', icon: <ShieldCheck className="text-stone-400" /> },
    { year: '2029', title: 'Initial Launch', desc: 'Final launch of our first 4-5 core healthy products. Available in select premium stores.', icon: <ShoppingBag className="text-stone-400" /> },
    { year: '2030', title: 'Full Catalog', desc: 'Final stage. Full product catalog launch and global distribution. The new standard for snacks.', icon: <Heart className="text-stone-400" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-stone-950 text-white py-32 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-32 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-stone-500 font-mono text-sm tracking-[0.5em] uppercase mb-4 block">The Evolution</span>
            <h2 className="text-7xl md:text-9xl font-serif font-light leading-none">
              Roadmap <br/> <span className="italic text-stone-600">to 2030</span>
            </h2>
          </motion.div>
          
          <div className="absolute top-0 right-0 hidden lg:block opacity-10">
            <h2 className="text-[20rem] font-serif font-bold leading-none select-none">CDUCK</h2>
          </div>
        </div>

        <div className="space-y-40 relative">
          {/* Vertical line that "grows" */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-stone-800 -translate-x-1/2 hidden md:block" />

          {timeline.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "relative flex flex-col md:flex-row items-center gap-12",
                i % 2 === 0 ? "md:flex-row-reverse" : ""
              )}
            >
              {/* Year Indicator */}
              <div className="absolute left-0 md:left-1/2 top-0 -translate-x-1/2 z-20 hidden md:block">
                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
              </div>

              {/* Content Side */}
              <div className="w-full md:w-1/2">
                <div className={cn(
                  "flex flex-col",
                  i % 2 === 0 ? "md:items-start" : "md:items-end md:text-right"
                )}>
                  <span className="text-8xl md:text-[10rem] font-serif font-bold text-stone-900 leading-none mb-[-2rem] md:mb-[-4rem] select-none">
                    {item.year}
                  </span>
                  <div className="relative z-10 bg-stone-900/50 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-stone-800 hover:border-stone-600 transition-all duration-500 group">
                    <div className={cn(
                      "flex items-center gap-4 mb-6",
                      i % 2 === 0 ? "" : "md:flex-row-reverse"
                    )}>
                      <div className="w-12 h-12 rounded-xl bg-stone-800 flex items-center justify-center group-hover:bg-white group-hover:text-stone-900 transition-colors duration-500">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif">{item.title}</h3>
                    </div>
                    <p className="text-stone-400 text-lg leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Empty Side (for spacing) */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-40 text-center py-24 border-t border-stone-900"
        >
          <h3 className="text-4xl font-serif italic text-stone-500 mb-8">The future is healthy.</h3>
          <div className="flex justify-center gap-4">
            <div className="w-2 h-2 rounded-full bg-stone-800" />
            <div className="w-2 h-2 rounded-full bg-stone-700" />
            <div className="w-2 h-2 rounded-full bg-stone-600" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ShopPage = () => {
  const [bookingProduct, setBookingProduct] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const fetchedProducts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(fetchedProducts);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handlePrebook = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'prebookings'), {
        productName: bookingProduct,
        userName: name,
        userEmail: email,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setBookingStatus('success');
      setTimeout(() => {
        setBookingProduct(null);
        setBookingStatus('idle');
      }, 2000);
    } catch (error) {
      console.error("Error pre-booking:", error);
      setBookingStatus('idle');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-5xl font-serif text-stone-900 mb-4">The Collection</h2>
            <p className="text-stone-500 max-w-md">
              Preview our upcoming catalog. Healthy alternatives to your favorite snacks and drinks.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-stone-100 rounded-full text-xs font-bold text-stone-600 uppercase tracking-wider">
              Premium Quality
            </span>
            <span className="px-4 py-2 bg-stone-100 rounded-full text-xs font-bold text-stone-600 uppercase tracking-wider">
              Health Focused
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full py-24 text-center">
              <Clock className="mx-auto mb-4 text-stone-200 animate-spin" size={48} />
              <p className="text-stone-400 font-medium">Loading collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-24 text-center border border-dashed border-stone-200 rounded-[40px]">
              <ShoppingBag className="mx-auto mb-4 text-stone-200" size={48} />
              <p className="text-stone-400 font-medium">Our collection is coming soon.</p>
            </div>
          ) : (
            products.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-stone-50 rounded-3xl mb-6 overflow-hidden relative flex items-center justify-center border border-stone-100">
                  <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-500" />
                  <div className="w-32 h-32 rounded-full bg-stone-200/50 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <ShoppingBag className="text-stone-300 group-hover:text-stone-400 transition-colors" size={48} />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {product.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                    <button 
                      onClick={() => setBookingProduct(product.name)}
                      className="w-full bg-stone-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl"
                    >
                      Pre-book Now
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-1">{product.name}</h3>
                <p className="text-stone-400 text-xs mb-3 leading-relaxed">{product.desc}</p>
                <span className="text-sm font-bold text-stone-600">{product.price}</span>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-24 p-12 bg-stone-900 rounded-[40px] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-500 via-transparent to-transparent" />
          </div>
          <h3 className="text-3xl md:text-4xl font-serif mb-6 relative z-10">Why the higher price?</h3>
          <p className="max-w-2xl mx-auto text-stone-400 leading-relaxed relative z-10">
            We use premium, ethically sourced ingredients. While mass-market brands compromise on health for cost, 
            we prioritize your well-being. We are constantly working to make health affordable without cutting corners.
          </p>
        </div>
      </div>

      {/* Pre-booking Modal */}
      <AnimatePresence>
        {bookingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingProduct(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl"
            >
              <h3 className="text-3xl font-serif mb-2">Pre-book</h3>
              <p className="text-stone-500 text-sm mb-8">Secure your {bookingProduct} from the 2029 batch.</p>
              
              {bookingStatus === 'success' ? (
                <div className="text-center py-12">
                  <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                  <p className="font-bold text-stone-900">Booking Confirmed!</p>
                </div>
              ) : (
                <form onSubmit={handlePrebook} className="space-y-4">
                  <input 
                    name="name"
                    required
                    placeholder="Full Name"
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none"
                  />
                  <input 
                    name="email"
                    type="email"
                    required
                    placeholder="Email Address"
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none"
                  />
                  <button 
                    disabled={bookingStatus === 'loading'}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? 'Processing...' : 'Confirm Pre-booking'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SuggestionPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const idea = formData.get('idea') as string;

    try {
      await addDoc(collection(db, 'suggestions'), {
        name,
        idea,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending suggestion:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f5f2ed] py-24 px-6 flex items-center justify-center"
    >
      <div className="max-w-2xl w-full bg-white p-10 md:p-16 rounded-[40px] shadow-xl border border-stone-100">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-stone-900 mb-4">Shape Our Future</h2>
          <p className="text-stone-500">
            What products would you like to see in our healthy catalog? 
            Your suggestions drive our innovation.
          </p>
        </div>

        {!submitted ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Your Name</label>
              <input 
                name="name"
                type="text" 
                required
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Product Idea</label>
              <textarea 
                name="idea"
                required
                rows={4}
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all resize-none"
                placeholder="Describe your healthy snack or drink idea..."
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg"
            >
              Send Suggestion
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-green-600" size={40} />
            </div>
            <h3 className="text-2xl font-serif text-stone-900 mb-2">Thank You!</h3>
            <p className="text-stone-500 mb-8">Your idea has been recorded. We'll consider it for our 2029-2030 roadmap.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-stone-900 font-bold underline underline-offset-8"
            >
              Send another idea
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const AdminPanel = ({ user }: { user: FirebaseUser | null, key?: string }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [prebookings, setPrebookings] = useState<Prebooking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'prebookings' | 'products'>('suggestions');
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (user?.email !== 'saigomonarch0@gmail.com') return;

    const qS = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
    const unsubS = onSnapshot(qS, (snap) => {
      setSuggestions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Suggestion)));
    });

    const qP = query(collection(db, 'prebookings'), orderBy('createdAt', 'desc'));
    const unsubP = onSnapshot(qP, (snap) => {
      setPrebookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prebooking)));
    });

    const qPr = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubPr = onSnapshot(qPr, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });

    return () => { unsubS(); unsubP(); unsubPr(); };
  }, [user]);

  const handleDelete = async (coll: string, id: string) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      await deleteDoc(doc(db, coll, id));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const desc = formData.get('desc') as string;

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price,
        category,
        desc,
        createdAt: new Date().toISOString()
      });
      setShowAddProduct(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'prebookings', id), { status });
  };

  if (user?.email !== 'saigomonarch0@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[40px] text-center shadow-xl">
          <Lock className="mx-auto mb-6 text-stone-300" size={48} />
          <h2 className="text-3xl font-serif mb-4">Admin Access</h2>
          <p className="text-stone-500 mb-8">Please sign in with your admin account to access the dashboard.</p>
          <button 
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
          >
            <User size={20} />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-serif text-stone-900">Admin Dashboard</h2>
            <p className="text-stone-500">Managing Cduck's growth and community input.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-full border border-stone-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <ShieldCheck size={16} />
              </div>
              <span className="text-sm font-bold">{user.email}</span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-3 bg-white rounded-full border border-stone-100 text-stone-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('suggestions')}
            className={cn(
              "px-8 py-3 rounded-full font-bold transition-all",
              activeTab === 'suggestions' ? "bg-stone-900 text-white" : "bg-white text-stone-500 border border-stone-100"
            )}
          >
            Suggestions ({suggestions.length})
          </button>
          <button 
            onClick={() => setActiveTab('prebookings')}
            className={cn(
              "px-8 py-3 rounded-full font-bold transition-all",
              activeTab === 'prebookings' ? "bg-stone-900 text-white" : "bg-white text-stone-500 border border-stone-100"
            )}
          >
            Pre-bookings ({prebookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "px-8 py-3 rounded-full font-bold transition-all",
              activeTab === 'products' ? "bg-stone-900 text-white" : "bg-white text-stone-500 border border-stone-100"
            )}
          >
            Products ({products.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'suggestions' ? (
            suggestions.map((s) => (
              <motion.div 
                layout
                key={s.id}
                className="bg-white p-8 rounded-[2rem] border border-stone-100 flex flex-col md:flex-row justify-between items-start gap-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <span className="text-xs text-stone-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">{s.idea}</p>
                </div>
                <button 
                  onClick={() => handleDelete('suggestions', s.id)}
                  className="p-3 text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))
          ) : activeTab === 'prebookings' ? (
            prebookings.map((p) => (
              <motion.div 
                layout
                key={p.id}
                className="bg-white p-8 rounded-[2rem] border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {p.productName}
                    </span>
                    <span className="text-xs text-stone-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg">{p.userName}</h3>
                  <p className="text-stone-500 text-sm">{p.userEmail}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <select 
                    value={p.status}
                    onChange={(e) => updateStatus(p.id, e.target.value)}
                    className="bg-stone-50 border border-stone-100 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button 
                    onClick={() => handleDelete('prebookings', p.id)}
                    className="p-3 text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="bg-stone-900 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2"
                >
                  Add New Product
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <motion.div 
                    layout
                    key={product.id}
                    className="bg-white p-6 rounded-[2rem] border border-stone-100 relative group"
                  >
                    <button 
                      onClick={() => handleDelete('products', product.id)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm text-stone-300 hover:text-red-500 transition-colors z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="aspect-square bg-stone-50 rounded-2xl mb-4 flex items-center justify-center">
                      <ShoppingBag className="text-stone-200" size={32} />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{product.name}</h3>
                      <span className="text-xs font-bold text-stone-400">{product.price}</span>
                    </div>
                    <p className="text-stone-500 text-xs mb-3">{product.desc}</p>
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {product.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {(activeTab === 'suggestions' ? suggestions : activeTab === 'prebookings' ? prebookings : products).length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-stone-100 border-dashed">
              <Clock className="mx-auto mb-4 text-stone-200" size={48} />
              <p className="text-stone-400 font-medium">No records found yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProduct(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl"
            >
              <h3 className="text-3xl font-serif mb-6">New Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input 
                  name="name"
                  required
                  placeholder="Product Name"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none"
                />
                <input 
                  name="price"
                  required
                  placeholder="Price (e.g. Coming 2029)"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none"
                />
                <input 
                  name="category"
                  required
                  placeholder="Category (e.g. Beverages)"
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none"
                />
                <textarea 
                  name="desc"
                  required
                  placeholder="Description"
                  rows={3}
                  className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none resize-none"
                />
                <button 
                  type="submit"
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold"
                >
                  Add Product
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailsPage = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen bg-white py-24 px-6"
  >
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <h2 className="text-5xl font-serif text-stone-900 mb-8">The Company</h2>
          <div className="space-y-6 text-stone-600 leading-relaxed">
            <p>
              <strong className="text-stone-900">Cduck Food and Beverages Limited</strong> was born from a simple observation: 
              the snacks we love are often the ones that harm us most.
            </p>
            <p>
              We are building a brand that mirrors the scale of industry giants like PepsiCo, 
              but with a fundamental difference in DNA. Every product we create is engineered 
              to be healthy for normal people, without compromising on the taste and convenience 
              of modern life.
            </p>
            <p>
              Our mission is to make health the default choice, not the difficult one.
            </p>
          </div>
        </div>
        <div className="aspect-square bg-stone-50 rounded-[60px] border border-stone-100 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h3 className="text-2xl font-serif text-stone-900 mb-2">Certified Healthy</h3>
          <p className="text-stone-500 text-sm">
            Our standards exceed international health guidelines for sugar, sodium, and fat content.
          </p>
        </div>
      </div>

      <div className="border-t border-stone-100 pt-16">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-12 text-center">Core Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Transparency", desc: "Full disclosure of every ingredient and its source." },
            { title: "Affordability", desc: "Constant innovation to lower the cost of healthy living." },
            { title: "Sustainability", desc: "Eco-friendly packaging and ethical supply chains." }
          ].map((val, i) => (
            <div key={i} className="text-center">
              <h4 className="text-xl font-serif text-stone-900 mb-3">{val.title}</h4>
              <p className="text-stone-500 text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-32 pt-12 border-t border-stone-100 text-center">
        <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
          © 2026 Cduck Food and Beverages Limited. All rights reserved.
        </p>
      </footer>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Handle URL routing for /admin
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setPage('admin');
    }
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed]">
        <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-sans text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-100 py-2 px-4 text-center relative z-[100]">
        <p className="text-[10px] md:text-xs font-bold text-amber-800 uppercase tracking-widest leading-relaxed">
          Disclaimer: Cduck Food and Beverages Limited currently does not exist. This is a conceptual vision. 
          We make no claims of current operations; this brand may exist in the future.
        </p>
      </div>

      <Navbar activePage={page} setPage={setPage} user={user} />
      
      <main>
        <AnimatePresence mode="wait">
          {page === 'home' && <HomePage key="home" onNext={() => setPage('journey')} />}
          {page === 'journey' && <JourneyPage key="journey" />}
          {page === 'shop' && <ShopPage key="shop" />}
          {page === 'suggestion' && <SuggestionPage key="suggestion" />}
          {page === 'details' && <DetailsPage key="details" />}
          {page === 'admin' && <AdminPanel key="admin" user={user} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
