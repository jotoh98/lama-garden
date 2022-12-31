import {createRandomLama, initializeLamas, Lama, renderLama, updateLama} from "./lama";
import {Grass, randomGrass, renderGrass, updateGrass} from "./grass";

export type GameObject =  Lama | Grass

export const allGameObjects: GameObject[] = [];
let frame = 0;

export let IS_DEV = true;

export let clickMode: 'PLACE_LAMA' | 'PLACE_GRASS' = 'PLACE_LAMA';

function setCanvasDimensions(ctx: CanvasRenderingContext2D) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
}

const setupControls = (ctx: CanvasRenderingContext2D) => {
    const checkbox = document.getElementById('devmode') as HTMLInputElement | null;
    IS_DEV = checkbox?.checked ?? false;
    checkbox?.addEventListener('click', () => {
        IS_DEV = checkbox.checked;
    });
    const switchClickModeButton = document.getElementById('switchClickMode') as HTMLButtonElement | null;
    switchClickModeButton?.addEventListener('click', () => {
        const wasLama = clickMode === 'PLACE_LAMA';
        clickMode = wasLama ?  'PLACE_GRASS' : 'PLACE_LAMA';
        switchClickModeButton.innerText = wasLama ? 'Grass' : 'Lama';
    })

    ctx.canvas.addEventListener('pointerdown', (e) => {
        const x = Math.floor(e.x / 5);
        const y = Math.floor(e.y / 5);
        switch (clickMode) {
            case 'PLACE_LAMA':
                allGameObjects.push({
                    ...createRandomLama('lama'),
                    position: {x, y}
                });
                break;
            case 'PLACE_GRASS':
                allGameObjects.push({
                    ...randomGrass(),
                    position: {x, y}
                })
                break;
        }
    })
};

export const setupCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;


    setupControls(ctx);

    initializeLamas(allGameObjects);
    for (let i = 0; i < Math.random() * 20 + 10; i++) {
        allGameObjects.push(randomGrass())
    }

    clearCanvas(ctx);

    setCanvasDimensions(ctx);

    window.addEventListener('resize', () => setCanvasDimensions(ctx));
    render(ctx, Date.now());

}

const updateGameObject = (gameObject: GameObject, frame: number, delta: number) => {
    switch (gameObject.type) {
        case 'LAMA':
            updateLama(gameObject, frame, delta);
            break;
        case "GRASS":
            updateGrass(gameObject, frame, delta);
            break;
    }
}

const updateAllGameObjects = (delta: number) => allGameObjects.forEach(gameObject => updateGameObject(gameObject, frame, delta))

function renderGameObject(ctx: CanvasRenderingContext2D, gameObject: GameObject, frame: number) {
    switch (gameObject.type) {
        case 'LAMA':
            renderLama(ctx, gameObject, frame);
            break;
        case "GRASS":
            renderGrass(ctx, gameObject);
            break;
    }
}

const renderAllGameObjects = (ctx: CanvasRenderingContext2D, frame: number) => {
    allGameObjects.sort((a, b) => {
        return a.position.y - b.position.y
    });
    allGameObjects.forEach(gameObject => renderGameObject(ctx, gameObject, frame));
}

const fullRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
}

const renderFences = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#83530b'
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    const {width, height} = ctx.canvas;
    const number = (width % 20) / Math.floor(width / 20);
    const number1 = (height % 20) / Math.floor(height / 20);
    fullRect(ctx, 8, 10, width - 16, 4);
    ctx.fillStyle = '#4f3205';
    fullRect(ctx, 8, 14, width - 16, 12);
    ctx.fillStyle = '#83530b'

    fullRect(ctx, 8, height-10, width - 16, 4);
    ctx.fillStyle = '#4f3205';
    fullRect(ctx, 8, height-6, width - 16, 12);
    ctx.fillStyle = '#83530b'

    for (let x = 5; x < width; x += 20 + number) {
        fullRect(ctx, x, 5, 10, 8)
        fullRect(ctx, x, 13, 10, 16)
        fullRect(ctx, x, ctx.canvas.height - 15, 10, 8)
        fullRect(ctx, x, ctx.canvas.height - 7, 10, 8)
    }

    ctx.fillRect(5, 5, 10, height - 10)
    ctx.strokeRect(5, 5, 10, height - 14)
    ctx.strokeRect(8, 5, 4, height - 14)
    ctx.fillRect(width - 15, 5, 10, height - 10)
    ctx.strokeRect(width - 15, 5, 10, height - 14)
    ctx.strokeRect(width - 13, 5, 4, height - 14)
    for (let y = 5; y < ctx.canvas.height; y += 20 + number1) {
        fullRect(ctx, 5, y, 10, 8)
        fullRect(ctx, width - 15, y, 10, 8)
    }
};
const renderHUD = (ctx: CanvasRenderingContext2D, delta: number) => {
    if (!IS_DEV) return;
    ctx.font = '20px Arial';
    const fpsText = `${Math.round(delta * 1000)}`;
    const textMetrics = ctx.measureText(fpsText);
    ctx.fillStyle = 'black';
    ctx.fillRect(ctx.canvas.width - textMetrics.width - 10, 0, textMetrics.width + 10, 25);
    ctx.fillStyle = 'green'
    ctx.fillText(fpsText, window.innerWidth - textMetrics.width - 5, 20);
};
const render = (ctx: CanvasRenderingContext2D, time: number) => {
    const millsNow = Date.now();
    frame++;
    const delta = (millsNow - time)/1000;
    updateAllGameObjects(delta);
    clearCanvas(ctx);
    ctx.fillStyle = '#7edc7e';
    const {width, height} = ctx.canvas;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#5bb95b';
    ctx.beginPath()
    for (let x = 0; x < width; x += 160) {
        for (let y = 0; y < height; y += 160) {
            ctx.translate(x, y);
            ctx.rect(0, 0, 5, 5);
            ctx.rect(20, 10, 5, 5);
            ctx.rect(90, 130, 5, 5);
            ctx.rect(130, 60, 5, 5);
            ctx.rect(80, 60, 5, 5);
            ctx.rect(150, 20, 5, 5);
            ctx.resetTransform()
        }
    }
    ctx.fill()

    renderFences(ctx);
    renderAllGameObjects(ctx, frame);
    renderHUD(ctx, delta);
    window.requestAnimationFrame(() => render(ctx, millsNow));
}

const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}