import jwt from 'jsonwebtoken'
import { userModel } from '../../DB/model/user.model.js';
import { asyncHandler } from '../utils/errorHandling.js';

export const roles = {
    User: "User",
    Admin: "Admin",
    SuperAdmin: "SuperAdmin",
    Shelter: "Shelter",
    Accounting: "Accounting",
}
export const auth = (accessRoles = []) => {
    return asyncHandler( async (req, res, next) => {
            const { authorization } = req.headers
            console.log(authorization);
            if (!authorization?.startsWith(process.env.BearerKey)) {
                return next(new Error('In-valid Bearer key', { cause: 400 }))
            } else {
                const token = authorization.split(process.env.BearerKey)[1]
                const decoded = jwt.verify(token, process.env.tokenSignature)
                if (!decoded?.id || !decoded?.isLoggedIn) {
                    return next(new Error('In-valid token payload ', { cause: 400 }))
                } else {
                    const user = await userModel.findById(decoded.id).select('email userName role')
                    if (!user) {
                        return next(new Error('Not register user', { cause: 404 }))
                    } else {
                        if (!accessRoles.includes(user.role)) {
                            return next(new Error('Not auth user', { cause: 403 }))
                        } else {
                            req.user = user
                            return next()
                        }

                    }
                }
            }
        })
}