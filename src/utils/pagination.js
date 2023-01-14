

export function paginate({page=1, size=100}={}) {

    if (!page || page <= 0) {
        page = 1
    }

    if (!size || size <= 0) {
        size = 20
    }

    const skip = (page - 1) * size
    return { limit: size, skip }
}