import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiSliders, FiArrowRight, FiHeart } from 'react-icons/fi';

const signaturePizzas = [
  {
    id: 'sig-1',
    name: 'Margherita Classic',
    description: 'Thin Crust loaded with Classic Tomato sauce, premium Mozzarella cheese, and a Basil Pesto drizzle.',
    base: 'Thin Crust',
    sauce: 'Classic Tomato',
    cheese: ['Mozzarella'],
    vegetables: [],
    price: 150,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    tag: 'Classic'
  },
  {
    id: 'sig-2',
    name: 'Garden Veggie Supreme',
    description: 'Pan Crust topped with Spicy Marinara, Mozzarella, Cheddar, Bell Peppers, Red Onions, and Sweet Corn.',
    base: 'Pan Crust',
    sauce: 'Spicy Marinara',
    cheese: ['Mozzarella', 'Cheddar'],
    vegetables: ['Bell Peppers', 'Red Onions', 'Sweet Corn'],
    price: 245,
    image: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    tag: 'Bestseller'
  },
  {
    id: 'sig-3',
    name: 'Alfredo Mushroom Magic',
    description: 'Stuffed Crust with Creamy Garlic Alfredo sauce, Mozzarella, Parmesan, and a load of roasted Mushrooms.',
    base: 'Stuffed Crust',
    sauce: 'Creamy Garlic Alfredo',
    cheese: ['Mozzarella', 'Parmesan'],
    vegetables: ['Mushrooms'],
    price: 275,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    tag: 'Gourmet'
  },
  {
    id: 'sig-4',
    name: 'Smoky BBQ Jalapeno Fest',
    description: 'Cheese Burst base with Smoky BBQ sauce, Mozzarella, Jalapeños, Sweet Corn, and Black Olives.',
    base: 'Cheese Burst',
    sauce: 'Smoky BBQ',
    cheese: ['Mozzarella'],
    vegetables: ['Jalapeños', 'Sweet Corn', 'Black Olives'],
    price: 285,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    tag: 'Spicy Hot'
  },
  {
    id: 'sig-5',
    name: 'Double Cheese Margherita',
    description: 'Double Mozzarella cheese with Classic Tomato sauce on a Cheese Burst base.',
    base: 'Cheese Burst',
    sauce: 'Classic Tomato',
    cheese: ['Mozzarella', 'Cheddar'],
    vegetables: [],
    price: 260,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    tag: 'Classic'
  },
  {
    id: 'sig-6',
    name: 'Chicken Tikka Delight',
    description: 'Spicy Marinara sauce, Mozzarella, Cheddar, topped with Red Onions, Jalapeños, and spiced grilled chicken chunks.',
    base: 'Pan Crust',
    sauce: 'Spicy Marinara',
    cheese: ['Mozzarella', 'Cheddar'],
    vegetables: ['Red Onions', 'Jalapeños'],
    price: 295,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    tag: 'Bestseller'
  },
  {
    id: 'sig-7',
    name: 'Pepperoni Passion',
    description: 'Thin Crust, Classic Tomato sauce, loaded with double Mozzarella cheese and crispy pepperoni slices.',
    base: 'Thin Crust',
    sauce: 'Classic Tomato',
    cheese: ['Mozzarella', 'Parmesan'],
    vegetables: ['Black Olives'],
    price: 320,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    tag: 'Classic'
  },
  {
    id: 'sig-8',
    name: 'BBQ Chicken Supreme',
    description: 'Stuffed Crust, Smoky BBQ sauce, Mozzarella, Cheddar, topped with Red Onions, Bell Peppers, and BBQ chicken.',
    base: 'Stuffed Crust',
    sauce: 'Smoky BBQ',
    cheese: ['Mozzarella', 'Cheddar'],
    vegetables: ['Red Onions', 'Bell Peppers'],
    price: 340,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    tag: 'Gourmet'
  },
  {
    id: 'sig-9',
    name: 'Italian Garlic Meatball',
    description: 'Pan Crust with Creamy Garlic Alfredo sauce, Mozzarella, Parmesan, topped with roasted Mushrooms and meatballs.',
    base: 'Pan Crust',
    sauce: 'Creamy Garlic Alfredo',
    cheese: ['Mozzarella', 'Parmesan'],
    vegetables: ['Mushrooms', 'Black Olives'],
    price: 310,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    tag: 'Gourmet'
  },
  {
    id: 'sig-10',
    name: 'Fiery Chicken Inferno',
    description: 'Cheese Burst base, Spicy Marinara sauce, Mozzarella, packed with Jalapeños, Sweet Corn, and spicy shredded chicken.',
    base: 'Cheese Burst',
    sauce: 'Spicy Marinara',
    cheese: ['Mozzarella'],
    vegetables: ['Jalapeños', 'Sweet Corn'],
    price: 335,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    tag: 'Spicy Hot'
  },
  {
    id: 'sig-11',
    name: 'Basil Pesto Fiesta',
    description: 'Thin Crust coated with aromatic Basil Pesto sauce, Mozzarella, Cheddar, fresh Bell Peppers, and Sweet Corn.',
    base: 'Thin Crust',
    sauce: 'Basil Pesto',
    cheese: ['Mozzarella', 'Cheddar'],
    vegetables: ['Bell Peppers', 'Sweet Corn'],
    price: 265,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    tag: 'Gourmet'
  },
  {
    id: 'sig-12',
    name: 'Smoky BBQ Meat-Overload',
    description: 'Stuffed Crust topped with Smoky BBQ sauce, Mozzarella, Cheddar, loaded with seasoned meatballs, pepperoni, and onions.',
    base: 'Stuffed Crust',
    sauce: 'Smoky BBQ',
    cheese: ['Mozzarella', 'Cheddar'],
    vegetables: ['Red Onions', 'Jalapeños'],
    price: 350,
    image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
    tag: 'Bestseller'
  }
];

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'classic', 'gourmet', 'bestseller'
  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'non-veg'

  const handleCustomize = (pizza) => {
    // Navigate to builder, pre-filling options in state/query parameters
    navigate('/builder', {
      state: {
        preset: {
          name: pizza.name,
          base: pizza.base,
          sauce: pizza.sauce,
          cheese: pizza.cheese,
          vegetables: pizza.vegetables
        }
      }
    });
  };

  const handleQuickOrder = (pizza) => {
    // Navigate straight to Checkout summary with this pizza item pre-selected
    const checkoutItem = {
      name: pizza.name,
      base: pizza.base,
      sauce: pizza.sauce,
      cheese: pizza.cheese,
      vegetables: pizza.vegetables,
      quantity: 1,
      price: pizza.price
    };
    navigate('/checkout', { state: { items: [checkoutItem] } });
  };

  const filteredPizzas = signaturePizzas.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterType === 'all' || p.tag.toLowerCase() === filterType.toLowerCase();
    const matchesVeg = vegFilter === 'all' || 
                       (vegFilter === 'veg' && p.isVeg) || 
                       (vegFilter === 'non-veg' && !p.isVeg);
    
    return matchesSearch && matchesTag && matchesVeg;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      
      {/* 1. Header Welcome & Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Welcome Card */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl shadow-glass border border-white/40 dark:border-white/5 bg-gradient-to-br from-white/70 to-rose-50/10 dark:from-slate-900/70 dark:to-slate-900/10 flex flex-col justify-between">
          <div>
            <span className="text-sm font-extrabold text-brand tracking-widest uppercase mb-2 block">
              Dashboard Console
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}! 🍕
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 font-semibold leading-relaxed max-w-xl">
              Ready to command your own custom pizza build or grab one of our chef's hand-crafted signature recipes? Use our dynamic flight deck to design the perfect pie.
            </p>
          </div>
          <div className="mt-8 flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/builder')}
              className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-200 active:scale-95 hover:shadow-premium-hover"
            >
              Launch Pizza Builder <FiArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl transition-all"
            >
              Track Active Orders
            </button>
          </div>
        </div>

        {/* Promo Banner Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-glass border border-rose-200/50 dark:border-rose-950/50 bg-gradient-to-br from-rose-500 to-rose-600 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative design */}
          <div className="absolute right-[-40px] top-[-45px] text-[120px] opacity-15 select-none animate-spin-slow">🍕</div>
          
          <div>
            <div className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full w-max tracking-wider mb-3">
              Pilot's Offer
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Get 20% Off Custom Pizzas
            </h2>
            <p className="text-rose-100 text-xs mt-2 font-semibold leading-relaxed">
              Design a pizza with 3 or more veggie toppings and automatically save 20% on checkout! No coupon code needed.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate('/builder')}
              className="px-4 py-2 bg-white text-brand hover:bg-rose-50 text-xs font-extrabold rounded-lg shadow-sm transition-all"
            >
              Customize Now
            </button>
          </div>
        </div>
      </div>

      {/* 2. Menu Catalog with filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Hand-Crafted Signature Pizzas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-semibold">
              Select one to checkout immediately or customize ingredients on the board
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search recipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-slate-800 dark:text-white"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex bg-slate-100/70 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {['all', 'classic', 'gourmet', 'bestseller'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterType(tag)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterType === tag
                      ? 'bg-white dark:bg-slate-800 text-brand shadow-sm'
                      : 'hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Veg/Non-Veg category filter */}
            <div className="flex bg-slate-100/70 dark:bg-slate-900/70 p-1 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {[
                { id: 'all', name: 'All' },
                { id: 'veg', name: 'Veg Only' },
                { id: 'non-veg', name: 'Non-Veg' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setVegFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    vegFilter === cat.id
                      ? 'bg-white dark:bg-slate-800 text-brand shadow-sm'
                      : 'hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Catalog Grid */}
        {filteredPizzas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPizzas.map((pizza) => (
              <div
                key={pizza.id}
                className="group glass-panel rounded-3xl overflow-hidden shadow-glass border border-white/40 dark:border-white/5 hover:border-brand/35 hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-200">
                    <img
                      src={pizza.image}
                      alt={pizza.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-brand/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                      {pizza.tag}
                    </div>
                    {pizza.isVeg ? (
                      <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        VEG
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-rose-600/90 backdrop-blur-md text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        NON-VEG
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-white group-hover:text-brand transition-colors">
                        {pizza.name}
                      </h3>
                      <span className="font-extrabold text-brand text-base">
                        ₹{pizza.price}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed line-clamp-3">
                      {pizza.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCustomize(pizza)}
                    className="py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand/40 hover:text-brand dark:hover:text-brand text-xs font-bold rounded-xl transition-all"
                  >
                    Customize
                  </button>
                  <button
                    onClick={() => handleQuickOrder(pizza)}
                    className="py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Quick Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl border border-slate-200/30 dark:border-slate-800/30">
            <span className="text-5xl inline-block mb-3">🔍</span>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
              No matching recipes found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
              Try adjusting your filters or search keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
