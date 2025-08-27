import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongo";
import { ObjectId } from "mongodb";

type ProductMongo = {
  _id: ObjectId;
  id?: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  description: string;
  type?: string;
};

export async function GET(req: Request) {
  const db = await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const search = searchParams.get("search") || "";

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await db.collection("products").countDocuments(query);
  const products = await db
    .collection("products")
    .find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  // Map _id to id for frontend compatibility
  const mappedProducts = products.map((product) => {
    const p = product as ProductMongo;
    return {
      ...p,
      id: p._id?.toString() || p.id,
    };
  });

  return NextResponse.json({
    products: mappedProducts,
    total,
    page,
    limit,
  });
}