import Footer from "../components/Footer";
import InstallPWAButton from "../components/InstallPWAButton";
import { Product } from "../store/cartStore";
import { connectToDatabase } from "../lib/mongo";
import { WithId } from "mongodb";
import HomeClient from "./HomeClient";

export default async function Home() {
  // Fetch first page of products server-side for fast initial load
  const db = await connectToDatabase();
  const limit = 3;
  const page = 1;
  const query = {};
  const total = await db.collection("products").countDocuments(query);
  const products = await db
    .collection("products")
    .find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
    console.log(products);
    
  type MongoProduct = WithId<{
    id?: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    description: string;
    type?: string;
  }>;
  const mappedProducts: Product[] = (products as MongoProduct[]).map((p) => ({
    id: p._id?.toString() || p.id || "",
    name: p.name,
    image: p.image,
    price: p.price,
    unit: p.unit,
    description: p.description,
    type: p.type,
  }));

  return (
    <>
  <HomeClient initialProducts={mappedProducts} initialTotal={total} initialLimit={limit} />
      <Footer />
      <InstallPWAButton />
    </>
  );
}

