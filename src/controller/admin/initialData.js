const Category = require("../../models/category");
const Product = require("../../models/product");
const Order = require("../../models/order");

function createCategories(categories, parentId = null) {
  const categoryList = [];
  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  for (let categ of category) {
    categoryList.push({
      _id: categ._id,
      name: categ.name,
      slug: categ.slug,
      parentId: categ.parentId,
      type: categ.type,
      children: createCategories(categories, categ._id),
    });
  }
  return categoryList;
}

exports.initialData = async (req, res) => {
  const categories = await Category.find({}).exec();
  const products = await Product.find({})
    .select(
      "_id name mrp price ratings quantity saving description productImages"
    )
    .populate({ path: "category", select: "_id name" })
    .exec();
  const orders = await Order.find({})
    .populate("items.productId", "name")
    .exec();
  res.status(200).json({
    categories: createCategories(categories),
    products,
    orders,
  });
};
