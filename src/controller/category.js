const Category = require("../models/category");
const slugify = require("slugify");
const shortid = require("shortid");

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

exports.addCategory = (req, res) => {
  const categoryObj = {
    name: req.body.name,
    slug: `${slugify(req.body.name)}-${shortid.generate()}`,
  };
  if (req.file) {
    categoryObj.categoryImage = `/public/` + req.file.filename;
  }
  if (req.body.parentId) {
    categoryObj.parentId = req.body.parentId;
  }
  const cat = new Category(categoryObj);
  cat.save((err, category) => {
    if (err) return res.status(400).json({ err });
    if (category) {
      return res.status(201).json({ category });
    }
  });
};

exports.fetchCategory = (req, res) => {
  Category.find({}).exec((err, category) => {
    if (err) return res.status(400).json({ err });
    if (category) {
      const categoryList = createCategories(category);
      res.status(200).json({ categoryList });
    }
  });
};

exports.updateCategories = async (req, res) => {
  const { _id, name, parentId, type } = req.body;
  const updatedCategories = [];
  if (name instanceof Array) {
    for (let i = 0; i < name.length; i++) {
      const category = {
        name: name[i],
        type: type[i],
      };
      if (parentId[i] !== "") {
        category.parentId = parentId[i];
      }

      const updatedCategory = await Category.findOneAndUpdate(
        { _id: _id[i] },
        category,
        { new: true }
      );
      updatedCategories.push(updatedCategory);
    }
    return res.status(201).json({ updatedCategories: updatedCategories });
  } else {
    const category = {
      name,
      type,
    };
    if (parentId !== "") {
      category.parentId = parentId;
    }
    const updatedCategory = await Category.findOneAndUpdate({ _id }, category, {
      new: true,
    });
    return res.status(201).json({ updatedCategory });
  }
};

exports.deleteCategories = async (req, res) => {
  // res.status(200).json({body:req.body})
  const { ids } = req.body.payload;
  // console.log(ids);
  const deletedCategories = [];
  for (let i = 0; i < ids.length; i++) {
    const deleteCategory = await Category.findByIdAndDelete({
      _id: ids[i]._id,
    });
    deletedCategories.push(deleteCategory);
  }
  if (deletedCategories.length == ids.length) {
    res.status(200).json({ message: "Categories removed" });
  } else res.status(200).json({ message: "Something went wrong" });
};
