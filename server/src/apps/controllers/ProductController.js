const productModel = require('../models/product');
const asyncHandle = require('express-async-handler');
const slugify = require('slugify');

const getProduct = asyncHandle(async (req, res) => {
    const { pid } = req.params;
    const product = await productModel.findById(pid);
    return res
        .status(200)
        .json({
            status: product ? 'success' : 'failed',
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
        const totalProduct = await productModel.find().countDocuments();
        const totalPage = Math.ceil(totalProduct / limit);
        return res
            .status(200)
            .json({
                status: response ? 'success' : 'failed',
                products: response ? response : 'Cannot get Product',
                counts,
                totalPage
            })
    })
        .catch((err) => {
            throw new Error(err.message);
        })
})


const createProduct = asyncHandle(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs');
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const response = await productModel(req.body).save();
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            createProduct: response ? response : 'Cannot create new Product'
        })
})

const updateProduct = asyncHandle(async (req, res) => {
    const { pid } = req.params;
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
    const response = await productModel.findByIdAndUpdate(pid, req.body, { new: true });
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            updateProduct: response ? response : 'Cannot update new Product'
        })
})
const deleteProduct = asyncHandle(async (req, res) => {
    const { pid } = req.params;
    const response = await productModel.findByIdAndDelete(pid);
    return res
        .status(200)
        .json({
            status: response ? 'success' : 'failed',
            updateProduct: response ? 'Deleted product done' : 'Cannot delete new Product'
        })
})

const ratings = asyncHandle(async (req, res) => {
    const uid = req.user._id;
    const { pid } = req.params;
    const { star, comment } = req.body;
    if (!star) throw new Error('Missing Inputs');

    //Check xem đánh giá hay chưa nếu chưa thì thêm còn đánh giá trước đó r thì cập nhật
    const ratingProduct = await productModel.findById(pid);
    //tìm xem trong rating có đánh giá hay chưa
    const alreadyRating = ratingProduct.ratings.find(el => el.postedBy.toString() === uid); // tìm comment của user trùng với uid hay không

    //elemMatch giống find nó sẽ chọc vào các trường của rating dấu $ sẽ so sánh xem trong đó có trường đó hay không
    if (alreadyRating) {
        //update rating & comment
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
        //add rating & comment
        await productModel.findByIdAndUpdate(pid, {
            $push: {
                ratings: { star, comment, postedBy: uid }
            }
        }, { new: true })

    }

    //Sum rating
    const updateProduct = await productModel.findById(pid);
    //Tất cả đánh giá
    const ratingCount = updateProduct.ratings.length;
    //tính tổng các star vd 1+2+3
    const sumRating = updateProduct.ratings.reduce((sum, el) => sum + el.star, 0);

    updateProduct.totalRatings = Math.round(sumRating * 10 / ratingCount) / 10;
    await updateProduct.save();
    return res
        .status(200)
        .json({
            status: 'success',
            mes: "Rating done",
            updateProduct
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