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

let cart = { items: [] };
let isExit = false;
let isMainMenu = true;

function rupiah(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(price);
}
function addToCart(chosenFood, qty) {
  cart.items.push({ id: chosenFood, qty: qty });
  var wantToCheckout = readlineSync.question("Do you want to checkout? (Y/N) ");
  switch (wantToCheckout) {
    case "Y":
      menuHub(2);
      break;
    case "N":
      menuHub(1);
      break;
    default:
      menuHub(1);
      break;
  }
}
function generateFoodMenu(foods, callback) {
  let i = 0;
  let menus = "";
  do {
    menus += `\n${foods[i].id.toString().padEnd(4)} ${foods[i].name.toString().padEnd(50)}${rupiah(foods[i].price.toString().padEnd(5))},-`;
    i++;
  } while (i < foods.length);

  console.log(menus);
  var chosenFood = readlineSync.questionInt(
    "Please choose food you wish to enjoy: ",
  );
  var qty = readlineSync.questionInt("How many do you want? ");
  callback(chosenFood, qty);
}
const generateMainMenu = function () {
  console.log(`
    Welcome to Taburai\n
    1. Dishes
    2. Checkout
    3. Exit
    4. Customers 
  `);
};
const prepareCheckout = (callback) => {
  if (typeof cart.items[0] === "object") {
    var name = readlineSync.question("Whose order is this? ");
    callback(name);
  } else {
    console.log("\nYou haven't ordered yet. Please order something first.");
    menuHub(1);
  }
};
const findDish = (foodID) => {
  let isFound = false;
  let i = 0;
  let food = {};
  while (!isFound) {
    if (foodID === dishes[i].id) {
      isFound = true;
      food = dishes[i];
    }
    i++;
  }
  return food;
};
const generateCartItem = (name) => {
  cart = { ...cart, name: name };
  let i = 0;
  let items = "\n\n";
  let total = 0;
  while (i <= cart.items.length - 1) {
    const item = cart.items[i];
    const food = findDish(item.id);
    const subTotal = cart.items[i].qty * food.price;

    const indexStr = `${i + 1}.`.padEnd(4);
    const nameStr = food.name.padEnd(20);
    const qtyStr = `(x${item.qty})`.padEnd(8);
    const priceStr = rupiah(food.price).padStart(12);
    const totalStr = rupiah(subTotal).padStart(14);

    items += `${indexStr}${nameStr}${qtyStr}${priceStr}${totalStr}\n`;
    total += subTotal;
    i++;
  }
  items += `\n\nTotal.....................................${rupiah(total)},-\n\n\n`;
  items += `Thank you for ordering here ${cart.name}, see your next visit!`;
  console.log(items);

  isExit = true;
};
const getListCustomer = async () => {
  const url = "https://jsonplaceholder.typicode.com/users";

  try {
    const res = await fetch(url);
    const data = await res.json();

    data.forEach((item) => {
      console.log(
        `Name:${item.name.padEnd(4)}\nEmail:${item.email.padEnd(4)}Phone:\n${item.phone}\n\n`,
      );
    });
  } catch (error) {
    console.log(error);
  }
};

async function menuHub(menu) {
  switch (menu) {
    case 4:
      isMainMenu = false;
      await getListCustomer();
      break;
    case 3:
      isExit = true;
      isMainMenu = false;
      break;
    case 2:
      isMainMenu = false;
      prepareCheckout(generateCartItem);
      break;
    case 1:
      generateFoodMenu(dishes, addToCart);
      isMainMenu = false;
      break;
    default:
      isMainMenu = true;
  }
}

const mainApp = async () => {
  while (!isExit) {
    if (isMainMenu) {
      generateMainMenu();
      var choosenMenu = readlineSync.questionInt("Please choose a menu:");
      await menuHub(choosenMenu);
    }
  }
};

mainApp();
