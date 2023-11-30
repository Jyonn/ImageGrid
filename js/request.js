class Request {
    constructor() {
        this.xhr = new XMLHttpRequest();
    }

    baseRequest({method, url, query, data}) {
        //     query and data are both objects
        //     convert query to string
        //     if query is empty, queryStr is ''
        let queryStr = ''
        if (query === undefined) {
            query = {}
        }
        for (let key in query) {
            queryStr += `${key}=${query[key]}&`
        }
        queryStr = queryStr.slice(0, -1)
        url = `${url}?${queryStr}`

        if (method === 'GET') {
            data = undefined
        }
        else if (data === undefined) {
            data = {}
        }
        //    use fetch api
        return fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => {
            return response.json()
        })
    }

    get(url, query) {
        return this.baseRequest({
            method: 'GET',
            url: url,
            query: query
        })
    }

    post(url, data) {
        return this.baseRequest({
            method: 'POST',
            url: url,
            data: data
        })
    }

    put(url, data) {
        return this.baseRequest({
            method: 'PUT',
            url: url,
            data: data
        })
    }

    delete(url, data) {
        return this.baseRequest({
            method: 'DELETE',
            url: url,
            data: data
        })
    }
}
