
import {userModel} from "./model/User.model.js"


//find
export const findOne = async ({ model = userModel, filter = {}, select = "", populate = [] } = {}) => {
    const result = await model.findOne(filter).select(select).populate(populate)
    return result
}


export const find = async ({ model = userModel, skip=0 , limit=20, filter = {},
    select = "", populate = [] } = {}) => {
    const result = await model.find(filter).limit(limit).skip(skip).select(select).populate(populate)
    return result
}

export const findByID = async ({ model = userModel, filter = {},
    select = "", populate = [] } = {}) => {
    const result = await model.findById(filter).select(select).populate(populate)
    return result
}

//create 
export const create = async ({ model = userModel, data = {} } = {}) => {
    const result = await model.create(data)
    return result
}

export const insertMany = async ({ model = userModel, data = [{}] } = {}) => {
    const result = await model.insertMany(data)
    return result
}

export const createAndSave = async ({ model = userModel, data = [{}] } = {}) => {
    const newObj = new model(data)
    const savedObj = await newObj.save()
    return savedObj
}



//findOneAndUpdate
export const findOneAndUpdate = async ({ model = userModel,
    filter = {}, data = {}, select = "", populate = [] , options={}} = {}) => {
    const result = await model.findOneAndUpdate(filter, data , options).select(select).populate(populate)
    return result
}


export const findByIdAndUpdate = async ({ model = userModel,
    filter = '', data = {}, options={}, select = "", populate = [] } = {}) => {
    const result = await model.findByIdAndUpdate(filter, data, options ).select(select).populate(populate)
    return result
}

export const updateOne = async ({ model = userModel, filter = {}, data = {}, options = {} } = {}) => {
    const result = await model.findByIdAndUpdate(filter, data, options)
    return result
}


//findOneAndUpdate
export const findOneAndDelete = async ({ model = userModel, filter = {},
    select = "", populate = [] } = {}) => {
    const result = await model.findOneAndDelete(filter).select(select).populate(populate)
    return result
}


export const findByIdAndDelete = async ({ model = userModel,
    filter = "", select = "", populate = [] } = {}) => {
    const result = await model.findByIdAndDelete(filter).select(select).populate(populate)
    return result
}

export const deleteOne = async ({ model = userModel, filter = {} } = {}) => {
    const result = await model.deleteOne(filter)
    return result
}