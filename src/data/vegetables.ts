export interface Vegetable {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  description: string;
}

export const vegetables: Vegetable[] = [
  {
    id: "carrot",
    name: "Carrot",
    image: "/vegetables/carrot.jpg",
    price: 50,
    unit: "kg",
    description: "Crunchy and sweet carrots."
  },
  {
    id: "tomato",
    name: "Tomato",
    image: "/vegetables/tomato.jpg",
    price: 40,
    unit: "kg",
    description: "Fresh red tomatoes."
  },
  {
    id: "potato",
    name: "Potato",
    image: "/vegetables/potato.jpg",
    price: 30,
    unit: "kg",
    description: "Versatile and starchy potatoes."
  },
  {
    id: "cucumber",
    name: "Cucumber",
    image: "/vegetables/cucumber.jpg",
    price: 35,
    unit: "kg",
    description: "Cool and refreshing cucumbers."
  },
  {
    id: "capsicum",
    name: "Capsicum",
    image: "/vegetables/capsicum.jpg",
    price: 70,
    unit: "kg",
    description: "Colorful and crisp capsicums."
  }
];
