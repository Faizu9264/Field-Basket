
export interface Fruit {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  description: string;
}

export const fruits: Fruit[] = [
  {
    id: "apple",
    name: "Apple",
    image: "/fruits/apple.jpg",
    price: 100,
    unit: "kg",
    description: "Fresh and juicy apples."
  },
  {
    id: "banana",
    name: "Banana",
    image: "/fruits/banana.jpg",
    price: 60,
    unit: "dozen",
    description: "Sweet ripe bananas."
  },
  {
    id: "orange",
    name: "Orange",
    image: "/fruits/orange.jpg",
    price: 80,
    unit: "kg",
    description: "Citrus oranges full of vitamin C."
  },
  {
    id: "grapes",
    name: "Grapes",
    image: "/fruits/grapes.jpg",
    price: 120,
    unit: "kg",
    description: "Sweet and seedless grapes."
  },
  {
    id: "mango",
    name: "Mango",
    image: "/fruits/mango.jpg",
    price: 150,
    unit: "kg",
    description: "King of fruits, juicy mangoes."
  },
  {
    id: "watermelon",
    name: "Watermelon",
    image: "/fruits/watermelon.jpg",
    price: 40,
    unit: "kg",
    description: "Refreshing and hydrating watermelon."
  },
  {
    id: "pineapple",
    name: "Pineapple",
    image: "/fruits/pineapple.jpg",
    price: 90,
    unit: "piece",
    description: "Tropical and tangy pineapple."
  }
];
