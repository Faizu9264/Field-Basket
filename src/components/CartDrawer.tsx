"use client";

import React, { useState } from "react";
import CartItem from "../components/CartItem";
import PlacesAutocomplete from "react-places-autocomplete";
// Shop location (updated)
const SHOP_LOCATION = { lat: 10.953891716268787, lng: 76.3179751502432 };

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
import { useCartStore } from "../store/cartStore";
import { useIsMobile } from "../hooks/useIsMobile";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [locationError, setLocationError] = useState("");
  const [deliveryAllowed, setDeliveryAllowed] = useState(true);
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
          }
        } catch {
          setManualAddress(`${latitude}, ${longitude}`);
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
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isMobile = useIsMobile();

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const orderLines = cart
      .map(
        (item) =>
          `- ${item.product.name} (${item.quantity}${item.product.unit}) - ₹${
            item.product.price * item.quantity
          }`
      )
      .join("%0A");
    const message = `Hello, I want to order:%0A${orderLines}%0ATotal: ₹${total}`;
    const phone = "+916282821603"; // Replace with your WhatsApp number if needed
    const waLink = `https://wa.me/${phone}?text=${message}`;
    window.open(waLink, "_blank");
  };

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

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
                          className: "w-full border rounded px-3 py-2 mb-1",
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
                  <div className={deliveryAllowed ? "text-green-700 text-sm mt-1 font-bold" : "text-red-600 text-sm mt-1 font-bold"}>
                    {deliveryAllowed ? "Delivery available to this location!" : "Sorry, delivery is only available within 10km of our shop. Please visit our store to pick up your order."}
                  </div>
                )}
                {locationError && (
                  <div className="text-red-600 text-sm mt-1 font-bold">{locationError}</div>
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
                <span className="text-green-700">₹{total}</span>
              </div>
              {isMobile && (
                <button
                  className="w-full bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white py-3 rounded-xl mt-4 font-bold text-lg shadow-lg transition"
                  onClick={handlePlaceOrder}
                  disabled={!deliveryAllowed}
                >
                  Place Order
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
