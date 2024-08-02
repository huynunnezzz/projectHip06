const { response } = require('express');
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

//Filter ,Sorting, Pagnigation
const getProducts = asyncHandle(async (req, res) => {
    const queries = { ...req.query };

    //1 tách các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    //Format lại các trường cho đúng mongoose vd {"title":"laptop"} => {title:'laptop'}
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    const formatedQueries = JSON.parse(queryString);

    //Filering
    if (queries.title) formatedQueries.title = { $regex: queries.title, $options: 'i' }
    //Để cho chạy bất đồng bộ
    let queryCommand = productModel.find(formatedQueries);

    // 2) Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
    } else {
        queryCommand = queryCommand.sort('-createdAt');
    }

    //3) Field Limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    } else {
        queryCommand = queryCommand.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || process.env.LIMIT_PRODUCT;
    const skip = page * limit - limit;
    queryCommand.limit(limit).skip(skip);

    //Excute query
    queryCommand.then(async (response) => {
        const counts = await productModel.find(formatedQueries).countDocuments();
        return res
            .status(200)
            .json({
                status: response ? true : false,
                products: response ? response : 'Cannot get Product',
                counts
            })
    })
        .catch((err) => {
            throw new Error(err.message);
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

const ratings = asyncHandle(async (req, res) => {
    const { _id } = req.user;
    const { pid } = req.params;
    const { star, comment } = req.body;
    if (!star) throw new Error('Missing Inputs');

    //Check xem đánh giá hay chưa nếu chưa thì thêm còn đánh giá trước đó r thì cập nhật

    const ratingProduct = await productModel.findById(pid);
    //tìm xem trong rating có đánh giá hay chưa
    const alreadyRating = ratingProduct.ratings.find(el => el.postedBy.toString() === _id);

    //elemMatch giống find nó sẽ chọc vào các trường của rating dấu $ sẽ so sánh xem trong đó có trường đó hay không
    if (alreadyRating) {
        await productModel.updateOne({
            ratings: {
                $elemMatch: alreadyRating
            }
        }, {
            $set: {
                "ratings.$.star": star,
                "ratings.$.comment": comment
            }
        })
    } else {
        await productModel.findByIdAndUpdate(pid, {
            $push: {
                ratings: { star, comment, postedBy: _id }
            }
        }, { new: true })

    }
    return res
        .status(200)
        .json({
            status: true,
            mes: "Rating done"
        })

})


module.exports = {
    getProduct,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    ratings
}