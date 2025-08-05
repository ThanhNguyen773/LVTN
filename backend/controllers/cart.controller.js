// import Product from "../models/product.model.js";



// export const getCartProducts = async (req, res) => {
// 	try {
// 		const products = await Product.find({ _id: { $in: req.user.cartItems } });

// 		// add quantity for each product
// 		const cartItems = products.map((product) => {
// 			const item = req.user.cartItems.find((cartItem) => cartItem.product.toString() === product._id.toString());
// 			return { ...product.toJSON(), quantity: item.quantity };
// 		});

// 		res.json(cartItems);
// 	} catch (error) {
// 		console.log("Error in getCartProducts controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

// // export const addToCart = async (req, res) => {
// // 	try {
// // 		const { productId } = req.body;
		
// // 		const user = req.user;

// // 		const existingItem = user.cartItems.find((item) => item.id === productId);
// // 		if (existingItem) {
// // 			existingItem.quantity += 1;
// // 		} else {
// // 			user.cartItems.push(productId);
// // 		}

// // 		await user.save();
// // 		res.json(user.cartItems);
// // 	} catch (error) {
// // 		console.log("Error in addToCart controller", error.message);
// // 		res.status(500).json({ message: "Server error", error: error.message });
// // 	}
// // };

// export const addToCart = async (req, res) => {
//   try {
//     const { productId } = req.body;
//     const user = req.user;

//     const existingItem = user.cartItems.find((item) => 
//       item.product && item.product.toString() === productId
//     );

//     if (existingItem) {
//       existingItem.quantity += 1;
//     } else {
//       user.cartItems.push({ product: productId, quantity: 1 });
//     }

//     await user.save();
//     res.json(user.cartItems);
//   } catch (error) {
//     console.error("Error in addToCart controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// export const removeAllFromCart = async (req, res) => {
//   try {
//     const { productId } = req.body;
//     const user = req.user;

//     if (productId) {
//       user.cartItems = user.cartItems.filter(
//         (item) => item.product.toString() !== productId
//       );
//     } else {
//       user.cartItems = [];
//     }

//     await user.save();
//     res.json(user.cartItems);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };




// export const updateQuantity = async (req, res) => {
//   try {
//     const { id: productId } = req.params;
//     const { quantity } = req.body;
//     const user = req.user;

//     const existingItem = user.cartItems.find(
//       (item) => item.product.toString() === productId
//     );

//     if (existingItem) {
//       if (quantity === 0) {
//         user.cartItems = user.cartItems.filter(
//           (item) => item.product.toString() !== productId
//         );
//       } else {
//         existingItem.quantity = quantity;
//       }

//       await user.save();
//       return res.json(user.cartItems);
//     }

//     return res.status(404).json({ message: "Product not found in cart" });
//   } catch (error) {
//     console.error("Error in updateQuantity controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// cart.controller.js
import Product from "../models/product.model.js";

/**
 * Helper: populate và build cart response
 */
const buildCartResponse = async (user) => {
  await user.populate("cartItems.product"); // Mongoose 8+ syntax
  return user.cartItems.map((item) => {
    const product = item.product;
    return {
      ...product.toJSON(),
      quantity: item.quantity,
    };
  });
};

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const cartItems = await buildCartResponse(user);
    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity: incomingQuantity } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const existingItem = user.cartItems.find(
      (item) => item.product?.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += incomingQuantity ? incomingQuantity : 1;
    } else {
      user.cartItems.push({
        product: productId,
        quantity: incomingQuantity ? incomingQuantity : 1,
      });
    }

    await user.save();
    const cartItems = await buildCartResponse(user);
    res.json(cartItems);
  } catch (error) {
    console.error("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Nếu muốn rõ ràng hơn, tách:
 * - removeFromCart (khi có productId)
 * - clearCart (khi không có productId)
 */
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (productId) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      user.cartItems = [];
    }

    await user.save();
    const cartItems = await buildCartResponse(user);
    res.json(cartItems);
  } catch (error) {
    console.error("Error in removeAllFromCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      existingItem.quantity = quantity;
    }

    await user.save();
    const cartItems = await buildCartResponse(user);
    res.json(cartItems);
  } catch (error) {
    console.error("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

