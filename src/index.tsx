const canvas: HTMLCanvasElement = document.querySelector('canvas')
const context: CanvasRenderingContext2D = canvas.getContext('2d')

canvas.height = window.innerHeight
canvas.width = window.innerWidth

context.fillStyle = 'black'
context.fillRect(0, 0, canvas.width, canvas.height)
