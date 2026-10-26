const readlineSync = require("readline-sync");

const dishes = [
  {
    id: 1,
    name: "Ayam Pop",
    price: 10000,
  },
  {
    id: 2,
    name: "Rendang",
    price: 15000,
  },
  {
    id: 3,
    name: "Ikan Nila Bakar",
    price: 13000,
  },
  {
    id: 4,
    name: "Ikan Cue Goreng",
    price: 3000,
  },
  {
    id: 5,
    name: "Nasi Putih",
    price: 7000,
  },
  {
    id: 6,
    name: "Paket Komplit Ayam Goreng Kecombrang",
    price: 21500,
  },
  {
    id: 7,
    name: "Ayam Kecap",
    price: 25500,
  },
  {
    id: 8,
    name: "Nasi Telur Minang",
    price: 15500,
  },
  {
    id: 9,
    name: "Dendeng Cabe Ijo/Cabe Merah",
    price: 30000,
  },
  {
    id: 10,
    name: "Jus Timun Nanas",
    price: 24400,
  },
];

const MAX_QTY = 99;

let cart = {
  customer: {
    name: "",
  },
  items: [],
};

let isExit = false;

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function rupiah(price) {
  return rupiahFormatter.format(price);
}

const findDish = (foodID) => dishes.find(({ id: dishId }) => dishId === foodID);

function askDish() {
  while (true) {
    const chosenFood = readlineSync.questionInt(
      "Please choose food you wish to enjoy (or 0 to cancel): ",
    );
    if (chosenFood === 0) return null;

    const dish = findDish(chosenFood);
    if (dish) return dish;

    console.log(
      `Invalid choice: menu ${chosenFood} is not available. Please choose between 1 and ${dishes.length}, or 0 to cancel.`,
    );
  }
}

function askQty() {
  while (true) {
    const qty = readlineSync.questionInt(
      `How many do you want? (1-${MAX_QTY}): `,
    );
    if (qty >= 1 && qty <= MAX_QTY) return qty;
    console.log(`Invalid quantity. Quantity must be between 1 and ${MAX_QTY}.`);
  }
}

function addToCart(dish, qty) {
  const { id: targetId } = dish;
  const existingItem = cart.items.find(
    ({ dish: { id: itemDishId } }) => itemDishId === targetId,
  );

  if (existingItem) {
    existingItem.qty = Math.min(existingItem.qty + qty, MAX_QTY);
  } else {
    cart.items.push({ dish, qty });
  }
}

function generateFoodMenu(foods) {
  let menus = "\n================== MENU DISHES ==================\n";
  for (const { id: foodId, name: foodName, price: foodPrice } of foods) {
    menus += `${String(foodId).padEnd(4)} ${foodName.padEnd(40)} ${rupiah(foodPrice).padStart(14)}\n`;
  }
  menus += "=================================================\n";
  menus += "0.   Back to Main Menu\n";
  console.log(menus);
}

function orderDishes() {
  generateFoodMenu(dishes);
  const dish = askDish();
  if (!dish) {
    console.log("\nOrder cancelled. Returning to main menu.");
    return;
  }

  const qty = askQty();
  addToCart(dish, qty);

  const { name: dishName } = dish;
  console.log(`\nSuccessfully added: ${dishName} (x${qty}) to cart.`);

  if (readlineSync.keyInYNStrict("Do you want to checkout now?")) {
    checkout();
  }
}

const generateMainMenu = function () {
  console.log(`
================ TABURAI RESTAURANT ================
  1. Dishes
  2. Checkout
  3. Exit
  4. Customers
====================================================
`);
};

const checkout = () => {
  if (cart.items.length === 0) {
    console.log("\nYou haven't ordered yet. Please order something first.");
    return;
  }

  let customerName = readlineSync.question("Whose order is this? ").trim();
  while (!customerName) {
    console.log("Customer name cannot be empty. Please enter your name.");
    customerName = readlineSync.question("Whose order is this? ").trim();
  }

  generateCartItem(customerName);
};

const generateCartItem = (customerName) => {
  cart = {
    ...cart,
    customer: { name: customerName },
  };

  const {
    customer: { name: buyerName },
    items: cartItems,
  } = cart;

  let receipt = "\n==================== RECEIPT ====================\n";
  let total = 0;

  for (const [
    index,
    {
      dish: { name: dishName, price: unitPrice },
      qty: orderQty,
    },
  ] of cartItems.entries()) {
    const subTotal = orderQty * unitPrice;

    const indexStr = `${index + 1}.`.padEnd(4);
    const nameStr = dishName.padEnd(25);
    const qtyStr = `(x${orderQty})`.padEnd(8);
    const priceStr = rupiah(unitPrice).padStart(12);
    const totalStr = rupiah(subTotal).padStart(14);

    receipt += `${indexStr}${nameStr}${qtyStr}${priceStr}${totalStr}\n`;
    total += subTotal;
  }

  receipt += "=================================================\n";
  receipt += `Total Price: ${rupiah(total).padStart(36)}\n`;
  receipt += "=================================================\n";
  receipt += `Thank you for ordering here, ${buyerName}! See you on your next visit!\n`;

  console.log(receipt);
  isExit = true;
};

const getListCustomer = async () => {
  const url = "https://jsonplaceholder.typicode.com/users";

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    const data = await res.json();

    console.log("\n================ CUSTOMER DIRECTORY ================\n");
    data.forEach(
      ({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: { city: customerCity } = {},
        company: { name: companyName } = {},
      }) => {
        console.log(`Name    : ${customerName}`);
        console.log(`Email   : ${customerEmail}`);
        console.log(`Phone   : ${customerPhone}`);
        console.log(`City    : ${customerCity}`);
        console.log(`Company : ${companyName}`);
        console.log("----------------------------------------------------");
      },
    );
  } catch (error) {
    console.log(`Failed to load customers: ${error.message}`);
  }

  readlineSync.question("\nPress Enter to return to the main menu...");
};

async function menuHub(menu) {
  switch (menu) {
    case 1:
      orderDishes();
      break;
    case 2:
      checkout();
      break;
    case 3:
      console.log("\nThank you for visiting Taburai! Goodbye.");
      isExit = true;
      break;
    case 4:
      await getListCustomer();
      break;
    default:
      console.log(
        `\nInvalid choice "${menu}". Please choose a menu from 1 to 4.`,
      );
  }
}

const mainApp = async () => {
  while (!isExit) {
    generateMainMenu();
    const chosenMenu = readlineSync.questionInt("Please choose a menu: ");
    await menuHub(chosenMenu);
  }
};

mainApp();
