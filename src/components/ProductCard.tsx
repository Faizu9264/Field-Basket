
import React from 'react';
import Image from 'next/image';


interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  onAddToCart: () => void;
  onBuyNow?: () => void;
}


const ProductCard: React.FC<ProductCardProps> = ({ image, name, price, unit, description, onAddToCart, onBuyNow }) => (
  <div className="relative bg-white rounded-2xl shadow-2xl border border-lime-100 hover:border-green-300 p-0 flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-green-200 group overflow-hidden">
    {/* Decorative badge */}
    <span className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-lime-400 text-white text-xs font-bold px-3 py-1 rounded shadow-md z-10">Fresh</span>
    {/* Product Image */}
    <div className="w-full h-48 bg-gradient-to-br from-lime-50 via-yellow-50 to-green-100 flex items-center justify-center overflow-hidden">
      <Image src={image} alt={name} width={320} height={192} className="object-cover w-full h-full rounded-t-2xl" />
    </div>
    <div className="flex flex-col flex-1 px-5 pt-4 pb-6">
      <h2 className="text-xl font-extrabold mb-1 text-green-800 drop-shadow">{name}</h2>
      <p className="text-gray-600 mb-2 text-center min-h-[40px]">{description}</p>
      <div className="flex items-center justify-between mt-auto mb-3">
  <p className="text-green-700 font-bold text-lg">
    <span style={{ fontFamily: 'UAEDirham', fontSize: '1.15em', verticalAlign: 'middle' }}>&#x00EA;</span> {price}
    <span className="text-sm font-medium text-green-900">/ {unit}</span>
  </p>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={onAddToCart}
          className="w-1/2 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white py-2 rounded-xl font-bold text-base shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Add to Cart
        </button>
        <button
          onClick={onBuyNow}
          className="w-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white py-2 rounded-xl font-bold text-base shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          Buy Now
        </button>
      </div>
    </div>
  </div>
);

export default ProductCard;
