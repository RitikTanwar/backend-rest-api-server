const Cart = require("../models/cart");

function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    console.log(condition, updateData);
    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve())
      .catch((err) => reject(err));
  });
}

exports.addToCart = (req, res) => {
  // console.log(req.body, req.user);
  Cart.findOne({ user: req.user._id }).exec((err, cart) => {
    if (err) return res.status(400).json({ err });
    if (cart) {
      // res.status(200).json({message:cart});
      // if cart already exist update the quantity and price
      let promiseArray = [];
      // console.log("Cart1", cart);
      req.body.cartItems.forEach((cartItem) => {
        const product = cartItem.product;
        const isAdded = cart.cartItems.find((item) => item.product == product);
        let condition, update;
        if (isAdded) {
          // console.log("If CartItem", cartItem);
          condition = { user: req.user._id, "cartItems.product": product };
          update = {
            $set: {
              "cartItems.$": cartItem,
            },
          };
        } else {
          condition = { user: req.user._id };
          // console.log("Else", cartItem);
          update = {
            $push: {
              cartItems:
                // req.body.cartItems
                cartItem,
            },
          };
        }
        // console.log("Line 45 cart", cart);
        promiseArray.push(runUpdate(condition, update));
      });
      Promise.all(promiseArray)
        .then((response) => res.status(201).json({ response }))
        .catch((err) => res.status(400).json({ err }));
    } else {
      // If cart don't exists
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });
      // console.log("Cart2", cart);
      cart.save((err, cart) => {
        if (err) return res.status(400).json({ err });
        if (cart) {
          return res.status(201).json({ cart });
        }
      });
    }
  });
};

exports.getCartItems = (req, res) => {
  //const { user } = req.body.payload;
  //if(user){
  // console.log('GET_CART_ITEMS',req.user._id);
  // console.log(Cart);
  Cart.findOne({ user: req.user._id })
    .populate("cartItems.product", "_id name price productImages")
    //   .populate({path:'cartItems',populate:{path:'product'},select: '_id name price productImages'})
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        let cartItems = {};
        // console.log("Line 81", cart);
        cart.cartItems.forEach((item, index) => {
          // console.log("Item line 83", item);
          // if (item.product == null) {
          //   cartItems[item._id.toString()] = {
          //     _id: item._id.toString(),
          //     name: item.name,
          //     img: item.productImages[0].img,
          //     price: item.price,
          //     qty: item.quantity,
          //   };
          // } else {
          cartItems[item.product._id.toString()] = {
            _id: item.product._id.toString(),
            name: item.product.name,
            img: item.product.productImages[0].img,
            price: item.product.price,
            qty: item.quantity,
          };
          // }
        });
        res.status(200).json({ cartItems });
      }
    });
  //}
};

// new update remove cart items
exports.removeCartItems = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Cart.update(
      { user: req.user._id },
      {
        $pull: {
          cartItems: {
            product: productId,
          },
        },
      }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};
