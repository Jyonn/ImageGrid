class Grid {
    constructor(w, h) {
        this.w = w
        this.h = h
        this.itemSet = new Set()
    }

    getRadio() {
        return (this.h / this.w).toFixed(2)
    }
}
