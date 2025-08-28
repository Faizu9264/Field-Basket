"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import PlacesAutocomplete from "react-places-autocomplete";
import { useCartStore, CartItem as CartItemType } from "../../store/cartStore";
import CartItem from "../../components/CartItem";
import Footer from "../../components/Footer";
import Link from "next/link";
import { useIsMobile } from "../../hooks/useIsMobile";

// Shop location (updated)
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

export default function CartPage() {
	const cart = useCartStore((state) => state.cart);
	const addToCart = useCartStore((state) => state.addToCart);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeFromCart = useCartStore((state) => state.removeFromCart);
	const isMobile = useIsMobile();
	const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
	const [manualAddress, setManualAddress] = useState("");
	const [houseNumber, setHouseNumber] = useState("");
	const [locationError, setLocationError] = useState("");
	const [deliveryAllowed, setDeliveryAllowed] = useState(true);
	const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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
					setDeliveryAllowed(dist <= 15);
					// Reverse geocode using OpenStreetMap Nominatim
					try {
						const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
						const data = await response.json();
						if (data && data.display_name) {
							setManualAddress(data.display_name);
						}
					} catch (err) {
						// fallback: just show coordinates
						setManualAddress(`${latitude}, ${longitude}`);
					}
				},
				() => {
					setLocationError("Unable to retrieve your location.");
				}
			);
		};

	const handleRemove = (item: CartItemType) => {
		if (item.quantity <= 1) {
			removeFromCart(item.product.id);
		} else {
			updateQuantity(item.product.id, item.quantity - 1);
		}
	};

	const handleCheckout = () => {
		if (cart.length === 0) return;
		if (!deliveryAllowed) return;
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
					`- ${item.product.name} (${item.quantity}${item.product.unit}) - د.إ${
						item.product.price * item.quantity
					}`
			)
			.join("%0A");
		let locationMsg = "";
		if (userLocation) {
			locationMsg = `%0ALocation: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
		} else if (manualAddress) {
			locationMsg = `%0AAddress: ${manualAddress}`;
		} else {
			locationMsg = `%0AAddress: Shop Pickup`;
		}
					const distanceStr = userLocation ? `*Distance from shop:* ${getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng).toFixed(1)} km%0A` : "";
					const message =
						`🛒 *New Order from Field Basket*%0A%0A` +
						`*Order Details:*%0A${orderLines}%0A` +
						`-----------------------------%0A` +
						`*Total:* د.إ${total}%0A` +
						`%0A*House/Flat No.:* ${houseNumber}%0A` +
						`%0A*Delivery Location:* ${manualAddress || "-"}%0A` +
						distanceStr +
						`%0AThank you!`;
		const phone = "+916282821603";
		const waLink = `https://wa.me/${phone}?text=${message}`;
		window.open(waLink, "_blank");
	};

			return (
				<div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-lime-100 via-green-50 to-yellow-100 px-2 pb-8">
					<Toaster position="top-center" />
					{/* Minimal header for cart */}
				{/* No top-level cart header, only inside cart section */}
				<div className={
					isMobile
						? "w-full max-w-xl bg-white/95 rounded-3xl shadow-2xl p-8 mt-12 text-gray-900 flex flex-col relative"
						: "w-full max-w-4xl bg-white/95 rounded-3xl shadow-2xl p-8 mt-12 text-gray-900 flex flex-row gap-8 relative"
				} style={{ minHeight: 400 }}>
				{/* Left: Delivery Location */}
				<div className={isMobile ? "mb-6" : "w-1/2 mb-0"}>
					<label className="block font-semibold mb-1 text-green-900">House Number <span className="text-red-500">*</span></label>
					<input
						type="text"
						className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
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
									onSelect={async address => {
										setManualAddress(address);
										// Geocode the address to get coordinates
										try {
											const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
											const data = await response.json();
											if (data.status === "OK" && data.results && data.results[0]) {
												const { lat, lng } = data.results[0].geometry.location;
												setUserLocation({ lat, lng });
												const dist = getDistanceFromLatLonInKm(lat, lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng);
												setDeliveryAllowed(dist <= 15);
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
								}}
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
													{deliveryAllowed ? (
														<>
															Delivery available to this location!
															<span className="block text-xs text-gray-700 font-normal mt-1">
																Distance from shop: {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng).toFixed(1)} km
															</span>
														</>
													) : (
														<>
															Sorry, delivery is only available within 15km of our shop. Please visit our store to pick up your order.
															<span className="block text-xs text-gray-700 font-normal mt-1">
																Distance from shop: {getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, SHOP_LOCATION.lat, SHOP_LOCATION.lng).toFixed(1)} km
															</span>
														</>
													)}
												</div>
											)}
								{locationError && (
									<div className="text-red-600 text-sm mt-1 font-bold">{locationError}</div>
								)}
					{/* Shop Location Map */}
					<div className="mt-4">
						<span className="font-semibold text-green-700">Shop Location:</span>
						<div className="rounded-xl overflow-hidden mt-2 border shadow">
							<iframe
								title="Shop Location"
								width="100%"
								height="200"
								style={{ border: 0 }}
								loading="lazy"
								allowFullScreen
								referrerPolicy="no-referrer-when-downgrade"
								src={`https://www.google.com/maps?q=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}&z=15&output=embed`}
							></iframe>
						</div>
					</div>
				</div>
				{/* Right: Cart Items */}
				<div className={isMobile ? "" : "w-1/2"}>
								<div className="flex items-center justify-between mb-6">
									<h1 className="text-3xl font-extrabold text-green-700 flex items-center gap-2">
										<span role="img" aria-label="cart">🛒</span> Your Cart
									</h1>
									<Link href="/">
										<button
											className="ml-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition"
										>
											&larr; Back to Shop
										</button>
									</Link>
								</div>
					{cart.length === 0 ? (
						<div className="text-center text-gray-500 py-16">Your cart is empty.</div>
					) : (
						<>
							<div
								className={
									isMobile
										? "space-y-4 pb-4 overflow-y-auto max-h-[calc(100vh-260px)]"
										: "space-y-4 pb-4 overflow-y-auto max-h-[400px]"
								}
								style={
									isMobile
										? { maxHeight: 'calc(100vh - 260px)' }
										: { maxHeight: 300 }
								}
							>
								{cart.map((item) => (
									<CartItem
										key={item.product.id}
										name={item.product.name}
										price={item.product.price}
										unit={item.product.unit}
										quantity={item.quantity}
										onRemove={() => handleRemove(item)}
										onAdd={() => addToCart(item.product)}
									/>
								))}
																								<div className="flex justify-between font-bold text-lg mt-4 border-t pt-4">
																									<span>Total:</span>
																									<span className="text-green-700">
																										<span style={{ fontFamily: 'UAEDirham', fontSize: '1.1em', verticalAlign: 'middle' }}>&#x00EA;</span> {total}
																									</span>
																								</div>
							</div>
						</>
					)}
					{/* Place Order button (always outside the scrollable area) */}
					{cart.length > 0 && (
						isMobile ? (
							<div className="fixed left-0 right-0 bottom-0 z-50 px-4 pb-4">
								<button
									className="w-full bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition"
									onClick={handleCheckout}
									disabled={!deliveryAllowed || !houseNumber.trim()}
								>
									Place Order
								</button>
							</div>
						) : (
							<div className="mt-4">
								<button
									className="w-full bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition"
									onClick={handleCheckout}
									disabled={!deliveryAllowed}
								>
									Place Order
								</button>
							</div>
						)
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
}
