import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten Free' },
];

const NutritionModal = ({ nutrition, onClose }) => {
  // Add safety checks for when nutrition data is missing
  const nutritionData = nutrition || {};

  // Default values for nutrition properties
  const calories = nutritionData.calories || 0;
  const protein = nutritionData.protein || 0;
  const carbs = nutritionData.carbs || 0;
  const fat = nutritionData.fat || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Nutrition Information
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!nutrition ? (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nutrition information is not available for this item.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">
                  Calories
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {calories}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Protein
                </div>
                <div className="font-bold text-gray-800 dark:text-gray-200">
                  {protein}g
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Carbs
                </div>
                <div className="font-bold text-gray-800 dark:text-gray-200">
                  {carbs}g
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Fat
                </div>
                <div className="font-bold text-gray-800 dark:text-gray-200">
                  {fat}g
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          className="mt-6 w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded-lg transition-colors duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const OrderHistory = ({ orders }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-300 mb-4">
        Order History
      </h3>
      {orders.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map(order => (
            <li
              key={order._id}
              className="border-b border-gray-200 dark:border-gray-700 pb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {order.mealType} - {order.day}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.items.length} items
                  </p>
                </div>
                <span className="text-yellow-600 dark:text-yellow-300 font-medium">
                  ${order.totalPrice.toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CafeteriaMenu = () => {
  const { user } = useAuth(); // Get current user (user._id available)
  const [allMeals, setAllMeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  // Fetch meals from the backend API (GET /api/meals)
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        console.log('🔵 Initiating meal fetch request...');
        const token = localStorage.getItem('token');
        console.log(
          '🔑 Using token:',
          token ? 'Token exists' : 'No token found',
        );

        const response = await fetch('http://localhost:5000/api/menu', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('🔵 API Response status:', response.status);
        const data = await response.json();
        console.log('🔵 API Response data:', data);

        if (data.success) {
          console.log(
            '✅ Successfully loaded meals:',
            data.data.length,
            'items',
          );
          setAllMeals(data.data);
          setError(null);
        } else {
          console.error('❌ API returned error:', data.error);
          setError(data.error || 'Failed to load meals');
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError('Failed to connect to the server');
      }
    };

    if (user?._id) {
      console.log('👤 User authenticated, fetching meals...');
      fetchMeals();
    } else {
      console.log('⚠️ No authenticated user found');
    }
  }, [user]);

  // Add this reusable fetch orders function
  const fetchOrders = async () => {
    try {
      console.log('🔵 Fetching order history...');
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/orders/student/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('🔵 Order history response status:', response.status);
      const data = await response.json();
      console.log('🔵 Order history data:', data);

      if (data.success) {
        console.log(
          '✅ Successfully loaded orders:',
          data.data.length,
          'items',
        );
        setOrders(data.data); // Changed from data.orders to data.data
      } else {
        console.error('❌ Order history error:', data.error);
      }
    } catch (error) {
      console.error('❌ Order history fetch error:', error);
    }
  };

  // Update the useEffect to use the new fetchOrders function
  useEffect(() => {
    if (user?._id) {
      console.log('👤 User authenticated, fetching order history...');
      fetchOrders();
    }
  }, [user]);

  console.log('Current allMeals state:', allMeals);
  console.log('Selected category:', selectedCategory);
  console.log('Search query:', searchQuery);

  // Add error message display
  if (error) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  // Compute filtered meals based on selected category and search query
  const filteredMeals = allMeals.filter(meal => {
    console.log('Processing meal:', meal);
    const matchesCategory =
      selectedCategory === 'all' ||
      (meal.categories && meal.categories.includes(selectedCategory));
    const matchesSearch =
      meal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    console.log(
      'Meal matches - category:',
      matchesCategory,
      'search:',
      matchesSearch,
    );
    return matchesCategory && matchesSearch;
  });

  console.log('Filtered meals:', filteredMeals);

  // Add a meal to the cart and show notification
  const addToCart = meal => {
    const existingItem = cart.find(item => item.id === meal.id);
    if (existingItem) {
      setCart(
        cart.map(item =>
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...meal, quantity: 1 }]);
    }
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const removeFromCart = mealId => {
    setCart(cart.filter(item => item.id !== mealId));
  };

  const updateQuantity = (mealId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(
      cart.map(item =>
        item.id === mealId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Handle order submission
  const handleCheckout = async () => {
    try {
      console.log('🛒 Starting checkout process');
      const token = localStorage.getItem('token');

      // Format order data according to schema
      const orderData = {
        userId: user._id,
        studentName: user.name,
        mealType: 'lunch',
        day: new Date().toLocaleString('en-us', { weekday: 'long' }),
        items: cart.map(item => ({
          menuItem: item._id, // Use the menu item ID
          quantity: item.quantity,
        })),
        totalPrice: totalPrice * 1.08,
        pickupTime: '12:30',
      };

      console.log('📝 Final order data:', JSON.stringify(orderData, null, 2));

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Order placed successfully');
        setCart([]);
        setShowCart(false);
        await fetchOrders(); // Refresh order history
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        console.error('❌ Order submission failed:', data.error);
        setError(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setError(`Failed to process checkout: ${error.message}`);
    }
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="p-8 bg-yellow-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-4xl font-bold text-yellow-600 dark:text-yellow-300 mb-2">
              Today's Menu
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Welcome {user && user.name ? user.name : 'Guest'}, enjoy your
              meal!
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              className="relative bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300"
              onClick={() => setShowCart(!showCart)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
              </svg>
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Order History Section */}
          <div className="lg:col-span-1">
            <OrderHistory orders={orders} />
          </div>

          {/* Menu Section */}
          <div className="lg:col-span-3">
            {/* Search and Filter Section */}
            <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search meals..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-2 md:py-0">
                  <FiFilter className="text-yellow-600 dark:text-yellow-300" />
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                        selectedCategory === category.id
                          ? 'bg-yellow-500 dark:bg-yellow-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      } transition-colors duration-300`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Meal Cards Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredMeals.length > 0 ? (
                filteredMeals.map(meal => (
                  <motion.div
                    key={meal.id}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          meal.image?.url ||
                          meal.image ||
                          'https://via.placeholder.com/300?text=No+Image'
                        }
                        className="w-full h-full object-cover"
                        alt={meal.name}
                      />
                      <div className="absolute top-0 right-0 m-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {meal.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          {meal.name}
                        </h3>
                        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-300">
                          ${meal.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {meal.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {meal.categories &&
                          meal.categories.map(cat => {
                            const catObj = categories.find(c => c.id === cat);
                            return (
                              <span
                                key={cat}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                              >
                                {catObj ? catObj.name : cat}
                              </span>
                            );
                          })}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                          onClick={() => addToCart(meal)}
                        >
                          Pre-Order
                        </button>
                        <button
                          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors duration-300"
                          onClick={() => setSelectedMeal(meal)}
                        >
                          Nutrition
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 col-span-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No meals found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or search query.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Cart Notification */}
        {showNotification && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
            Item added to cart!
          </div>
        )}

        {/* Animated Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowCart(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-0 right-0 w-full md:w-96 h-full bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
              >
                {/* Existing cart content */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                      Your Order
                    </h3>
                    <button
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => setShowCart(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Add some delicious meals to get started.
                      </p>
                      <button
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                        onClick={() => setShowCart(false)}
                      >
                        Continue Browsing
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cart.map(item => (
                          <div
                            key={item.id}
                            className="flex border-b border-gray-200 dark:border-gray-700 pb-4"
                          >
                            <img
                              src={
                                item.image?.url ||
                                item.image ||
                                'https://via.placeholder.com/100?text=No+Image'
                              }
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="ml-4 flex-grow">
                              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                {item.name}
                              </h4>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center">
                                  <button
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                  >
                                    -
                                  </button>
                                  <span className="mx-2 w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-yellow-600 dark:text-yellow-300 font-medium mr-2">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                  <button
                                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Tax
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            ${(totalPrice * 0.08).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-gray-800 dark:text-gray-200">
                            Total
                          </span>
                          <span className="text-yellow-600 dark:text-yellow-300">
                            ${(totalPrice * 1.08).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-8">
                        <button
                          className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg text-lg font-medium transition-colors duration-300"
                          onClick={handleCheckout}
                        >
                          Checkout
                        </button>
                        <button
                          className="w-full mt-4 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                          onClick={() => setShowCart(false)}
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Nutrition Modal */}
        {selectedMeal && (
          <NutritionModal
            nutrition={selectedMeal.nutrition}
            onClose={() => setSelectedMeal(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CafeteriaMenu;
