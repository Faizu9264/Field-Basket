"use client";


const SHOP_LOCATION = { lat: 23.619488, lng: 53.707794 };

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat)/2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon))/2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import CartItem from "../components/CartItem";
import PlacesAutocomplete from "react-places-autocomplete";
import { useIsMobile } from "../hooks/useIsMobile";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CartDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [locationError, setLocationError] = useState("");
  const [deliveryAllowed, setDeliveryAllowed] = useState(true);
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Delivery charge logic
  let deliveryDistance = 0;
  let deliveryCharge = 0;
  if (userLocation) {
    deliveryDistance = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng);
    if (deliveryDistance > 10) {
      deliveryCharge = Math.ceil(deliveryDistance - 10) * 2; // 2 AED per km over 10km
    }
  }
  const grandTotal = total + deliveryCharge;
  const isMobile = useIsMobile();

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationError("");
  const dist = getDistanceFromLatLonInKm(latitude, longitude, SHOP_LOCATION.lat, SHOP_LOCATION.lng);
  setDeliveryAllowed(dist <= 10);
        // Reverse geocode using OpenStreetMap Nominatim
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setManualAddress(data.display_name);
          } else {
            setManualAddress("");
            toast.error("Location found, but address unavailable. Please enter your address manually.", {
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
              },
              icon: '📍',
            });
          }
        } catch {
          setManualAddress("");
          toast.error("Location found, but address unavailable. Please enter your address manually.", {
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: '#b91c1c',
              border: '1px solid #fca5a5',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
            },
            icon: '📍',
          });
        }
      },
      () => {
        setLocationError("Unable to retrieve your location.");
      }
    );
  };

  // When user selects a location from autocomplete
  const handleSelectAddress = async (address: string) => {
    setManualAddress(address);
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.status === "OK" && data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setUserLocation({ lat, lng });
  const dist = getDistanceFromLatLonInKm(lat, lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng);
  setDeliveryAllowed(dist <= 10);
        setLocationError("");
      } else if (data.status === "ZERO_RESULTS") {
        setLocationError("Address not found. Please enter a more specific location.");
        setDeliveryAllowed(false);
      } else {
        setLocationError("Could not determine location for this address.");
        setDeliveryAllowed(false);
      }
    } catch {
      setLocationError("Error checking address location.");
      setDeliveryAllowed(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    if (!houseNumber.trim() && !manualAddress.trim()) {
      toast.error("Please enter both your house number and delivery location.", {
        duration: 3500,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#b91c1c',
          border: '1px solid #fca5a5',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
        },
        icon: '⚠️',
      });
      return;
    }
    if (!houseNumber.trim()) {
      toast.error("Please enter your house or flat number.", {
        duration: 3500,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#b91c1c',
          border: '1px solid #fca5a5',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
        },
        icon: '🏠',
      });
      return;
    }
    if (!manualAddress.trim()) {
      toast.error("Please enter your delivery location.", {
        duration: 3500,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#b91c1c',
          border: '1px solid #fca5a5',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
        },
        icon: '📍',
      });
      return;
    }
    const orderLines = cart
      .map(
        (item) =>
          `- ${item.product.name} (${item.quantity}${item.product.unit}) - AED ${
            item.product.price * item.quantity
          }`
      )
      .join("%0A");
    const distanceStr = userLocation ? `*Distance from shop:* ${getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng).toFixed(1)} km%0A` : "";
    const message =
  `🛒 *New Order from Field Basket*%0A%0A` +
  `*Order Details:*%0A${orderLines}%0A` +
  `-----------------------------%0A` +
  `*Total:* AED ${total}%0A` +
  (deliveryCharge > 0 ? `*Delivery Charge:* AED ${deliveryCharge}%0A` : "") +
  `*Grand Total:* AED ${grandTotal}%0A` +
  `%0A*House/Flat No.:* ${houseNumber}%0A` +
  `%0A*Delivery Location:* ${manualAddress || "-"}%0A` +
  distanceStr +
  `%0AThank you!`;
    const phone = "+916282821603"; // Replace with your WhatsApp number if needed
    const waLink = `https://wa.me/${phone}?text=${message}`;
    window.open(waLink, "_blank");
  };

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity"
        onClick={onClose}
        aria-label="Close cart overlay"
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md h-full bg-white shadow-2xl rounded-l-3xl flex flex-col p-6 animate-slide-in-right">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-green-700 flex items-center gap-2">
            <span role="img" aria-label="cart">🛒</span> Your Cart
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-green-600 text-2xl p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 flex-1 flex items-center justify-center">Your cart is empty.</div>
        ) : (
          <>
            {/* Delivery Location Selection (Mobile Only) */}
            {isMobile && (
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-green-900">House Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-900 placeholder-gray-700"
                  placeholder="Enter your house or flat number"
                  value={houseNumber}
                  onChange={e => setHouseNumber(e.target.value)}
                  required
                />
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Delivery Location:</span>
                  <button
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-sm font-bold flex items-center gap-1"
                    onClick={handleUseCurrentLocation}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                    Use Current Location
                  </button>
                </div>
                <PlacesAutocomplete
                  value={manualAddress}
                  onChange={setManualAddress}
                  onSelect={handleSelectAddress}
                  searchOptions={{ componentRestrictions: { country: ["in"] } }}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div className="relative w-full">
                      <input
                        {...getInputProps({
                          placeholder: "Enter delivery address or landmark",
                          className: "w-full border rounded px-3 py-2 mb-1 bg-white text-gray-900 placeholder-gray-700",
                        })}
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute left-0 min-w-full max-w-full z-50 bg-white rounded-b shadow-lg" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                          {loading && <div className="px-2 py-1 text-gray-500">Loading...</div>}
                          {suggestions.map(suggestion => (
                            <div
                              {...getSuggestionItemProps(suggestion, {
                                className: suggestion.active
                                  ? "bg-blue-100 cursor-pointer px-2 py-1"
                                  : "bg-white cursor-pointer px-2 py-1",
                              })}
                              key={suggestion.placeId}
                            >
                              {suggestion.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </PlacesAutocomplete>
                {userLocation && !locationError && (
                  <div className={deliveryAllowed ? "text-green-700 text-sm mt-1 font-bold" : "text-yellow-700 text-sm mt-1 font-bold"} style={{background: '#fff', borderRadius: 8, padding: '4px 8px'}}>
                    {deliveryAllowed ? (
                      <>
                        <span className="text-green-700 font-bold">Free Delivery available!</span>
                        <span className="block text-xs text-gray-700 font-normal mt-1">
                          Distance from shop: {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng).toFixed(1)} km
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-700 font-bold">Delivery is available, but a delivery charge applies for locations beyond 10km.</span>
                        <span className="block text-xs text-gray-700 font-normal mt-1">
                          Distance from shop: {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng).toFixed(1)} km
                        </span>
                      </>
                    )}
                  </div>
                )}
                {locationError && (
                  <div className="text-red-600 text-sm mt-1 font-bold" style={{background: '#fff', borderRadius: 8, padding: '4px 8px'}}>{locationError}</div>
                )}
              </div>
            )}
            <div className="space-y-4 flex-1 overflow-y-auto pb-4">
              {cart.map((item) => (
                <CartItem
                  key={item.product.id}
                  name={item.product.name}
                  price={item.product.price}
                  unit={item.product.unit}
                  quantity={item.quantity}
                  onRemove={() => {
                    if (item.quantity <= 1) {
                      removeFromCart(item.product.id);
                    } else {
                      updateQuantity(item.product.id, item.quantity - 1);
                    }
                  }}
                  onAdd={() => addToCart(item.product)}
                />
              ))}
              <div className="flex justify-between font-bold text-lg mt-4 border-t pt-4">
                <span>Total:</span>
                <span className="text-green-700">
                  <span style={{ fontFamily: 'UAEDirham', fontSize: '1.1em', verticalAlign: 'middle' }}>&#x00EA;</span> {total}
                </span>
              </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Delivery Charge:</span>
                  {deliveryCharge > 0 ? (
                    <span className="text-yellow-700"><span style={{ fontFamily: 'UAEDirham', fontSize: '1.1em', verticalAlign: 'middle' }}>&#x00EA;</span> {deliveryCharge}</span>
                  ) : (
                    <span className="text-green-700 font-bold">FREE</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Grand Total:</span>
                  <span className="text-green-900"><span style={{ fontFamily: 'UAEDirham', fontSize: '1.1em', verticalAlign: 'middle' }}>&#x00EA;</span> {grandTotal}</span>
                </div>
              {isMobile && (
                <>
                  <Toaster position="top-center" />
                  <button
                    className="w-full bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white py-3 rounded-xl mt-4 font-bold text-lg shadow-lg transition"
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
