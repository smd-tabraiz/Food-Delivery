const Menu = require("../models/menu");

const ErrorHandler = require("../utils/errorHandler");

const catchAsync = require("../middlewares/catchAsyncErrors");

// GET ALL MENUS
exports.getAllMenus = catchAsync(async (req, res, next) => {

  const filter = req.params.storeId
    ? { restaurant: req.params.storeId }
    : {};

  const menu = await Menu.find(filter).populate("menu.items");

  res.status(200).json({
    status: "success",
    count: menu.length,
    data: menu,
  });

});

// CREATE MENU
exports.createMenu = catchAsync(async (req, res, next) => {

  const menu = await Menu.create(req.body);

  res.status(201).json({
    status: "success",
    data: menu,
  });

});

// DELETE MENU
exports.deleteMenu = catchAsync(async (req, res, next) => {

  const menu = await Menu.findByIdAndDelete(req.params.menuId);

  if (!menu) {
    return next(new ErrorHandler("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
  });

});

// ADD ITEM TO MENU
exports.addItemToMenu = catchAsync(async (req, res, next) => {

  const { category, foodItemId } = req.body;
  const menuId = req.params.menuId;

  if (!menuId) {
    return next(new ErrorHandler("Menu ID is required", 400));
  }

  const menu = await Menu.findById(menuId);

  if (!menu) {
    return next(new ErrorHandler("Menu not found", 404));
  }

  // find category
  let cat = menu.menu.find((c) => c.category === category);

  // if not found, create new
  if (!cat) {
    cat = { category, items: [] };
    menu.menu.push(cat);
  }

  // add item
  cat.items.push(foodItemId);

  await menu.save();

  await menu.populate("menu.items");

  res.status(200).json({
    status: "success",
    data: menu,
  });

});