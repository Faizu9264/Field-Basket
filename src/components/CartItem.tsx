import React from 'react';

interface CartItemProps {
  name: string;
  price: number;
  unit: string;
  quantity: number;
  onRemove: () => void;
  onAdd: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ name, price, unit, quantity, onRemove, onAdd }) => (
  <div className="grid grid-cols-12 items-center gap-2 py-3 px-3 mb-2 bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="col-span-5 sm:col-span-6">
      <h3 className="font-semibold truncate">{name}</h3>
      <p className="text-xs text-gray-500">
        <span style={{ fontFamily: 'UAEDirham', fontSize: '1.05em', verticalAlign: 'middle' }}>&#x00EA;</span> {price} / {unit}
      </p>
    </div>
    <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-2">
      <button onClick={onRemove} className="bg-red-400 hover:bg-red-500 text-white w-7 h-7 rounded-full text-lg font-bold flex items-center justify-center">-</button>
      <span className="w-6 text-center font-semibold">{quantity}</span>
      <button onClick={onAdd} className="bg-green-400 hover:bg-green-500 text-white w-7 h-7 rounded-full text-lg font-bold flex items-center justify-center">+</button>
    </div>
  <div className="col-span-3 sm:col-span-3 text-right font-bold text-green-700 text-base">
    <span style={{ fontFamily: 'UAEDirham', fontSize: '1.1em', verticalAlign: 'middle' }}>&#x00EA;</span> {price * quantity}
  </div>
  </div>
);

export default CartItem;
