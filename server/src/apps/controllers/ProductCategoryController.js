const productCategoryModel = require('../models/productCategory');
const asyncHandle = require('express-async-handler');

const getCategories = asyncHandle(async (req, res) => {
    const response = await productCategoryModel.find().select('title _id');
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            mes: response ? 'Get product-category success' : 'Get product-category failed',
            productCategories: response ? response : 'Cannot get Product Category'
        });
});

const createCategory = asyncHandle(async (req, res) => {
    const response = await productCategoryModel(req.body).save();
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            mes: response ? 'Insert ProCategory success' : 'Insert ProCategory failed',
            createCategory: response ? response : 'null'
        });
});

const updateCategory = asyncHandle(async (req, res) => {
    const { cid } = req.params;
    if (!req.body.title) throw new Error('Missing inputs');
    const response = await productCategoryModel.findByIdAndUpdate(cid, req.body, { new: true });
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            mes: response ? 'Updated success' : 'Updated failed',
            updateCategory: response ? response : 'null'
        })
})
const deleteCategory = asyncHandle(async (req, res) => {
    const { cid } = req.params;
    const response = await productCategoryModel.findByIdAndDelete(cid);
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            mes: response ? 'Deleted success' : 'Deleted failed',
            deleteCategory: response ? response : 'null'
        })
})




module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory


}
