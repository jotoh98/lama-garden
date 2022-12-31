import {allGameObjects, GameObject, IS_DEV} from "./game";
import {
    circleVector,
    clampValue,
    clampVectorToScreen,
    distance,
    normalize,
    randomVector,
    scaleVector,
    Vector2D,
    vectorDiff,
    vectorLength,
    vectorSum
} from "./vector";
import {Grass} from "./grass";

export type Lama = {
    type: 'LAMA';
    name: string;
    age: number;
    isAlive: boolean;
    position: Vector2D;
    velocity: Vector2D;
    transform: Vector2D;
    hunger: number;
    state: LamaState;
    blinkOffset: number;
    collisionShape: Path2D
    onClick: () => void;
}

type LamaState = {
    type: 'RESTING'
    until: number;
    leftFacing: boolean;
} | {
    type: 'MOVING'
    to: Vector2D;
} | {
    type: 'EATING'
    leftFacing: boolean;
}

/*const createLamaFSM = () => create({
    states: ['MOVING', 'RESTING', 'EATING'],
    initial: 'RESTING',
    transitions: {
        RESTING: [
            'MOVING'
        ],
        MOVING: [
            'RESTING',
            'EATING'
        ],
        EATING: [
            'RESTING',
            'MOVING'
        ]
    }
})*/

const getAllLamasExceptMe = (lama: Lama) => {
    const allLamaObjects = allGameObjects.filter(x => x.type === 'LAMA') as Lama[];
    return allLamaObjects.filter(x => x !== lama);
};

const getClosestGrass = (lama: Lama) => {
    const lamasExceptMe = getAllLamasExceptMe(lama);
    const allGrassObjects = allGameObjects.filter(x => x.type === 'GRASS') as Grass[];
    const grassTuples = allGrassObjects.filter(x => x.amount > 0).map(grass => [grass, distance(lama.position, grass.position)] as const)
    grassTuples.sort((a, b) => a[1] - b[1]);
    return grassTuples.find(([grass]) => !lamasExceptMe.filter(otherLama => distance(otherLama.position, grass.position) < 10).length)?.[0]
};

const isLeftFacing = (lama: Lama) => {
    switch (lama.state.type) {
        case 'MOVING':
            return lama.state.to.x < lama.position.x;
        case 'EATING':
        case 'RESTING':
            return lama.state.leftFacing;
    }
}

const createNextState = <Type extends LamaState['type'] = LamaState['type']>(lama: Lama, type: Type, rest?: Extract<LamaState, { type: Type }>) => {
    switch (type) {
        case 'MOVING':
            const closestGrass = getClosestGrass(lama);
            return {
                type: 'MOVING',
                to: closestGrass?.position ?? randomVector(0, window.innerWidth / 5, 0, window.innerHeight / 5),
                ...rest
            } as const
        case 'RESTING':
            return {
                type: 'RESTING',
                until: Date.now() + 1000 + Math.random() * 5000,
                leftFacing: isLeftFacing(lama),
                ...rest
            } as const
        case 'EATING':
            return {
                type: 'EATING',
                leftFacing: isLeftFacing(lama),
                ...rest
            } as const
    }
    return undefined;
}

const randomPositionAround = (position: Vector2D, distance: number) => {
    const angle = Math.random() * Math.PI * 2;
    const around = vectorSum(position, scaleVector(circleVector(angle), distance));
    return clampVectorToScreen(around);
}

const getNextRandomPosition = (lama: Lama) => {
    if (Math.random() > .7) {
        const otherLamas = getAllLamasExceptMe(lama);
        otherLamas.sort((a, b) => distance(a.position, lama.position) - distance(b.position, lama.position));
        const closestLama = otherLamas[0];
        if (closestLama) {
            const newPosition = randomPositionAround(closestLama.position, 10);
            return clampVectorToScreen(newPosition);
        }
    }
    const randomDistance = 10 + Math.random() * 60;
    const newPosition = randomPositionAround(lama.position, randomDistance)
    return clampVectorToScreen(newPosition)
}

const nextLamaState = (lama: Lama): LamaState | undefined => {
    const closestGrass = getClosestGrass(lama);
    switch (lama.state.type) {
        case 'RESTING':
            if (lama.hunger > 0.5 && closestGrass) {
                if (distance(lama.position, closestGrass.position) < 2) {
                    return createNextState(lama, 'EATING');
                }
                return createNextState(lama, 'MOVING');
            }
            if (lama.state.until < Date.now()) {
                return {
                    type: "MOVING",
                    to: getNextRandomPosition(lama)
                };
            }
            return undefined;
        case 'MOVING':
            const objective = lama.state.to;
            if (lama.hunger > .8 && closestGrass) {
                if (distance(closestGrass.position, lama.position) < 1) {
                    return createNextState(lama, 'EATING');
                }
                return createNextState(lama, 'MOVING');
            }

            if (distance(lama.position, objective) < 1) {
                return createNextState(lama, 'RESTING');
            }
            if (lama.hunger <= 0 && distance(lama.position, objective) < 1) {
                return createNextState(lama, 'RESTING');
            }

            const allLamasExceptMe = getAllLamasExceptMe(lama);
            const lamaAtObjective = allLamasExceptMe.find(other => distance(other.position, objective) < 10);
            if (lamaAtObjective) {
                const position = randomPositionAround(lamaAtObjective.position, 10);
                return {
                    type: 'MOVING',
                    to: position
                }
            }
            return undefined;

        case "EATING":
            if (lama.hunger > 0) {
                const closestGrass = getClosestGrass(lama);
                if (!closestGrass) {
                    return {
                        type: 'RESTING',
                        until: Date.now() + 1000 + Math.random() * 5000,
                        leftFacing: lama.state.leftFacing,
                    }
                }
                if (distance(closestGrass.position, lama.position) > 1) {
                    return createNextState(lama, 'MOVING');
                }
                return undefined;
            }
            return {
                type: 'MOVING',
                to: randomVector(),
            };
    }
    return undefined;
}

export const initializeLamas = (allGameObjects: GameObject[]) => {
    for (let i = 0; i < Math.random() * 10 + 5; i++) {
        const lama = createRandomLama(`Lama ${i + 1}`);
        allGameObjects.push({
            ...lama
        });
    }
}

export const getCloseLamas = (lama: Lama, minDistance: number) => {
    return getAllLamasExceptMe(lama).filter(x => distance(lama.position, x.position) < minDistance) as Lama[];
}

export const updateLama = (lama: Lama, _frame: number, delta: number) => {
    const nextState = nextLamaState(lama);
    if (nextState) {
        lama.state = nextState;
    }
    switch (lama.state.type) {
        case 'RESTING':
            lama.velocity = {x: 0, y: 0};
            lama.hunger += delta / 1000
            break;
        case 'MOVING':
            const direction = vectorDiff(lama.state.to, lama.position);
            const opposite = getCloseLamas(lama, 10)
                .map(x => vectorDiff(x.position, lama.position))
                .reduce((a, b) => vectorSum(a, b), {x: 0, y: 0});
            const d = normalize(vectorDiff(direction, opposite));

            const runningScalar = distance(lama.state.to, lama.position) > 20 && vectorLength(opposite) === 0 ? 2 : 1;

            lama.velocity.x = d.x / 100 * runningScalar;
            lama.velocity.y = d.y / 100 * runningScalar;
            lama.hunger += delta / 50;
            lama.hunger = Math.min(lama.hunger, 1);
            break;
        case 'EATING':
            lama.velocity = {x: 0, y: 0};
            const closestGrass = getClosestGrass(lama);
            if (closestGrass) {
                closestGrass.amount -= delta / 10;
            }
            lama.hunger -= delta / 10;
            break;

    }
    lama.hunger = clampValue(lama.hunger, 0, 1);

    lama.position.x += lama.velocity.x * delta *1000;

    lama.position.y += lama.velocity.y * delta * 1000;
}

export const createRandomLama = (name: string): Lama => {
    const position = randomVector();

    return {
        type: 'LAMA',
        name,
        age: 0,
        isAlive: true,
        position,
        velocity: {
            x: 0,
            y: 0,
        },
        transform: {
            x: 0,
            y: 0,
        },
        state: {
            type: 'RESTING',
            until: 0,
            leftFacing: Math.random() > 0.5,
        },
        hunger: .5,
        blinkOffset: Math.random() * 100,
        collisionShape: LAMA_PATH,
        onClick: () => {
            console.log('clicked lama', name);
        }
    };
}

export const renderLama = (ctx: CanvasRenderingContext2D, lama: Lama, frame: number) => {
    const x = Math.round(lama.position.x);
    const y = Math.round(lama.position.y);
    ctx.transform(5, 0, 0, 5, 5 * x, 5 * y);
    ctx.fillStyle = '#0002'
    ctx.fillRect(-5, -16, 10, 1);
    ctx.fillStyle = '#0006'
    ctx.fillRect(-5, -16, 10 * (1- lama.hunger), 1);
    ctx.resetTransform();

    renderLamaIcon(ctx, lama, frame);

    if (IS_DEV && lama.state.type === 'MOVING') {
        ctx.beginPath()
        ctx.strokeStyle = 'rgb(185,21,110)';
        ctx.moveTo(5 * x, 5 * y);
        ctx.lineTo(5 * lama.state.to.x, 5 * lama.state.to.y);
        ctx.stroke()
    }

    if (IS_DEV) {
        const hungerPercentage = ((1 - lama.hunger) * 100).toFixed(0);
        ctx.font = '10px Arial';
        ctx.fillText(`${lama.state.type} ${hungerPercentage}%`, 5 * lama.position.x + 10, 5 * lama.position.y - 20);
    }
}

const LAMA_PATH = new Path2D('M-5, 0 L-4, 0 L-4, 1 L-3, 1 L-3, 0 L-2, 0 L-2, 7 L5, 7 L5, 9 L6, 9 L6, 10 L5, 10 L5, 13 L4, 13 L4, 10 L3, 10 L3, 13 L2, 13 L2, 10 L-2, 10 L-2, 13 L-3, 13 L-3, 10 L-4, 10 L-4, 13 L-5, 13 L-5, 3 L-6, 3 L-6, 2 L-5, 2 L-5, 0')
const renderLamaIcon = (ctx: CanvasRenderingContext2D, lama: Lama, frame: number) => {
    const x = Math.round(lama.position.x + lama.transform.x);
    const y = Math.round(lama.position.y + lama.transform.y);
    ctx.transform(isLeftFacing(lama) ? 5 : -5, 0, 0, 5, 5 * x, 5 * (y - 13));
    ctx.lineWidth = 0.2;
    ctx.fillStyle = '#c58e53';
    ctx.fill(LAMA_PATH)
    ctx.strokeStyle = '#000'
    ctx.stroke(LAMA_PATH)

    ctx.fillStyle = '#607be5';
    const blinks = ((frame + lama.blinkOffset) % 100) < 10
    ctx.fillRect(-4, 2, 1, blinks ? 0 : 1)
    ctx.strokeRect(-4, 2, 1, blinks ? 0 : 1)
    ctx.resetTransform()

}