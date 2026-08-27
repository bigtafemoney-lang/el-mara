import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const PRODUCTS: Record<
  string,
  {
    name: string;
    price: number;
    sizes: string[];
  }
> = {
  "01": {
    name: "EL MARA Polo",
    price: 35000,
    sizes: ["S", "M", "L", "XL"],
  },
  "02": {
    name: "EL MARA Shirt",
    price: 45000,
    sizes: ["S", "M", "L", "XL"],
  },
  "03": {
    name: "EL MARA Pants",
    price: 50000,
    sizes: ["S", "M", "L", "XL"],
  },
  "04": {
    name: "EL MARA Blazer",
    price: 85000,
    sizes: ["S", "M", "L", "XL"],
  },
  "05": {
    name: "EL MARA T-Shirt",
    price: 30000,
    sizes: ["S", "M", "L", "XL"],
  },
  "06": {
    name: "EL MARA Jacket",
    price: 95000,
    sizes: ["S", "M", "L", "XL"],
  },
  "07": {
    name: "EL MARA Shorts",
    price: 32000,
    sizes: ["S", "M", "L", "XL"],
  },
  "08": {
    name: "EL MARA Suit",
    price: 120000,
    sizes: ["S", "M", "L", "XL"],
  },
  "09": {
    name: "EL MARA Collection",
    price: 150000,
    sizes: ["S", "M", "L", "XL"],
  },
};

type IncomingCartItem = {
  productNumber?: unknown;
  size?: unknown;
  quantity?: unknown;
};

export async function POST(
  request: Request
) {
  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message:
            "Vous devez être connecté pour créer une commande.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const rawItems =
      body?.items;

    if (
      !Array.isArray(rawItems) ||
      rawItems.length === 0
    ) {
      return NextResponse.json(
        {
          error: "EMPTY_CART",
          message:
            "Le panier est vide.",
        },
        {
          status: 400,
        }
      );
    }

    if (rawItems.length > 100) {
      return NextResponse.json(
        {
          error: "TOO_MANY_ITEMS",
          message:
            "Le panier contient trop d'articles.",
        },
        {
          status: 400,
        }
      );
    }

    const validatedItems = [];

    for (const item of rawItems as IncomingCartItem[]) {
      const productNumber =
        typeof item.productNumber ===
        "string"
          ? item.productNumber
          : "";

      const size =
        typeof item.size === "string"
          ? item.size
          : "";

      const quantity =
        typeof item.quantity ===
        "number"
          ? item.quantity
          : Number(item.quantity);

      const product =
        PRODUCTS[productNumber];

      if (!product) {
        return NextResponse.json(
          {
            error: "INVALID_PRODUCT",
            message:
              `Produit invalide : ${productNumber}`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        !product.sizes.includes(
          size
        )
      ) {
        return NextResponse.json(
          {
            error: "INVALID_SIZE",
            message:
              `Taille invalide pour ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return NextResponse.json(
          {
            error: "INVALID_QUANTITY",
            message:
              `Quantité invalide pour ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      validatedItems.push({
        productNumber,
        name: product.name,
        size,
        quantity,
        unitPrice: product.price,
        subtotal:
          product.price *
          quantity,
      });
    }

    const totalAmount =
      validatedItems.reduce(
        (sum, item) =>
          sum + item.subtotal,
        0
      );

    const order =
      await prisma.order.create({
        data: {
          userId:
            session.user.id,
          status: "PENDING",
          totalAmount,
          currency: "AOA",
          items: {
            create:
              validatedItems.map(
                (item) => ({
                  productNumber:
                    item.productNumber,
                  name:
                    item.name,
                  size:
                    item.size,
                  quantity:
                    item.quantity,
                  unitPrice:
                    item.unitPrice,
                })
              ),
          },
        },
        include: {
          items: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE_ORDER_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message:
          "Impossible de créer la commande.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const session =
      await auth.api.getSession({
        headers: await headers(),
      });

    if (!session) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const orders =
      await prisma.order.findMany({
        where: {
          userId:
            session.user.id,
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      {
        success: true,
        orders,
      }
    );
  } catch (error) {
    console.error(
      "GET_ORDERS_ERROR",
      error
    );

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}