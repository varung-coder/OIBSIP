import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiArrowRight, FiArrowLeft, FiCheck, FiInfo } from 'react-icons/fi';

const PizzaBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Customizer Selections State
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedSauce, setSelectedSauce] = useState('');
  const [selectedCheese, setSelectedCheese] = useState([]);
  const [selectedVeg, setSelectedVeg] = useState([]);
  const [pizzaQuantity, setPizzaQuantity] = useState(1);

  // Customizer Step: 0 (Base), 1 (Sauce), 2 (Cheese), 3 (Veggies)
  const [step, setStep] = useState(0);

  // Fetch active inventory levels on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/inventory');
        if (res.data.success) {
          setInventory(res.data.items);
          
          // Check if there is a redirect preset from the dashboard
          const preset = location.state?.preset;
          if (preset) {
            setSelectedBase(preset.base);
            setSelectedSauce(preset.sauce);
            setSelectedCheese(preset.cheese || []);
            setSelectedVeg(preset.vegetables || []);
          } else {
            // Set defaults to first available in-stock items
            const bases = res.data.items.filter(i => i.category === 'base' && i.quantity > 0);
            const sauces = res.data.items.filter(i => i.category === 'sauce' && i.quantity > 0);
            if (bases.length > 0) setSelectedBase(bases[0].name);
            if (sauces.length > 0) setSelectedSauce(sauces[0].name);
          }
        }
      } catch (error) {
        console.error('Failed to retrieve inventory:', error);
        toast('Failed to load ingredients. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [location.state, toast]);

  // Group inventory items
  const bases = inventory.filter((item) => item.category === 'base');
  const sauces = inventory.filter((item) => item.category === 'sauce');
  const cheeses = inventory.filter((item) => item.category === 'cheese');
  const vegetables = inventory.filter((item) => item.category === 'vegetable');

  // Find price of selected ingredients
  const getIngredientPrice = (name) => {
    const item = inventory.find((i) => i.name === name);
    return item ? item.price : 0;
  };

  // Check if ingredient is out of stock
  const isOutOfStock = (name) => {
    const item = inventory.find((i) => i.name === name);
    return item ? item.quantity <= 0 : true;
  };

  // Calculate live dynamic price
  const calculateSinglePizzaPrice = () => {
    let total = 0;
    total += getIngredientPrice(selectedBase);
    total += getIngredientPrice(selectedSauce);
    selectedCheese.forEach((ch) => {
      total += getIngredientPrice(ch);
    });
    selectedVeg.forEach((veg) => {
      total += getIngredientPrice(veg);
    });
    return total;
  };

  const singlePizzaPrice = calculateSinglePizzaPrice();
  const totalPrice = singlePizzaPrice * pizzaQuantity;

  // Toggle cheese selection
  const handleCheeseToggle = (name) => {
    if (isOutOfStock(name)) {
      toast(`"${name}" is out of stock!`, 'warning');
      return;
    }
    setSelectedCheese((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  // Toggle veg selection
  const handleVegToggle = (name) => {
    if (isOutOfStock(name)) {
      toast(`"${name}" is out of stock!`, 'warning');
      return;
    }
    setSelectedVeg((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  // Render Sauce Color for Visual preview
  const getSauceColorClass = () => {
    switch (selectedSauce) {
      case 'Classic Tomato':
        return 'bg-rose-600/80';
      case 'Spicy Marinara':
        return 'bg-red-700/90';
      case 'Creamy Garlic Alfredo':
        return 'bg-yellow-50/90 border border-yellow-200/50';
      case 'Smoky BBQ':
        return 'bg-amber-900/85';
      case 'Basil Pesto':
        return 'bg-emerald-700/80';
      default:
        return 'bg-rose-500/10';
    }
  };

  // Handle Checkout submission
  const handlePlaceOrder = () => {
    if (!selectedBase) {
      toast('Please select a pizza base first.', 'error');
      setStep(0);
      return;
    }
    if (!selectedSauce) {
      toast('Please select a pizza sauce.', 'error');
      setStep(1);
      return;
    }

    const pizzaItem = {
      name: `Customized Pizza (${selectedBase})`,
      base: selectedBase,
      sauce: selectedSauce,
      cheese: selectedCheese,
      vegetables: selectedVeg,
      quantity: pizzaQuantity,
      price: singlePizzaPrice,
    };

    navigate('/checkout', { state: { items: [pizzaItem] } });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-500 dark:text-slate-400">Loading Pizza Customizer Workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Custom Pizza Design Deck 🍕
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Configure bases, sauces, and toppings. Visual components update dynamically below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: VISUAL PIZZA CANVAS */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 glass-panel rounded-3xl border border-white/40 dark:border-white/5 relative">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 select-none">
            Live Preview Canvas
          </div>

          {/* Pizza Structure Container */}
          <div className="relative w-72 h-72 rounded-full bg-amber-100/50 dark:bg-amber-950/20 border-4 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center shadow-inner select-none transition-all">
            {/* 1. Crust Layer */}
            {selectedBase && (
              <div className="absolute w-[260px] h-[260px] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md flex items-center justify-center transition-all duration-300 border-4 border-amber-300">
                
                {/* 2. Sauce Layer */}
                {selectedSauce && (
                  <div className={`absolute w-[220px] h-[220px] rounded-full transition-colors duration-500 shadow-inner flex items-center justify-center ${getSauceColorClass()}`}>
                    
                    {/* 3. Cheese Layers */}
                    {selectedCheese.length > 0 && (
                      <div className="absolute inset-0 flex flex-wrap justify-around items-center p-6 opacity-85">
                        {/* Render melted cheese effect using CSS circles */}
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-yellow-200/90 shadow-sm animate-pulse"
                            style={{
                              transform: `rotate(${idx * 30}deg) translate(${idx % 2 === 0 ? '10px' : '2px'})`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* 4. Vegetables scattered */}
                    {selectedVeg.length > 0 && (
                      <div className="absolute inset-0 p-4">
                        {selectedVeg.map((veg) => {
                          let color = 'bg-green-500';
                          if (veg === 'Red Onions') color = 'bg-purple-500';
                          if (veg === 'Mushrooms') color = 'bg-amber-100 border border-amber-300';
                          if (veg === 'Black Olives') color = 'bg-slate-900 border border-slate-700';
                          if (veg === 'Sweet Corn') color = 'bg-yellow-400';
                          if (veg === 'Jalapeños') color = 'bg-green-700';

                          return (
                            <div key={veg} className="absolute inset-0">
                              {/* Scatter Topping Elements */}
                              {Array.from({ length: 6 }).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-3.5 h-3.5 rounded-full absolute shadow-sm ${color}`}
                                  style={{
                                    top: `${20 + (idx * 25 + (idx % 2 === 0 ? 10 : 30)) % 65}%`,
                                    left: `${20 + (idx * 35 + (idx % 2 === 0 ? 25 : 5)) % 65}%`,
                                  }}
                                  title={veg}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details Summary below Canvas */}
          <div className="mt-8 w-full border-t border-slate-200/50 dark:border-slate-800/50 pt-5 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <span>Selected Base:</span>
              <span className="text-slate-800 dark:text-white">{selectedBase || 'None'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <span>Selected Sauce:</span>
              <span className="text-slate-800 dark:text-white">{selectedSauce || 'None'}</span>
            </div>
            <div className="flex justify-between items-start text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <span>Cheese Selection:</span>
              <span className="text-slate-800 dark:text-white text-right">
                {selectedCheese.length > 0 ? selectedCheese.join(', ') : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-start text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              <span>Vegetables Selection:</span>
              <span className="text-slate-800 dark:text-white text-right max-w-[200px]">
                {selectedVeg.length > 0 ? selectedVeg.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4-STEP CONTROLLER WIZARD */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step indicators */}
          <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200/20 dark:border-slate-800/20">
            {['Base', 'Sauce', 'Cheese', 'Veggies'].map((sName, idx) => (
              <button
                key={sName}
                onClick={() => setStep(idx)}
                className={`flex-grow py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  step === idx
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Step {idx + 1}: {sName}
              </button>
            ))}
          </div>

          {/* Active Step Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 space-y-6 min-h-[300px]">
            
            {/* STEP 1: PIZZA BASES */}
            {step === 0 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Choose Your Crust Base</h3>
                <p className="text-xs text-slate-500 font-semibold">Select exactly 1 base options below:</p>
                
                <div className="space-y-3">
                  {bases.map((base) => (
                    <div
                      key={base._id}
                      onClick={() => !isOutOfStock(base.name) && setSelectedBase(base.name)}
                      className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                        isOutOfStock(base.name)
                          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/20'
                          : selectedBase === base.name
                          ? 'border-brand bg-brand/5 dark:bg-brand/10'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedBase === base.name ? 'border-brand text-brand' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {selectedBase === base.name && <span className="w-2.5 h-2.5 bg-brand rounded-full" />}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{base.name}</span>
                          {isOutOfStock(base.name) && (
                            <span className="ml-2 text-[10px] font-extrabold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                              OUT OF STOCK
                            </span>
                          )}
                          {base.quantity > 0 && base.quantity < base.threshold && (
                            <span className="ml-2 text-[10px] font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                              LOW STOCK ({base.quantity} left)
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-brand">₹{base.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: SAUCES */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Choose Your Base Sauce</h3>
                <p className="text-xs text-slate-500 font-semibold">Select exactly 1 sauce option:</p>

                <div className="space-y-3">
                  {sauces.map((sauce) => (
                    <div
                      key={sauce._id}
                      onClick={() => !isOutOfStock(sauce.name) && setSelectedSauce(sauce.name)}
                      className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                        isOutOfStock(sauce.name)
                          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/20'
                          : selectedSauce === sauce.name
                          ? 'border-brand bg-brand/5 dark:bg-brand/10'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedSauce === sauce.name ? 'border-brand text-brand' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {selectedSauce === sauce.name && <span className="w-2.5 h-2.5 bg-brand rounded-full" />}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{sauce.name}</span>
                          {isOutOfStock(sauce.name) && (
                            <span className="ml-2 text-[10px] font-extrabold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                              OUT OF STOCK
                            </span>
                          )}
                          {sauce.quantity > 0 && sauce.quantity < sauce.threshold && (
                            <span className="ml-2 text-[10px] font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                              LOW STOCK ({sauce.quantity} left)
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-brand">₹{sauce.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: CHEESES */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Add Cheese Fillings</h3>
                <p className="text-xs text-slate-500 font-semibold">Select multiple options to enhance your pizza:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cheeses.map((ch) => {
                    const isSelected = selectedCheese.includes(ch.name);
                    return (
                      <div
                        key={ch._id}
                        onClick={() => handleCheeseToggle(ch.name)}
                        className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                          isOutOfStock(ch.name)
                            ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/20'
                            : isSelected
                            ? 'border-brand bg-brand/5 dark:bg-brand/10'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-brand border-brand text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{ch.name}</span>
                            {isOutOfStock(ch.name) && (
                              <span className="ml-1.5 text-[9px] font-extrabold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                                OUT
                              </span>
                            )}
                            {ch.quantity > 0 && ch.quantity < ch.threshold && (
                              <span className="ml-1.5 text-[9px] font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                                LOW
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-brand">₹{ch.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: VEGETABLES */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Add Vegetable Toppings</h3>
                <p className="text-xs text-slate-500 font-semibold">Select multiple options to build fresh flavors:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vegetables.map((veg) => {
                    const isSelected = selectedVeg.includes(veg.name);
                    return (
                      <div
                        key={veg._id}
                        onClick={() => handleVegToggle(veg.name)}
                        className={`flex justify-between items-center p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                          isOutOfStock(veg.name)
                            ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/20'
                            : isSelected
                            ? 'border-brand bg-brand/5 dark:bg-brand/10'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-brand border-brand text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{veg.name}</span>
                            {isOutOfStock(veg.name) && (
                              <span className="ml-1.5 text-[9px] font-extrabold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                                OUT
                              </span>
                            )}
                            {veg.quantity > 0 && veg.quantity < veg.threshold && (
                              <span className="ml-1.5 text-[9px] font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                                LOW
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-brand">₹{veg.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Stepper buttons & Total Price Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/20 dark:border-slate-800/20">
            
            {/* Quantity select & Total ticker */}
            <div className="flex items-center gap-5">
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <button
                  onClick={() => setPizzaQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-extrabold text-sm text-slate-800 dark:text-white">{pizzaQuantity}</span>
                <button
                  onClick={() => setPizzaQuantity(prev => prev + 1)}
                  className="px-3.5 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  +
                </button>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Checkout Price</span>
                <span className="text-2xl font-extrabold text-brand">₹{totalPrice}</span>
              </div>
            </div>

            {/* Stepper Wizard triggers */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-3 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs uppercase transition-all"
                >
                  <FiArrowLeft className="w-4 h-4" /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl text-xs uppercase transition-all shadow-md active:scale-95"
                >
                  Next Step <FiArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-tr from-brand to-rose-400 hover:from-brand-hover hover:to-rose-500 text-white font-extrabold rounded-xl text-xs uppercase transition-all shadow-md active:scale-95 animate-pulse"
                >
                  Configure Checkout <FiCheck className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PizzaBuilder;
