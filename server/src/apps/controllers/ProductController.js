const productModel = require('../models/product');
const asyncHandle = require('express-async-handler');
const slugify = require('slugify');

const getProduct = asyncHandle(async (req, res) => {
    const { pid } = req.params;

    const product = await productModel.findById(pid);
    return res
        .status(200)
        .json({
            status: product ? true : false,
            product: product ? product : 'Cannot get Product'
        })

})

const getProducts = asyncHandle(async (req, res) => {
    const products = await productModel
        .find();
    return res
        .status(200)
        .json({
            status: products ? true : false,
            product: products ? products : 'Cannot get Product'
        })
})


const createProduct = asyncHandle(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs');
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const newProduct = await productModel(req.body).save();
    return res
        .status(200)
        .json({
            status: newProduct ? true : false,
            createProduct: newProduct ? newProduct : 'Cannot create new Product'
        })
})

const updateProduct = asyncHandle(async (req, res) => {
    const { pid } = req.params;
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const updateProduct = await productModel.findByIdAndUpdate(pid, req.body, { new: true });
    return res
        .status(200)
        .json({
            status: updateProduct ? true : false,
            updateProduct: updateProduct ? updateProduct : 'Cannot update new Product'
        })
})
const deleteProduct = asyncHandle(async (req, res) => {
    const { pid } = req.params;
    console.log(pid);

    const deleteProduct = await productModel.findByIdAndDelete(pid);
    return res
        .status(200)
        .json({
            status: deleteProduct ? true : false,
            updateProduct: deleteProduct ? 'Deleted product done' : 'Cannot delete new Product'
        })
})



module.exports = {
    getProduct,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
}