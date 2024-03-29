interface DrawParamsBase {
    /** 块的样式 */
    style: CSSStyleDeclaration
}

interface DrawImageParams extends DrawParamsBase {
    type: "image"
    src: string
}

interface DrawTextParams extends DrawParamsBase {
    type: "text"
    text: string
}

interface DrawRectParams extends DrawParamsBase {
    type: "div"
    children?: DrawParams[]
}

export type DrawParams = DrawImageParams | DrawTextParams | DrawRectParams

class CanvasShared {
    public ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D, config?: any) {
        this.ctx = ctx
    }


    private _draw(drawParam: DrawParams, top = 0, left = 0) {
        drawParam.style.top = `${parseInt(drawParam.style.top) + top}`
        drawParam.style.left = `${parseInt(drawParam.style.left) + left}`

        // only block can have children
        if (drawParam.type === 'div') {
            this.drawRect(drawParam)
            // Recursion draw children
            if (drawParam.children) {
                drawParam.children.forEach((child) => {
                    this._draw(child, parseInt(drawParam.style.top), parseInt(drawParam.style.left))
                })
            }
        } else if (drawParam.type === 'image') {
            this.drawImage(drawParam)
        } else if (drawParam.type === 'text') {
            this.drawText(drawParam)
        }
    }

    public draw(drawParams: DrawParams[]) {
        drawParams.forEach((drawParam) => {
            this._draw(drawParam)
        })
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    public drawRect(drawParam: DrawRectParams) {
        const {style} = drawParam

        this.drawBorder(style)

        this.ctx.fillStyle = style.backgroundColor
        this.ctx.fillRect(
            parseInt(style.left),
            parseInt(style.top),
            parseInt(style.width),
            parseInt(style.height)
        )
    }

    private drawBorder(style: CSSStyleDeclaration) {
        const {borderColor, borderWidth, borderRadius} = style
        this.ctx.strokeStyle = borderColor
        this.ctx.lineWidth = parseInt(borderWidth)
        this.ctx.lineJoin = 'round'
        this.ctx.beginPath()
        this.ctx.moveTo(parseInt(style.left) + parseInt(borderRadius), parseInt(style.top))
        this.ctx.lineTo(parseInt(style.left) + parseInt(style.width) - parseInt(borderRadius), parseInt(style.top))
        this.ctx.quadraticCurveTo(
            parseInt(style.left) + parseInt(style.width),
            parseInt(style.top),
            parseInt(style.left) + parseInt(style.width),
            parseInt(style.top) + parseInt(borderRadius)
        )
    }

    public drawText(drawParam: DrawTextParams) {
        const {style, text} = drawParam
        this.ctx.fillStyle = style.color;
        this.ctx.font = `${style.fontSize}px ${style.fontFamily || "Microsoft YaHei"}`;
        this.ctx.fillText(text, parseInt(style.left), parseInt(style.top) + parseInt(style.fontSize));
    }

    public drawImage(drawImageParams: DrawImageParams) {
        const {style, src} = drawImageParams

        const img = new Image()
        img.src = src
        img.onload = () => {
            this.ctx.drawImage(
                img,
                parseInt(style.left),
                parseInt(style.top),
                parseInt(style.width),
                parseInt(style.height)
            )
        }
    }
}

export default CanvasShared
