let getRadioKeys = function(grids) {
    let ratios = {} // 用于存储不同宽高比及其索引的对象
    let ratiosKey = [] // 存储不同宽高比的数组
    for (let i = 0; i < grids.length; i++) {
        let ratio = grids[i].getRadio() // 计算当前网格的宽高比
        if (ratio in ratios)
            ratios[ratio].push(i) // 如果该宽高比已存在，添加当前索引到数组中
        else {
            ratios[ratio] = [i] // 如果该宽高比不存在，创建新数组并添加索引
            ratiosKey.push(ratio) // 将新的宽高比添加到键数组中
        }
    }
    return [ratios, ratiosKey] // 返回包含宽高比及其索引的对象和宽高比数组
}


let imageGrids = [
    new Grid(1, 1), new Grid(1, 2), new Grid(1, 3), new Grid(1, 4),
    new Grid(2, 1), new Grid(2, 2), new Grid(2, 3), new Grid(2, 4),
    new Grid(3, 1), new Grid(3, 2), new Grid(3, 3),
    new Grid(4, 1), new Grid(4, 2)
]

let albumGrids = [
    new Grid(1, 2), new Grid(1, 3),
    new Grid(2, 2), new Grid(2, 3), new Grid(2, 4),
    new Grid(3, 2), new Grid(3, 3),
    new Grid(4, 2)
]

let [imageRatios, imageRatiosKey] = getRadioKeys(imageGrids)
let [albumRatios, albumRatiosKey] = getRadioKeys(albumGrids)

class Album {
    constructor(items, rows) {
        this.items = items
        this.rows = rows
        this.widthPerColumn = new Array(this.rows).fill(0)

        this.initGrids()
        this.matchGrids(this.items)
    }

    initGrids() {
        for (let grid of imageGrids) {
            grid.itemSet = new Set()
        }
        for (let grid of albumGrids) {
            grid.itemSet = new Set()
        }
    }

    attemptMoveLeft(matrix, item) {
        // attemptMoveLeft方法，尝试将一个项目向左移动
        // 从项目的左侧位置开始向左检查
        for (let detectX = item.position.x - 1; detectX >= 0; detectX--) {
            // 检查该列的每一行是否有项目
            for (let y = item.position.y; y < item.position.y + item.grid.h; y++) {
                if (matrix[y][detectX]) {
                    // 如果该列不是空闲的，则返回可以向左移动的距离
                    return item.position.x - detectX - 1;
                }
            }
        }
        // 如果所有左侧列都是空闲的，则返回整个左侧距离
        return item.position.x;
    }

    attemptMoveTop(matrix, item) {
        // attemptMoveTop方法，尝试将一个项目向上移动
        // 从项目的上方位置开始向上检查
        for (let detectY = item.position.y - 1; detectY >= 0; detectY--) {
            // 检查该行的每一列是否有项目
            for (let x = item.position.x; x < item.position.x + item.grid.w; x++) {
                if (matrix[detectY][x]) {
                    // 如果该行不是空闲的，则返回可以向上移动的距离
                    return item.position.y - detectY - 1;
                }
            }
        }
        // 如果所有上方行都是空闲的，则返回整个上方距离
        return item.position.y;
    }

    getZeroMatrix(width, height) {
        // 使用Array.from方法创建一个新数组，每个元素都是填充了0的数组
        return Array.from({ length: height }, () => new Array(width).fill(0));
    }

    fillMatrix(matrix, item, value=1) {
        for (let x = item.position.x; x < item.position.x + item.grid.w; x++) {
            for (let y = item.position.y; y < item.position.y + item.grid.h; y++) {
                matrix[y][x] = value
            }
        }
    }
    compare(a, b) {
        if (a.position.x < b.position.x) {
            return -1
        }
        if (a.position.x > b.position.x) {
            return 1
        }
        return (a.position.y < b.position.y) ? -1 : 1
    }

    getMaxWidth() {
        this.maxWidth = 0
        for (let item of this.items) {
            if (item.grid.w + item.position.x > this.maxWidth) {
                this.maxWidth = item.grid.w + item.position.x
            }
        }
    }

    getMaxHeight() {
        this.maxHeight = 0
        for (let item of this.items) {
            if (item.grid.h + item.position.y > this.maxHeight) {
                this.maxHeight = item.grid.h + item.position.y
            }
        }
    }

    updateGrids() {
        this.getMaxWidth()
        this.getMaxHeight()

        let matrix = this.getZeroMatrix(this.maxWidth, this.maxHeight)
        this.items.sort(this.compare)

        for (let item of this.items) {
            this.fillMatrix(matrix, item, 1)

        }

        for (let item of this.items) {
            while (1) {
                let leftMargin = this.attemptMoveLeft(matrix, item)
                if (leftMargin) {
                    this.fillMatrix(matrix, item, 0)
                    item.position.x -= leftMargin
                    this.fillMatrix(matrix, item, 1)
                }
                let topMargin = this.attemptMoveTop(matrix, item)
                if (topMargin) {
                    this.fillMatrix(matrix, item, 0)
                    item.position.y -= topMargin
                    this.fillMatrix(matrix, item, 1)
                } else {
                    break
                }
            }
        }

        this.getMaxWidth()
    }

    matchGrids(items) {
        for (let item of items) {
            item.grids = []
            let ratios
            let ratiosKey
            let grids

            if (item.type === 'image') {
                ratios = imageRatios
                ratiosKey = imageRatiosKey
                grids = imageGrids
            } else {
                ratios = albumRatios
                ratiosKey = albumRatiosKey
                grids = albumGrids
            }

            let ratio = (item.height / item.width).toFixed(2)
            let i = 0
            for (; i < ratiosKey.length; i++)
                if (ratiosKey[i] > ratio)
                    break

            let matchRatios
            if (i === 0) matchRatios = [i]
            else if (i === ratiosKey.length) matchRatios = [i - 1]
            else matchRatios = [i - 1, i]

            for (let matchRatio of matchRatios) {
                let matchGrids = ratios[ratiosKey[matchRatio]]
                for (let grid of matchGrids) {
                    grid = grids[grid]
                    grid.itemSet.add(item)
                    item.grids.push(grid)
                }
            }
        }
        this.arrange()
    }

    getRemainGrids() {
        let remainGrids = []
        for (let grid of imageGrids) {
            if (grid.itemSet.size)
                remainGrids.push(grid)
        }
        for (let grid of albumGrids) {
            if (grid.itemSet.size)
                remainGrids.push(grid)
        }
        return remainGrids
    }

    arrange() {
        while (true) {
            let remainGrids = this.getRemainGrids()
            if (!remainGrids.length)
                break

            let minWidth = 0
            let height = 1
            let continuous = true
            for (let i = 1; i < this.rows; i++) {
                if (this.widthPerColumn[i] < this.widthPerColumn[minWidth]) {
                    minWidth = i
                    height = 1
                    continuous = true
                } else if (this.widthPerColumn[i] == this.widthPerColumn[minWidth] && continuous) {
                    height += 1
                } else {
                    continuous = false
                }
            }

            let supportGrids = []
            for (let grid of remainGrids) {
                if (grid.h <= height)
                    supportGrids.push(grid)
            }

            if (!supportGrids.length) {
                this.widthPerColumn[minWidth] += 1
                continue
            }

            let selectedGridIndex = Math.floor(Math.random() * supportGrids.length)
            let selectedGrid = supportGrids[selectedGridIndex]
            let selectedImage = selectedGrid.itemSet.keys().next().value

            selectedImage.grid = selectedGrid
            selectedImage.position = {x: this.widthPerColumn[minWidth], y: minWidth}

            for (let i = minWidth; i < minWidth + selectedGrid.h; i++) {
                this.widthPerColumn[i] += selectedGrid.w
            }

            for (let grid of selectedImage.grids) {
                grid.itemSet.delete(selectedImage)
            }
            delete selectedImage["grids"]
        }

        this.maxWidth = 0
        for (let w of this.widthPerColumn) {
            if (w > this.maxWidth)
                this.maxWidth = w
        }
    }
}
